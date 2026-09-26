"""Tests for the LexSphere Hybrid RAG retrieval pipeline.

Uses the real judgment PDFs in public/documents/judgments (no dummy data).

    pytest tests/test_rag.py -s        # run tests; -s shows the printed chunks
    python tests/test_rag.py           # build the real index and print sample queries

pytest builds indexes in a temporary folder so it never touches backend/data/.
"""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

import pytest

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from rag import HybridRAGPipeline, RAGConfig  # noqa: E402
from rag.chunker import chunk_document, split_sentences  # noqa: E402
from rag.hybrid_retriever import reciprocal_rank_fusion  # noqa: E402
from rag.metadata import case_name_from_filename, extract_document_metadata  # noqa: E402
from rag.pdf_loader import discover_pdfs, load_corpus  # noqa: E402
from rag.pipeline import print_results  # noqa: E402
from rag.text_cleaner import clean_pages, clean_text  # noqa: E402
from rag.schemas import PageText  # noqa: E402

SAMPLE_QUERIES = [
    "Explain Article 21 judgement",
    "What are the fundamental rights under Article 21?",
    "Explain principles of natural justice",
    "Summarize this judgement",
]
RESULT_KEYS = {"document", "case_name", "page_number", "chunk_id", "text", "retrieval_score"}


def _overlap_words(a: str, b: str) -> int:
    """Length of the longest suffix of a that is a prefix of b, in words."""
    wa, wb = a.split(), b.split()
    return next((n for n in range(min(len(wa), len(wb)), 0, -1) if wa[-n:] == wb[:n]), 0)


# --------------------------------------------------------------- fixtures
@pytest.fixture(scope="session")
def config(tmp_path_factory) -> RAGConfig:
    work = tmp_path_factory.mktemp("rag")
    return RAGConfig(processed_dir=work / "processed", index_dir=work / "indexes")


@pytest.fixture(scope="session")
def corpus(config):
    return load_corpus(config.corpus_dir)


@pytest.fixture(scope="session")
def pipeline(config) -> HybridRAGPipeline:
    return HybridRAGPipeline(config)  # builds the index on first use


# ------------------------------------------------------ 1. load PDFs
def test_discovers_every_pdf_in_corpus_folder(config):
    pdfs = discover_pdfs(config.corpus_dir)
    on_disk = [p for p in config.corpus_dir.rglob("*") if p.suffix.lower() == ".pdf"]
    assert pdfs, f"No PDFs found in {config.corpus_dir}"
    assert len(pdfs) == len(on_disk)


def test_pages_are_extracted_with_page_numbers(corpus):
    assert corpus
    for document, pages in corpus.items():
        assert [p.page for p in pages] == list(range(1, len(pages) + 1))
        assert all(p.document == document for p in pages)
        assert sum(len(p.text.split()) for p in pages) > 50, f"{document} has no text"


# ------------------------------------------------------ 2. text cleaning
def test_cleaner_preserves_legal_references():
    text = (
        "Conviction under Section 302 IPC read with Section 34 IPC. Article 21 of the\n"
        "Constitution was considered in Maneka Gandhi, AIR 1978 SC 597, and in\n"
        "(2024) SCC 1; see also 2023 INSC 308 and Section 2(28) of the Electricity Act."
    )
    cleaned = clean_text(text)
    for ref in ["Section 302 IPC", "Section 34 IPC", "Article 21", "AIR 1978 SC 597",
                "(2024) SCC", "2023 INSC 308", "Section 2(28)", "Maneka Gandhi"]:
        assert ref in cleaned, ref


def test_cleaner_removes_page_noise():
    pages = [
        PageText("doc.pdf", 1, "J U D G M E N T\nThe appeal is allowed.\n1\nDigitally signed by\n"
                               "GULSHAN KUMAR\nDate: 2022.07.12\n18:32:55 IST\nReason:\nSignature Not Verified"),
        PageText("doc.pdf", 2, "The pro-\nceedings were stayed.\n2."),
    ]
    first, second = clean_pages(pages)
    assert "JUDGMENT" in first.text
    assert "Digitally signed" not in first.text and "Signature" not in first.text
    assert not first.text.rstrip().endswith("1")
    assert "proceedings" in second.text


# ------------------------------------------------------ 3. chunking + metadata
def test_legal_sentence_splitter_keeps_abbreviations_together():
    sentences = split_sentences("Held in Rahul v. State, per S. Ravindra Bhat, J. under Sec. 37. Bail was granted.")
    assert sentences == ["Held in Rahul v. State, per S. Ravindra Bhat, J. under Sec. 37.", "Bail was granted."]


def test_case_name_from_filename():
    assert case_name_from_filename("04_vidarbha_industries_vs_axis_bank_2022.pdf") == "Vidarbha Industries v. Axis Bank"


