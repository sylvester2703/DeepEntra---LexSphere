"""Derive document-level metadata (case name, citation, court, date).

Metadata is read from the first page of the judgment where possible and falls
back to the file name, so any new PDF gets a usable case name automatically.
"""

from __future__ import annotations

import re
from pathlib import PurePosixPath

from .schemas import DocumentMetadata, PageText

_VERSUS_LINE = re.compile(r"^(?:versus|vs\.?|v\.?|v/s)$", re.IGNORECASE)
_INLINE_VERSUS = re.compile(r"^(.{3,150}?)\s+(?:versus|vs\.?|v\.|v/s)\s+(.{3,150})$", re.IGNORECASE)
# Party-role labels that follow names in cause titles: "….. Appellant(s)"
_PARTY_ROLE = re.compile(
    r"[\s.…_-]*(?:appellants?|respondents?|petitioners?|applicants?|plaintiffs?|defendants?)"
    r"(?:\s*\(s\))?\s*$",
    re.IGNORECASE,
)
_CITATION_PATTERNS = [
    re.compile(r"Citation:\s*([^|\n]+)", re.IGNORECASE),
    re.compile(r"\b(\d{4}\s+INSC\s+\d+)\b"),
    re.compile(r"(\(\d{4}\)\s+\d+\s+SCC\s+\d+)"),
    re.compile(r"\b(AIR\s+\d{4}\s+SC\s+\d+)\b"),
    re.compile(r"\b(\d{4}\s+SCC\s+OnLine\s+\w+\s+\d+)\b"),
    # No reported citation: fall back to the case number on the cause title
    re.compile(
        r"\b((?:CIVIL|CRIMINAL|WRIT)\s+(?:APPEAL|PETITION)\s*(?:\(\w+\)\s*)?NO\.?\s*\d+\s+OF\s+\d{4})",
        re.IGNORECASE,
    ),
]
_COURT = re.compile(r"\bIN THE (SUPREME COURT OF INDIA|HIGH COURT OF [A-Z .&]+)", re.IGNORECASE)
_MONTHS = r"(?:January|February|March|April|May|June|July|August|September|October|November|December)"
_DATE_LABELLED = re.compile(rf"Date of Judgment:\s*({_MONTHS}\s+\d{{1,2}},\s*\d{{4}})", re.IGNORECASE)
# Judgments are dated at the end ("JULY 12, 2022; NEW DELHI."), so the last such date wins
_DATE_ANY = re.compile(rf"\b({_MONTHS}\s+\d{{1,2}},\s*\d{{4}})", re.IGNORECASE)

_SMALL_WORDS = {"and", "of", "the", "for", "in", "on", "at", "to", "by", "v.", "vs", "&"}
_KEEP_UPPER = {"NCT", "IPC", "CPC", "LLP", "UOI", "CBI", "ED", "NDPS", "PVT", "LTD"}


def _title_case(name: str) -> str:
    """Convert "AXIS BANK LIMITED" style text to "Axis Bank Limited"."""
    if not name.isupper():
        return name
    words = []
    for i, word in enumerate(name.split()):
        bare = word.strip("().,&@")
        if bare in _KEEP_UPPER:
            words.append(word)
        elif i and word.lower() in _SMALL_WORDS:
            words.append(word.lower())
        else:
            words.append(word.capitalize() if "(" not in word else word.title())
    return " ".join(words)


def _clean_party(text: str) -> str:
    text = _PARTY_ROLE.sub("", text)
    text = re.sub(r"\s+", " ", text).strip(" …,-_")
    return re.sub(r"\s*\.{2,}$", "", text).strip()  # dot leaders, but keep "Ors."


def case_name_from_text(first_page: str) -> str | None:
    lines = [ln.strip() for ln in first_page.split("\n") if ln.strip()][:40]
    for i, line in enumerate(lines):
        # Cause title split over lines: "PARTY A ….. Appellant" / "versus" / "PARTY B"
        if _VERSUS_LINE.match(line) and 0 < i < len(lines) - 1:
            left, right = _clean_party(lines[i - 1]), _clean_party(lines[i + 1])
            if left and right:
                return f"{_title_case(left)} v. {_title_case(right)}"
        # Cause title on one line: "BOINI MAHIPAL AND ANOTHER v. THE STATE OF TELANGANA"
        match = _INLINE_VERSUS.match(line)
        if match and not line.lower().startswith(("citation", "this ", "in the")):
            left, right = _clean_party(match.group(1)), _clean_party(match.group(2))
            if left and right:
                return f"{_title_case(left)} v. {_title_case(right)}"
    return None


def case_name_from_filename(document: str) -> str:
    """ "04_vidarbha_industries_vs_axis_bank_2022.pdf" -> "Vidarbha Industries v. Axis Bank"."""
    stem = PurePosixPath(document).stem
    stem = re.sub(r"^\d+[_\-\s]+", "", stem)  # leading ordering number
    stem = re.sub(r"[_\-\s]+(?:19|20)\d{2}$", "", stem)  # trailing year
    words = re.split(r"[_\-\s]+", stem)
    out = []
    for w in words:
        if w.lower() in {"vs", "v", "versus"}:
            out.append("v.")
        elif w.lower() in _SMALL_WORDS:
            out.append(w.lower())
        elif w.upper() in _KEEP_UPPER:
            out.append(w.upper())
        else:
            out.append(w.capitalize())
    return " ".join(out) if out else document


def _first_match(patterns: list[re.Pattern], text: str) -> str | None:
    for pattern in patterns:
        match = pattern.search(text)
        if match:
            return re.sub(r"\s+", " ", match.group(1)).strip()
    return None


def extract_document_metadata(document: str, raw_pages: list[PageText]) -> DocumentMetadata:
    """Build metadata from the raw (uncleaned) first pages, where layout is intact."""
    head = "\n".join(p.text for p in raw_pages[:2])
    first_page = raw_pages[0].text if raw_pages else ""
    court = _COURT.search(head)
    date = _DATE_LABELLED.search(head)
    if date:
        judgment_date = date.group(1)
    else:
        tail_dates = _DATE_ANY.findall(raw_pages[-1].text) if raw_pages else []
        judgment_date = tail_dates[-1] if tail_dates else None
    if judgment_date:
        judgment_date = _title_case(re.sub(r"\s+", " ", judgment_date).upper())
    return DocumentMetadata(
        document=document,
        case_name=case_name_from_text(first_page) or case_name_from_filename(document),
        citation=_first_match(_CITATION_PATTERNS, head),
        court=_title_case(court.group(1).upper()) if court else None,
        judgment_date=judgment_date,
        total_pages=len(raw_pages),
    )
