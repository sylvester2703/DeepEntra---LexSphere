"""Cross-encoder reranking of fused candidates."""

from __future__ import annotations

import logging
from functools import lru_cache

from .embeddings import word_windows

logger = logging.getLogger(__name__)


@lru_cache(maxsize=2)
def _load_model(model_name: str):
    from sentence_transformers import CrossEncoder

    logger.info("Loading reranker %s (downloaded on first use)", model_name)
    return CrossEncoder(model_name, device="cpu")


class CrossEncoderReranker:
    """Scores each (query, passage) pair jointly, which is more precise than
    comparing independent embeddings.

    ms-marco-MiniLM-L-6-v2 reads at most 512 tokens, so a long chunk is split
    into overlapping ~300-word windows and scored by its best window: a chunk
    is relevant if any part of it answers the query.
    """

    window_words = 300
    window_stride = 200

    def __init__(self, model_name: str, batch_size: int = 16):
        self.model_name = model_name
        self.batch_size = batch_size

    @property
    def model(self):
        return _load_model(self.model_name)

    def score(self, query: str, passages: list[str]) -> list[float]:
        return self.score_pairs([(query, p) for p in passages])

    def score_pairs(self, pairs: list[tuple[str, str]]) -> list[float]:
        """Score (query, passage) pairs; each passage is scored by its best window."""
        if not pairs:
            return []
        windowed: list[tuple[str, str]] = []
        owners: list[int] = []
        for i, (query, passage) in enumerate(pairs):
            for window in word_windows(passage, self.window_words, self.window_stride):
                windowed.append((query, window))
                owners.append(i)
        window_scores = self.model.predict(windowed, batch_size=self.batch_size, show_progress_bar=False)
        best = [float("-inf")] * len(pairs)
        for owner, s in zip(owners, window_scores):
            best[owner] = max(best[owner], float(s))
        return best
