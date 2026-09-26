# ⚖️ LexSphere — Citation Verification Module

AI-powered Citation Verification Pipeline for legal discovery, authority extraction, hallucinated citation detection, and RAG retrieval over Supreme Court judgments.

---

## 📁 Module Architecture & Directory Structure

```
backend/
├── main.py                     # Main FastAPI application entry point
└── citation/
    ├── data/
    │   ├── embeddings/          # Generated FAISS vector index & embeddings
    │   ├── extracted_text/      # Raw text extracted from judgment PDFs
    │   └── citations.json       # Parsed legal citations database
    │
    ├── pdf_processor.py         # PyMuPDF-based text & metadata extraction
    ├── citation_parser.py       # Indian legal citation regex parser
    ├── text_chunker.py          # Semantic passage chunking
    ├── embedding_generator.py   # Sentence-Transformers (all-MiniLM-L6-v2)
    ├── vector_store.py          # FAISS Vector Indexing & Similarity Search
    ├── ingest_documents.py      # Automated End-to-End Ingestion Pipeline
    ├── citation_checker.py      # Citation Verification Engine & Confidence Scoring
    ├── verification_api.py      # FastAPI APIRouter endpoints (/api/verify-citation)
    ├── test_citation.py         # Unit test suite
    └── requirements.txt         # Dependencies manifest
```

---

## 🚀 Quickstart Guide

### 1. Environment Setup

#### Windows:
```cmd
python -m venv venv
venv\Scripts\activate
```

#### Linux / macOS:
```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Document Ingestion Pipeline
Builds the citation database, generates embeddings, and creates the FAISS vector index:
```bash
python ingest_documents.py
```

### 4. Run Verification Tests
```bash
python test_citation.py
```

### 5. Launch FastAPI Server
From the `backend` root folder:
```bash
uvicorn main:app --reload
```
Interactive Swagger documentation is available at:
👉 **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

---

## 📡 API Reference

### POST `/api/verify-citation`

#### Sample Request:
```json
{
  "text": "According to Vidarbha Industries Power Limited vs Axis Bank Ltd (2022) 8 SCC 352, the NCLT has discretionary power under Section 7(5)(a)."
}
```

#### Sample Response:
```json
{
  "verification_status": "VERIFIED",
  "citations": [
    {
      "verified": true,
      "status": "VERIFIED",
      "citation": "(2022) 8 SCC 352",
      "case_name": "Vidarbha Industries Power Limited vs Axis Bank",
      "source_document": "04_vidarbha_industries_power_limited_vs_axis_bank_limited_2022.pdf",
      "page_number": 5,
      "confidence_score": 0.93,
      "matched_text": "Section 7(5)(a) of the IBC confers discretionary power on the Adjudicating Authority..."
    }
  ],
  "sources": [
    {
      "document": "04_vidarbha_industries_power_limited_vs_axis_bank_limited_2022.pdf",
      "page": 5,
      "case_name": "Vidarbha Industries Power Limited vs Axis Bank",
      "similarity": 0.93
    }
  ]
}
```
