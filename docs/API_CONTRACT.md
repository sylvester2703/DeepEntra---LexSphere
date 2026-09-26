# LexSphere Backend API Contract ⚖️

> **Document Status:** PROPOSED (Ready for Confirmation with Person 1 & Person 2)  
> **Team Contribution:** Person 3 (Frontend & Integration Interface)  
> **Backend Base URL:** Configured via `VITE_API_BASE_URL` (Default: `http://localhost:8000`)

---

## 1. Overview & Architecture

LexSphere's frontend communicates with a unified FastAPI backend coordinating Person 1 (Hybrid RAG & Local Ollama generation) and Person 2 (Document Ingestion & Independent Citation Verification).

```
┌─────────────────────────────────────────────────────────────┐
│                 LexSphere Frontend (React + Vite)           │
└──────────────┬──────────────────────────────▲───────────────┘
               │ HTTP REST (Typed Service)    │ JSON Response
               ▼                              │
┌─────────────────────────────────────────────────────────────┐
│                 FastAPI Integration Gateway                 │
├──────────────────────────────┬──────────────────────────────┤
│  Person 1: Hybrid RAG        │  Person 2: Verification     │
│  - BM25 + Dense Embeddings   │  - PDF OCR & Chunking        │
│  - RRF / Cross-Encoder       │  - Entity & Citation Parser  │
│  - Local Llama via Ollama    │  - Entailment Verifier       │
└──────────────────────────────┴──────────────────────────────┘
```

> **Note on Model Hosting:** The frontend never connects directly to Ollama. Ollama runs strictly behind the FastAPI backend on localhost.

---

## 2. API Endpoints

