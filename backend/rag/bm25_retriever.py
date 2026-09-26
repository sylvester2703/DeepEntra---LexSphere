"""BM25 keyword index with legal-aware tokenisation."""

from __future__ import annotations

import json
import pickle
import re
from pathlib import Path

from rank_bm25 import BM25Okapi

_TOKEN = re.compile(r"[a-z0-9]+")
# "Section 302", "Article 21", "Order 7 Rule 11" -> extra tokens "section_302",
# "article_21" so an exact provision outranks chunks that merely mention "21"
_PROVISION = re.compile(
    r"\b(section|sec|s|article|art|order|rule|clause|schedule)s?\.?\s*(\d+[a-z]?)(?:\s*\(\s*(\d+|[a-z])\s*\))?",
    re.IGNORECASE,
)
_PROVISION_ALIASES = {"sec": "section", "s": "section", "art": "article"}

_STOPWORDS = frozenset(
    """a an and are as at be been but by for from had has have he her his i if in into is it
    its of on or our she so such that the their them then there these they this those to was
    were which while who whom will with would what when where why how do does did not no can
    could should may might shall also than any all each other some very just about over under
    upon said being here herein thereof whereas""".split()
)


def tokenize(text: str) -> list[str]:
    tokens = [t for t in _TOKEN.findall(text.lower()) if t not in _STOPWORDS]
    for kind, number, sub in _PROVISION.findall(text):
        kind = _PROVISION_ALIASES.get(kind.lower(), kind.lower())
        tokens.append(f"{kind}_{number.lower()}")
        if sub:
            tokens.append(f"{kind}_{number.lower()}_{sub.lower()}")
    return tokens


class BM25Retriever:
    def __init__(self, tokenized_corpus: list[list[str]], bm25: BM25Okapi | None = None):
        self.tokenized_corpus = tokenized_corpus
        self.bm25 = bm25 or (BM25Okapi(tokenized_corpus) if tokenized_corpus else None)

    @classmethod
    def build(cls, texts: list[str]) -> "BM25Retriever":
        return cls([tokenize(t) for t in texts])

    def save(self, index_path: Path, corpus_path: Path) -> None:
        corpus_path.write_text(json.dumps(self.tokenized_corpus), encoding="utf-8")
        with index_path.open("wb") as fh:
            pickle.dump(self.bm25, fh)

    @classmethod
    def load(cls, index_path: Path, corpus_path: Path) -> "BM25Retriever":
        tokenized = json.loads(corpus_path.read_text(encoding="utf-8"))
        bm25 = None
        if index_path.exists():
            try:
                # Only ever loads the pickle this pipeline wrote into its own index folder
                with index_path.open("rb") as fh:
                    bm25 = pickle.load(fh)
            except Exception:
                bm25 = None  # incompatible pickle: rebuild from the tokenized corpus
        return cls(tokenized, bm25)

    def search(self, query: str, top_k: int) -> list[tuple[int, float]]:
        """Return [(chunk position, BM25 score), ...] best first, positive scores only."""
        if self.bm25 is None:
            return []
        tokens = tokenize(query)
        if not tokens:
            return []
        scores = self.bm25.get_scores(tokens)
        ranked = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
        return [(i, float(scores[i])) for i in ranked[:top_k] if scores[i] > 0]
