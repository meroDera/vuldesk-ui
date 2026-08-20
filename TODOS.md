# TODOS

Deferred items. Items 1-3 come from the engineering review on 2026-08-09 —
everything actionable in code from that review has been done, and those three
cannot be closed by editing files. Item 4 comes from the plan review on
2026-08-20 and was deferred as a real tradeoff, not forgotten.

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
**Cons:** Adds a PR step for a solo operator making one-line copy edits. Genuinely
annoying if you are the only committer.

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

## 3. Close the last critical dependency finding

**What:** `npm audit` reports 15 findings, 1 critical (`tar`, transitive).

**Why:** Non-breaking fixes took this from 36 findings / 2 critical down to 15 / 1 on
2026-08-09. The remainder needs `npm audit fix --force`, which pulls breaking major
versions into the build chain.

**Framing that matters, because it was got wrong twice during the review:** GitHub
Dependabot reports 112. `npm audit` reports 15. Neither number describes visitor risk.
This is a **static** site — nothing in `dependencies` executes in a browser. Every one
of these is a build-time dependency, so the threat model is compromise of the CI build
chain producing poisoned HTML, not a visitor being attacked. That is a real risk and a
much narrower one than "112 vulnerabilities on a security company's site" implies.

**Pros:** Removes the last critical. Makes the Dependabot badge honest.
**Cons:** `--force` can break the Astro build. Needs the full verify loop
(`npm run lint:eslint && npm run build && npm run check:integrity`) and a rollback plan.

**Context:** `cp package-lock.json /tmp/lock-backup.json` first. If the build breaks,
restore and pin `tar` via an `overrides` block instead.

**Depends on:** nothing, but do it on a branch now that `verify` runs on PRs.

---

## 4. Measure CTA and proof-link clicks

**What:** Count clicks on "Tell me about your pile", "Email me", and the proof
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
