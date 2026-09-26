"""FastAPI router connecting the LexSphere frontend to the Hybrid RAG pipeline.

Endpoints (paths and field names match frontend/src/services/legalApiService.ts):
    GET  /api/health              backend, index and Ollama status
    GET  /api/documents           indexed judgments
    GET  /api/documents/{id}      one judgment
    POST /api/documents/upload    add a PDF to the corpus and re-index
    POST /api/research/query      hybrid retrieval + grounded answer + citation checks
    POST /api/citations/verify    check one claim against a source passage

Note: the frontend passes /api/health and /api/documents responses to the UI
without renaming keys, so those use camelCase. /api/research/query and
/api/citations/verify are snake_case (the frontend maps them).
"""

from __future__ import annotations

import logging
import re
import threading
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal, Optional
from urllib.parse import quote

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from pydantic import BaseModel, Field

from rag import HybridRAGPipeline
from rag.bm25_retriever import tokenize

from .answer_generator import (
    GeneratedAnswer,
    claims_from_llm_answer,
    extractive_answer,
    generate_with_ollama,
    ollama_status,
    prose_sentences,
    sigmoid,
    verify_claims,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Legal Research (Hybrid RAG)"])

MAX_UPLOAD_BYTES = 25 * 1024 * 1024
SERVICE_VERSION = "0.2.0"

# One pipeline per process. The lock serialises index rebuilds with queries.
_lock = threading.RLock()
_state: dict = {"pipeline": None, "ready": False, "error": None}
_doc_cache: dict = {"key": None, "docs": {}, "pages": {}}


# ------------------------------------------------------------------ lifecycle
def _corpus_fingerprint(corpus_dir: Path) -> tuple:
    """Cheap change detector: name, size and modification time of every PDF."""
    return tuple(
        sorted(
            (str(p.relative_to(corpus_dir)), p.stat().st_size, p.stat().st_mtime_ns)
            for p in corpus_dir.rglob("*")
            if p.is_file() and p.suffix.lower() == ".pdf"
        )
    )


def get_pipeline() -> HybridRAGPipeline:
    """The shared pipeline, re-indexed first if PDFs were added, removed or changed
    in the corpus folder while the server was running."""
    with _lock:
        p = _state["pipeline"]
        if p is None:
            p = _state["pipeline"] = HybridRAGPipeline()
            _state["fingerprint"] = _corpus_fingerprint(p.config.corpus_dir)
        else:
            fingerprint = _corpus_fingerprint(p.config.corpus_dir)
            if fingerprint != _state.get("fingerprint"):
                logger.info("Corpus folder changed; refreshing index")
                p.refresh()
                _state["fingerprint"] = fingerprint
        return p


def start_background_warmup() -> None:
    """Build/load the index and load both models without blocking server start-up."""

    def _warm() -> None:
        try:
            with _lock:
                get_pipeline().warmup()
                _state["ready"] = True
            logger.info("Hybrid RAG pipeline ready")
        except Exception as exc:  # reported through /api/health
            _state["error"] = str(exc)
            logger.exception("Hybrid RAG warm-up failed")

    threading.Thread(target=_warm, name="rag-warmup", daemon=True).start()


# ------------------------------------------------------------------ documents
_CATEGORY_KEYWORDS = {
    "Insolvency & Bankruptcy": ["insolvency", "bankruptcy", "ibc", "nclt", "nclat", "corporate debtor"],
    "Criminal Law": ["ipc", "penal code", "criminal", "ndps", "bail", "accused", "conviction", "crpc"],
    "Family & Matrimonial Law": ["hindu marriage", "divorce", "maintenance", "matrimonial", "custody"],
    "Civil Procedure & Tenancy": ["eviction", "tenant", "tenancy", "civil procedure", "cpc", "second appeal"],
    "Constitutional Law": ["article 21", "article 14", "fundamental right", "constitution"],
}
_MONTHS = "January February March April May June July August September October November December".split()


def _iso_date(date: str | None) -> str:
    """'March 28, 2023' -> '2023-03-28' (empty string when unknown)."""
    if not date:
        return ""
    try:
        return datetime.strptime(date.replace(",", ""), "%B %d %Y").date().isoformat()
    except ValueError:
        return date


def _classify(text: str) -> str:
    lowered = text.lower()
    counts = {
        cat: sum(len(re.findall(rf"\b{re.escape(k)}\b", lowered)) for k in keys)
        for cat, keys in _CATEGORY_KEYWORDS.items()
    }
    best = max(counts, key=counts.get)
    return best if counts[best] else "General"


def _summary(text: str) -> str:
    """First real sentence of the judgment, skipping cause-title and header text."""
    for sentence in prose_sentences(text):
        words = sentence.split()
        upper = sum(1 for w in words if w.isupper() and len(w) > 1)
        if len(words) >= 15 and sentence[-1] in ".?!" and upper / len(words) < 0.3:
            return sentence if len(sentence) <= 400 else sentence[:397].rsplit(" ", 1)[0] + "..."
    return ""


def _doc_key(chunk_id: str) -> str:
    return chunk_id.split("::", 1)[0]


def _load_documents(p: HybridRAGPipeline) -> dict[str, dict]:
    """{doc id: internal record}, recomputed only when the index changes."""
    key = id(p.chunks)
    if _doc_cache["key"] == key:
        return _doc_cache["docs"]

    import json

    pages_file = p.config.processed_dir / "pages.json"
    pages: dict[str, list[tuple[int, str]]] = {}
    if pages_file.exists():
        for page in json.loads(pages_file.read_text(encoding="utf-8")):
            pages.setdefault(page["document"], []).append((page["page"], page["text"]))

    docs: dict[str, dict] = {}
    for chunk in p.chunks:
        rec = docs.setdefault(
            _doc_key(chunk.chunk_id),
            {"document": chunk.document, "chunks": [], "case_name": chunk.case_name,
             "citation": chunk.citation, "court": chunk.court, "date": chunk.judgment_date},
        )
        rec["chunks"].append(chunk)
    for doc_id, rec in docs.items():
        path = p.config.corpus_dir / rec["document"]
        doc_pages = pages.get(rec["document"], [])
        full_text = " ".join(t for _, t in doc_pages) or " ".join(c.text for c in rec["chunks"])
        rec.update(
            id=doc_id,
            path=path,
            pages_count=len(doc_pages) or max(c.page_end for c in rec["chunks"]),
            category=_classify(full_text),
            full_text=full_text,
            summary=_summary(doc_pages[0][1] if doc_pages else rec["chunks"][0].text),
        )
    _doc_cache.update(key=key, docs=docs, pages=pages)
    return docs


def _document_json(rec: dict, base_url: str) -> dict:
    """LegalDocument (camelCase, see frontend/src/types/legal.ts)."""
    path: Path = rec["path"]
    stat = path.stat() if path.exists() else None
    return {
        "id": rec["id"],
        "title": rec["case_name"],
        "citation": rec["citation"] or "",
        "court": rec["court"] or "",
        "jurisdiction": "India",
        "date": _iso_date(rec["date"]),
        "category": rec["category"],
        "fileName": rec["document"],
        "fileSizeBytes": stat.st_size if stat else 0,
        "pagesCount": rec["pages_count"],
        "chunksCount": len(rec["chunks"]),
        "status": "ready",
        "processingProgress": 100,
        "processingMessage": "Indexed for hybrid retrieval (FAISS + BM25).",
        "summary": rec["summary"],
        "pdfUrl": f"{base_url}corpus/{quote(rec['document'])}",
        "createdAt": (
            datetime.fromtimestamp(stat.st_mtime, timezone.utc).isoformat(timespec="seconds")
            if stat else ""
        ),
    }


def _page_of_sentence(document: str, sentence: str, fallback: int) -> int:
    """Exact page of a quoted sentence, using the cleaned page texts."""
    probe = " ".join(sentence.split()[:8])
    for page, text in _doc_cache["pages"].get(document, []):
        if probe in text:
            return page
    return fallback


# ----------------------------------------------------------------- endpoints
@router.get("/health", summary="Backend, index and local LLM status")
def health() -> dict:
    connected, model = ollama_status()
    p = _state["pipeline"]
    chunks = len(p.chunks) if p else 0
    documents = len({c.document for c in p.chunks}) if p else 0
    if _state["error"]:
        status = "degraded"
    elif _state["ready"]:
        status = "healthy"
    else:
        status = "degraded"  # still loading models
    index = {"documentsCount": documents, "passagesCount": chunks, "vectorDim": 768}
    return {
        "status": status,
        "service": "lexsphere-backend",
        "version": SERVICE_VERSION,
        "message": _state["error"] or ("ready" if _state["ready"] else "loading models and index"),
        "ollama": {
            "status": "connected" if connected and model else "offline",
            "model": model if connected and model else "Extractive answers (Ollama not running)",
            "temperature": 0.1,
        },
        "indexStatus": index,
        "index_status": {"documents_count": documents, "passages_count": chunks, "vector_dim": 768},
    }


@router.get("/documents", summary="List indexed legal judgments")
def list_documents(request: Request) -> list[dict]:
    with _lock:
        docs = _load_documents(get_pipeline())
    return [_document_json(rec, str(request.base_url)) for rec in docs.values()]


@router.get("/documents/{doc_id}", summary="Get one indexed judgment")
def get_document(doc_id: str, request: Request) -> dict:
    with _lock:
        docs = _load_documents(get_pipeline())
    if doc_id not in docs:
        raise HTTPException(status_code=404, detail=f"Document not found: {doc_id}")
    return _document_json(docs[doc_id], str(request.base_url))


@router.post("/documents/upload", status_code=201, summary="Add a judgment PDF and re-index")
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    category: Optional[str] = Form(None),  # accepted for compatibility; category is auto-detected
) -> dict:
    name = Path(file.filename or "").name
    if not name.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files can be uploaded.")
    data = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="PDF is larger than 25 MB.")
    if not data.startswith(b"%PDF"):
        raise HTTPException(status_code=400, detail="File is not a valid PDF.")

    safe = re.sub(r"[^A-Za-z0-9._-]+", "_", name).strip("._") or "judgment.pdf"
    with _lock:
        p = get_pipeline()
        target = p.config.corpus_dir / safe
        stem, n = target.stem, 1
        while target.exists():  # never overwrite an existing judgment
            target = target.with_name(f"{stem}_{n}.pdf")
            n += 1
        target.write_bytes(data)
        try:
            p.refresh()
        except Exception as exc:
            target.unlink(missing_ok=True)
            p.refresh()
            raise HTTPException(status_code=422, detail=f"Could not index this PDF: {exc}") from exc
        finally:
            _state["fingerprint"] = _corpus_fingerprint(p.config.corpus_dir)
        docs = _load_documents(p)
        rec = next((r for r in docs.values() if r["document"] == target.name), None)
    if rec is None:
        target.unlink(missing_ok=True)
        with _lock:
            get_pipeline().refresh()
        raise HTTPException(status_code=422, detail="No text could be extracted (scanned PDF?).")
    return _document_json(rec, str(request.base_url))


