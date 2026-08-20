# vuldesk-ui

Source for [www.vuldesk.com](https://www.vuldesk.com) — a one-page, plain-English
site for Vuldesk: AI tools that read your records and give you answers.

The site is a static Astro 4 + Tailwind CSS build, derived from the
[AstroWind](https://github.com/onwidget/astrowind) template. Almost all template
surface has been removed or rewritten; what remains is the build machinery, the
MIT license, and the legal-page clause text (unreviewed template inheritance —
see TODOS.md item 2).

## What the site is

One page, written as a letter, in grade 5-7 plain English. The design system is
documented in [DESIGN.md](./DESIGN.md) ("the set letter"): Source Serif 4 for
display, Source Sans 3 for body, a paper/ink palette, no boxes, light-only.
The plan of record for the current positioning is
[docs/designs/plain-english-one-page-site.md](./docs/designs/plain-english-one-page-site.md).

Routes that ship:

| Route | What it is |
| :---- | :--------- |
| `/` | The letter (`src/pages/index.astro`) |
| `/404` | Plain-English not-found page that routes back to the letter |
| `/terms`, `/privacy` | Legal pages (see TODOS.md item 2) |
| `/sitemap-index.xml`, `robots.txt` | Generated |

Retired routes redirect to `/` (see `redirects` in `astro.config.mjs`):
`/free-recon` and the three drafted blog-post slugs, kept as meta-refresh
tombstones so old backlinks do not hard-404. CHECK 6 asserts they stay
redirects.

The blog is **disabled** (`apps.blog.isEnabled: false` in `src/config.yaml`).
The three pentest-era posts under `src/content/post/` are kept as `draft: true`
because they describe a different business than the homepage sells. Re-enable
only with posts that match the positioning.

## Project structure

```
/
├── .github/workflows/
│   ├── deploy.yml          # push to main → verify (lint, build, integrity) → GitHub Pages
│   └── proof-links.yml     # weekly cron: external proof links must respond
├── docs/designs/           # plans of record + assets (jargon inventory, cold-read harness)
├── scripts/
│   └── check-integrity.mjs # CHECK 1-8, runs against ./dist after build
├── src/
│   ├── assets/images/      # og card (default.png) lives here
│   ├── components/
│   │   ├── CustomStyles.astro        # color tokens + font wiring (see DESIGN.md)
│   │   └── widgets/SiteHeader.astro  # wordmark + one action, no menu
│   ├── content/post/       # drafted blog posts (blog disabled)
│   ├── layouts/PageLayout.astro
│   ├── pages/index.astro   # the letter
│   ├── config.yaml         # site metadata, blog flags, theme
│   └── navigation.js       # CONTACT_EMAIL / CONTACT_MAILTO single source of truth
├── DESIGN.md               # design system: type, color, composition, gates
├── TODOS.md                # deferred items with context
└── package.json
```

## Commands

| Command                   | Action                                            |
| :------------------------ | :------------------------------------------------ |
| `npm install`             | Install dependencies                              |
| `npm run dev`             | Start the dev server at `localhost:4321`          |
| `npm run build`           | Build the production site to `./dist/`           |
| `npm run check:integrity` | Run CHECK 1-8 against `./dist/` (build first)     |
| `npm test`                | `build` then `check:integrity`                    |
| `npm run preview`         | Preview the build locally                         |
| `npm run format`          | Format with Prettier                              |
| `npm run lint:eslint`     | Run ESLint                                        |

## Integrity checks

`scripts/check-integrity.mjs` runs against the built `./dist/` — locally via
`npm test` (which builds first), and in CI before any deploy. A plain
`npm run build` does not run it. The checks:

1. **Internal links** resolve to built pages.
2. **Mailto links** carry the real contact address.
3. **Banned strings** — template residue cannot ship.
4. **Category-route regression** guard.
5. **Copy gates** — the homepage's visible text stays under a 450-word budget
   and contains zero terms from `docs/designs/assets/jargon-inventory.md`.
   Also scanned: meta strings (og:title, og:description, og:image:alt,
   twitter, meta description), alt/aria-label attributes, and the decoded
   mailto drafts — the chat-link preview and the pre-filled email are part
   of the buyer's read.
6. **Blog teardown** — with the blog disabled, no blog routes, RSS feed, or
   RSS chrome may appear in `dist/`.
7. **Preview metadata** — `index.html` must carry an og:image and a meta
   description.
8. **External proof links** — the page's load-bearing claims link to systems
   outside this repo (`ivf.vuldesk.com`). Controlled by the `EXTERNAL_LINKS`
   env var: `warn` (default — push runs never block a deploy on a third-party
   outage), `fail` (used by the weekly workflow), or `skip`.

## CI

- **deploy.yml** — every push to `main` runs `verify` (lint, build,
  integrity check) and deploys to GitHub Pages only if it passes. PRs run
  `verify` without deploying.
- **proof-links.yml** — Mondays 06:00 UTC (and on manual dispatch), rebuilds
  the site and runs the integrity check with `EXTERNAL_LINKS=fail`, so a dead
  proof link gets caught between deploys and fails loud.

## Documentation map

- [DESIGN.md](./DESIGN.md) — design system and the gates that keep it true
- [docs/designs/plain-english-one-page-site.md](./docs/designs/plain-english-one-page-site.md) — plan of record (with engineering and design review amendments)
- [docs/designs/assets/jargon-inventory.md](./docs/designs/assets/jargon-inventory.md) — the 212-term banned list behind CHECK 5
- [docs/designs/assets/cold-read-harness.md](./docs/designs/assets/cold-read-harness.md) — comprehension test protocol and results
- [TODOS.md](./TODOS.md) — deferred work, each item with pros/cons and a trigger

## License

MIT — see [LICENSE.md](./LICENSE.md). Based on the
[AstroWind](https://github.com/onwidget/astrowind) template by
[onWidget](https://onwidget.com).
