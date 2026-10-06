# Agent brief - shared by every fan-out page of learn-business-english-with-phoebe

Internal build document. Never linked from an audience page. Filled from
`~/.claude/skills/course-builder/references/agent-brief.template.md` on 2026-10-06.

You are writing ONE static HTML session page. No servers, no npm. **If your target file already
exists on disk, do not write it; report that and stop.** Write the file, return its path and one
line of coverage. No HTML in your reply.

## Read first, in this order

1. The template page. Copy its structure, classes, SVG grammar and quiz markup EXACTLY,
   including FOUR options per quiz question:
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-business-english-with-phoebe/courses/01-plain-beats-formal.html`
   Also skim the bench page for how canon numbers are quoted (do not copy its bench):
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-business-english-with-phoebe/courses/04-the-plain-english-bench.html`
2. The source map: every verified number, its evidence tier, per-session coverage, the seams.
   Use ONLY its numbers; never invent a statistic; if a fact is missing, teach the uncertainty.
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-business-english-with-phoebe/materials/official-course-map.md`
3. The stylesheet `:root` block for the palette tokens:
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-business-english-with-phoebe/assets/style.css`

## Page skeleton (keep every component)

toolbar (crumb EXACTLY "`<a href="../index.html">learn-business-english-with-phoebe</a> / Session N of 6`",
#toggle-all, #zoom-toggle) · masthead (eyebrow "Learn Business English with Phoebe · Session N of 6",
h1 with one `<span class="accent">`, .sub, .chip-row with the level chip (`🟡 Core` for sessions 2
and 3, `🟠 Hands-on` for sessions 5 and 6), two `.chip.audience`, `.chip.time` "45 min", .agenda
a1-a4 with flex weights 1/4/5/1 as in the template) · main.wrap · section#intro (Part 0: kicker
"Where we start" or "Where we are", .lede, .legend pills exactly as the template, .callout.win
"★ What you walk out with tonight") · 3 Parts, each `section.section#part-N` with section-kicker
(klabel "Part N · covers ...", h2, `.tag.concept "N min live"`), a `.lede`, ONE figure, `details.card`
accordions (summary: `.mode.live` or `.mode.self`, title, `.mini`, `.caret ▶`), at least one
`.callout.example` with `span.ex-pill` "Real world" on the page · section#demo-1 Build-along
(klabel "Build-along", kicker `.tag.demo "★ 22 min · everyone builds"`, .lede, ONE figure,
`.steps > .step`, each a `<p>` then a `.prompt-box.good` carrying a `span.label`, BELOW the p) ·
section#exercise Homework (ol, 4 items, `.tag.exercise "30 min"`) · section#quiz (3 x
`.quiz-q data-answer="0-based"`, `p.qtext`, FOUR `button.qopt` "A · ...", `p.qwhy`; one
`p.quiz-score` after the last; vary the correct letter) · section#official, h2 EXACTLY "What this
session teaches, and where it came from", `.covered > .covered-row` (pill solid ✓ / light ◐ +
name + note), then the `.mono` line EXACTLY "Every fact on this page, and its verification tier,
is recorded in the course's source map." · section.cheat#cheatsheet (h3 "Session N cheat sheet
<span>· pin this</span>", .grid-2 of six .cheat-item) · `.callout.next` with `.nx-pill` "Next
session" (session 6: a closing callout with the same classes, pill text "Where to go next") ·
footer.pagefoot.

Scripts at the end, exactly:
```
<script src="../assets/plain-core.js?v=1"></script>
<script src="../assets/plain-live.js?v=2"></script>
<script src="../assets/app.js?v=1"></script>
```
Head: the template's social meta block with this page's own title/description/url;
`<title>Session N · <Title> - learn business english with phoebe</title>`;
`<link rel="stylesheet" href="../assets/style.css?v=2">`. Nothing else external.

