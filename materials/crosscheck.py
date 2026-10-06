"""crosscheck.py - Python reference vs the node engine, every detector count, every email.

Run from the repo root:  python3 materials/crosscheck.py
Prints the canon numbers the pages quote. Exit 0 only if Python and node agree on all of them.
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "materials"))
import plain_reference as pr  # noqa: E402

NODE = r"""
var c = require('./assets/plain-core.js'), s = require('./assets/plain-sample.js'), L = require('./assets/plain-ladder.js');
var live = require('./assets/plain-live.js');
var base = live.baseStats(s.emails);
var out = {
  emails: s.emails.map(c.counts),
  shuffled: s.emails.map(function (e, i) { return c.counts(c.shuffleWords(e, 1000 + i)); }),
  ladder: L.map(function (r) { var a = c.analyse(r.text); return { label: r.label, counts: c.counts(r.text), per100: a.per100, below: live.below(base, a.per100),
                                                                     shuffled: c.counts(c.shuffleWords(r.text, 7)) }; }),
  per: base.per, median: base.median, p90: base.p90, any: base.any, pooled: base.pooled,
  brk: live.breakSample(s.emails)
};
process.stdout.write(JSON.stringify(out));
"""
node = json.loads(subprocess.run(["node", "-e", NODE], cwd=ROOT, capture_output=True, text=True, check=True).stdout)
sample = json.loads((ROOT / "assets" / "plain-sample.js").read_text().split("var PLAIN_SAMPLE = ", 1)[1].split(";\nif (typeof window", 1)[0])
ladder = json.loads((ROOT / "assets" / "plain-ladder.js").read_text().split("var PLAIN_LADDER = ", 1)[1].split(";\nif (typeof window", 1)[0])

KEYS = ["words", "sentences", "hedge", "noun", "passive", "long", "formal", "regional", "polite", "flags"]
bad = 0
py = [pr.counts(e) for e in sample["emails"]]
pysh = [pr.counts(pr.shuffle_words(e, 1000 + i)) for i, e in enumerate(sample["emails"])]
for i, (a, b) in enumerate(zip(py, node["emails"])):
    if a != b:
        bad += 1
        print("MISMATCH email", i, a, b)
for i, (a, b) in enumerate(zip(pysh, node["shuffled"])):
    if a != b:
        bad += 1
        print("MISMATCH shuffled", i, a, b)
n = len(py)
tot = [sum(r[k] for r in py) for k in range(10)]
per = sorted(pr.js_round(r[9] * 10000 / r[0]) / 100 for r in py)
q = lambda p: per[min(n - 1, int(p * n))]
print(f"emails {n}, python==node on all {n} x 10 counts and {n} shuffled: {'YES' if not bad else 'NO'}")
print("totals:", dict(zip(KEYS, tot)))
print("share of emails with >=1:", {KEYS[k]: round(sum(1 for r in py if r[k] > 0) / n, 4) for k in range(2, 10)})
print(f"per100 median {q(0.5)} p90 {q(0.9)} (node {node['median']} {node['p90']}); pooled {pr.js_round(tot[9]*10000/tot[0])/100} (node {node['pooled']})")
if (q(0.5), q(0.9)) != (node["median"], node["p90"]):
    bad += 1
sl = sorted(x for e in sample["emails"] for x in pr.sentences(pr.normalise(e)))
print(f"sentences {len(sl)}; length p50 {sl[len(sl)//2]} p75 {sl[int(.75*len(sl))]} p90 {sl[int(.9*len(sl))]} p95 {sl[int(.95*len(sl))]}; mean {sum(sl)/len(sl):.1f}; over limit {pr.LONG_LIMIT}: {sum(1 for x in sl if x > pr.LONG_LIMIT)}")
print("ladder:")
for r, nd in zip(ladder, node["ladder"]):
    c = pr.counts(r["text"])
    a = pr.analyse(r["text"])
    below = sum(1 for x in per if x < a["per100"])
    ok = c == nd["counts"] and a["per100"] == nd["per100"] and below == nd["below"] and pr.counts(pr.shuffle_words(r["text"], 7)) == nd["shuffled"]
    bad += 0 if ok else 1
    print(f"  {r['label']:<32} {dict(zip(KEYS, c))} per100 {a['per100']} below {below}/{n}  shuffled flags {nd['shuffled'][9]} {'OK' if ok else 'MISMATCH'}")
print("break over sample (node):", node["brk"])
mb = sum(1 for e in sample['emails'] for k in ('hedge','noun','passive','formal','regional') for h in pr.analyse(e)[k] if ' ' in h)
ma = sum(1 for i, e in enumerate(sample['emails']) for k in ('hedge','noun','passive','formal','regional') for h in pr.analyse(pr.shuffle_words(e, 1000 + i))[k] if ' ' in h)
print("break over sample (python): multiword", mb, "->", ma)
if (mb, ma) != (node["brk"]["multiBefore"], node["brk"]["multiAfter"]):
    bad += 1
print("RESULT", "AGREE" if not bad else f"{bad} DISAGREEMENTS")
sys.exit(1 if bad else 0)
