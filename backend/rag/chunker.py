"""Split cleaned judgments into overlapping, context-preserving chunks.

Chunks are built from whole sentences (never cutting mid-sentence) and aim for
700-900 words with a 100-150 word overlap. Each word keeps the page it came
from, so a chunk knows its starting and ending page even across page breaks.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from .config import RAGConfig
from .schemas import Chunk, DocumentMetadata, PageText

# Abbreviations common in Indian judgments whose trailing "." does not end a sentence
_ABBREVIATIONS = {
    "v", "vs", "no", "nos", "sec", "secs", "s", "ss", "art", "arts", "cl", "sub", "para",
    "paras", "r", "rr", "o", "ord", "ch", "vol", "p", "pp", "i.e", "e.g", "viz", "etc",
    "ltd", "pvt", "co", "corpn", "govt", "dept", "hon'ble", "honble", "mr", "mrs", "ms",
    "dr", "sh", "smt", "j", "jj", "cj", "cji", "sr", "jr", "st", "anr", "ors", "etc",
    "u/s", "w.e.f", "ibid", "supra", "cr", "crl", "civ", "misc", "slp", "appx", "approx",
}
_SENTENCE_END = re.compile(r"(?<=[.?!;:])\s+(?=[\"'“‘(\[]?[A-Z0-9])")


@dataclass
class _Sentence:
    words: list[str]
    pages: list[int]


def _ends_with_abbreviation(text: str) -> bool:
    last = text.rsplit(None, 1)[-1].rstrip(".").lower().lstrip("(\"'“‘")
    # Single letters are initials ("S. Ravindra Bhat") or list markers ("(a).")
    return last in _ABBREVIATIONS or (len(last) == 1 and last.isalpha())


def split_sentences(text: str) -> list[str]:
    """Legal-aware sentence splitter; paragraph breaks always end a sentence."""
    sentences: list[str] = []
    for paragraph in re.split(r"\n\s*\n", text):
        paragraph = paragraph.strip()
        if not paragraph:
            continue
        pieces = _SENTENCE_END.split(paragraph)
        buffer = ""
        for piece in pieces:
            buffer = f"{buffer} {piece}".strip() if buffer else piece
            if not _ends_with_abbreviation(buffer):
                sentences.append(buffer)
                buffer = ""
        if buffer:
            sentences.append(buffer)
    return sentences


def _document_sentences(pages: list[PageText], max_words: int) -> list[_Sentence]:
    """Sentences of the whole document, each word tagged with its page."""
    out: list[_Sentence] = []
    for page in pages:
        for sentence in split_sentences(page.text):
            words = sentence.split()
            # A single enormous "sentence" (e.g. a long table) is hard-split
            for start in range(0, len(words), max_words):
                part = words[start : start + max_words]
                out.append(_Sentence(part, [page.page] * len(part)))
    return out


def _overlap_start(sentences: list[_Sentence], start: int, end: int, cfg: RAGConfig) -> int:
    """Index of the first sentence of the next chunk, giving ~100-150 words of overlap."""
    overlap = 0
    i = end
    while i > start + 1:
        size = len(sentences[i - 1].words)
        if overlap >= cfg.overlap_min_words or (overlap and overlap + size > cfg.overlap_max_words):
            break
        overlap += size
        i -= 1
    return i if i > start else end


def chunk_document(pages: list[PageText], meta: DocumentMetadata, cfg: RAGConfig) -> list[Chunk]:
    sentences = _document_sentences(pages, cfg.chunk_max_words)
    if not sentences:
        return []

    def span_words(s: int, e: int) -> int:
        return sum(len(sent.words) for sent in sentences[s:e])

    spans: list[tuple[int, int]] = []
    start = 0
    while start < len(sentences):
        # Fill with whole sentences up to the maximum chunk size
        end, words = start, 0
        while end < len(sentences):
            size = len(sentences[end].words)
            if words and words + size > cfg.chunk_max_words:
                break
            words += size
            end += 1
        spans.append((start, end))
        if end >= len(sentences):
            break
        start = _overlap_start(sentences, start, end, cfg)

    # A short final chunk borrows earlier sentences so it still carries enough context
    if len(spans) > 1:
        s, e = spans[-1]
        while s > 0 and span_words(s, e) < cfg.chunk_min_words:
            if span_words(s - 1, e) > cfg.chunk_max_words:
                break
            s -= 1
        spans[-1] = (s, e)

    chunks: list[Chunk] = []
    doc_key = re.sub(r"[^a-z0-9]+", "_", meta.document.lower().rsplit(".", 1)[0]).strip("_")
    for n, (s, e) in enumerate(spans):
        words = [w for sent in sentences[s:e] for w in sent.words]
        pages_of_words = [p for sent in sentences[s:e] for p in sent.pages]
        text = " ".join(" ".join(sent.words) for sent in sentences[s:e])
        chunks.append(
            Chunk(
                chunk_id=f"{doc_key}::chunk_{n:03d}",
                document=meta.document,
                case_name=meta.case_name,
                page_number=pages_of_words[0],
                page_end=pages_of_words[-1],
                text=text,
                word_count=len(words),
                citation=meta.citation,
                court=meta.court,
                judgment_date=meta.judgment_date,
            )
        )
    return chunks
