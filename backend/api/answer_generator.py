"""Grounded answer generation over retrieved legal passages.

Two modes:
- Ollama (local Llama) when an Ollama server is reachable. The model is told to
  answer only from the numbered passages and cite them as [n].
- Extractive fallback when Ollama is not running: the answer is built from the
  passage sentences most relevant to the question, quoted verbatim, each cited
  as [n]. Nothing is generated, so nothing can be hallucinated.

Each citation is then checked against its source passage with the
cross-encoder (a relevance check, not formal entailment).
"""

from __future__ import annotations

import json
import math
import os
import re
import urllib.error
import urllib.request
from dataclasses import dataclass, field

from rag.chunker import split_sentences
from rag.reranker import CrossEncoderReranker

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3:8b")
OLLAMA_TIMEOUT_S = float(os.environ.get("OLLAMA_TIMEOUT_S", "180"))

# Cross-encoder logit thresholds
RELEVANT_PASSAGE_SCORE = 0.0  # passages below this are "probably not about the question"
VERIFIED_SCORE = 2.0
PARTIAL_SCORE = -1.0
ARGUMENT_PENALTY = 3.0
_ARGUMENT = re.compile(
    r"^(?:Mr|Ms|Mrs|Dr)\.|\blearned (?:senior )?counsel\b|\b(?:argued|submitted|contended|urged)\b",
    re.IGNORECASE,
)

NOT_COVERED_ANSWER = (
    "The indexed judgments do not appear to address this question directly. "
    "No grounded answer can be given from the current corpus; the closest passages "
    "are listed under the supporting evidence for reference."
)


def sigmoid(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-x))


@dataclass
class Claim:
    marker: str  # "[1]"
    text: str
    passage_index: int  # index into the passages list
    verbatim: bool = False  # True when quoted directly from the passage


@dataclass
class GeneratedAnswer:
    answer: str
    claims: list[Claim] = field(default_factory=list)
    model: str = ""
    generation_ms: int = 0


# --------------------------------------------------------------------- Ollama
def ollama_status(timeout: float = 1.5) -> tuple[bool, str | None]:
    """(reachable, model to use). Uses OLLAMA_MODEL if installed, else the first model found."""
    try:
        with urllib.request.urlopen(f"{OLLAMA_BASE_URL}/api/tags", timeout=timeout) as resp:
            models = [m.get("name", "") for m in json.load(resp).get("models", [])]
    except (urllib.error.URLError, OSError, ValueError):
        return False, None
    if not models:
        return True, None
    if OLLAMA_MODEL in models:
        return True, OLLAMA_MODEL
    base = OLLAMA_MODEL.split(":")[0]
    return True, next((m for m in models if m.split(":")[0] == base), models[0])


def _ollama_prompt(query: str, passages: list[dict]) -> str:
    blocks = []
    for n, p in enumerate(passages, start=1):
        ref = ", ".join(x for x in (p.get("citation"), f"p. {p['page_number']}") if x)
        blocks.append(f"[{n}] {p['case_name']} ({ref})\n{p['text']}")
    context = "\n\n".join(blocks)
    return (
        "You are LexSphere, a legal research assistant for Indian law.\n"
        "Answer the question using ONLY the numbered judgment passages below.\n"
        "Rules:\n"
        "- After every sentence, cite the passage it relies on as [n] (e.g. [1] or [2]).\n"
        "- Do not cite a passage that does not support the sentence.\n"
        "- Do not use outside knowledge, and never invent case names or citations.\n"
        "- If the passages do not answer the question, say so plainly.\n"
        "- Be concise: at most 2 short paragraphs.\n\n"
        f"PASSAGES:\n{context}\n\nQUESTION: {query}\n\nANSWER:"
    )


