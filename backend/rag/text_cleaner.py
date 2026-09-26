"""Clean extracted judgment text without damaging legal references.

Removes: page numbers, digital-signature stamps, headers/footers repeated
across pages, letter-spaced headings, broken hyphenation and extra whitespace.

Deliberately left untouched: punctuation, brackets, digits and capitalisation,
so references such as "Section 302 IPC", "Article 21", "AIR 1978 SC 597",
"(2024) SCC" and "2023 INSC 308" survive verbatim.
"""

from __future__ import annotations

import re
import unicodedata
from collections import Counter

from .schemas import PageText

# Stamp added by the Supreme Court's digital signing, e.g.
# "Digitally signed by\nGULSHAN KUMAR\nARORA\nDate: 2022.07.12\n18:32:55 IST\nReason:\nSignature Not Verified"
_SIGNATURE_BLOCK = re.compile(
    r"(?:Signature\s+Not\s+Verified\s*)?Digitally\s+signed\s+by.*?(?:Reason:\s*(?:Signature\s+Not\s+Verified)?|IST)",
    re.IGNORECASE | re.DOTALL,
)
_SIGNATURE_LEFTOVER = re.compile(r"^\s*Signature\s+Not\s+Verified\s*$", re.IGNORECASE | re.MULTILINE)

# "J U D G M E N T" -> "JUDGMENT" (4+ single capitals separated by one space)
_LETTER_SPACED = re.compile(r"\b(?:[A-Z] ){3,}[A-Z]\b")

# Word broken across lines: "proceed-\nings" -> "proceedings" (lowercase both sides only)
_HYPHEN_BREAK = re.compile(r"([a-z])-\n\s*([a-z])")

# A line holding only a paragraph number such as "12." -- glued to the next line
_PARA_NUMBER_LINE = re.compile(r"^\s*(\d{1,3}\.)\s*$")

_MULTI_SPACE = re.compile(r"[ \t  -​]+")


def _normalise_unicode(text: str) -> str:
    text = unicodedata.normalize("NFC", text)
    return (
        text.replace("­", "")  # soft hyphen
        .replace("﻿", "")
        .replace("\r\n", "\n")
        .replace("\r", "\n")
        .replace(" ", " ")
    )


def _is_page_number(line: str, page: int) -> bool:
    """True for lines that are just this page's number: "5", "- 5 -", "Page 5 of 34"."""
    s = line.strip().lower()
    return bool(
        re.fullmatch(rf"[-–—\s]*{page}[-–—\s]*", s)
        or re.fullmatch(rf"page\s+{page}(\s+of\s+\d+)?", s)
    )


def _strip_page_numbers(lines: list[str], page: int) -> list[str]:
    """Remove page-number lines, but only near the top or bottom of the page."""
    non_empty = [i for i, ln in enumerate(lines) if ln.strip()]
    edge = set(non_empty[:2] + non_empty[-3:])
    return [ln for i, ln in enumerate(lines) if not (i in edge and _is_page_number(ln, page))]


def _repeated_edge_lines(pages: list[list[str]]) -> set[str]:
    """Header/footer lines: the same text at a page edge on most pages."""
    if len(pages) < 3:
        return set()
    counts: Counter[str] = Counter()
    for lines in pages:
        non_empty = [ln.strip() for ln in lines if ln.strip()]
        counts.update(set(non_empty[:2] + non_empty[-2:]))
    threshold = max(3, int(0.5 * len(pages)))
    # Never treat a digits-only line as a header (could be a year or section number)
    return {ln for ln, n in counts.items() if n >= threshold and not ln.isdigit()}


def _reflow(lines: list[str]) -> str:
    """Join wrapped lines into paragraphs; start a new paragraph at "12." markers."""
    paragraphs: list[str] = []
    current: list[str] = []
    pending_number: str | None = None
    for raw in lines:
        line = raw.strip()
        if not line:
            continue
        match = _PARA_NUMBER_LINE.match(line)
        if match:
            if current:
                paragraphs.append(" ".join(current))
                current = []
            pending_number = match.group(1)
            continue
        if pending_number:
            line = f"{pending_number} {line}"
            pending_number = None
        current.append(line)
    if pending_number:
        current.append(pending_number)
    if current:
        paragraphs.append(" ".join(current))
    return "\n\n".join(paragraphs)


def clean_text(text: str) -> str:
    """Clean a free-standing string (no page context)."""
    text = _normalise_unicode(text)
    text = _SIGNATURE_BLOCK.sub(" ", text)
    text = _SIGNATURE_LEFTOVER.sub(" ", text)
    text = _HYPHEN_BREAK.sub(r"\1\2", text)
    text = _LETTER_SPACED.sub(lambda m: m.group(0).replace(" ", ""), text)
    text = _reflow(text.split("\n"))
    text = _MULTI_SPACE.sub(" ", text)
    return re.sub(r" *\n *", "\n", text).strip()


def clean_pages(pages: list[PageText]) -> list[PageText]:
    """Clean every page of one document, using cross-page context for headers."""
    split_pages: list[list[str]] = []
    for p in pages:
        text = _normalise_unicode(p.text)
        text = _SIGNATURE_BLOCK.sub(" ", text)
        text = _SIGNATURE_LEFTOVER.sub(" ", text)
        split_pages.append(_strip_page_numbers(text.split("\n"), p.page))

    repeated = _repeated_edge_lines(split_pages)

    cleaned: list[PageText] = []
    for p, lines in zip(pages, split_pages):
        if repeated:
            lines = [ln for ln in lines if ln.strip() not in repeated]
        cleaned.append(PageText(p.document, p.page, clean_text("\n".join(lines))))
    return cleaned