class QueryFiltersModel(BaseModel):
    jurisdiction: Optional[str] = None
    court: Optional[str] = None
    category: Optional[str] = None
    year_start: Optional[int] = None
    year_end: Optional[int] = None


class ResearchQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    document_ids: Optional[list[str]] = None
    filters: Optional[QueryFiltersModel] = None
    search_mode: Literal["hybrid", "bm25", "semantic"] = "hybrid"
    top_k: int = Field(5, ge=1, le=20)


def _allowed_documents(docs: dict[str, dict], req: ResearchQueryRequest) -> Optional[set[str]]:
    """Document names the query may search, or None for the whole corpus.

    Unknown document ids are ignored (the frontend's sample questions carry demo-only
    ids); if none of the requested ids exist, the whole corpus is searched."""
    known_ids = [i for i in (req.document_ids or []) if i in docs]
    selected = [r for r in docs.values() if not known_ids or r["id"] in known_ids]
    f = req.filters
    if f:
        if f.court:
            selected = [r for r in selected if f.court.lower() in (r["court"] or "").lower()]
        if f.category:
            selected = [r for r in selected if r["category"] == f.category]
        if f.year_start or f.year_end:
            def year(r):
                y = _iso_date(r["date"])[:4]
                return int(y) if y.isdigit() else None
            selected = [
                r for r in selected
                if year(r) is not None
                and (not f.year_start or year(r) >= f.year_start)
                and (not f.year_end or year(r) <= f.year_end)
            ]
    if len(selected) == len(docs):
        return None
    return {r["document"] for r in selected}