def test_chunks_have_required_size_overlap_and_metadata(config, corpus):
    for document, raw in corpus.items():
        meta = extract_document_metadata(document, raw)
        chunks = chunk_document(clean_pages(raw), meta, config)
        total_words = sum(len(p.text.split()) for p in clean_pages(raw))
        assert chunks, document
        print(f"\n{meta.case_name}: {len(chunks)} chunk(s) {[c.word_count for c in chunks]}")
        for c in chunks:
            assert c.chunk_id and c.document == document and c.case_name and c.text
            assert 1 <= c.page_number <= c.page_end <= len(raw)
            assert c.word_count <= config.chunk_max_words
            if total_words >= config.chunk_min_words:
                assert c.word_count >= config.chunk_min_words, (c.chunk_id, c.word_count)
        # Overlap between consecutive chunks (the final chunk may borrow extra context)
        for a, b in zip(chunks[:-2], chunks[1:-1]):
            overlap = _overlap_words(a.text, b.text)
            assert config.overlap_min_words <= overlap <= config.overlap_max_words, (b.chunk_id, overlap)


# ------------------------------------------------------ 4. fusion
def test_reciprocal_rank_fusion_formula():
    fused = reciprocal_rank_fusion({"dense": [(7, 0.9), (3, 0.8)], "sparse": [(3, 12.0), (5, 4.0)]}, k=60)
    scores = {c.position: c.rrf_score for c in fused}
    assert scores[3] == pytest.approx(1 / 62 + 1 / 61)
    assert scores[7] == pytest.approx(1 / 61)
    assert scores[5] == pytest.approx(1 / 62)
    assert fused[0].position == 3 and fused[0].dense_rank == 2 and fused[0].sparse_rank == 1


# ------------------------------------------------------ 5. embeddings + indexes
def test_indexes_are_built_and_consistent(pipeline, config, corpus):
    assert config.index_dir.joinpath("faiss.index").exists()
    assert config.index_dir.joinpath("bm25.pkl").exists()
    assert config.index_dir.joinpath("chunks.json").exists()
    retriever = pipeline._retriever
    assert len(retriever.vector_store) == len(pipeline.chunks) == len(retriever.bm25.tokenized_corpus)
    assert {c.document for c in pipeline.chunks} == set(corpus)
    assert not pipeline.needs_rebuild()


def test_index_reloads_from_disk_without_rebuilding(pipeline, config):
    reloaded = HybridRAGPipeline(config)  # same folder, unchanged corpus
    assert [c.chunk_id for c in reloaded.chunks] == [c.chunk_id for c in pipeline.chunks]


def test_adding_a_pdf_triggers_rebuild(tmp_path, config):
    """Copies real PDFs into a scratch corpus; adding one must invalidate the index."""
    real = discover_pdfs(config.corpus_dir)
    small = sorted(real, key=lambda p: p.stat().st_size)[:2]
    corpus_dir = tmp_path / "corpus"
    corpus_dir.mkdir()
    shutil.copy(small[0], corpus_dir)
    cfg = RAGConfig(corpus_dir=corpus_dir, processed_dir=tmp_path / "p", index_dir=tmp_path / "i")
    pipe = HybridRAGPipeline(cfg)
    assert {c.document for c in pipe.chunks} == {small[0].name}

    shutil.copy(small[1], corpus_dir / "sub_folder_copy.pdf")  # new PDF, no code change
    assert pipe.needs_rebuild()
    assert pipe.refresh() is True
    assert {c.document for c in pipe.chunks} == {small[0].name, "sub_folder_copy.pdf"}


# ------------------------------------------------------ 6. retrieval
def test_article_21_query_returns_top_5_with_metadata(pipeline):
    results = pipeline.retrieve("Explain Article 21 judgement")
    print_results("Explain Article 21 judgement", results)
    assert len(results) == 5
    assert all(RESULT_KEYS <= r.keys() for r in results)
    scores = [r["retrieval_score"] for r in results]
    assert scores == sorted(scores, reverse=True)
    # The corpus judgment on Article 21 (speedy trial vs NDPS bail) must rank first
    assert "article 21" in results[0]["text"].lower()
    assert "muslim" in results[0]["case_name"].lower()


def test_sample_legal_queries(pipeline):
    for query in SAMPLE_QUERIES:
        results = pipeline.retrieve(query)
        print_results(query, results, preview_chars=300)
        assert 1 <= len(results) <= 5
        assert len({r["chunk_id"] for r in results}) == len(results)


def test_min_score_and_empty_query(pipeline):
    assert pipeline.retrieve("   ") == []
    strict = pipeline.retrieve("Explain Article 21 judgement", min_score=0.0)
    assert strict and all(r["retrieval_score"] >= 0 for r in strict)


def test_format_context_for_llm(pipeline):
    context = HybridRAGPipeline.format_context(pipeline.retrieve("Section 7 IBC admission", top_k=2))
    assert context.startswith("[1] ") and "[2] " in context


# ------------------------------------------------------ script mode
if __name__ == "__main__":
    import logging

    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    for noisy in ("httpx", "huggingface_hub", "sentence_transformers", "transformers"):
        logging.getLogger(noisy).setLevel(logging.WARNING)
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    rag = HybridRAGPipeline()  # uses backend/data/indexes, rebuilding only if PDFs changed
    print(f"\nIndexed {len({c.document for c in rag.chunks})} documents as {len(rag.chunks)} chunks")
    for q in SAMPLE_QUERIES:
        print_results(q, rag.retrieve(q))
