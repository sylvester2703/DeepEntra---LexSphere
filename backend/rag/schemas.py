"""Data structures passed between pipeline stages."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Optional


@dataclass
class PageText:
    """Text of a single PDF page, as extracted (or after cleaning)."""

    document: str  # file name, e.g. "mohd_muslim_vs_state_nct_delhi.pdf"
    page: int  # 1-based page number
    text: str

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class DocumentMetadata:
    """Document-level facts shared by every chunk of a judgment."""

    document: str
    case_name: str
    citation: Optional[str] = None
    court: Optional[str] = None
    judgment_date: Optional[str] = None
    total_pages: int = 0

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class Chunk:
    """A retrievable unit of legal text with its provenance."""

    chunk_id: str
    document: str
    case_name: str
    page_number: int  # page on which the chunk starts
    page_end: int  # page on which the chunk ends
    text: str
    word_count: int
    citation: Optional[str] = None
    court: Optional[str] = None
    judgment_date: Optional[str] = None

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> "Chunk":
        return cls(**data)

    def search_text(self) -> str:
        """Text used for embedding and BM25: the case name is prepended so a
        query naming the case can match any chunk of that judgment."""
        return f"{self.case_name}. {self.text}"


@dataclass
class RetrievedChunk:
    """A chunk returned to the caller, with the scores that ranked it."""

    chunk_id: str
    document: str
    case_name: str
    page_number: int
    page_end: int
    text: str
    retrieval_score: float  # cross-encoder relevance score (higher = better)
    rrf_score: float
    dense_rank: Optional[int] = None  # 1-based rank in FAISS results, None if absent
    sparse_rank: Optional[int] = None  # 1-based rank in BM25 results, None if absent
    dense_score: Optional[float] = None  # cosine similarity from FAISS
    sparse_score: Optional[float] = None  # raw BM25 score
    citation: Optional[str] = None
    court: Optional[str] = None
    judgment_date: Optional[str] = None
    extra: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return asdict(self)
