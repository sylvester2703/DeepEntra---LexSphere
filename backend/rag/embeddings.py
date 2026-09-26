"""Sentence-transformer embeddings for chunks and queries."""

from __future__ import annotations

import logging
from functools import lru_cache

import numpy as np

logger = logging.getLogger(__name__)


@lru_cache(maxsize=2)
def _load_model(model_name: str):
    from sentence_transformers import SentenceTransformer

    logger.info("Loading embedding model %s (downloaded on first use)", model_name)
    return SentenceTransformer(model_name, device="cpu")


def word_windows(text: str, size: int, stride: int) -> list[str]:
    """Overlapping word windows covering the whole text."""
    words = text.split()
    if len(words) <= size:
        return [text]
    starts = list(range(0, len(words) - size + 1, stride))
    if starts[-1] + size < len(words):
        starts.append(len(words) - size)
    return [" ".join(words[s : s + size]) for s in starts]


class Embedder:
    """Wraps all-mpnet-base-v2. Vectors are L2-normalised, so inner product
    in FAISS equals cosine similarity.

    The model reads at most 384 tokens (~250 words); a 700-900 word chunk would
    otherwise be represented by its opening only. Chunks are therefore embedded
    as the normalised mean of overlapping ~200-word windows.
    """

    window_words = 200
    window_stride = 150

    def __init__(self, model_name: str, batch_size: int = 16):
        self.model_name = model_name
        self.batch_size = batch_size

    @property
    def model(self):
        return _load_model(self.model_name)

    @property
    def dimension(self) -> int:
        return self.model.get_sentence_embedding_dimension()

    def _encode(self, texts: list[str]) -> np.ndarray:
        return self.model.encode(
            texts,
            batch_size=self.batch_size,
            normalize_embeddings=True,
            convert_to_numpy=True,
            show_progress_bar=len(texts) > 64,
        ).astype("float32")

    def embed_documents(self, texts: list[str]) -> np.ndarray:
        windows: list[str] = []
        owners: list[int] = []
        for i, text in enumerate(texts):
            for window in word_windows(text, self.window_words, self.window_stride):
                windows.append(window)
                owners.append(i)
        window_vectors = self._encode(windows)
        vectors = np.zeros((len(texts), window_vectors.shape[1]), dtype="float32")
        np.add.at(vectors, np.array(owners), window_vectors)
        vectors /= np.linalg.norm(vectors, axis=1, keepdims=True).clip(min=1e-12)
        return vectors

    def embed_query(self, query: str) -> np.ndarray:
        return self._encode([query])
