"""Central configuration for the LexSphere Hybrid RAG retrieval pipeline.

Every path and tunable lives here so other modules never hardcode values.
Paths can be overridden with environment variables (see README).
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_DIR.parent


def _path_from_env(var: str, default: Path) -> Path:
    value = os.environ.get(var)
    return Path(value).expanduser().resolve() if value else default


@dataclass
class RAGConfig:
    # --- Locations -------------------------------------------------------
    # Folder holding the legal judgment PDFs. Scanned recursively, so new PDFs
    # (or sub-folders of PDFs) are picked up without any code change.
    corpus_dir: Path = field(
        default_factory=lambda: _path_from_env(
            "LEXSPHERE_CORPUS_DIR", REPO_ROOT / "public" / "documents" / "judgments"
        )
    )
    processed_dir: Path = field(
        default_factory=lambda: _path_from_env(
            "LEXSPHERE_PROCESSED_DIR", BACKEND_DIR / "data" / "processed"
        )
    )
    index_dir: Path = field(
        default_factory=lambda: _path_from_env(
            "LEXSPHERE_INDEX_DIR", BACKEND_DIR / "data" / "indexes"
        )
    )

    # --- Models ----------------------------------------------------------
    embedding_model: str = "sentence-transformers/all-mpnet-base-v2"
    reranker_model: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"
    embedding_batch_size: int = 16

    # --- Chunking (word counts) -------------------------------------------
    chunk_min_words: int = 700
    chunk_max_words: int = 900
    overlap_min_words: int = 100
    overlap_max_words: int = 150

    # --- Retrieval ---------------------------------------------------------
    dense_top_k: int = 10
    sparse_top_k: int = 10
    rrf_k: int = 60
    final_top_k: int = 5

    def ensure_dirs(self) -> None:
        self.processed_dir.mkdir(parents=True, exist_ok=True)
        self.index_dir.mkdir(parents=True, exist_ok=True)

    def index_signature(self) -> dict:
        """Settings that invalidate the index when changed."""
        return {
            "embedding_model": self.embedding_model,
            "chunk_min_words": self.chunk_min_words,
            "chunk_max_words": self.chunk_max_words,
            "overlap_min_words": self.overlap_min_words,
            "overlap_max_words": self.overlap_max_words,
        }


# File names inside index_dir / processed_dir
FAISS_INDEX_FILE = "faiss.index"
CHUNK_METADATA_FILE = "chunks.json"
BM25_INDEX_FILE = "bm25.pkl"
BM25_CORPUS_FILE = "bm25_tokenized_corpus.json"
MANIFEST_FILE = "manifest.json"
PAGES_FILE = "pages.json"
