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
import logging
import math
import os
import re
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field

from rag.chunker import split_sentences
from rag.embeddings import word_windows
from rag.reranker import CrossEncoderReranker

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
# llama3.2:3b is fast enough on a CPU-only laptop; set OLLAMA_MODEL=llama3:8b on stronger machines
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2:3b")
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
    """(reachable, model to use). Uses OLLAMA_MODEL if installed, else the first model found.
    Set OLLAMA_ENABLED=0 to always use extractive answers (e.g. in tests)."""
    if os.environ.get("OLLAMA_ENABLED", "1").lower() in {"0", "false", "no"}:
        return False, None
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


SYSTEM_PROMPT = (
    "You are LexSphere, a legal research assistant for Indian law. You answer ONLY from "
    "the numbered judgment passages the user gives you. You never use outside knowledge "
    "and never mention any case, statute or citation that is not in the passages. "
    "Every sentence you write ends with the number of the passage that supports it, "
    "like [1] or [2]. If the passages do not answer the question, reply exactly: "
    "NOT_COVERED"
)


def build_llm_context(
    query: str, passages: list[dict], reranker: CrossEncoderReranker, max_passages: int = 3
) -> list[dict]:
    """Relevant passages only, each trimmed to its most relevant ~220-word window, so
    the prompt stays small (fast on CPU, and within the model's context window)."""
    relevant = [i for i, p in enumerate(passages) if p["retrieval_score"] >= RELEVANT_PASSAGE_SCORE]
    contexts = []
    for i in relevant[:max_passages]:
        windows = word_windows(passages[i]["text"], 220, 150)
        scores = reranker.score_pairs([(query, w) for w in windows]) if len(windows) > 1 else [0.0]
        best = windows[max(range(len(windows)), key=scores.__getitem__)]
        contexts.append({"index": i, "case_name": passages[i]["case_name"],
                         "citation": passages[i].get("citation"), "text": best})
    return contexts


def _user_prompt(query: str, contexts: list[dict]) -> str:
    blocks = []
    for n, c in enumerate(contexts, start=1):
        ref = f" ({c['citation']})" if c.get("citation") else ""
        blocks.append(f"[{n}] {c['case_name']}{ref}:\n{c['text']}")
    return (
        "PASSAGES:\n\n" + "\n\n".join(blocks) + "\n\n"
        f"QUESTION: {query}\n\n"
        "Answer in 2 to 4 sentences using only these passages. "
        "End every sentence with its passage number, e.g. [1]."
    )


def generate_with_ollama(query: str, contexts: list[dict], model: str) -> str:
    body = json.dumps(
        {
            "model": model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": _user_prompt(query, contexts)},
            ],
            "stream": False,
            "keep_alive": "30m",  # keep the model in memory between questions
            "options": {"temperature": 0.1, "num_predict": 260, "num_ctx": 4096},
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        f"{OLLAMA_BASE_URL}/api/chat", data=body, headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=OLLAMA_TIMEOUT_S) as resp:
        return json.load(resp).get("message", {}).get("content", "").strip()


def ollama_warmup(model: str) -> None:
    """Load the model into memory so the first question does not pay the load time."""
    body = json.dumps({"model": model, "prompt": "", "keep_alive": "30m"}).encode("utf-8")
    req = urllib.request.Request(
        f"{OLLAMA_BASE_URL}/api/generate", data=body, headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=OLLAMA_TIMEOUT_S) as resp:
        resp.read()