def generate_with_ollama(query: str, passages: list[dict], model: str) -> str:
    body = json.dumps(
        {
            "model": model,
            "prompt": _ollama_prompt(query, passages),
            "stream": False,
            "options": {"temperature": 0.1},
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        f"{OLLAMA_BASE_URL}/api/generate", data=body, headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=OLLAMA_TIMEOUT_S) as resp:
        return json.load(resp).get("response", "").strip()


def claims_from_llm_answer(answer: str, passage_count: int) -> tuple[str, list[Claim]]:
    """One claim per cited sentence. Markers are renumbered so each claim has its own
    marker; the frontend links every [n] chip to exactly one citation card."""
    claims: list[Claim] = []
    paragraphs_out = []
    for paragraph in re.split(r"\n\s*\n", answer.strip()):
        sentences_out = []
        for sentence in split_sentences(paragraph) or [paragraph]:
            cited = [int(n) - 1 for n in re.findall(r"\[(\d+)\]", sentence)]
            cited = [i for i in dict.fromkeys(cited) if 0 <= i < passage_count]
            bare = re.sub(r"\s*\[\d+\]", "", sentence).strip()
            markers = []
            for idx in cited:
                marker = f"[{len(claims) + 1}]"
                claims.append(Claim(marker, bare, idx))
                markers.append(marker)
            sentences_out.append(f"{bare} {' '.join(markers)}".strip())
        paragraphs_out.append(" ".join(sentences_out))
    return "\n\n".join(paragraphs_out), claims


# ----------------------------------------------------------------- extractive
# A run of capitalised header words ("JUDGMENT & LEGAL PRINCIPLES", "AXIS BANK LIMITED")
# followed by a normal capitalised word starts real prose. Acronyms inside brackets
# such as "(NDPS Act)" are excluded, and short runs ("IBC", "NCLT") are ignored.
_CAPS_RUN = re.compile(r"(?<![(\w])((?:(?:[A-Z][A-Z.,'-]+|&)\s+)+)(?=[A-Z][a-z])")
_JUDGE_PREFIX = re.compile(r"^(?:[A-Z][\w.]*\s)*[A-Z][\w.]*,\s*J\.\s+")  # "Indira Banerjee, J. "


def prose_sentences(text: str) -> list[str]:
    """Sentences with cause-title/heading text split off the prose that follows it."""

    def _break(match: re.Match) -> str:
        run = match.group(1)
        return f"{run}\n\n" if sum(ch.isalpha() for ch in run) >= 6 else run

    out = []
    for sentence in split_sentences(_CAPS_RUN.sub(_break, text)):
        sentence = _JUDGE_PREFIX.sub("", sentence).strip()
        if sentence:
            out.append(sentence)
    return out


def _is_heading(sentence: str) -> bool:
    words = sentence.split()
    upper = sum(1 for w in words if w.isupper() and len(w) > 1)
    return upper / max(len(words), 1) > 0.3


def extractive_answer(
    query: str, passages: list[dict], reranker: CrossEncoderReranker, max_sentences: int = 4
) -> GeneratedAnswer:
    relevant = [i for i, p in enumerate(passages) if p["retrieval_score"] >= RELEVANT_PASSAGE_SCORE]
    if not relevant:
        return GeneratedAnswer(NOT_COVERED_ANSWER, model="extractive")

    candidates: list[tuple[int, int, str]] = []  # (passage index, order in passage, sentence)
    for i in relevant:
        for order, sentence in enumerate(prose_sentences(passages[i]["text"])):
            words = len(sentence.split())
            if 8 <= words <= 90 and not _is_heading(sentence) and sentence[-1] in ".?!;":
                candidates.append((i, order, sentence))
    if not candidates:
        return GeneratedAnswer(NOT_COVERED_ANSWER, model="extractive")

    scores = reranker.score(query, [s for _, _, s in candidates])
    # Prefer the court's own findings over sentences reporting counsel's arguments
    scores = [s - ARGUMENT_PENALTY if _ARGUMENT.search(c[2]) else s for c, s in zip(candidates, scores)]
    ranked = sorted(zip(candidates, scores), key=lambda pair: pair[1], reverse=True)

    chosen: list[tuple[int, int, str]] = []
    per_passage: dict[int, int] = {}
    for (i, order, sentence), score in ranked:
        if len(chosen) >= max_sentences:
            break
        if chosen and score < PARTIAL_SCORE:
            break
        if per_passage.get(i, 0) >= 2:
            continue
        chosen.append((i, order, sentence))
        per_passage[i] = per_passage.get(i, 0) + 1

    # One paragraph per judgment (in retrieval order); sentences in document order
    doc_rank = {}
    for i in relevant:
        doc_rank.setdefault(passages[i]["document"], len(doc_rank))
    chosen.sort(key=lambda c: (doc_rank[passages[c[0]]["document"]], relevant.index(c[0]), c[1]))
    claims: list[Claim] = []
    paragraphs: list[str] = []
    for document in dict.fromkeys(passages[c[0]]["document"] for c in chosen):
        parts = []
        for i, _, sentence in (c for c in chosen if passages[c[0]]["document"] == document):
            marker = f"[{len(claims) + 1}]"
            claims.append(Claim(marker, sentence, i, verbatim=True))
            parts.append(f"{sentence} {marker}")
        case_name = next(p["case_name"] for p in passages if p["document"] == document)
        paragraphs.append(f"**{case_name}**: " + " ".join(parts))
    return GeneratedAnswer("\n\n".join(paragraphs), claims, model="extractive")


# ------------------------------------------------------------------ verifying
def verify_claims(claims: list[Claim], passages: list[dict], reranker: CrossEncoderReranker) -> list[dict]:
    """Score each claim against the passage it cites."""
    to_score = [c for c in claims if not c.verbatim]
    scores = dict(
        zip(
            (id(c) for c in to_score),
            reranker.score_pairs([(c.text, passages[c.passage_index]["text"]) for c in to_score]),
        )
    ) if to_score else {}

    results = []
    for c in claims:
        if c.verbatim:
            status, entailment, confidence = "verified", "direct_entailment", 0.99
            rationale = "Quoted verbatim from the cited judgment passage."
        else:
            logit = scores[id(c)]
            confidence = round(sigmoid(logit), 2)
            if logit >= VERIFIED_SCORE:
                status, entailment = "verified", "direct_entailment"
                rationale = "The cited passage strongly supports this statement."
            elif logit >= PARTIAL_SCORE:
                status, entailment = "partially_verified", "partial_support"
                rationale = "The cited passage is related but only partly supports this statement."
            else:
                status, entailment = "unverified", "unsupported_claim"
                rationale = "The cited passage does not appear to support this statement."
            rationale += " (Cross-encoder relevance check between statement and source.)"
        results.append(
            {"claim": c, "status": status, "entailment": entailment,
             "confidence": confidence, "rationale": rationale}
        )
    return results