def _matched_keywords(query: str, text: str) -> list[str]:
    passage_tokens = set(tokenize(text))
    out = []
    for token in dict.fromkeys(tokenize(query)):
        if token in passage_tokens:
            out.append(re.sub(r"^(\w+?)_(\w+)$", lambda m: f"{m[1].title()} {m[2]}", token)
                       if "_" in token else token)
    return out[:8]


@router.post("/research/query", summary="Hybrid RAG legal research with grounded answer")
def research_query(req: ResearchQueryRequest) -> dict:
    started = time.perf_counter()
    query = req.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    with _lock:
        p = get_pipeline()
        docs = _load_documents(p)
        allowed = _allowed_documents(docs, req)
        t_pre = time.perf_counter()
        passages = [] if allowed == set() else p.retrieve(query, req.top_k, documents=allowed, mode=req.search_mode)
        stats = dict(p.last_retrieval_stats)
        t_ret = time.perf_counter()

        generated: GeneratedAnswer | None = None
        connected, model = ollama_status()
        if connected and model and passages:
            try:
                text, claims = claims_from_llm_answer(generate_with_ollama(query, passages, model), len(passages))
                generated = GeneratedAnswer(text, claims, model=model)
            except Exception as exc:
                logger.warning("Ollama generation failed, using extractive answer: %s", exc)
        if generated is None:
            generated = extractive_answer(query, passages, p.reranker)
        t_gen = time.perf_counter()
        checks = verify_claims(generated.claims, passages, p.reranker)
        t_ver = time.perf_counter()

    id_by_document = {r["document"]: r["id"] for r in docs.values()}
    supporting = []
    for r in passages:
        in_both = r["dense_rank"] is not None and r["sparse_rank"] is not None
        supporting.append({
            "id": r["chunk_id"],
            "document_id": id_by_document.get(r["document"], r["document"]),
            "document_title": r["case_name"],
            "citation": r["citation"] or "",
            "court": r["court"] or "",
            "date": _iso_date(r["judgment_date"]),
            "page_number": r["page_number"],
            "paragraph_number": (
                f"pp. {r['page_number']}-{r['page_end']}" if r["page_end"] != r["page_number"] else None
            ),
            "excerpt": r["text"],
            "retrieval_method": "hybrid_reranked" if in_both else ("dense" if r["dense_rank"] else "bm25"),
            "bm25_score": r["sparse_score"],
            "dense_score": r["dense_score"],
            "combined_score": round(sigmoid(r["retrieval_score"]), 4),
            "matched_keywords": _matched_keywords(query, r["text"]),
        })

    citations = []
    for n, check in enumerate(checks, start=1):
        claim = check["claim"]
        src = passages[claim.passage_index]
        page = _page_of_sentence(src["document"], claim.text, src["page_number"]) if claim.verbatim else src["page_number"]
        citations.append({
            "id": f"cit-{n}",
            "marker": claim.marker,
            "claim_text": claim.text,
            "source_document_id": id_by_document.get(src["document"], src["document"]),
            "source_document_title": src["case_name"],
            "source_page": page,
            "source_paragraph": None,
            "source_excerpt": claim.text if claim.verbatim else src["text"][:600],
            "verification_status": check["status"],
            "confidence_score": check["confidence"],
            "verification_rationale": check["rationale"],
            "entailment_type": check["entailment"],
        })

    ms = lambda a, b: int((b - a) * 1000)  # noqa: E731
    return {
        "query_id": f"qry-{datetime.now():%Y%m%d-%H%M%S}-{uuid.uuid4().hex[:6]}",
        "query": query,
        "grounded_answer": generated.answer,
        "supporting_passages": supporting,
        "citations": citations,
        "pipeline_metadata": {
            "preprocessing_time_ms": ms(started, t_pre),
            "retrieval_strategy": {
                "hybrid": "Hybrid (BM25 + Dense Vector Index)",
                "semantic": "Semantic (Dense Vector Index)",
                "bm25": "Keyword (BM25)",
            }[req.search_mode],
            "bm25_candidates_count": stats.get("sparse", 0),
            "semantic_candidates_count": stats.get("dense", 0),
            "reranked_passages_count": len(passages),
            "ollama_model": (
                f"{generated.model} (Local Ollama)" if generated.model != "extractive"
                else "Extractive answer (Ollama not running)"
            ),
            "generation_time_ms": ms(t_ret, t_gen),
            "verification_time_ms": ms(t_gen, t_ver),
            "total_latency_ms": ms(started, t_ver),
            "fusion_method": "Reciprocal Rank Fusion (k=60) + Cross-Encoder rerank",
        },
    }