First `details.card` in the FIRST Part is `open` (the template's Part 0 card is an exception you
do not copy: your Part 0 has no card). Sentence case headings. Warm practitioner voice, concrete,
never dry, written for a professional whose English is good and comes out stiff. Inside
prompt-boxes escape `&` `<` `>`. 450 to 650 lines is guidance about depth, never a target: never
collapse whitespace, dissolve a list into a paragraph, or drop a component to fit.

**Optional widget** (encouraged once per page, in the build-along): the mini checker, same six
detectors as the bench: `<div class="pe-mini" data-title="..." data-seed="..."></div>`. The seed
is plain text (escape quotes as `&quot;`). If you quote what it prints for a seed, you must have
computed it: run `node -e "var c=require('<repo>/assets/plain-core.js');console.log(JSON.stringify(c.analyse('<text>')))"`
from Bash and quote only what it prints. Otherwise do not quote counts.

## Hard rules (a violation is rework)

- NEVER an em dash or en dash, anywhere (prose, code, aria-labels, comments). Hyphen only.
- No meta text: never "this course", "in this course", "the course teaches", "banned here". State
  the professional norm directly with its reason. The two exact estate phrases above are the only
  self-references; "session 4" cross-references are fine.
- Attribution "by Phoebe Fu". Never "built with" a tool.
- Every number comes from the map or is labelled constructed. For constructed data never print
  invented outputs as if measured.
- Contested or missing evidence: teach the disagreement; never resolve what the sources have not.
  Known disagreement: the Plain English Campaign email guide says too formal rarely offends;
  its plain English guide and the US guidelines argue against formal sentences. Frame vs sentences.
- Citations in the exact form of the map's appendix; anything marked Tier R is "reported".
- NEVER "lottery" or "lotteries".
- Default to the English word. Do not use Chinese, Malay or other non-English terms on the page.
  If one is genuinely unavoidable it carries its English in brackets right after it, every time.
- Running case: **Mei Lin Goh, a constructed data analyst at Harbourline, a constructed logistics
  company in Singapore.** Say "constructed" the first time she appears on your page. Any other
  person (her manager, a finance lead in London, a colleague in Manila) is constructed too and
  labelled so. Never use Phoebe's own career, employers or clients. No real company as a case.
- Seams: message structure, where the ask goes, bad news, disagreement as structure live in
  https://phoebefu6.github.io/learn-communication-with-phoebe/ (link, never teach). Talk
  delivery, slides, voice and nerves live in
  https://phoebefu6.github.io/learn-public-speaking-with-phoebe/ (link, never teach).
  Business Chinese: https://phoebefu6.github.io/learn-business-chinese-basic-with-phoebe/.
  Teach the LANGUAGE: phrases, verbs, word choice, register, the sentence.
- No statistic about email reading time, meeting speaking time, non-native speaker shares or any
  "studies show". None is in the map; none may appear.
- Titles, widget ids and class names must not collide with siblings. Use ONLY classes that exist
  in the template page or style.css. Do not create ids beyond the section ids above. Never use
  the id `plain-bench`.
- Phrase lists you teach should not contradict the detectors: e.g. a phrase bank for meetings may
  include a softener such as "I'm not sure that works", and if it does, say plainly that the bench
  would count "I'm not sure" as a hedge and why one honest softener in speech differs from six in
  front of a written request.

## Figure grammar (hand-drawn, every figure)

Palette, ONLY these hexes (no invented greys): `#406D77` (teal) `#1F434B` (deep teal, values)
`#36616B` `#C5DADE` `#EDF4F5` (teal 50 tint) `#14282D` (ink) `#4C5F64` (muted) `#C3D3D6` (faint)
`#DDE7E9` (hairline) `#A8452B` (terracotta, the ONE thing a figure is about) `#7C3019`
(terracotta ink, text) `#FBEDE7` (terracotta 50) `#FBFDFD` · `#FFFFFF` · universal reds `#991B1B`
`#FEF2F2` `#FCA5A5` only for a wrong-way panel.

- `<figure class="zoomable">` > `<svg viewBox="0 0 880 H" xmlns="http://www.w3.org/2000/svg"
  role="img" aria-label="the data, not the shape">` > `<defs>` + `<style>` + content, then
  `<figcaption>🔍 Click to zoom - takeaway</figcaption>`. Grow H, never W.
