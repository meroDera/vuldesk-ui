# Vuldesk design system — "the set letter"

Decided in /plan-design-review, 2026-08-20 (design doc: docs/designs/
plain-english-one-page-site.md, decisions D12/D13/D15). The site is a
beautifully set letter, not a landing page. In a category of dark-gradient AI
sites, plainness is the differentiated composition.

## Voice

Person voice, company wrapper: copy speaks as "I" (Himal); Vuldesk Technologies
Private Limited appears in the footer, legal pages, and contracts. Grade 5-7
plain English; zero terms from docs/designs/assets/jargon-inventory.md
(mechanically enforced by CHECK 5 in scripts/check-integrity.mjs).

## Typography

- Display (H1, H2, price amounts, the evidence line): **Source Serif 4**
  (`@fontsource-variable/source-serif-4`)
- Body and UI: **Source Sans 3** (`@fontsource-variable/source-sans-3`)
- Scale: H1 34px (28px ≤640px) / H2 22px / body 17px / minimum 16px.
  Nothing user-facing below 16px — the buyer reads carefully and slowly.
- Reading measure: 720px, left-aligned. Never center body text.

## Color tokens (CustomStyles.astro)

| Token | Value | Use |
|---|---|---|
| `--paper` | `#faf8f4` | page background (the letter's paper) |
| `--ink` | `#211c16` | text, buttons, wordmark |
| `--muted` | `#5a544c` | secondary text — AA on paper at 16px |
| `--rule` | `#d8d2c8` | 1px section rules, table rules |
| `--accent` | `#b5502f` | terracotta — evidence rule and small emphasis ONLY |
| `--focus` | `#1a56db` | focus rings |

Light-only (`theme: 'light:only'`). There is no dark mode by decision (D5),
not by omission.

## Composition rules

- **No boxes.** Hierarchy comes from type, whitespace, and 1px rules. Cards
  only when the card IS the interaction (currently: never).
- One job per section; five blocks total (hero, proof, prices, trust, close).
- Proof is an editorial band; prices are a ruled typographic table.
- Header: wordmark + one action, non-sticky, no menu (SiteHeader.astro).
- Motion: at most one quiet entrance stagger, always behind
  `prefers-reduced-motion`. Documented exceptions to marketing conventions
  (no full-bleed hero, no motion suite): declined deliberately.

## Accessibility floor (non-negotiable)

- All user-facing text ≥16px; contrast ≥4.5:1 (footer included).
- Interactive elements are real anchors/buttons with `:focus-visible` rings
  (`--focus`), minimum 44px touch targets.
- Links underlined; visited links keep a distinct color.
- Images carry alt text and intrinsic width/height (no layout shift).

## Gates that keep this true

- `npm test` → build + scripts/check-integrity.mjs (CHECK 1-8: links, mailto,
  banned strings, category regression, copy budget + jargon incl. og/meta
  strings, blog teardown, preview metadata, external proof links).
- Comprehension: docs/designs/assets/cold-read-harness.md — 3 personas,
  5-second protocol, pass = 3/3 at ≥7/10, desktop AND mobile renders.
- Copy drift checklist (any offer-line change touches all five): index.astro
  H1/sub, config.yaml metadata, the og card (src/assets/images/default.png),
  CONTACT_MAILTO in navigation.js, outbound message templates.