def _norm(text: str) -> str:
    text = re.sub(r"\b(?:versus|vs\.?|v\.)\s", " v ", text.lower())
    return re.sub(r"[^a-z0-9 ]+", " ", text)


_REPORTED_CITATION = re.compile(
    r"\d{4}\s+INSC\s+\d+|\(\d{4}\)\s*\d+\s+SCC\s+\d+|AIR\s+\d{4}\s+SC\s+\d+|\d{4}\s+SCC\s+OnLine\s+\w+\s+\d+",
    re.IGNORECASE,
)
_PARTY_FILLER = {"the", "and", "m", "s", "shri", "smt", "sri", "mr", "ms"}


def _find_cited_document(reference: str, docs: dict[str, dict]) -> Optional[dict]:
    """Indexed judgment named by a citation reference: a reported citation in the
    reference appears in the judgment, or both party names match."""
    ref = " ".join(_norm(reference).split())
    reported = [" ".join(_norm(c).split()) for c in _REPORTED_CITATION.findall(reference)]
    for rec in docs.values():
        haystack = " ".join(_norm(f"{rec['citation'] or ''} {rec['full_text']}").split())
        if reported and any(c in haystack for c in reported):
            return rec
        parties = [p.split() for p in _norm(rec["case_name"]).split(" v ")]
        if len(parties) != 2:
            continue
        petitioner = " ".join(w for w in parties[0] if w not in _PARTY_FILLER)
        respondent = [w for w in parties[1] if w not in _PARTY_FILLER]
        # First two words of the petitioner + first real word of the respondent
        first = " ".join(petitioner.split()[:2])
        if first and respondent and first in ref and re.search(rf"\bv {re.escape(respondent[0])}\b", ref):
            return rec
    return None


