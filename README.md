# LexSphere ⚖️

**LexSphere** is an AI-powered legal research workspace engineered to enhance legal discovery, statutory interpretation, case law analysis, and automated citation verification with propositional entailment.

---

## 📌 Architecture & Team Workstreams

```
┌─────────────────────────────────────────────────────────────┐
│                 LexSphere Frontend (React + TS + Vite)      │
│                 - Person 3 (Workstream: pod-3)              │
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

- **Person 1:** Retrieval-Augmented Generation (RAG) Pipeline, BM25 + Dense indexing, RRF reranking, and local Llama inference via Ollama.
- **Person 2:** Legal Document Processing, PDF OCR, semantic chunking, and independent citation propositional entailment verification.
- **Person 3:** Frontend Research Workspace (React/TypeScript/Vite), UI/UX design, typed API client contracts, and system integration.

---

## 🚀 Running the Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit **`http://localhost:5173/`** to interact with the legal research workspace.

### Key Capabilities in `frontend/`:
1. **Legal Corpus Management:** Upload legal PDF briefs/statutes and track multi-stage ingestion progression (OCR -> Chunking -> Indexing -> Ready).
2. **Interactive Legal Research:** Curated benchmark inquiries (Contract Act Sec 74 damages, DPDP Act 2023 legitimate uses, Puttaswamy privacy proportionality, Kesavananda basic structure).
3. **Grounded Editorial Synthesis:** Generated answers with interactive citation chips (`[1]`, `[2]`, `[3]`) that jump directly to highlighted supporting evidence cards.
4. **Citation Verification Audit:** Side-by-side claim vs source excerpt inspection with four-tier entailment classification (`verified`, `partially_verified`, `unverified`, `source_not_found`).
5. **Architectural Transparency:** Inspect the 5-stage RAG & verification execution pipeline with real latency breakdown and candidate counts.
6. **Dual Mode Architecture:** Seamless toggle between offline demo corpus and live FastAPI backend (`VITE_API_BASE_URL`).

---

## 📑 Teammate Integration & Contracts

- **API Contract:** [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) contains complete JSON request/response models for Person 1 & 2.
- **Frontend Guide:** [`frontend/README.md`](frontend/README.md) documents local setup, environment variables, and FastAPI CORS configuration.
