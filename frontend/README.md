# LexSphere Frontend ⚖️

Grounded Legal Research Workspace with Hybrid BM25+Dense Retrieval and Independent Citation Verification.

Built by **Person 3** (Frontend & System Integration) using **React 18**, **TypeScript**, **Vite**, and bespoke **Vanilla CSS** tokens.

---

## 🎨 Design & Legal Workspace Architecture

- **Visual Palette:** Warm parchment (`#faf7f2`), soft sand (`#f5efe6`), rich mahogany/espresso (`#1f1610`), and brass/amber accents (`#b8731d`).
- **Typography:** *Newsreader* for editorial legal authority text and quotes, *Cinzel* for title branding, *Plus Jakarta Sans* for crisp UI controls, and *JetBrains Mono* for citation markers and technical scores.
- **Service Boundary:** The UI strictly communicates via typed API adapters (`LiveFastApiAdapter` & `DemoAdapter`) and **never** calls Ollama directly from the browser.

---

## 🚀 Quickstart & Local Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```env
# Live FastAPI Backend URL (Person 1 + Person 2 backend)
VITE_API_BASE_URL=http://localhost:8000

# Default Mode: 'demo' or 'live'
VITE_DEFAULT_MODE=demo
```

### 3. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🔄 Switching Between Demo Mode and Live FastAPI Mode

1. **In the UI:** Use the mode switcher in the top navigation header:
   - **Demo Mode:** Uses rich, internally consistent benchmark data (5 landmark legal documents, pre-computed answers with citation verification breakdown, and dynamic answer synthesis).
   - **Live FastAPI:** Sends HTTP requests to `http://localhost:8000` (`VITE_API_BASE_URL`).
2. **Via Configuration:** Set `VITE_DEFAULT_MODE=live` in `frontend/.env`.

---

## 👥 Teammate Integration Guide (Person 1 & Person 2)

See [`docs/API_CONTRACT.md`](../docs/API_CONTRACT.md) for full JSON request/response schemas.

### Required FastAPI Endpoints:

| Method | Path | Description | Owner |
|---|---|---|---|
| `GET` | `/api/health` | Backend and local Ollama status | Gateway / Person 1 |
| `GET` | `/api/documents` | List indexed legal briefs and statutes | Person 2 |
| `POST` | `/api/documents/upload` | Ingest legal PDF (OCR, Chunking, Indexing) | Person 2 |
| `POST` | `/api/research/query` | Hybrid retrieval + Ollama prompt + Citation verification | Person 1 & 2 |
| `POST` | `/api/citations/verify` | Standalone claim-versus-source verification | Person 2 |

### Enabling CORS in FastAPI (`main.py`):
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="LexSphere Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔍 Citation Verification States

LexSphere verifies propositional entailment between stated claims and source text:
- **Verified (`verified`):** The claim is directly entailed by the cited source passage.
- **Partially Verified (`partially_verified`):** The claim is partially supported, but contains nuance or extrapolation.
- **Unverified / Mismatch (`unverified`):** The source text contradicts or does not support the claim.
- **Source Not Found (`source_not_found`):** The citation could not be mapped to any indexed passage.
