"""HybridRAGPipeline: the public entry point of the retrieval module.

    from rag import HybridRAGPipeline
    pipeline = HybridRAGPipeline()
    results = pipeline.retrieve("Explain Article 21 judgement")

On construction the pipeline checks the PDFs in the corpus folder against the
manifest saved with the index. If a PDF was added, removed or changed (or the
chunking/embedding settings changed) the index is rebuilt automatically.

Command line (run from the backend/ folder):
    python -m rag.pipeline build [--force]
    python -m rag.pipeline query "Explain Article 21 judgement" [--top-k 5]
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

from .bm25_retriever import BM25Retriever
from .chunker import chunk_document
from .config import (
    BM25_CORPUS_FILE,
    BM25_INDEX_FILE,
    CHUNK_METADATA_FILE,
    FAISS_INDEX_FILE,
    MANIFEST_FILE,
    PAGES_FILE,
    RAGConfig,
)
from .embeddings import Embedder
from .hybrid_retriever import HybridRetriever
from .metadata import extract_document_metadata
from .pdf_loader import discover_pdfs, document_id, extract_pages, file_sha256
from .reranker import CrossEncoderReranker
from .schemas import Chunk, RetrievedChunk
from .text_cleaner import clean_pages
from .vector_store import FaissVectorStore

logger = logging.getLogger(__name__)


def _write_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


class HybridRAGPipeline:
    def __init__(self, config: RAGConfig | None = None, auto_build: bool = True):
        self.config = config or RAGConfig()
        self.embedder = Embedder(self.config.embedding_model, self.config.embedding_batch_size)
        self.reranker = CrossEncoderReranker(self.config.reranker_model)
        self.chunks: list[Chunk] = []
        self._retriever: HybridRetriever | None = None
        if auto_build:
            self.refresh()

    # ------------------------------------------------------------------ index
    def _index_path(self, name: str) -> Path:
        return self.config.index_dir / name

    def _signature(self) -> dict:
        return {
            **self.config.index_signature(),
            "embedding_window": [Embedder.window_words, Embedder.window_stride],
        }

    def _current_documents(self) -> dict[str, dict]:
        corpus_dir = self.config.corpus_dir
        return {
            document_id(p, corpus_dir): {"sha256": file_sha256(p), "bytes": p.stat().st_size}
            for p in discover_pdfs(corpus_dir)
        }

    def needs_rebuild(self) -> bool:
        """True when the saved index is missing or out of date with the corpus."""
        manifest_path = self._index_path(MANIFEST_FILE)
        required = [CHUNK_METADATA_FILE, BM25_CORPUS_FILE, MANIFEST_FILE]
        if not all(self._index_path(f).exists() for f in required):
            return True
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        return (
            manifest.get("signature") != self._signature()
            or manifest.get("documents") != self._current_documents()
        )

    def refresh(self) -> bool:
        """Rebuild the index if the corpus changed, then load it. Returns True if rebuilt."""
        rebuilt = False
        if self.needs_rebuild():
            self.build_index()
            rebuilt = True
        else:
            self.load_index()
        return rebuilt

    def build_index(self) -> dict:
        """Extract, clean, chunk, embed and index every PDF in the corpus folder."""
        cfg = self.config
        cfg.ensure_dirs()
        started = time.perf_counter()
        pdfs = discover_pdfs(cfg.corpus_dir)
        logger.info("Indexing %d PDF(s) from %s", len(pdfs), cfg.corpus_dir)

        chunks: list[Chunk] = []
        documents: dict[str, dict] = {}
        doc_metadata: list[dict] = []
        cleaned_pages: list[dict] = []
        for pdf in pdfs:
            name = document_id(pdf, cfg.corpus_dir)
            try:
                raw_pages = extract_pages(pdf, name)
            except Exception as exc:  # one corrupt PDF must not block the rest
                logger.error("Skipping unreadable PDF %s: %s", name, exc)
                continue
            meta = extract_document_metadata(name, raw_pages)
            pages = clean_pages(raw_pages)
            doc_chunks = chunk_document(pages, meta, cfg)
            chunks.extend(doc_chunks)
            documents[name] = {"sha256": file_sha256(pdf), "bytes": pdf.stat().st_size}
            doc_metadata.append({**meta.to_dict(), "chunk_count": len(doc_chunks)})
            cleaned_pages.extend(p.to_dict() for p in pages)
            logger.info("  %s -> %d page(s), %d chunk(s)", name, len(pages), len(doc_chunks))

        search_texts = [c.search_text() for c in chunks]
        bm25 = BM25Retriever.build(search_texts)
        store = FaissVectorStore.build(self.embedder.embed_documents(search_texts)) if chunks else FaissVectorStore()

        # Processed artefacts (human-readable, useful for debugging)
        _write_json(cfg.processed_dir / PAGES_FILE, cleaned_pages)
        _write_json(cfg.processed_dir / "documents.json", doc_metadata)
        # Index artefacts; manifest is written last so a crash mid-build forces a rebuild
        _write_json(self._index_path(CHUNK_METADATA_FILE), [c.to_dict() for c in chunks])
        bm25.save(self._index_path(BM25_INDEX_FILE), self._index_path(BM25_CORPUS_FILE))
        faiss_path = self._index_path(FAISS_INDEX_FILE)
        if chunks:
            store.save(faiss_path)
        elif faiss_path.exists():
            faiss_path.unlink()
        stats = {
            "document_count": len(documents),
            "chunk_count": len(chunks),
            "build_seconds": round(time.perf_counter() - started, 1),
        }
        _write_json(
            self._index_path(MANIFEST_FILE),
            {
                "built_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                "corpus_dir": str(cfg.corpus_dir),
                "signature": self._signature(),
                "documents": documents,
                "reranker_model": cfg.reranker_model,
                **stats,
            },
        )
        self._attach(chunks, store, bm25)
        logger.info("Index built: %s", stats)
        return stats

    def load_index(self) -> None:
        chunks = [
            Chunk.from_dict(d)
            for d in json.loads(self._index_path(CHUNK_METADATA_FILE).read_text(encoding="utf-8"))
        ]
        faiss_path = self._index_path(FAISS_INDEX_FILE)
        store = FaissVectorStore.load(faiss_path) if faiss_path.exists() else FaissVectorStore()
        bm25 = BM25Retriever.load(self._index_path(BM25_INDEX_FILE), self._index_path(BM25_CORPUS_FILE))
        if len(store) != len(chunks) or len(bm25.tokenized_corpus) != len(chunks):
            logger.warning("Index files are inconsistent; rebuilding")
            self.build_index()
            return
        self._attach(chunks, store, bm25)

    def _attach(self, chunks: list[Chunk], store: FaissVectorStore, bm25: BM25Retriever) -> None:
        cfg = self.config
        self.chunks = chunks
        self._retriever = HybridRetriever(
            self.embedder, store, bm25, cfg.dense_top_k, cfg.sparse_top_k, cfg.rrf_k
        )

    # -------------------------------------------------------------- retrieval
    def retrieve_chunks(
        self, query: str, top_k: int | None = None, min_score: float | None = None
    ) -> list[RetrievedChunk]:
        """Hybrid retrieval -> RRF fusion -> cross-encoder rerank -> top-k chunks.

        min_score drops chunks whose cross-encoder score is below it. Scores are
        logits: above 0 usually means relevant, strongly negative means the
        corpus probably does not cover the question.
        """
        query = query.strip()
        if not query:
            return []
        if self._retriever is None:
            self.refresh()
        if not self.chunks:
            return []

        candidates = self._retriever.retrieve(query)
        passages = [self.chunks[c.position].search_text() for c in candidates]
        scores = self.reranker.score(query, passages)
        ranked = sorted(zip(candidates, scores), key=lambda pair: pair[1], reverse=True)
        if min_score is not None:
            ranked = [pair for pair in ranked if pair[1] >= min_score]

        results: list[RetrievedChunk] = []
        for cand, score in ranked[: top_k or self.config.final_top_k]:
            chunk = self.chunks[cand.position]
            results.append(
                RetrievedChunk(
                    chunk_id=chunk.chunk_id,
                    document=chunk.document,
                    case_name=chunk.case_name,
                    page_number=chunk.page_number,
                    page_end=chunk.page_end,
                    text=chunk.text,
                    retrieval_score=round(score, 4),
                    rrf_score=round(cand.rrf_score, 6),
                    dense_rank=cand.dense_rank,
                    sparse_rank=cand.sparse_rank,
                    citation=chunk.citation,
                    court=chunk.court,
                    judgment_date=chunk.judgment_date,
                )
            )
        return results

    def retrieve(
        self, query: str, top_k: int | None = None, min_score: float | None = None
    ) -> list[dict]:
        """Same as retrieve_chunks, returned as plain JSON-serialisable dicts."""
        return [r.to_dict() for r in self.retrieve_chunks(query, top_k, min_score)]

    @staticmethod
    def format_context(results: list[dict]) -> str:
        """Render results as numbered, citable context blocks for the LLM layer."""
        blocks = []
        for n, r in enumerate(results, start=1):
            pages = (
                f"p. {r['page_number']}"
                if r["page_number"] == r["page_end"]
                else f"pp. {r['page_number']}-{r['page_end']}"
            )
            ref = ", ".join(x for x in (r.get("citation"), r["document"], pages) if x)
            blocks.append(f"[{n}] {r['case_name']} ({ref})\n{r['text']}")
        return "\n\n".join(blocks)


# ----------------------------------------------------------------------- CLI
def print_results(query: str, results: list[dict], preview_chars: int = 600) -> None:
    print(f"\nQuery: {query}\n" + "=" * 80)
    if not results:
        print("No relevant chunks found.")
    for n, r in enumerate(results, start=1):
        pages = r["page_number"] if r["page_number"] == r["page_end"] else f"{r['page_number']}-{r['page_end']}"
        print(f"\n#{n}  {r['case_name']}")
        print(f"    Document : {r['document']}   Page(s): {pages}")
        print(f"    Chunk ID : {r['chunk_id']}")
        print(
            f"    Scores   : retrieval={r['retrieval_score']:.4f}  rrf={r['rrf_score']:.5f}  "
            f"dense_rank={r['dense_rank']}  bm25_rank={r['sparse_rank']}"
        )
        text = r["text"]
        print("    Text     : " + (text[:preview_chars] + " ..." if len(text) > preview_chars else text))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="LexSphere Hybrid RAG retrieval pipeline")
    sub = parser.add_subparsers(dest="command", required=True)
    build = sub.add_parser("build", help="Build the index (only if PDFs changed, unless --force)")
    build.add_argument("--force", action="store_true", help="Rebuild even if nothing changed")
    query = sub.add_parser("query", help="Retrieve the top legal chunks for a query")
    query.add_argument("text", help="The legal question")
    query.add_argument("--top-k", type=int, default=None)
    query.add_argument("--min-score", type=float, default=None, help="Drop chunks scoring below this")
    query.add_argument("--json", action="store_true", help="Print raw JSON instead of a summary")
    args = parser.parse_args(argv)

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    for noisy in ("httpx", "huggingface_hub", "sentence_transformers", "transformers"):
        logging.getLogger(noisy).setLevel(logging.WARNING)
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    if args.command == "build":
        pipeline = HybridRAGPipeline(auto_build=False)
        if args.force or pipeline.needs_rebuild():
            print(json.dumps(pipeline.build_index(), indent=2))
        else:
            print("Index is up to date with the corpus; use --force to rebuild.")
        return 0

    pipeline = HybridRAGPipeline()
    results = pipeline.retrieve(args.text, args.top_k, args.min_score)
    if args.json:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        print_results(args.text, results)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
