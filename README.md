<!-- learn-with-phoebe hub banner -->
> ### 📚 Part of [**Learn with Phoebe**](https://phoebefu6.github.io/learn-with-phoebe/)
> The shelf of 148 free, hands-on courses on AI, data, and the craft around them. **[Browse every course ↗](https://phoebefu6.github.io/learn-with-phoebe/)**
<!-- /learn-with-phoebe hub banner -->

# Learn Business English with Phoebe

Six 45-minute sessions on confident, natural workplace English for people who work in a second or
third language: why stiff, template English reads as unsure, emails that get answered, speaking
up in meetings, a plain-English bench, numbers and updates out loud, and a phrase bank you keep.
The running case is a constructed analyst in Singapore; every build-along runs on your own emails.

**Live site:** https://phoebefu6.github.io/learn-business-english-with-phoebe/

| # | Session | Signature thing |
|---|---|---|
| 1 | Plain beats formal | Six countable habits, marked by hand on a real draft |
| 2 | Emails that get answered | Subject lines, the request up front, softeners that are not hedges |
| 3 | Speaking up in meetings | Phrase banks for joining, disagreeing and interrupting, mapped to CEFR |
| 4 | The plain-English bench | Your email against 400 real business emails, computed in the browser |
| 5 | Numbers and updates, out loud | Points against percent, ranges, the spoken status update |
| 6 | Your phrase bank and practice loop | A bank mined from your own sent mail; final scorecard |

The bench in session 4 (`assets/plain-core.js` for the six detectors, `assets/plain-live.js` for
the widget, data in `assets/plain-sample.js`) holds 400 emails drawn with a fixed seed from the
sent folders of 146 mailboxes in the public CMU Enron corpus (2015 release), own text only, with
digit runs, phone numbers and addresses masked. The median real email carries 1.11 flags per 100
words; a constructed stiff draft carries 18.49, its five-step rewrite 0.00, and the "sound more
formal" anti-lever 25.26 with its politeness markers gone. Shuffling word order drops multi-word
phrase hits across the sample from 337 to 56. A Python reference (`materials/plain_reference.py`,
cross-checked by `materials/crosscheck.py`) agrees with the browser engine on every count.

Sources read at source: Plain English Campaign guides, the US federal plain language guidelines,
Gowers' The Complete Plain Words (1954), and the CEFR Companion Volume (2020).

By Phoebe Fu.
