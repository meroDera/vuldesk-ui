# TODOS

Deferred items. Items 1-3 come from the engineering review on 2026-08-09 —
everything actionable in code from that review has been done, and those three
cannot be closed by editing files. Item 4 comes from the plan review on
2026-08-20 and was deferred as a real tradeoff, not forgotten. Items 5-6 come from
the engineering review on 2026-10-31 (docs/designs/company-story-we-voice.md).

---

## 1. Enable branch protection on `main`

**What:** Require a pull request and a passing `verify` check before anything merges
to `main`.

**Why:** `.github/workflows/deploy.yml` deploys on every push to `main`. The `verify`
job now blocks a deploy when lint, build or the integrity check fails, but nothing
stops an unreviewed push from reaching production — that is exactly how two
repositionings shipped on 2026-08-09 with no review. A CI gate catches broken output;
it does not catch a bad decision.

**Pros:** Forces a diff to be looked at before it is live. Makes the integrity check a
pre-merge gate rather than a post-merge one.
**Cons:** Adds a PR step for a small team making one-line copy edits. Genuinely
annoying for the one person who commits most site changes.

**Context:** Settings → Branches → Add rule for `main`. Enable "Require a pull request
before merging" and "Require status checks to pass", selecting `verify` as required.
The workflow already runs on `pull_request`, so the check appears on PRs today.

**Depends on:** nothing. Two minutes in repo settings.

---

## 2. Have the legal pages reviewed by a lawyer

**What:** `src/pages/terms.md` and `src/pages/privacy.md` carry unmodified AstroWind
clause text.

**Why:** On 2026-08-09 the identity fields were corrected — the pages had named
"AstroWind LLC, 1 Cupertino, CA 95014" as the company, declared the terms "a Demo",
and published `somecoolemail@domain.com` as the contact address. Those are fixed. The
substance of the clauses was never written for this business, this jurisdiction, or
this service. A page that now correctly says "Vuldesk Technologies Private Limited"
while describing obligations nobody chose is a more convincing wrong answer than the
obvious placeholder it replaced.

**Pros:** Removes the last piece of template inheritance from the pages a buyer's
counsel will actually open.
**Cons:** Costs money. Not urgent at zero customers.

**Context:** Particularly relevant once an engagement involves a customer's staging
data. The site says data handling is the differentiator; the terms should not
contradict that. Governing law is currently implied as Nepal via the Country field.

**Depends on:** a first paying engagement is a reasonable trigger.

---

## 3. Review the remaining moderate and low dependency findings

**Current result (2026-11-28):** The security update removes affected versions for all
33 critical/high Dependabot alert records from the reviewed lockfile. `npm audit`
reports zero critical/high, seven moderate, and one low finding. GitHub's main-branch
alerts are reassessed after the updated lockfile is merged.

**Remaining:** The reviewed advisory records still match `minimatch`,
`postcss-selector-parser`, and `fast-xml-parser`. Npm also counts affected parent
packages, so its finding count differs from the advisory count.

**What:** Review compatible parent updates for these lower-severity findings in a
separate maintenance change. Do not force a typography downgrade or override a
parser across incompatible major versions just to change the audit count.

**Context:** Production serves static files, but development and build tools still
process images, Markdown, YAML, and other inputs. A compromised build can produce
unsafe output; static hosting alone does not resolve those dependency findings.

**Verify:** Use Node 24 (the minimum supported runtime is 22.23.4), then run
`npm audit --audit-level=high`, `npm test`, and `npm run lint:eslint`. Review desktop,
mobile, metadata, and navigation when changing the build chain.

**Depends on:** compatible fixes for the remaining dependency paths.

---

## 4. Measure CTA and proof-link clicks

**What:** Count clicks on "Tell us about your pile", "Email us", and the proof
link on the rewritten homepage (a second proof link joins when the sample
report ships — design doc OQ4).

**Why:** Cloudflare Web Analytics counts page views only. The plain-English rewrite
(docs/designs/plain-english-one-page-site.md) has post-ship success criteria that
need conversion behavior, not traffic: did readers who understood the page act?

**Pros:** Real numbers for the first copy iteration; tells you whether confusion or
disinterest is the bottleneck.
**Cons:** Needs client-side JS (Cloudflare custom events or a small beacon) on a
page whose design goal is zero scripts beyond the analytics beacon. A real
tradeoff — that is why it was deferred, not forgotten.

**Context:** Decided in /plan-eng-review 2026-08-20 (finding D11). The mailto-only
conversion path also got a visible plain-text address fallback in the same review;
if a form ever replaces mailto, measurement comes free with the form handler and
this item should be reconsidered in that shape.

**Depends on:** the one-page rewrite being shipped.

---

## 5. Add a booking link beside the email button

**What:** A booking link (for example Cal.com or Calendly) beside the hero and close
email buttons: plain underlined text, the email address on the line below, a 44px hit
area (`display: inline-block; padding: 10px 0; margin: -10px 0`), never in the header.
The link text must match the booking page's call length.

**Why:** 16 of 34 small service sites in the October 2026 market scan lead with a
booked call, and the company-story office hours chose a booking link (D6). The design
defers it until the owner gives a booking URL (P5), so no dormant code ships.

**Pros:** A second way to make contact, for buyers who want to talk first.
**Cons:** Needs the owner's booking page, a check that the URL is an absolute https
URL, and one more cold-read gate run (P6) on a build that shows the link. The link
colour is still open (`--ink` or `--muted`; Cross-Model Perspective in the design doc).

**Context:** docs/designs/company-story-we-voice.md: P5, "Owner inputs and stand-ins"
and the Cross-Model Perspective hold the placement spec. Decided in the engineering
review on 2026-10-31 (T1, D26).

**Depends on:** the owner's booking URL; the company-story change shipped.

---

## 6. Answer clinic buyers about patient records

**What:** Decide what the page tells a clinic that asks whether patient records may go
to an AI company. First collect the facts: which AI companies the tools use, and what
agreement each one offers for medical records. Then write one plain answer, or decide
to say nothing on the page.

**Why:** In the cold-read tests of October 2026, the clinic-owner persona asked this
first, in the control run and in several versions. The page does not answer it. A
wrong answer is a legal risk, so the page must not guess.

**Pros:** Answers the first question of a target buyer.
**Cons:** Needs facts from the owner, and maybe legal advice.

**Context:** design doc OQ7. Decided in the engineering review on 2026-10-31 (T3, D28).

**Depends on:** the owner's facts about the AI companies the tools use; possibly a
lawyer (TODO 2).
