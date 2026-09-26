"""Discover legal PDFs and extract their text page by page (PyMuPDF)."""

from __future__ import annotations

import hashlib
import logging
from pathlib import Path

import pymupdf

from .schemas import PageText

logger = logging.getLogger(__name__)


def discover_pdfs(corpus_dir: Path) -> list[Path]:
    """Return every PDF under corpus_dir (recursive), sorted for determinism."""
    if not corpus_dir.exists():
        raise FileNotFoundError(f"Legal corpus folder not found: {corpus_dir}")
    return sorted(
        p for p in corpus_dir.rglob("*") if p.is_file() and p.suffix.lower() == ".pdf"
    )


def document_id(pdf_path: Path, corpus_dir: Path) -> str:
    """Stable document name: path relative to the corpus folder, '/'-separated."""
    return pdf_path.relative_to(corpus_dir).as_posix()


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as fh:
        for block in iter(lambda: fh.read(1 << 20), b""):
            digest.update(block)
    return digest.hexdigest()


def extract_pages(pdf_path: Path, document: str) -> list[PageText]:
    """Extract raw text from every page, keeping 1-based page numbers."""
    pages: list[PageText] = []
    with pymupdf.open(pdf_path) as doc:
        for index, page in enumerate(doc):
            # sort=True orders text blocks top-to-bottom, left-to-right
            pages.append(PageText(document, index + 1, page.get_text("text", sort=True)))
    if not any(p.text.strip() for p in pages):
        logger.warning("No extractable text in %s (scanned PDF? OCR not supported)", document)
    return pages


def load_corpus(corpus_dir: Path) -> dict[str, list[PageText]]:
    """Load every PDF in the corpus: {document name: [PageText, ...]}."""
    corpus: dict[str, list[PageText]] = {}
    for pdf_path in discover_pdfs(corpus_dir):
        name = document_id(pdf_path, corpus_dir)
        try:
            corpus[name] = extract_pages(pdf_path, name)
        except Exception as exc:  # a corrupt PDF must not break the whole index
            logger.error("Skipping unreadable PDF %s: %s", name, exc)
    return corpus
