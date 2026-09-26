"""Dense (FAISS) + sparse (BM25) retrieval combined with Reciprocal Rank Fusion."""

from __future__ import annotations

from dataclasses import dataclass, field

from .bm25_retriever import BM25Retriever
from .embeddings import Embedder
from .vector_store import FaissVectorStore


@dataclass
class FusedCandidate:
    position: int  # row in chunks.json / FAISS index / BM25 corpus
    rrf_score: float
    dense_rank: int | None = None
    sparse_rank: int | None = None
    dense_score: float | None = None
    sparse_score: float | None = None
    sources: list[str] = field(default_factory=list)


def reciprocal_rank_fusion(
    ranked_lists: dict[str, list[tuple[int, float]]], k: int = 60
) -> list[FusedCandidate]:
    """RRF: score(d) = sum over lists of 1 / (k + rank_d), with 1-based ranks.

    Rank-based, so BM25 scores and cosine similarities need no normalisation.
    """
    fused: dict[int, FusedCandidate] = {}
    for source, results in ranked_lists.items():
        for rank, (position, score) in enumerate(results, start=1):
            cand = fused.setdefault(position, FusedCandidate(position, 0.0))
            cand.rrf_score += 1.0 / (k + rank)
            cand.sources.append(source)
            if source == "dense":
                cand.dense_rank, cand.dense_score = rank, score
            elif source == "sparse":
                cand.sparse_rank, cand.sparse_score = rank, score
    return sorted(fused.values(), key=lambda c: c.rrf_score, reverse=True)


class HybridRetriever:
    def __init__(
        self,
        embedder: Embedder,
        vector_store: FaissVectorStore,
        bm25: BM25Retriever,
        dense_top_k: int = 10,
        sparse_top_k: int = 10,
        rrf_k: int = 60,
    ):
        self.embedder = embedder
        self.vector_store = vector_store
        self.bm25 = bm25
        self.dense_top_k = dense_top_k
        self.sparse_top_k = sparse_top_k
        self.rrf_k = rrf_k

    def dense_search(self, query: str) -> list[tuple[int, float]]:
        return self.vector_store.search(self.embedder.embed_query(query), self.dense_top_k)

    def sparse_search(self, query: str) -> list[tuple[int, float]]:
        return self.bm25.search(query, self.sparse_top_k)

    def retrieve(self, query: str) -> list[FusedCandidate]:
        return reciprocal_rank_fusion(
            {"dense": self.dense_search(query), "sparse": self.sparse_search(query)},
            k=self.rrf_k,
        )
