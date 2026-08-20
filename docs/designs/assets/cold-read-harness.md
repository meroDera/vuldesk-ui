# Cold-read harness — the comprehension gate for vuldesk.com copy

This is the repeatable eval referenced by the design doc's success criterion 3.
Run it on every copy change, on BOTH the desktop and the 375px mobile render
(D14). Pass bar: **3/3 personas at confidence ≥ 7/10** on the five-second
question.

## Protocol

1. Give each persona ONLY the user-visible text of the page under test (or the
   rendered screenshot). No explanation of what the company is.
2. FIRST: the persona looks at only the first screen (header, H1, first
   paragraph, first button) for ~5 seconds of reading, then answers:
   *"What does this company do?"* with a confidence 0-10.
3. THEN: the persona reads the whole page and reports: who is this for, exact
   phrases where they got lost, whether they would make contact, and the first
   question they would ask.
4. A persona must stay strictly in character and must not use technical
   vocabulary knowledge its description excludes. Instruct: "Do not be polite.
   If the page reads as noise to you, say so."

## The three personas (verbatim — do not paraphrase)

1. "a 55-year-old owner of a small fertility clinic. You bought a booking
   website from a contractor in 2024. You do not know what an API is. You read
   carefully but slowly."
2. "the president of a mid-size home-buying company. You skim a website for
   30 seconds. You care about cost, risk, and outcomes, not technology."
3. "an operations manager at a 20-person services business. Your boss told you
   to 'look into AI'. You do not code and you fear buying the wrong thing."

## Answer schema

- five_second_answer (string) — what the company does, first screen only
- confidence (0-10)
- for_whom (string)
- lost_at (array of verbatim quotes)
- would_contact (boolean)
- first_question (string)

## History

| Date | Artifact | Result |
|---|---|---|
| 2026-08-20 | live site (pre-rewrite) | 4/10, 6/10, 4/10 — FAIL |
| 2026-08-20 | wireframe v2 (desktop) | 8/10, 8/10, 8/10 — PASS |
| 2026-08-20 | wireframe v3 (desktop) | 8/10, 9/10, 9/10 — PASS |
| 2026-08-20 | wireframe v3 (mobile first screen) | ~7/10 ×3 — at bar; example line below fold costs proof, not comprehension |
| 2026-08-20 | built page (dist/index.html, pre-push) | 8/10, 9/10, 9/10 — PASS; mobile-first-screen probe held at ~7/10 ×3 (at bar); all flagged the [PHOTO] placeholder (since removed per D6 — real photo is a merge gate) and "the AI service it runs on" (founder wording call) |

Personas may be refreshed when the target market sharpens — update this file
and note the change here, or historical scores stop being comparable.
