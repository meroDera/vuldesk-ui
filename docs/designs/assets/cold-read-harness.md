# Cold-read harness — the comprehension gate for vuldesk.com copy

This is the repeatable eval for vuldesk.com copy. Run it on every copy change.

## Ship gate (P6, docs/designs/company-story-we-voice.md, 2026-10-31)

It replaces the August pass bar (3/3 personas at confidence ≥ 7/10), which the live
page itself fails in this harness: the clinic-owner persona gives 6 to every version.

- **Five-second runs:** the standalone prompt, 3 runs per persona on each screen,
  desktop 1280 x 720 and phone 375 x 667 (August design-review D14), on the new build
  and on the live build: 36 runs. Pass when, for every persona and screen, the new
  build's median confidence is not lower than the live median, and every run on the
  new build gives the answer the change must land (for the company story:
  one_person_or_team = "a team"; "not sure" does not count).
- **Whole-page runs:** the two-step prompt, 1 run per persona on each build: 6 runs.
  Pass when the new build's would-contact count is not lower than the live count, and
  every phrase that the change adds or rewrites and that loses 3 of 3 personas has a
  recorded owner decision before ship. Quotes from the same sentence count as one
  phrase. Unchanged lines that lose 3 of 3 stay open questions.
- **Which build:** the PR head commit. A later commit that changes visible text, meta
  strings, the og card or the hero CSS voids the result; the gate runs again.
- **A fail:** the failed part runs once more on the same build, with fresh subagents
  and the same prompts. A second fail goes to the owner, who decides to ship or to
  rework (D22, 2026-10-31).

## Protocol

1. Give each persona ONLY the user-visible text of the page under test, in a fresh
   context (one subagent per run). No explanation of what the company is.
2. FIRST (the five-second read): the persona sees only the first screen for ~5
   seconds of reading, then answers *"What does this company do?"* with a
   confidence 0-10, and *"How many people do you think work at this company?"*
   (how_many_people, and one_person_or_team: "one person", "a team" or "not sure").
   The first-screen text is the text of the elements whose bottom edge is inside
   the viewport, in reading order, with `[button]` and `[photo: alt]` markers.
   Measure it on the built page: desktop 1280 x 720; phone 375 x 667 with the page
   inside a 375 x 667 iframe (narrowing the body does not apply the phone CSS).
   When the page is served under a path prefix (gstack-render does this), make the
   `/_astro/` URLs relative first, wait until the fonts load, and check that the H1
   computed font is Source Serif 4 Variable: without the CSS, every fold position
   is wrong. The standalone runs get only this text, never the whole page.
3. THEN (the two-step prompt only): the persona reads the whole page and reports:
   who is this for, exact phrases where they got lost, whether they would make
   contact, the first question they would ask, and the people answers.
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

## Prompt templates

Fill each slot by hand; never send a template with an empty slot. Copy the personas
above verbatim.

Standalone five-second prompt (ship-gate five-second runs, repeats):

```
You take part in a cold-read comprehension test of a company web page. Stay strictly in character as this persona (verbatim): "PERSONA TEXT" You must not use technical knowledge that this persona does not have. Do not be polite. If the page reads as noise to you, say so.

RULES: Do not use any tools. Do not search the web, do not open links, do not look up the company. Answer only from the text below. Answer in English.

(Phone runs only:) You see this page on your phone.
Read ONLY this first screen for about 5 seconds of reading, then answer: What does this company do? Give a confidence from 0 to 10. Also say how many people you think work at this company, and why.
FIRST SCREEN TEXT START
FIRST-SCREEN TEXT
FIRST SCREEN TEXT END

ANSWER FIELDS: five_second_answer (what the company does), confidence (0 to 10), how_many_people (a number or a range, with one reason), one_person_or_team ('one person', 'a team' or 'not sure').
```

Two-step prompt (ship-gate whole-page runs): the same opening and RULES, then
"STEP 1 (five seconds, first screen only)" with the first-screen text and the
five-second question, then "STEP 2 (whole page)" with the whole-page text, and these
answer fields: five_second_answer, confidence, for_whom, lost_at (exact phrases where
you got lost), would_contact, first_question, how_many_people, one_person_or_team,
trust_up (exact phrases that raised your trust), trust_down (exact phrases that
lowered your trust).

## Answer schema

- five_second_answer (string) — what the company does, first screen only
- confidence (0-10)
- how_many_people (string) — a number or a range, with one reason
- one_person_or_team ("one person" / "a team" / "not sure")
- for_whom (string) — two-step only
- lost_at (array of verbatim quotes) — two-step only
- would_contact (boolean) — two-step only
- first_question (string) — two-step only
- trust_up, trust_down (arrays of verbatim quotes) — two-step only

## History

| Date | Artifact | Result |
|---|---|---|
| 2026-08-20 | live site (pre-rewrite) | 4/10, 6/10, 4/10 — FAIL |
| 2026-08-20 | wireframe v2 (desktop) | 8/10, 8/10, 8/10 — PASS |
| 2026-08-20 | wireframe v3 (desktop) | 8/10, 9/10, 9/10 — PASS |
| 2026-08-20 | wireframe v3 (mobile first screen) | ~7/10 ×3 — at bar; example line below fold costs proof, not comprehension |
| 2026-08-20 | built page (dist/index.html, pre-push) | 8/10, 9/10, 9/10 — PASS; mobile-first-screen probe held at ~7/10 ×3 (at bar); all flagged the [PHOTO] placeholder (since removed per D6 — real photo is a merge gate) and "the AI service it runs on" (founder wording call) |
| 2026-10-31 | live page 6793c65 ("I" voice), control with the company-story prompt | 6, 8, 7; 3 of 3 "one person" (each guessed 1) |
| 2026-10-31 | wireframe v4 (products row; team in Kathmandu) | 6, 8, 7; 3 of 3 "a team" |
| 2026-10-31 | wireframe v4.1 (no products row, no team size) | desktop 6, 8, 7; 0 of 6 "a team" (all "not sure") |
| 2026-10-31 | wireframe v4.2 ("We are a team of four") | desktop 6, 7, 7; phone same text (measured at 375 x 712); 3 of 3 "a team" (each guessed 4) |
| 2026-10-31 | wireframe v4.3 (plain real-estate example) | desktop 6, 7, 7; phone 6, 8, 8 at 375 x 712; 6 of 6 "a team"; president repeats (standalone, desktop): v4.3 7, 8, 8, 8 vs live 8, 8, 8, 8 — equal medians, accepted (D16, 2026-10-31) |

IDs from the company-story session carry their date, for example "D14 (2026-10-31)",
because this file already uses D14 for the August mobile render. Raw answers:
`~/.gstack/projects/meroDera-vuldesk-ui/designs/wireframe-20261030/`.

Personas may be refreshed when the target market sharpens — update this file
and note the change here, or historical scores stop being comparable.
