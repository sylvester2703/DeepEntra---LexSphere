"""
Main FastAPI Application for LexSphere Legal Research Platform.
Mounts citation verification module, the Hybrid RAG research API, handles CORS,
and exposes interactive API documentation.
"""

import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Ensure citation directory is on sys.path for clean module imports
current_dir = os.path.dirname(os.path.abspath(__file__))
citation_dir = os.path.join(current_dir, "citation")
if citation_dir not in sys.path:
    sys.path.insert(0, citation_dir)
# backend/ itself, so the rag and api packages import from any working directory
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from verification_api import router as citation_router
from api.research_api import router as research_router, start_background_warmup
from rag.config import RAGConfig

app = FastAPI(
    title="LexSphere AI Legal Platform API",
    description="Backend services for AI Legal Research, Citation Verification, and Legal Retrieval.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for local development and frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include citation verification router
app.include_router(citation_router)

# Include Hybrid RAG research router (/api/health, /api/documents, /api/research/query, ...)
app.include_router(research_router)

# Serve the judgment PDFs so the frontend can open them (pdfUrl -> /corpus/<file>.pdf)
app.mount("/corpus", StaticFiles(directory=str(RAGConfig().corpus_dir)), name="corpus")


@app.on_event("startup")
def warm_up_rag_pipeline():
    # Loads the index and models in the background so the first query is fast
    start_background_warmup()


@app.get("/", summary="Root Health Check")
def root_health_check():
    return {
        "status": "online",
        "service": "LexSphere API Engine",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