- Prefix unique per figure, used for every class and id: `s<N><letter>`, e.g. s2a, s2b, s2c, s2d.
- `<defs>` holds, with prefix P: a wobble filter `id="PSk"` (copy the template's exactly, new
  seed), a hachure pattern `id="PHc"` (7x7 userSpaceOnUse, rotate(-38), one `#406D77` line,
  opacity .5), an open arrowhead `id="PAr"` (path `M1 1 L9 5 L1 9`, fill none, `#14282D` stroke
  1.6). ALL shapes sit inside ONE `<g filter="url(#PSk)" fill="none" stroke="#14282D"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`; rects carry a tiny rotation
  (-4 to 4 degrees for hand-placed items, under 1 for panels). Fills: white, `#EDF4F5`, the
  hachure for "the pile" or "the data", and terracotta ONLY for the one thing the figure is about.
  One doodle anchor per figure, simple strokes, never a mascot. Text classes: `.PH` 800 12px ink
  heading · `.PL` 600 12px ink label · `.PS` 400 11px `#4C5F64` · `.PB` 800 11px `#7C3019` · `.PV`
  800 16-20px `#1F434B` value · `.PW` 800 12px white on a fill · `.PA` 700 11px `#406D77` axis
  caption · `.PN` 400 12px `#4C5F64` note.
- ALL `<text>` outside the filtered group, sans stack as in the template, never below 10.5px.
- Fit: max chars ~ (box width - 20) / 7 at 12px, 6.4px/char at 11px; full-width note under 110
  chars; 40px between neighbouring point labels; bottom note 22px below the last row, H clears it
  by 8px. No line, arrow or curve may cross a label. When in doubt, shorten.
- Floor: one figure per Part plus one in the build-along (4 figures). Draw the MECHANISM (what
  the reader does with a subject line; where a turn opens in a conversation; how a number is
  heard once and lost), never a metaphor literally, never decoration.

## Voice and honesty

Every Part gets a "Real world" story; they are constructed workplace situations, written as
recognisable scenes, never as claims about real companies. Mei Lin and her colleagues are
labelled constructed. Sources you may cite (all in the map): Plain English Campaign (How to write
in plain English; Writing business emails), US federal plain language guidelines (archived
plainlanguage.gov / digital.gov), Gowers 1954, CEFR Companion Volume 2020 (quote descriptors
exactly as the map gives them, with the level). Bench numbers: only those in the map's "Bench
canon" section.

## Cross-links (absolute URLs)

- Communication: https://phoebefu6.github.io/learn-communication-with-phoebe/
- Public Speaking: https://phoebefu6.github.io/learn-public-speaking-with-phoebe/
- Business Chinese Basic: https://phoebefu6.github.io/learn-business-chinese-basic-with-phoebe/
- Hub: https://phoebefu6.github.io/learn-with-phoebe/

## Footer chain and session titles

Footer left: "Session N of 6 · learn-business-english-with-phoebe · by Phoebe Fu &nbsp;·&nbsp; 📚 <a href="https://phoebefu6.github.io/learn-with-phoebe/">Learn with Phoebe ↗</a>"
Footer right: `<a href="PREV">← Prev: <title></a> &nbsp;·&nbsp; <a href="NEXT">Next: <title> →</a>`;
session 6: `<a href="05-numbers-and-updates-out-loud.html">← Prev: Numbers and updates, out loud</a> &nbsp;·&nbsp; <a href="../index.html">Course home</a>`.

Session titles and files (exact, sentence case, one accent span in h1):
1. 01-plain-beats-formal.html · Plain beats formal
2. 02-emails-that-get-answered.html · Emails that get answered
3. 03-speaking-up-in-meetings.html · Speaking up in meetings
4. 04-the-plain-english-bench.html · The plain-English bench
5. 05-numbers-and-updates-out-loud.html · Numbers and updates, out loud
6. 06-your-phrase-bank.html · Your phrase bank and practice loop