### `GET /api/health`
Checks backend and local Ollama instance readiness.

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "service": "lexsphere-backend",
  "version": "0.1.0",
  "ollama": {
    "status": "connected",
    "model": "llama3:8b",
    "temperature": 0.1
  },
  "index_status": {
    "documents_count": 4,
    "passages_count": 1420,
    "vector_dim": 768
  }
}
```

---

### `GET /api/documents`
Retrieves all registered and processed legal documents.

**Response `200 OK`:**
```json
[
  {
    "id": "doc-kesavananda-1973",
    "title": "Kesavananda Bharati v. State of Kerala",
    "citation": "(1973) 4 SCC 225",
    "court": "Supreme Court of India",
    "date": "1973-04-24",
    "category": "Constitutional Law",
    "file_name": "kesavananda_bharati_1973.pdf",
    "file_size_bytes": 4518290,
    "pages_count": 135,
    "chunks_count": 412,
    "status": "ready",
    "processing_progress": 100,
    "summary": "Landmark ruling establishing the Basic Structure Doctrine of the Indian Constitution, limiting parliamentary amendment powers under Article 368.",
    "created_at": "2026-09-26T10:00:00Z"
  }
]
```

---

### `POST /api/documents/upload`
Uploads one or more legal PDF briefs/statutes for OCR, chunking, and dual-indexing (BM25 + Dense).

- **Content-Type:** `multipart/form-data`
- **Body:** `file` (Binary PDF), `category` (optional string), `jurisdiction` (optional string)

**Response `201 Created` / `202 Accepted`:**
```json
{
  "id": "doc-dpdp-act-2023",
  "title": "Digital Personal Data Protection Act, 2023",
  "citation": "Act No. 22 of 2023",
  "court": "Parliament of India",
  "date": "2023-08-11",
  "category": "Statute / Privacy",
  "file_name": "dpdp_act_2023.pdf",
  "file_size_bytes": 1084200,
  "pages_count": 22,
  "chunks_count": 68,
  "status": "processing",
  "processing_progress": 25,
  "summary": "Statutory framework governing the processing of digital personal data and rights of data principals.",
  "created_at": "2026-09-26T12:00:00Z"
}
```

---

### `POST /api/research/query`
The primary legal research pipeline endpoint. Executes hybrid retrieval, context injection into Ollama (Llama), generates grounded answers, and runs independent citation verification.

**Request Body:**
```json
{
  "query": "What are the essential elements required to establish a valid claim for liquidated damages under Section 74 of the Indian Contract Act?",
  "document_ids": ["doc-contract-act-1872", "doc-kailash-nath-2015"],
  "filters": {
    "jurisdiction": "Supreme Court of India",
    "category": "Commercial & Contract Law",
    "year_start": 1960,
    "year_end": 2024
  },
  "search_mode": "hybrid",
  "top_k": 5
}
```

**Response `200 OK`:**
```json
{
  "query_id": "qry-20260926-001",
  "query": "What are the essential elements required to establish a valid claim for liquidated damages under Section 74 of the Indian Contract Act?",
  "grounded_answer": "Under Section 74 of the Indian Contract Act, 1872, liquidated damages cannot be awarded automatically as a penalty upon a mere breach [1]. Following the landmark ratio in *Kailash Nath Associates v. DDA*, the claimant must establish actual damage or loss, unless the loss is impossible or difficult to prove [2]. Furthermore, Section 74 stipulates that the sum named is merely an upper ceiling and reasonable compensation must be assessed [3]. Where no loss has occurred whatsoever, forfeiture of earnest money beyond reasonable loss constitutes an unjust penalty [4].",
  "supporting_passages": [
    {
      "id": "pass-kn-042",
      "document_id": "doc-kailash-nath-2015",
      "document_title": "Kailash Nath Associates v. Delhi Development Authority",
      "citation": "(2015) 4 SCC 136",
      "court": "Supreme Court of India",
      "date": "2015-01-09",
      "page_number": 14,
      "paragraph_number": "43.1",
      "excerpt": "Section 74 of the Contract Act applies where damage or loss is caused by breach of contract. Where it is possible to prove actual damage or loss, such proof is not dispensed with. It is only in cases where damage or loss is impossible or difficult to prove that the liquidated amount can be awarded as genuine pre-estimate.",
      "retrieval_method": "hybrid_reranked",
      "bm25_score": 18.42,
      "dense_score": 0.891,
      "combined_score": 0.942
    },
    {
      "id": "pass-ica-074",
      "document_id": "doc-contract-act-1872",
      "document_title": "Indian Contract Act, 1872",
      "citation": "Act IX of 1872",
      "court": "Statute",
      "date": "1872-04-25",
      "page_number": 31,
      "paragraph_number": "Section 74",
      "excerpt": "Compensation for breach of contract where penalty stipulated for.—When a contract has been broken, if a sum is named in the contract as the amount to be paid in case of such breach... the party complaining of the breach is entitled to receive reasonable compensation not exceeding the amount so named.",
      "retrieval_method": "bm25",
      "bm25_score": 21.05,
      "dense_score": 0.812,
      "combined_score": 0.887
    }
  ],
  "citations": [
    {
      "id": "cit-1",
      "marker": "[1]",
      "claim_text": "Liquidated damages cannot be awarded automatically as a penalty upon a mere breach.",
      "source_document_id": "doc-contract-act-1872",
      "source_document_title": "Indian Contract Act, 1872 (Section 74)",
      "source_page": 31,
      "source_excerpt": "the party complaining of the breach is entitled, whether or not actual damage or loss is proved to have been caused thereby, to receive from the party who has broken the contract reasonable compensation not exceeding the amount so named.",
      "verification_status": "verified",
      "confidence_score": 0.96,
      "verification_rationale": "Direct semantic and statutory entailment. Section 74 explicitly substitutes genuine reasonable compensation for contractual penalty.",
      "entailment_type": "direct_entailment"
    },
    {
      "id": "cit-2",
      "marker": "[2]",
      "claim_text": "The claimant must establish actual damage or loss, unless the loss is impossible or difficult to prove.",
      "source_document_id": "doc-kailash-nath-2015",
      "source_document_title": "Kailash Nath Associates v. DDA, (2015) 4 SCC 136",
      "source_page": 14,
      "source_excerpt": "Where it is possible to prove actual damage or loss, such proof is not dispensed with. It is only in cases where damage or loss is impossible or difficult to prove that the liquidated amount can be awarded.",
      "verification_status": "verified",
      "confidence_score": 0.98,
      "verification_rationale": "High precision verbatim ratio alignment from paragraph 43.1 of the Supreme Court ruling.",
      "entailment_type": "direct_entailment"
    },
    {
      "id": "cit-3",
      "marker": "[3]",
      "claim_text": "Section 74 stipulates that the sum named is merely an upper ceiling and reasonable compensation must be assessed.",
      "source_document_id": "doc-contract-act-1872",
      "source_document_title": "Indian Contract Act, 1872",
      "source_page": 31,
      "source_excerpt": "reasonable compensation not exceeding the amount so named or, as the case may be, the penalty stipulated for.",
      "verification_status": "verified",
      "confidence_score": 0.95,
      "verification_rationale": "Corroborated by express statutory language 'not exceeding the amount so named'.",
      "entailment_type": "direct_entailment"
    },
    {
      "id": "cit-4",
      "marker": "[4]",
      "claim_text": "Where no loss has occurred whatsoever, forfeiture of earnest money beyond reasonable loss constitutes an unjust penalty.",
      "source_document_id": "doc-kailash-nath-2015",
      "source_document_title": "Kailash Nath Associates v. DDA, (2015) 4 SCC 136",
      "source_page": 18,
      "source_excerpt": "Since DDA did not suffer any loss when the subsequent auction fetched Rs. 11.75 crores, forfeiture of Rs. 78 lakhs earnest money was held illegal.",
      "verification_status": "partially_verified",
      "confidence_score": 0.82,
      "verification_rationale": "Claim is supported on earnest money principles, but scope varies between earnest money vs security deposit stipulations.",
      "entailment_type": "partial_support"
    }
  ],
  "pipeline_metadata": {
    "preprocessing_time_ms": 32,
    "retrieval_strategy": "Hybrid (BM25 + Dense Vector Index)",
    "bm25_candidates_count": 28,
    "semantic_candidates_count": 25,
    "reranked_passages_count": 5,
    "ollama_model": "llama3:8b (Local Ollama via FastAPI)",
    "generation_time_ms": 1420,
    "verification_time_ms": 380,
    "total_latency_ms": 1832,
    "fusion_method": "Reciprocal Rank Fusion (RRF) + Cross-Encoder"
  }
}
```

---

### `POST /api/citations/verify` (Standalone / Person 2)
Allows standalone claim-versus-source verification check.

**Request:**
```json
{
  "claim": "Section 43A of the IT Act is repealed and superseded by the DPDP Act 2023 upon central notification.",
  "source_passage": "The Digital Personal Data Protection Act, 2023, under Section 44 amends the Information Technology Act, 2000, omitting Section 43A.",
  "citation_reference": "DPDP Act 2023, s. 44"
}
```

**Response `200 OK`:**
```json
{
  "status": "verified",
  "confidence_score": 0.94,
  "entailment_type": "direct_entailment",
  "rationale": "Section 44 of DPDP Act 2023 explicitly omits Section 43A of the Information Technology Act 2000."
}
```

---

## 3. Citation Verification Status Enum

| Status | Meaning in LexSphere UI | Visual Style |
|---|---|---|
| `verified` | Claim is fully entailed and corroborated by the cited source passage | Green badge + Check icon |
| `partially_verified` | Claim is partially supported, but contains extrapolations or nuanced qualifications | Amber/Bronze badge + Info icon |
| `unverified` | Source text does not support or directly contradicts the stated proposition | Red badge + Warning icon |
| `source_not_found` | Cited authority could not be mapped to any indexed passage | Slate badge + Alert icon |

> **Critical Rule:** A citation is **NEVER** marked `verified` solely because a document or case title exists. Verification strictly checks propositional entailment against the retrieved excerpt.
