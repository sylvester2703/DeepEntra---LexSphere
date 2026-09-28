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

    def dense_search(self, query: str, allowed: set[int] | None = None) -> list[tuple[int, float]]:
        query_vector = self.embedder.embed_query(query)
        if allowed is None:
            return self.vector_store.search(query_vector, self.dense_top_k)
        # Restricted to some documents: rank everything (flat index = same cost), then filter
        hits = self.vector_store.search(query_vector, len(self.vector_store))
        return [h for h in hits if h[0] in allowed][: self.dense_top_k]

    def sparse_search(self, query: str, allowed: set[int] | None = None) -> list[tuple[int, float]]:
        if allowed is None:
            return self.bm25.search(query, self.sparse_top_k)
        hits = self.bm25.search(query, len(self.bm25.tokenized_corpus))
        return [h for h in hits if h[0] in allowed][: self.sparse_top_k]

    def retrieve(
        self, query: str, allowed: set[int] | None = None, mode: str = "hybrid"
    ) -> list[FusedCandidate]:
        """mode: "hybrid" (dense + BM25), "semantic" (dense only) or "bm25" (BM25 only).
        allowed: chunk positions to search within (None = whole corpus)."""
        if mode not in {"hybrid", "semantic", "bm25"}:
            raise ValueError(f"Unknown search mode: {mode}")
        ranked_lists: dict[str, list[tuple[int, float]]] = {}
        if mode in {"hybrid", "semantic"}:
            ranked_lists["dense"] = self.dense_search(query, allowed)
        if mode in {"hybrid", "bm25"}:
            ranked_lists["sparse"] = self.sparse_search(query, allowed)
        return reciprocal_rank_fusion(ranked_lists, k=self.rrf_k)
