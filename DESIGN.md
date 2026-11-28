# Vuldesk design system — the outside CTO worktable

The current homepage presents Vuldesk as an outside CTO for owners of live
websites, apps, and internal tools, including ones built with AI. It covers
releases, performance, and cloud costs, from planning through rollout.

The homepage layout and palette live in `src/pages/index.astro`; the interactive
example lives in `src/components/widgets/Worktable.astro`. Shared legal and
not-found pages retain the earlier set-letter styles from
`src/components/CustomStyles.astro`. Plans under `docs/designs/` are historical
references; their old positioning, composition, and test results do not
describe the current homepage.

## Voice and offer

- Speak as "we". The trust band names Kushal and the four-person team;
  Vuldesk Technologies Private Limited appears in the footer and legal pages.
  Do not make one-person claims (CHECK 3).
- Use plain English. CHECK 5 scans the jargon inventory, with deliberate
  exceptions documented in `JARGON_ALLOW` in `scripts/check-integrity.mjs`.
- The free technical review costs $0 USD and returns a short written
  recommendation. The email reply expectation is one business day.
- Fixed-price sprints start at $999.50 USD. Agree on scope, price, and timeline
  before work starts; implement one improvement in the buyer's code and
  accounts, handle rollout, and hand over results and rollback notes.
- Optional monthly support starts at $1,450 USD per month. Agree on scope and
  availability before starting. Aim for same-day replies, Monday–Friday;
  delivery time is agreed for each improvement. Do not imply fixed capacity
  or 24/7 response.
- Worktable exchanges are illustrative. The clinic booking project was retired
  from public proof after the owner reported that its site was broken.

## Typography

- Homepage display and note messages: **Source Serif 4**
  (`@fontsource-variable/source-serif-4`), including its italic face for the
  red hero emphasis.
- Homepage body, navigation, prices, and controls: **Inter**
  (`@fontsource-variable/inter`). Shared pages use **Source Sans 3**.
- Homepage H1 scales from 3rem to 5.25rem on desktop; at ≤720px it uses
  `clamp(2.35rem, 8.3vw, 4rem)`. Section headings and note messages use fluid
  sizes. Supporting labels are intentionally smaller than body copy.
- The homepage resets the root size to 100%; body text is 1rem/1.55.
  Hero copy is centered and balanced, while service and contact copy is
  left-aligned. Keep the existing responsive measures rather than applying
  the shared pages' 720px letter measure to the homepage.

## Homepage palette

Tokens are scoped through `body:has(#home-intro)` in `src/pages/index.astro`.

| Token          | Value     | Use                                    |
| -------------- | --------- | -------------------------------------- |
| `--home-paper` | `#faf2e4` | page background                        |
| `--ink`        | `#332016` | primary text                           |
| `--muted`      | `#665044` | supporting text                        |
| `--red`        | `#a02d24` | hero emphasis, prices, primary actions |
| `--rule`       | `#d6c1ac` | section and service-row rules          |
| `--white`      | `#fff8e9` | action and worktable text              |

The review band is `#f3dfc8`. The worktable uses the local decorative
`worktable.webp` photograph, dark brown caption/control bands (`#452018`), and
cream notes (`#fff1d2` and `#fffaf0`). The photograph carries no content needed
to understand the service.

The site remains light-only (`theme: 'light:only'`).

## Composition and interaction

- Homepage header: wordmark, "How we work", and the review action; non-sticky,
  with visible links at every viewport. Shared pages use `SiteHeader.astro`.
- Hero: outside CTO promise, the kinds of products served, and one review CTA.
- Worktable: overlapping paper notes on a warm photographic surface. Four
  stages cover the free review, paid sprint, rollout, and monthly support.
  Previous/next controls reveal one stage at a time. A mobile cue explains
  that more updates follow.
- When a stage changes, focus moves to its caption and that caption scrolls
  into view. With JavaScript unavailable, the first exchange stays readable
  and interactive controls stay hidden.
- Trust band: the founder and four-person team.
- Services: ruled rows for the free review, sprint, and optional support.
  Prices include USD and the relevant billing unit.
- Review band: what to send, what happens next, the email CTA, and a selectable
  address. The copy button appears only when Clipboard API support is present;
  success or failure is reported through a status element.
- At ≤720px the notes and review band stack, and the worktable spans the screen.
  Service rows stack their columns at ≤400px.

The shared layout enables Astro view transitions. Homepage scripts initialize
on `astro:page-load`, rather than only on the initial document load, and guard
against duplicate setup. Preserve this when changing either interaction.

## Accessibility

- Use real anchors and buttons, visible `:focus-visible` outlines, and at least
  44px targets for interactive controls. Primary CTAs are at least 48px high.
- Retain semantic headings, labeled navigation, and the Worktable stage focus
  behavior. Hidden notes and controls must remain hidden from assistive
  technology until shown.
- Keep text contrast at least 4.5:1 for normal text. Supporting labels run
  smaller than 16px, so contrast and mobile legibility need visual checking.
- Keep the visible email fallback: a buyer may have no configured email app,
  JavaScript, or Clipboard API access. Copy failure must leave the address
  available for manual selection.
- Meaningful images need alt text and intrinsic dimensions; the worktable's
  CSS background is decorative.

## Shared-page styles

The earlier set-letter system remains in `CustomStyles.astro` for legal and
not-found pages: Source Serif 4 display type, Source Sans 3 body type, and
hierarchy from type, whitespace, and rules. The not-found page uses a 720px
reading measure; legal pages use `MarkdownLayout.astro`'s `max-w-4xl` container.

| Token      | Value     | Use                    |
| ---------- | --------- | ---------------------- |
| `--paper`  | `#faf8f4` | shared-page background |
| `--ink`    | `#211c16` | text and actions       |
| `--muted`  | `#5a544c` | supporting text        |
| `--rule`   | `#d8d2c8` | rules                  |
| `--accent` | `#b5502f` | terracotta emphasis    |
| `--focus`  | `#1a56db` | focus outlines         |

Do not use these shared tokens as the homepage palette specification.

## Verification and copy drift

- `npm test` runs full Astro/TypeScript checks, metadata rendering checks, the production build, and
  `scripts/check-integrity.mjs`.
  CHECK 1-9 cover internal links, mailto addresses, banned strings, category
  regression, the 450-word reading-state budget and jargon, blog teardown,
  search/preview metadata, external proof links, and the homepage review path.
  Every Worktable stage is scanned for jargon; only the longest stage counts
  toward the visible word budget. CHECK 9 verifies the section anchors,
  visible contact address, and prefilled technical-review email prompts.
- The homepage search title names outside CTO and engineering support. Keep
  Organization/WebSite structured data factual; legal pages have distinct
  descriptions, and the not-found page is marked `noindex`.
- `npm run lint:eslint` is a separate check required by deploy CI. A plain
  `npm run build` does not run integrity checks.
- Check the current page on desktop and mobile, stage navigation with a
  keyboard, copy-address success/failure, and navigation back from shared
  pages. Build checks do not establish visual quality or screen-reader use.
- `docs/designs/assets/cold-read-harness.md` supplies a comprehension protocol;
  its recorded results concern earlier copy and must be rerun for this page.
- When the offer changes, review the homepage, `src/config.yaml` metadata,
  `src/assets/images/default.png` and its source
  `docs/designs/assets/og-card.html`, `src/navigation.js` email draft, package
  description, README, this file, and any outbound message templates.

CI/deploy behavior and the deferred branch-protection, legal-review, dependency,
and owner-input work remain documented in README.md and TODOS.md.
