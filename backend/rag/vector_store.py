"""FAISS vector index over chunk embeddings, persisted to disk."""

from __future__ import annotations

from pathlib import Path

import faiss
import numpy as np


class FaissVectorStore:
    """Exact inner-product search (IndexFlatIP). On normalised vectors this is
    cosine similarity. Row i of the index is chunk i of chunks.json."""

    def __init__(self, index: faiss.Index | None = None):
        self.index = index

    @classmethod
    def build(cls, embeddings: np.ndarray) -> "FaissVectorStore":
        index = faiss.IndexFlatIP(embeddings.shape[1])
        index.add(np.ascontiguousarray(embeddings, dtype="float32"))
        return cls(index)

    def save(self, path: Path) -> None:
        # faiss.write_index cannot open non-ASCII Windows paths, so serialise in Python
        path.write_bytes(faiss.serialize_index(self.index).tobytes())

    @classmethod
    def load(cls, path: Path) -> "FaissVectorStore":
        data = np.frombuffer(path.read_bytes(), dtype="uint8")
        return cls(faiss.deserialize_index(data))

    def __len__(self) -> int:
        return 0 if self.index is None else self.index.ntotal

    def search(self, query_vector: np.ndarray, top_k: int) -> list[tuple[int, float]]:
        """Return [(chunk position, cosine similarity), ...] best first."""
        k = min(top_k, len(self))
        if k == 0:
            return []
        scores, ids = self.index.search(np.ascontiguousarray(query_vector, dtype="float32"), k)
        return [(int(i), float(s)) for i, s in zip(ids[0], scores[0]) if i != -1]
