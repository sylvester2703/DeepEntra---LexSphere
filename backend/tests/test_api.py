"""Tests for the research API that the frontend calls (backend/api/research_api.py).

    pytest tests/test_api.py -q

Uses the real judgment PDFs and the index in backend/data/indexes. Answers are
extractive (OLLAMA_ENABLED=0) so results are fast and deterministic; the Ollama
path has its own test, which is skipped when Ollama is not running.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from main import app  # noqa: E402
from api import answer_generator  # noqa: E402


@pytest.fixture(scope="module")
def client():
    os.environ["OLLAMA_ENABLED"] = "0"
    with TestClient(app) as c:
        yield c
    os.environ.pop("OLLAMA_ENABLED", None)


def test_guardrails_drop_uncited_sentences_and_flag_outside_authorities():
    contexts = [{"index": 0, "case_name": "Mohd. Muslim v. State", "citation": "2023 INSC 308",
                 "text": "Statutory restrictions on bail cannot override the right to a speedy trial under Article 21."}]
    passages = [{"case_name": "Mohd. Muslim v. State", "citation": "2023 INSC 308", "text": contexts[0]["text"]}]
    raw = ("Article 21 guarantees life and liberty. "
           "Bail restrictions cannot override the right to a speedy trial, [1]. "
           "This follows Maneka Gandhi v. Union of India (2017) 16 SCC 1 [1].")
    text, claims = answer_generator.claims_from_llm_answer(raw, contexts)
    assert "guarantees life and liberty" not in text  # uncited sentence removed
    assert "speedy trial. [1]" in text  # stray comma cleaned
    assert len(claims) == 2
    foreign = answer_generator.foreign_authorities(raw, contexts, passages)
    assert any("SCC" in f for f in foreign) and any("Maneka" in f for f in foreign)
    assert answer_generator.foreign_authorities("Per Mohd. Muslim v. State [1].", contexts, passages) == []


def test_relevance_gate_accepts_plain_language_but_not_off_topic():
    def passages(*pairs):
        return [{"document": d, "retrieval_score": s} for d, s in pairs]

    rel = answer_generator.relevant_passage_indices
    assert rel(passages(("a", 1.2), ("b", -9))) == [0]  # clearly relevant
    assert rel(passages(("a", -1.5), ("b", -10.8), ("c", -11))) == [0]  # one judgment stands out
    assert rel(passages(("a", -1.0), ("b", -2.1), ("c", -5.8))) == []  # no clear winner (off-topic)
    assert rel(passages(("a", -7.4), ("b", -12))) == []  # too weak even with a big lead
    assert rel(passages(("a", -1.8), ("a", -1.9), ("a", -5))) == [0, 1]  # one long judgment only
    assert rel(passages(("a", -3.3), ("a", -4))) == []  # ...but not below its stricter floor


def test_plain_language_question_is_answered(client):
    body = client.post("/api/research/query", json={
        "query": "Can a landlord evict a tenant who rented out the shop to someone else without permission?"}).json()
    assert body["citations"] and "Rashmi" in body["citations"][0]["source_document_title"]
    off_topic = client.post("/api/research/query", json={"query": "What is the punishment for theft?"}).json()
    assert off_topic["citations"] == []


def test_ollama_answer_is_grounded_or_rejected(client, monkeypatch):
    monkeypatch.setenv("OLLAMA_ENABLED", "1")
    connected, model = answer_generator.ollama_status()
    if not (connected and model):
        pytest.skip("Ollama is not running")
    body = client.post("/api/research/query", json={"query": "Explain Article 21 judgement"}).json()
    # Either a model answer where every sentence is cited and supported, or the safe fallback
    assert body["citations"], body["grounded_answer"]
    assert all(c["verification_status"] in {"verified", "partially_verified"} for c in body["citations"])
    assert "Maneka" not in body["grounded_answer"]  # no outside authorities
    assert "Muslim" in body["citations"][0]["source_document_title"]


def test_health_reports_index(client):
    body = client.get("/api/health").json()
    assert body["service"] == "lexsphere-backend"
    assert body["indexStatus"]["documentsCount"] >= 1  # camelCase: passed straight to the UI
    assert body["ollama"]["status"] in {"connected", "offline"}


def test_documents_use_frontend_field_names(client):
    docs = client.get("/api/documents").json()
    assert docs
    for key in ["id", "title", "citation", "court", "date", "category", "fileName",
                "pagesCount", "chunksCount", "status", "summary", "pdfUrl"]:
        assert key in docs[0], key
    assert client.get(f"/api/documents/{docs[0]['id']}").status_code == 200
    assert client.get("/api/documents/not-a-document").status_code == 404
    # The PDF itself is served for the document viewer
    pdf = client.get("/corpus/" + docs[0]["fileName"])
    assert pdf.status_code == 200 and pdf.content.startswith(b"%PDF")


def test_research_query_article_21(client):
    res = client.post("/api/research/query", json={"query": "Explain Article 21 judgement", "top_k": 5})
    assert res.status_code == 200
    body = res.json()
    assert len(body["supporting_passages"]) == 5
    assert "Muslim" in body["supporting_passages"][0]["document_title"]
    assert "Article 21" in body["grounded_answer"]
    # Every [n] marker in the answer has a citation card, and vice versa
    markers = {c["marker"] for c in body["citations"]}
    assert markers and all(m in body["grounded_answer"] for m in markers)
    assert all(c["verification_status"] == "verified" for c in body["citations"])
    passage = body["supporting_passages"][0]
    assert 0 <= passage["combined_score"] <= 1
    assert passage["date"] == "2023-03-28"


def test_question_outside_corpus_is_not_answered(client):
    body = client.post("/api/research/query", json={"query": "Explain principles of natural justice"}).json()
    assert body["citations"] == []
    assert "do not appear to address" in body["grounded_answer"]


def test_unknown_document_ids_fall_back_to_whole_corpus(client):
    body = client.post(
        "/api/research/query",
        json={"query": "Explain Article 21 judgement", "document_ids": ["doc-kailash-nath-2015"]},
    ).json()
    assert body["supporting_passages"], "demo-only ids from the frontend must not empty the search"


def test_document_filter_and_modes(client):
    only_ibc = client.post(
        "/api/research/query",
        json={"query": "Section 7 admission", "document_ids": [
            "04_vidarbha_industries_power_limited_vs_axis_bank_limited_2022"], "search_mode": "bm25"},
    ).json()
    assert {p["document_title"] for p in only_ibc["supporting_passages"]} == {
        "Vidarbha Industries Power Limited v. Axis Bank Limited"}
    assert client.post("/api/research/query", json={"query": ""}).status_code == 422
    assert client.post("/api/research/query", json={"query": "x", "search_mode": "magic"}).status_code == 422


def test_verify_claim(client):
    supported = client.post("/api/citations/verify", json={
        "claim": "Bail restrictions cannot override the right to a speedy trial under Article 21.",
        "source_passage": "The Court ruled that statutory restrictions on bail, no matter how stringent, "
                          "cannot override the constitutional right to a speedy trial under Article 21.",
    }).json()
    assert supported["status"] == "verified"
    missing = client.post("/api/citations/verify", json={
        "claim": "Liquidated damages need proof of loss.",
        "citation_reference": "Kailash Nath Associates v. DDA (2015) 4 SCC 136",
    }).json()
    assert missing["status"] == "source_not_found"


def test_upload_rejects_non_pdf(client):
    res = client.post("/api/documents/upload", files={"file": ("notes.pdf", b"not a pdf", "application/pdf")})
    assert res.status_code == 400
    res = client.post("/api/documents/upload", files={"file": ("notes.txt", b"hello", "text/plain")})
    assert res.status_code == 400


def test_simple_explanation_endpoint(client):
    # Ollama is disabled in this module, so the fallback lists the key points
    res = client.post("/api/research/explain", json={
        "query": "Can a landlord evict a tenant who sublet the shop?",
        "answer": "The Supreme Court restored the decree of eviction. [1]",
        "citations": [{"claim_text": "The Supreme Court restored the decree of eviction.",
                       "source_document_title": "Rashmi Kant Vijay Chandra & Ors. v. Baijnath Choubey & Company"}],
    })
    assert res.status_code == 200
    assert "restored the decree of eviction" in res.json()["explanation"]
    not_covered = client.post("/api/research/explain", json={
        "query": "What is the punishment for theft?",
        "answer": answer_generator.NOT_COVERED_ANSWER, "citations": []}).json()
    assert "none of them actually deals with this question" in not_covered["explanation"]