class VerifyClaimRequest(BaseModel):
    claim: str = Field(..., min_length=1, max_length=5000)
    source_passage: str = ""
    citation_reference: Optional[str] = None


@router.post("/citations/verify", summary="Verify a claim against its source passage")
def verify_citation(req: VerifyClaimRequest) -> dict:
    """Checks the claim against the given passage (cross-encoder). If a citation
    reference is given, also checks that it names a judgment in the corpus."""
    rationale_parts: list[str] = []
    status, entailment, confidence = "unverified", "unsupported_claim", 0.0

    if req.source_passage.strip():
        with _lock:
            logit = get_pipeline().reranker.score_pairs([(req.claim, req.source_passage)])[0]
        confidence = round(sigmoid(logit), 2)
        if logit >= 2.0:
            status, entailment = "verified", "direct_entailment"
            rationale_parts.append("The source passage strongly supports the claim.")
        elif logit >= -1.0:
            status, entailment = "partially_verified", "partial_support"
            rationale_parts.append("The source passage only partly supports the claim.")
        else:
            rationale_parts.append("The source passage does not appear to support the claim.")

    if req.citation_reference:
        with _lock:
            docs = _load_documents(get_pipeline())
        match = _find_cited_document(req.citation_reference, docs)
        if match is None:
            status, entailment, confidence = "source_not_found", "missing_source", 0.0
            rationale_parts.append(f"'{req.citation_reference}' does not match any indexed judgment.")
        else:
            rationale_parts.append(f"'{req.citation_reference}' matches the indexed judgment {match['case_name']}.")
            if not req.source_passage.strip():
                status, entailment, confidence = "partially_verified", "partial_support", 0.5
                rationale_parts.append("Provide the source passage to check the claim itself.")

    if not rationale_parts:
        raise HTTPException(status_code=400, detail="Provide a source_passage or a citation_reference.")
    return {
        "status": status,
        "confidence_score": confidence,
        "entailment_type": entailment,
        "rationale": " ".join(rationale_parts),
    }
