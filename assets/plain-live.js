/* plain-live.js - the plain-English bench UI for learn-business-english-with-phoebe
 *
 * Needs plain-core.js (the six detectors), plain-sample.js (400 real Enron emails) and
 * plain-ladder.js (the constructed ladder). Everything on the widget is computed here, in
 * the browser, from the text in the box and from the 400 real emails. Nothing is asserted.
 *
 * MEASURED: every count, every rate, every percentile against the 400 real emails.
 * HEURISTIC: what counts as a hit. The lists are chosen, not discovered, and the passive
 *   detector misses some passives and flags a few adjectives. The widget says so.
 * CONSTRUCTED: the ladder email and its rewrites (Mei Lin Goh is invented for teaching).
 */
(function (root) {
  "use strict";
  var C = root.PLAIN_CORE;
  if (!C && typeof require !== "undefined") C = require("./plain-core.js");

  var DET = [
    { key: "hedge",    name: "Hedges",            unit: "precautionary words before the point" },
    { key: "noun",     name: "Hidden verbs",      unit: "a verb turned into a noun" },
    { key: "passive",  name: "Passive voice",     unit: "be + past participle (heuristic)" },
    { key: "long",     name: "Long sentences",    unit: "" },
    { key: "formal",   name: "Over-formal phrases", unit: "stock phrases a plain version beats" },
    { key: "regional", name: "Regional idioms",   unit: "may confuse global readers, not wrong" }
  ];

  function n(a, k) { return k === "long" ? a.long : a[k].length; }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function pct1(x) { return (x * 100).toFixed(1) + "%"; }

  /* ---------- the real base: 400 Enron emails, analysed once ---------- */
  function baseStats(emails) {
    var rows = emails.map(function (e) { return C.analyse(e); });
    var per = rows.map(function (r) { return r.per100; }).sort(function (a, b) { return a - b; });
    function q(p) { return per[Math.min(per.length - 1, Math.floor(p * per.length))]; }
    var any = {};
    DET.forEach(function (d) {
      any[d.key] = rows.filter(function (r) { return n(r, d.key) > 0; }).length / rows.length;
    });
    any.polite = rows.filter(function (r) { return r.polite.length > 0; }).length / rows.length;
    var words = 0, flags = 0;
    rows.forEach(function (r) { words += r.words; flags += r.flags; });
    return { rows: rows, per: per, median: q(0.5), p90: q(0.9), any: any, pooled: Math.round(flags * 10000 / words) / 100, n: rows.length };
  }
  function below(base, v) {
    var k = 0;
    for (var i = 0; i < base.per.length; i++) if (base.per[i] < v) k++;
    return k;
  }

  /* the break button over the whole sample: phrase hits before and after shuffling word order */
  function breakSample(emails) {
    var keys = ["hedge", "noun", "passive", "formal", "regional"], before = 0, after = 0, multiB = 0, multiA = 0;
    emails.forEach(function (e, i) {
      var a = C.analyse(e), b = C.analyse(C.shuffleWords(e, 1000 + i));
      keys.forEach(function (k) {
        before += a[k].length; after += b[k].length;
        a[k].forEach(function (h) { if (h.indexOf(" ") >= 0) multiB++; });
        b[k].forEach(function (h) { if (h.indexOf(" ") >= 0) multiA++; });
      });
    });
    return { before: before, after: after, multiBefore: multiB, multiAfter: multiA };
  }

  /* ---------- UI ---------- */
  var el = {}, state = { id: "r0", broken: false }, base = null, ladder = [];

  function histogram(v) {
    /* bins of 2 flags per 100 words, last bin 20+ */
    var bins = new Array(11).fill(0);
    base.per.forEach(function (x) { bins[Math.min(10, Math.floor(x / 2))]++; });
    var max = Math.max.apply(null, bins), W = 400, x0 = 14, bw = 34;
    var s = '<svg viewBox="0 0 ' + W + ' 168" role="img" aria-label="Histogram of flags per 100 words across ' + base.n +
      ' real Enron emails, with a marker at the text in the box: ' + v.toFixed(2) + '">';
    for (var i = 0; i < bins.length; i++) {
      var h = bins[i] / max * 86;
      var cx = x0 + i * bw + (bw - 6) / 2;
      s += '<rect x="' + (x0 + i * bw) + '" y="' + (124 - h).toFixed(1) + '" width="' + (bw - 6) + '" height="' + h.toFixed(1) +
        '" rx="3" class="pe-bar"></rect>';
      s += '<text x="' + cx + '" y="140" text-anchor="middle" class="pe-ax">' + (i === 10 ? "20+" : i * 2) + "</text>";
      if (bins[i]) s += '<text x="' + cx + '" y="' + (120 - h).toFixed(1) + '" text-anchor="middle" class="pe-ct">' + bins[i] + "</text>";
    }
    var mx = x0 + Math.min(v, 21.5) / 2 * bw;
    var right = mx > W / 2;
    s += '<line x1="' + mx.toFixed(1) + '" x2="' + mx.toFixed(1) + '" y1="30" y2="126" class="pe-mark"></line>';
    s += '<text x="' + (right ? mx - 6 : mx + 6).toFixed(1) + '" y="18" text-anchor="' + (right ? "end" : "start") + '" class="pe-mk">this text: ' + v.toFixed(2) + "</text>";
    s += '<text x="' + x0 + '" y="160" class="pe-ax">flags per 100 words · 400 real Enron emails</text>';
    return s + "</svg>";
  }

  function render() {
    var text = el.box.value;
    var used = state.broken ? C.shuffleWords(text, 7) : text;
    var a = C.analyse(used);
    var k = below(base, a.per100);
    var verdict, cls;
    if (!a.words) { verdict = "Paste or type an email to measure it"; cls = "ok"; }
    else if (state.broken) { verdict = "Word order shuffled: the multi-word phrases fall apart, single words survive, the word count does not move"; cls = "bad"; }
    else if (a.per100 > base.p90) { verdict = "More flags per 100 words than " + k + " of " + base.n + " real business emails"; cls = "bad"; }
    else if (a.per100 > base.median) { verdict = "Stiffer than the median real email: " + k + " of " + base.n + " score lower"; cls = "ok"; }
    else {
      var tie = base.per.filter(function (x) { return x === a.per100; }).length;
      verdict = a.flags === 0 ? "Zero flags: level with the " + tie + " of " + base.n + " real emails that also score zero"
        : "Plainer than the median real email: only " + k + " of " + base.n + " score lower";
      cls = "good";
    }

    var m = '<div class="mb-verdict is-' + cls + '">' + esc(verdict) + "</div><div class=\"mb-metrics\">";
    m += metric("Flags per 100 words", a.per100.toFixed(2), a.flags + " flags in " + a.words + " words · Enron median " + base.median.toFixed(2), "measured");
    DET.forEach(function (d) {
      var unit = d.key === "long" ? "over " + C.LONG_LIMIT + " words · longest " + a.longest : d.unit;
      m += metric(d.name, n(a, d.key), unit + " · " + pct1(base.any[d.key]) + " of real emails have one", "measured");
    });
    m += metric("Politeness markers", a.polite.length, (a.polite.length ? "present" : "absent") + " · not a flag · " + pct1(base.any.polite) + " of real emails have one", "counted");
    m += "</div>";
    el.read.innerHTML = m;

    var chips = "";
    DET.concat([{ key: "polite", name: "Politeness" }]).forEach(function (d) {
      var hits = d.key === "long" ? [] : a[d.key];
      if (!hits.length) return;
      chips += '<div class="pe-hitrow"><b>' + esc(d.name) + "</b>" + hits.map(function (h) {
        return '<span class="pe-hit is-' + d.key + '">' + esc(h) + "</span>";
      }).join("") + "</div>";
    });
    el.hits.innerHTML = chips || '<p class="mb-hint">No phrase hits in this text.</p>';
    el.hist.innerHTML = histogram(a.per100);
    el.out.textContent = state.broken ? used : "";
    el.out.style.display = state.broken ? "block" : "none";
    root.PLAIN_LIVE.last = a;
  }

  function metric(label, value, unit, kind) {
    return '<div class="mb-metric"><span class="mb-mlabel">' + esc(label) + '</span><span class="mb-mvalue">' + esc(value) +
      '</span><span class="mb-munit">' + esc(unit) + '</span><span class="mb-mkind is-' + (kind === "measured" ? "measured" : "heuristic") + '">' + kind + "</span></div>";
  }

  function choose(id) {
    state.id = id;
    Object.keys(el.btn).forEach(function (k) {
      el.btn[k].classList.toggle("is-on", k === id);
      el.btn[k].querySelector("input").checked = (k === id);
    });
    if (id !== "own") {
      var r = ladder.filter(function (x) { return x.id === id; })[0];
      el.box.value = r.text;
    } else if (!el.box.dataset.touched) {
      el.box.value = "";
    }
    render();
  }

  function setBroken(on) {
    state.broken = on;
    el.brk.classList.toggle("is-on", on);
    el.brk.setAttribute("aria-pressed", on ? "true" : "false");
    el.brk.textContent = on ? "Restore the word order" : "Break it: shuffle the word order";
    render();
  }

  function build(rootEl) {
    var pre = document.createElement("div");
    pre.className = "mb-presets";
    el.btn = {};
    ladder.concat([{ id: "own", label: "Your own email", own: true }]).forEach(function (r) {
      var lab = document.createElement("label");
      lab.className = "mb-preset" + (r.anti ? " is-anti" : "");
      var note = r.own ? "paste one you sent this week" : r.anti ? "the obvious upgrade, measured" : r.id === "r0" ? "constructed, by Mei Lin Goh" : "one habit fixed";
      lab.innerHTML = '<input type="radio" name="pe-rung" value="' + r.id + '"><span class="mb-pname">' + esc(r.anti ? r.label.replace(/^Anti-lever: */, "").replace(/^./, function (c) { return c.toUpperCase(); }) : r.label) +
        (r.anti ? ' <em class="mb-anti">anti-lever</em>' : "") + '</span><span class="mb-pnote">' + esc(note) + "</span>";
      lab.querySelector("input").addEventListener("change", function () { choose(r.id); });
      el.btn[r.id] = lab;
      pre.appendChild(lab);
    });

    var edit = document.createElement("div");
    edit.className = "mb-edit";
    edit.innerHTML = '<label for="pe-box">The email being measured</label><textarea id="pe-box" spellcheck="false"></textarea>' +
      '<div class="pe-actions"><button type="button" class="btn pe-break" aria-pressed="false">Break it: shuffle the word order</button>' +
      '<span class="mb-hint">Nothing you type leaves this page. There is no model call, only string matching.</span></div>' +
      '<pre class="pe-shuffled" aria-live="polite"></pre>';
    el.box = edit.querySelector("textarea");
    el.brk = edit.querySelector(".pe-break");
    el.out = edit.querySelector(".pe-shuffled");
    el.box.addEventListener("input", function () {
      el.box.dataset.touched = "1";
      if (state.id !== "own") { state.id = "own"; Object.keys(el.btn).forEach(function (k) { el.btn[k].classList.toggle("is-on", k === "own"); el.btn[k].querySelector("input").checked = (k === "own"); }); }
      render();
    });
    el.brk.addEventListener("click", function () { setBroken(!state.broken); });

    el.read = document.createElement("div"); el.read.className = "mb-readout";
    el.hits = document.createElement("div"); el.hits.className = "pe-hits";
    el.hist = document.createElement("div"); el.hist.className = "pe-hist";
    var hint = document.createElement("p");
    hint.className = "mb-hint";
    hint.textContent = "Base: " + base.n + " real emails drawn with a fixed seed from the sent folders of " + root.PLAIN_SAMPLE.meta.mailboxes +
      " Enron mailboxes (CMU release, 2015), own text only, numbers and addresses masked. Every count is computed in this page. " +
      "What counts as a hit is a chosen list, not a law: the passive detector misses some passives and flags a few adjectives, " +
      "and a regional idiom is flagged because a reader elsewhere may not know it, never because it is wrong. " +
      "The ladder email is constructed. The Enron writers were mostly native speakers in one US company in 2000 and 2001: a picture of real email, not a standard of good email.";

    rootEl.appendChild(pre); rootEl.appendChild(edit); rootEl.appendChild(el.read);
    rootEl.appendChild(el.hits); rootEl.appendChild(el.hist); rootEl.appendChild(hint);
    choose("r0");
  }

  /* ---------- the mini checker on the other session pages: same detectors, no base ---------- */
  function mini(box) {
    var ta = document.createElement("textarea");
    ta.rows = 5; ta.spellcheck = false;
    ta.value = box.getAttribute("data-seed") || "";
    ta.setAttribute("aria-label", box.getAttribute("data-title") || "Text to check");
    var out = document.createElement("div");
    out.className = "pe-mini-out";
    var h = document.createElement("p");
    h.className = "pe-mini-title";
    h.textContent = box.getAttribute("data-title") || "Check a draft";
    box.appendChild(h); box.appendChild(ta); box.appendChild(out);
    function run() {
      var a = C.analyse(ta.value), parts = [];
      DET.forEach(function (d) {
        var hits = d.key === "long" ? [] : a[d.key];
        parts.push('<span class="pe-mini-n"><b>' + n(a, d.key) + "</b> " + esc(d.name.toLowerCase()) +
          (hits.length ? ": " + hits.map(esc).join(", ") : "") + "</span>");
      });
      parts.push('<span class="pe-mini-n"><b>' + a.polite.length + "</b> politeness markers" +
        (a.polite.length ? ": " + a.polite.map(esc).join(", ") : "") + "</span>");
      out.innerHTML = '<p class="pe-mini-sum"><b>' + a.flags + " flags</b> in " + a.words + " words, " +
        a.per100.toFixed(2) + " per 100 words. Same detectors as the session 4 bench.</p>" + parts.join("");
    }
    ta.addEventListener("input", run);
    run();
  }

  function init() {
    if (!C) return;
    if (typeof document !== "undefined") {
      Array.prototype.forEach.call(document.querySelectorAll(".pe-mini"), mini);
    }
    var rootEl = document.getElementById("plain-bench");
    if (!root.PLAIN_SAMPLE) return;
    base = baseStats(root.PLAIN_SAMPLE.emails);
    ladder = root.PLAIN_LADDER || [];
    root.PLAIN_LIVE = {
      base: base, ladder: ladder, analyse: C.analyse, below: function (v) { return below(base, v); },
      breakSample: function () { return breakSample(root.PLAIN_SAMPLE.emails); },
      show: function (id) { choose(id); }, broken: function (on) { setBroken(!!on); }, last: null
    };
    if (rootEl) build(rootEl);
  }

  var api = { baseStats: baseStats, below: below, breakSample: breakSample, DET: DET };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})(typeof window !== "undefined" ? window : this);
