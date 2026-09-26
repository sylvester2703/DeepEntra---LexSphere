"""
Main FastAPI Application for LexSphere Legal Research Platform.
Mounts citation verification module, handles CORS, and exposes interactive API documentation.
"""

import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure citation directory is on sys.path for clean module imports
current_dir = os.path.dirname(os.path.abspath(__file__))
citation_dir = os.path.join(current_dir, "citation")
if citation_dir not in sys.path:
    sys.path.insert(0, citation_dir)

from verification_api import router as citation_router

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
