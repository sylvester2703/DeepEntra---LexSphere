"""Tests for the research API that the frontend calls (backend/api/research_api.py).

    pytest tests/test_api.py -q

Uses the real judgment PDFs and the index in backend/data/indexes.
"""

from __future__ import annotations

import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from main import app  # noqa: E402


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


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
