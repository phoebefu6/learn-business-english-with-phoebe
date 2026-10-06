"""plain_reference.py - Python reference for the plain-English bench.

Reads the lists and regular expressions straight out of assets/plain-core.js (one source of
truth, never a copy), re-implements analyse() in Python, and lets build-enron-sample.py and the
cross-check prove that Python and node give the same count for every detector on every email.
"""
from __future__ import annotations

import json
import math
import re
from pathlib import Path

CORE = Path(__file__).resolve().parent.parent / "assets" / "plain-core.js"
_src = CORE.read_text()


def _js_list(name: str) -> list[str]:
    m = re.search(r"var " + name + r" = \[(.*?)\];", _src, re.S)
    return json.loads("[" + m.group(1).strip().rstrip(",") + "]")


def _js_str(name: str) -> str:
    m = re.search(r"var " + name + r' = ((?:"[^"]*"\s*\+?\s*)+);', _src, re.S)
    return "".join(re.findall(r'"([^"]*)"', m.group(1)))


LONG_LIMIT = int(re.search(r"var LONG_LIMIT = (\d+);", _src).group(1))
HEDGES, FORMAL, REGIONAL, POLITE = (_js_list(n) for n in ("HEDGES", "FORMAL", "REGIONAL", "POLITE"))
THEOF_SKIP, PASSIVE_SKIP = _js_list("THEOF_SKIP"), _js_list("PASSIVE_SKIP")
LIGHT_VERBS, HIDDEN_NOUNS, PART_IRREG = _js_str("LIGHT_VERBS"), _js_str("HIDDEN_NOUNS"), _js_str("PART_IRREG")

RE_LIGHT = re.compile(r"\b(?:" + LIGHT_VERBS + r")\s+(?:(?:a|an|the|our|my|your|some|any|this|that)\s+)?"
                      r"(?:[a-z]+\s+)?(?:" + HIDDEN_NOUNS + r")s?\b")
RE_THEOF = re.compile(r"\bthe ([a-z]+(?:tion|sion|ment|ance|ence)|analysis|approval|review|failure|closure|refusal) of\b")
RE_PASSIVE = re.compile(r"\b(?:am|is|are|was|were|be|been|being)\s+(?:[a-z]+ly\s+)?([a-z]+ed|" + PART_IRREG + r")\b")


def _esc(p: str) -> str:
    return re.sub(r"([.*+?^${}()|\[\]\\])", r"\\\1", p).replace(" ", r"\s+")


def _list_re(lst: list[str]) -> re.Pattern:
    s = sorted(lst, key=lambda x: (-len(x), x))
    return re.compile(r"\b(?:" + "|".join(_esc(x) for x in s) + r")\b")


RE_HEDGE, RE_FORMAL, RE_REGIONAL, RE_POLITE = (_list_re(x) for x in (HEDGES, FORMAL, REGIONAL, POLITE))


def normalise(text: str) -> str:
    t = re.sub(r"\r\n?", "\n", text or "")
    t = re.sub("[‘’ʼ]", "'", t)
    t = re.sub("[“”]", '"', t)
    t = re.sub(r"[^\x00-\x7F]", " ", t)
    return t.lower()


def words(t: str) -> list[str]:
    return re.findall(r"[a-z0-9]+(?:'[a-z]+)?", t)


def sentences(t: str) -> list[int]:
    parts = re.split(r"[.!?]+(?=\s)|\n[ \t]*\n", t)
    return [n for n in (len(words(p)) for p in parts) if n > 0]


def _sp(s: str) -> str:
    return re.sub(r"\s+", " ", s)


def analyse(text: str) -> dict:
    t = normalise(text)
    w = len(words(t))
    regional = [_sp(m.group(0)) for m in RE_REGIONAL.finditer(t)]
    formal = [_sp(m.group(0)) for m in RE_FORMAL.finditer(RE_REGIONAL.sub(" ", t))]
    hedge = [_sp(m.group(0)) for m in RE_HEDGE.finditer(t)]
    noun = [_sp(m.group(0)) for m in RE_LIGHT.finditer(t)]
    noun += [_sp(m.group(0)) for m in RE_THEOF.finditer(t) if m.group(1) not in THEOF_SKIP]
    passive = [_sp(m.group(0)) for m in RE_PASSIVE.finditer(t) if m.group(1) not in PASSIVE_SKIP]
    sl = sentences(t)
    long_ = sum(1 for n in sl if n > LONG_LIMIT)
    polite = [_sp(m.group(0)) for m in RE_POLITE.finditer(t)]
    flags = len(hedge) + len(noun) + len(passive) + long_ + len(formal) + len(regional)
    return dict(words=w, sentences=len(sl), longest=max(sl) if sl else 0, hedge=hedge, noun=noun,
                passive=passive, long=long_, formal=formal, regional=regional, polite=polite,
                flags=flags, per100=js_round(flags * 10000 / w) / 100 if w else 0)


def js_round(x: float) -> int:
    """JavaScript Math.round: half rounds up (Python round() rounds half to even)."""
    return math.floor(x + 0.5)


def counts(text: str) -> list[int]:
    a = analyse(text)
    return [a["words"], a["sentences"], len(a["hedge"]), len(a["noun"]), len(a["passive"]), a["long"],
            len(a["formal"]), len(a["regional"]), len(a["polite"]), a["flags"]]


def mulberry32(seed: int):
    s = seed & 0xFFFFFFFF

    def imul(a: int, b: int) -> int:
        return (a * b) & 0xFFFFFFFF

    def rnd() -> float:
        nonlocal s
        s = (s + 0x6D2B79F5) & 0xFFFFFFFF
        z = s
        z = imul(z ^ (z >> 15), z | 1)
        z ^= (z + imul(z ^ (z >> 7), z | 61)) & 0xFFFFFFFF
        return ((z ^ (z >> 14)) & 0xFFFFFFFF) / 4294967296

    return rnd


def shuffle_words(text: str, seed: int = 7) -> str:
    toks = [x for x in re.split(r"\s+", text or "") if x]
    rnd = mulberry32(seed)
    for i in range(len(toks) - 1, 0, -1):
        j = int(rnd() * (i + 1))
        toks[i], toks[j] = toks[j], toks[i]
    return " ".join(toks)
