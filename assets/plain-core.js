/* plain-core.js - the six detectors behind the plain-English bench
 * learn-business-english-with-phoebe
 *
 * Pure string analysis. No model, no network: what you paste never leaves the page.
 * The Python reference (materials/plain_reference.py) carries the SAME lists and the SAME
 * regular expressions; the two must agree on every count over the shipped Enron sample
 * before any page quotes a number.
 *
 * Six detectors, each one reads PHRASES, not length:
 *   hedge    precautionary words in front of the point ("I just wanted to", "maybe", "perhaps")
 *   noun     hidden verbs: a light verb plus a noun made from a verb ("make a decision"),
 *            or "the <-tion/-ment/-ance> of" (plainlanguage.gov: avoid hidden verbs)
 *   passive  a form of "be" plus a past participle (heuristic: it misses some, flags a few)
 *   long     sentences over LONG_LIMIT words (the limit is calibrated on the Enron sample)
 *   formal   over-formal stock phrases ("please find attached herewith", "at your earliest convenience")
 *   regional regional office idioms that may confuse global readers ("do the needful", "revert back").
 *            Not wrong. Flagged because a reader elsewhere may not know them.
 * And one counter that is NOT a flag:
 *   polite   politeness markers present ("please", "thanks", "could you")
 */
(function (root) {
  "use strict";

  var LONG_LIMIT = 30; /* calibrated: see materials/official-course-map.md, bench canon */

  var HEDGES = [
    "just wanted to", "just want to", "only wanted to", "i was wondering", "was just wondering",
    "i wonder if", "maybe", "perhaps", "i think", "i guess", "i feel that", "i believe",
    "possibly", "a bit", "somewhat", "if possible", "if you don't mind", "sorry to bother",
    "sorry for the trouble", "hope this is ok", "hope that's ok", "not sure if", "i'm not sure",
    "might be able to", "may be able to", "it seems", "it would seem", "just checking",
    "just a quick", "just to check"
  ];

  var LIGHT_VERBS = "make|makes|made|making|take|takes|took|taken|taking|give|gives|gave|given|giving|" +
    "have|has|had|having|carry out|carried out|carrying out|conduct|conducted|conducting|perform|performed|" +
    "undertake|undertook|undertaken|reach|reached|provide|provided|providing";
  var HIDDEN_NOUNS = "decision|recommendation|review|analysis|assessment|discussion|application|payment|" +
    "investigation|calculation|confirmation|reduction|improvement|arrangement|comparison|contribution|" +
    "correction|evaluation|explanation|implementation|presentation|revision|selection|submission|" +
    "suggestion|adjustment|announcement|approval|estimate|examination|determination|clarification|" +
    "modification|verification|cancellation|completion|preparation|distribution|enquiry|inquiry|" +
    "reply|response|request|attempt|check";
  /* light verb, optional determiner, optional one adjective, then the noun */
  var RE_LIGHT = new RegExp("\\b(?:" + LIGHT_VERBS + ")\\s+(?:(?:a|an|the|our|my|your|some|any|this|that)\\s+)?" +
    "(?:[a-z]+\\s+)?(?:" + HIDDEN_NOUNS + ")s?\\b", "g");
  var RE_THEOF = /\bthe ([a-z]+(?:tion|sion|ment|ance|ence)|analysis|approval|review|failure|closure|refusal) of\b/g;
  var THEOF_SKIP = ["department", "government", "apartment", "moment", "element", "segment", "instance",
    "distance", "balance", "finance", "audience", "conference", "experience", "science", "evidence",
    "licence", "sentence", "insurance", "difference", "station", "nation", "position", "portion",
    "section", "question", "function", "condition", "edition", "version", "session", "mission",
    "commission", "division", "pension", "tension", "vision", "television", "occasion", "region",
    "presence", "absence", "importance", "significance", "attendance", "province", "agreement",
    "statement", "commitment", "equipment", "environment", "document", "comment", "percentage",
    "attention", "nature", "relevance"];

  var PART_IRREG = "known|done|made|given|taken|seen|sent|held|built|paid|told|sold|written|shown|found|" +
    "kept|left|met|put|set|cut|brought|thought|bought|caught|taught|chosen|driven|forgotten|gotten|" +
    "hidden|spoken|broken|understood|withdrawn|drawn|grown|thrown|begun|signed|forwarded";
  var RE_PASSIVE = new RegExp("\\b(?:am|is|are|was|were|be|been|being)\\s+(?:[a-z]+ly\\s+)?" +
    "([a-z]+ed|" + PART_IRREG + ")\\b", "g");
  var PASSIVE_SKIP = ["interested", "pleased", "excited", "worried", "tired", "concerned", "married",
    "surprised", "disappointed", "delighted", "satisfied", "indeed", "need", "speed", "feed", "proceed",
    "exceed", "succeed", "red", "bed", "shed", "bored", "confused", "glad", "supposed", "used"];

  var FORMAL = [
    "please find attached", "please find enclosed", "find attached herewith", "attached herewith",
    "enclosed herewith", "herewith", "hereby", "aforementioned", "the undersigned",
    "we wish to inform", "i wish to inform", "this is to inform", "please be informed",
    "kindly be informed", "be advised", "with reference to", "with regard to", "in this regard",
    "at your earliest convenience", "we would like to request", "i would like to request",
    "thanking you", "pursuant to", "in due course", "duly", "kindly", "we regret to inform",
    "do not hesitate to", "don't hesitate to", "for your perusal", "your kind attention",
    "your kind consideration", "humbly", "prior to", "in order to", "it is requested that",
    "it is hoped that", "we are pleased to inform"
  ];
  var REGIONAL = [
    "do the needful", "revert back", "revert to me", "revert to you", "revert to us",
    "will revert", "please revert", "pls revert", "kindly revert", "prepone", "preponed",
    "your good self", "your goodself", "updation", "discuss about", "noted with thanks",
    "out of station"
  ];
  var POLITE = ["please", "pls", "thank you", "thanks", "appreciate", "appreciated", "grateful",
    "could you", "would you", "would you mind", "if you could", "can you"];

  function esc(p) { return p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+"); }
  function listRe(list) {
    /* longest first, so "kindly revert" is not also read as "kindly" */
    var s = list.slice().sort(function (a, b) { return b.length - a.length || (a < b ? -1 : 1); });
    return new RegExp("\\b(?:" + s.map(esc).join("|") + ")\\b", "g");
  }
  var RE_HEDGE = listRe(HEDGES), RE_FORMAL = listRe(FORMAL), RE_REGIONAL = listRe(REGIONAL), RE_POLITE = listRe(POLITE);

  /* ---------- normalisation, identical in Python ---------- */
  function normalise(text) {
    var t = String(text || "").replace(/\r\n?/g, "\n");
    t = t.replace(/[\u2018\u2019\u02BC]/g, "'").replace(/[\u201C\u201D]/g, '"');
    t = t.replace(/[^\x00-\x7F]/g, " ");
    return t.toLowerCase();
  }
  function words(t) { return t.match(/[a-z0-9]+(?:'[a-z]+)?/g) || []; }
  function sentences(t) {
    /* a sentence ends at . ! ? followed by whitespace, or at a blank line; single line breaks are wraps */
    var parts = t.split(/[.!?]+(?=\s)|\n[ \t]*\n/);
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var n = words(parts[i]).length;
      if (n > 0) out.push(n);
    }
    return out;
  }
  function allMatches(re, t) {
    re.lastIndex = 0;
    var out = [], m;
    while ((m = re.exec(t)) !== null) { out.push(m); if (m[0] === "") re.lastIndex++; }
    return out;
  }

  /* ---------- the analysis ---------- */
  function analyse(text) {
    var t = normalise(text);
    var w = words(t).length;
    /* regional first; formal must not double-count a regional hit such as "kindly revert" */
    var regional = allMatches(RE_REGIONAL, t).map(function (m) { return m[0].replace(/\s+/g, " "); });
    var tNoRegional = t.replace(RE_REGIONAL, " ");
    var formal = allMatches(RE_FORMAL, tNoRegional).map(function (m) { return m[0].replace(/\s+/g, " "); });
    var hedge = allMatches(RE_HEDGE, t).map(function (m) { return m[0].replace(/\s+/g, " "); });
    var noun = allMatches(RE_LIGHT, t).map(function (m) { return m[0].replace(/\s+/g, " "); });
    allMatches(RE_THEOF, t).forEach(function (m) {
      if (THEOF_SKIP.indexOf(m[1]) < 0) noun.push(m[0].replace(/\s+/g, " "));
    });
    var passive = [];
    allMatches(RE_PASSIVE, t).forEach(function (m) {
      if (PASSIVE_SKIP.indexOf(m[1]) < 0) passive.push(m[0].replace(/\s+/g, " "));
    });
    var sl = sentences(t);
    var long = sl.filter(function (n) { return n > LONG_LIMIT; }).length;
    var polite = allMatches(RE_POLITE, t).map(function (m) { return m[0].replace(/\s+/g, " "); });
    var flags = hedge.length + noun.length + passive.length + long + formal.length + regional.length;
    return {
      words: w, sentences: sl.length, longest: sl.length ? Math.max.apply(null, sl) : 0,
      hedge: hedge, noun: noun, passive: passive, long: long, formal: formal, regional: regional,
      polite: polite, flags: flags,
      per100: w ? Math.round(flags * 10000 / w) / 100 : 0
    };
  }

  /* counts only, for the sample and for the cross-check */
  function counts(text) {
    var a = analyse(text);
    return [a.words, a.sentences, a.hedge.length, a.noun.length, a.passive.length, a.long,
      a.formal.length, a.regional.length, a.polite.length, a.flags];
  }

  /* seeded shuffle of word order: the break button. Mulberry32, same as the Python reference. */
  function mulberry32(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var z = s;
      z = Math.imul(z ^ (z >>> 15), z | 1);
      z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
      return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffleWords(text, seed) {
    var toks = String(text || "").split(/\s+/).filter(function (x) { return x.length; });
    var rnd = mulberry32(seed || 7);
    for (var i = toks.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var tmp = toks[i]; toks[i] = toks[j]; toks[j] = tmp;
    }
    return toks.join(" ");
  }

  var api = {
    LONG_LIMIT: LONG_LIMIT, HEDGES: HEDGES, FORMAL: FORMAL, REGIONAL: REGIONAL, POLITE: POLITE,
    normalise: normalise, words: words, sentences: sentences, analyse: analyse, counts: counts,
    shuffleWords: shuffleWords, mulberry32: mulberry32
  };
  root.PLAIN_CORE = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : this);
