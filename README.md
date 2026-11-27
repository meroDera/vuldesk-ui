# vuldesk-ui

Source for [www.vuldesk.com](https://www.vuldesk.com) — a one-page, plain-English
site for Vuldesk: an outside CTO for owners of live websites, apps, and internal
tools, including ones built with AI. The offer covers releases, performance,
and cloud costs, from planning through rollout.

The site is a static Astro 4 + Tailwind CSS build, derived from the
[AstroWind](https://github.com/onwidget/astrowind) template. Almost all template
surface has been removed or rewritten; what remains is the build machinery, the
MIT license, and the legal-page clause text (unreviewed template inheritance —
see TODOS.md item 2).

## What the site is

The homepage uses a warm worktable composition with Source Serif 4 display
type, Inter body/UI text, paper notes, and a red/brown palette. It is light-only.
[DESIGN.md](./DESIGN.md) documents the current design; `src/pages/index.astro`
and `src/components/widgets/Worktable.astro` define its implementation.

Buyers start with a free technical review ($0 USD), then can choose a fixed-price
sprint from $999.50 USD or optional monthly support from $1,450 USD. Scope,
price, timeline, and availability are agreed before paid work starts. Sprint
handoff includes results and rollback notes; monthly support does not promise
fixed capacity or round-the-clock response. Monthly replies target the same
day, Monday–Friday; delivery time is agreed for each improvement.

The interactive example has four stages: free review, paid sprint, rollout,
and monthly support. It illustrates the process. The trust band names Kushal
and the four-person team. The clinic booking project was retired from public
proof after the owner reported that its site was broken.

Review links lead to the review section; its email CTA opens a prefilled draft,
with a visible address and a copy-address button where the Clipboard API is
available. The team replies within one business day. Both homepage interactions initialize on
`astro:page-load` so they work after Astro view transitions; they guard against
duplicate setup. Without JavaScript, the first example and email link remain
available. Older plans under `docs/designs/` record earlier positioning and
design decisions; they are historical references, not the current page spec.

Routes that ship:

| Route                | What it is                                         |
| :------------------- | :------------------------------------------------- |
| `/`                  | The outside CTO homepage (`src/pages/index.astro`) |
| `/404`               | Plain-English not-found page that routes back home |
| `/terms`, `/privacy` | Legal pages (see TODOS.md item 2)                  |
| `/sitemap-index.xml` | Generated sitemap index                            |
| `/robots.txt`        | Static crawler rules from `public/robots.txt`      |

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
│   ├── deploy.yml          # push to main → verify (types, lint, build, integrity) → GitHub Pages
│   └── proof-links.yml     # weekly cron: external proof links must respond
├── docs/designs/           # historical plans + assets (jargon inventory, cold-read harness)
├── scripts/
│   └── check-integrity.mjs # CHECK 1-9, runs against ./dist after build
├── src/
│   ├── assets/images/      # OG card (default.png) + worktable.webp
│   ├── components/
│   │   ├── CustomStyles.astro        # shared-page tokens + fonts (see DESIGN.md)
│   │   ├── widgets/Worktable.astro   # four-stage interactive homepage example
│   │   └── widgets/SiteHeader.astro # shared-page wordmark + review action
│   ├── content/post/       # drafted blog posts (blog disabled)
│   ├── layouts/PageLayout.astro
│   ├── pages/index.astro   # homepage layout, styling, contact interaction
│   ├── config.yaml         # site metadata, blog flags, theme
│   └── navigation.js       # CONTACT_EMAIL / CONTACT_MAILTO single source of truth
├── DESIGN.md               # design system: type, color, composition, gates
├── TODOS.md                # deferred items with context
└── package.json
```

## Commands

| Command                   | Action                                        |
| :------------------------ | :-------------------------------------------- |
| `npm install`             | Install dependencies                          |
| `npm run dev`             | Start the dev server at `localhost:4321`      |
| `npm run build`           | Build the production site to `./dist/`        |
| `npm run check`           | Check Astro templates and TypeScript          |
| `npm run check:integrity` | Run CHECK 1-9 against `./dist/` (build first) |
| `npm test`                | `check`, `build`, then `check:integrity`      |
| `npm run preview`         | Preview the build locally                     |
| `npm run format`          | Format with Prettier                          |
| `npm run lint:eslint`     | Run ESLint                                    |

The Astro checker and its language server are pinned to preserve Node 18 compatibility.

## Integrity checks

`scripts/check-integrity.mjs` runs against the built `./dist/` — locally via
`npm test` (which checks types and builds first), and in CI before any deploy. A plain
`npm run build` does not run it. The checks:

1. **Internal links** resolve to built pages.
2. **Mailto links** carry the real contact address.
3. **Banned strings** — template residue cannot ship.
4. **Category-route regression** guard.
5. **Copy gates** — the homepage's longest reading state stays under a 450-word
   budget: shared page copy plus the longest worktable note, rather than all
   four hidden stages together. All stages are scanned against
   `docs/designs/assets/jargon-inventory.md`, with deliberate exceptions listed
   in `JARGON_ALLOW` in the script.
   Also scanned: meta strings (og:title, og:description, og:image:alt,
   twitter, meta description), alt/aria-label attributes, and the decoded
   mailto drafts — the chat-link preview and the pre-filled email are part
   of the buyer's read.
6. **Blog teardown** — with the blog disabled, no blog routes, RSS feed, or
   RSS chrome may appear in `dist/`.
7. **Search and preview metadata** — `index.html` must carry an og:image,
   a meta description, and valid Organization/WebSite structured data matching
   Vuldesk's public identity. Legal pages have their own descriptions; the
   not-found page is marked `noindex`.
8. **External proof links** — checks published proof links on Vuldesk
   subdomains. The homepage currently publishes none. Controlled by the `EXTERNAL_LINKS`
   env var: `warn` (default — push runs never block a deploy on a third-party
   outage), `fail` (used by the weekly workflow), or `skip`.
9. **Homepage review path** — the how-we-work and review anchors resolve, the
   review section shows the contact address, and its email draft carries the
   technical-review subject and the two requested prompts.

## CI

- **deploy.yml** — every push to `main` runs `verify` (Astro/TypeScript checks, lint, build,
  integrity check) and deploys to GitHub Pages only if it passes. PRs run
  `verify` without deploying. Each PR has its own concurrency group, so its
  checks cannot cancel publishing. Main pushes and manual deployments share
  one production group; newer runs cancel older runs within that group.
- **proof-links.yml** — Mondays 06:00 UTC (and on manual dispatch), rebuilds
  the site and runs the integrity check with `EXTERNAL_LINKS=fail`, so a dead
  proof link gets caught between deploys and fails loud. External link checks
  have no targets until a verified proof link is added to the homepage.

## Documentation map

- [DESIGN.md](./DESIGN.md) — design system and the gates that keep it true
- [docs/designs/plain-english-one-page-site.md](./docs/designs/plain-english-one-page-site.md) — historical set-letter plan (with engineering and design review amendments)
- [docs/designs/assets/jargon-inventory.md](./docs/designs/assets/jargon-inventory.md) — the 212-term banned list behind CHECK 5
- [docs/designs/assets/cold-read-harness.md](./docs/designs/assets/cold-read-harness.md) — comprehension test protocol and historical results; rerun for the current page
- [TODOS.md](./TODOS.md) — deferred work, including branch protection, legal review, dependencies, and owner inputs; some context refers to earlier positioning

## License

MIT — see [LICENSE.md](./LICENSE.md). Based on the
[AstroWind](https://github.com/onwidget/astrowind) template by
[onWidget](https://onwidget.com).