def claims_from_llm_answer(answer: str, contexts: list[dict]) -> tuple[str, list[Claim]]:
    """Keep only sentences that cite a passage; one claim per citation. Markers are
    renumbered so every [n] chip in the UI maps to exactly one citation card."""
    claims: list[Claim] = []
    paragraphs_out = []
    for paragraph in re.split(r"\n\s*\n", answer.strip()):
        sentences_out = []
        for sentence in split_sentences(paragraph) or [paragraph]:
            cited = [int(n) - 1 for n in re.findall(r"\[(\d+)\]", sentence)]
            cited = [i for i in dict.fromkeys(cited) if 0 <= i < len(contexts)]
            if not cited:
                continue  # uncited sentence: not grounded, so it is not shown
            bare = re.sub(r"\s*\[\d+(?:\s*,\s*\d+)*\]", "", sentence).strip(" *-")
            bare = re.sub(r"\s*[,;:]\s*([.?!]?)$", r"\1", bare)  # "bail, [1]." -> "bail."
            if bare and bare[-1] not in ".?!":
                bare += "."
            markers = []
            for i in cited:
                marker = f"[{len(claims) + 1}]"
                claims.append(Claim(marker, bare, contexts[i]["index"]))
                markers.append(marker)
            sentences_out.append(f"{bare} {' '.join(markers)}")
        if sentences_out:
            paragraphs_out.append(" ".join(sentences_out))
    return "\n\n".join(paragraphs_out), claims


_REPORTED = re.compile(
    r"\(\d{4}\)\s*\d+\s+SCC\s+\d+|AIR\s+\d{4}\s+SC\s+\d+|\d{4}\s+INSC\s+\d+|\d{4}\s+SCC\s+OnLine\s+\w+\s+\d+",
    re.IGNORECASE,
)
_CASE_NAME = re.compile(r"\b([A-Z][\w.&@]*(?:\s+[A-Z][\w.&@]*){0,5})\s+(?:v\.|vs\.?|versus)\s+([A-Z][\w.&()]*)")


def foreign_authorities(answer: str, contexts: list[dict], passages: list[dict]) -> list[str]:
    """Citations or case names in the answer that do not come from the retrieved passages."""
    known = " ".join(
        [c["text"] for c in contexts] + [p["case_name"] + " " + (p.get("citation") or "") for p in passages]
    ).lower()
    known_compact = re.sub(r"\s+", " ", known)
    foreign = [c for c in _REPORTED.findall(answer) if re.sub(r"\s+", " ", c.lower()) not in known_compact]
    for first_party, _ in _CASE_NAME.findall(answer):
        # The last word of the party name is the distinctive one ("Per Mohd. Muslim" -> "muslim")
        words = [w for w in re.findall(r"[a-z]+", first_party.lower()) if len(w) > 2]
        if words and words[-1] not in known_compact:
            foreign.append(first_party)
    return foreign


def grounded_answer(
    query: str, passages: list[dict], reranker: CrossEncoderReranker, model: str | None
) -> tuple[GeneratedAnswer, list[dict], str]:
    """Best safe answer: the LLM answer if it passes every check, else the extractive one.
    Returns (answer, citation checks, note explaining which path was used)."""
    started = time.perf_counter()
    note = "Ollama not running"
    contexts = build_llm_context(query, passages, reranker) if model else []
    if model and not contexts:
        note = "no relevant passages for the model"
    elif model:
        try:
            raw = generate_with_ollama(query, contexts, model)
            generation_ms = int((time.perf_counter() - started) * 1000)
            text, claims = claims_from_llm_answer(raw, contexts)
            foreign = foreign_authorities(raw, contexts, passages)
            if "NOT_COVERED" in raw and not claims:
                note = "model found the passages insufficient"
            elif foreign:
                note = "model answer cited authorities not in the corpus: " + ", ".join(foreign[:3])
            elif not claims:
                note = "model answer had no passage citations"
            else:
                checks = verify_claims(claims, passages, reranker)
                if any(c["status"] == "unverified" for c in checks):
                    note = "model answer contained statements its sources do not support"
                else:
                    answer = GeneratedAnswer(text, claims, model=model, generation_ms=generation_ms)
                    return answer, checks, "generated by " + model
        except Exception as exc:  # timeout, Ollama error: fall back safely
            note = f"Ollama error: {exc}"
        logger.warning("Using extractive answer (%s)", note)
    generated = extractive_answer(query, passages, reranker)
    generated.generation_ms = int((time.perf_counter() - started) * 1000)
    return generated, verify_claims(generated.claims, passages, reranker), note


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
