#!/usr/bin/env node
/**
 * Build-time site integrity check. Runs against dist/ after `astro build`.
 *
 * Exists because three defect classes shipped to production undetected:
 *   1. Ten internal links 404'd from April 2024 (deleted [category]/[tag] routes,
 *      config still enabled) until 2026-08-09.
 *   2. `mailto:contact.com` — a find-and-replace ate the `@vuldesk` and shipped a
 *      broken contact address, the site's only conversion path, to three pages.
 *   3. `AstroWind LLC, 1 Cupertino, CA 95014` sat in the live legal pages for two
 *      years, alongside a placeholder `somecoolemail@domain.com` contact address.
 *
 * A green `astro build` caught none of them. This does.
 *
 *   dist/**.html
 *     ├── every internal href resolves to a real file .......... CHECK 1
 *     ├── every mailto: has a plausible address ................ CHECK 2
 *     ├── no banned template / placeholder strings ............. CHECK 3
 *     └── category renders as text while config disables it .... CHECK 4 (regression)
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
let failures = [];

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : full.endsWith('.html') ? [full] : [];
  });
}

if (!existsSync(DIST)) {
  console.error(`${DIST}/ not found. Run \`npm run build\` first.`);
  process.exit(1);
}

const pages = walk(DIST);
const rel = (p) => p.slice(DIST.length);

// ── CHECK 1: internal links resolve ─────────────────────────────────────────
// Fragments are stripped; an anchor to a missing id is a softer failure than a
// 404 and is not worth blocking a deploy over.
const IGNORE_PREFIX = ['/_astro', '/fonts', '/images', '/favicon'];
let linkCount = 0;

for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  for (const [, href] of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    if (IGNORE_PREFIX.some((p) => href.startsWith(p))) continue;
    linkCount++;
    const bare = href.replace(/\/$/, '') || '/';
    const resolves =
      existsSync(join(DIST, href)) ||
      existsSync(join(DIST, bare)) ||
      existsSync(join(DIST, bare, 'index.html'));
    if (!resolves) failures.push(`[link] ${rel(page)} -> ${href} does not resolve`);
  }
}

// ── CHECK 2: mailto addresses are plausible ─────────────────────────────────
// `mailto:contact.com` is syntactically a URL but not an address. Require a
// local part, an @, and a dotted domain.
const MAILTO_OK = /^mailto:[^@\s]+@[^@\s.]+\.[^@\s]+$/;
let mailtoCount = 0;

for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  for (const [, raw] of html.matchAll(/href="(mailto:[^"]*)"/g)) {
    mailtoCount++;
    const addressOnly = raw.split('?')[0].replace(/&amp;/g, '&');
    if (!MAILTO_OK.test(addressOnly)) {
      failures.push(`[mailto] ${rel(page)} -> ${addressOnly} is not a valid address`);
    }
  }
}

// ── CHECK 3: banned strings ─────────────────────────────────────────────────
// Template residue and placeholders. `somecoolemail@domain.com` is included
// explicitly because it passes CHECK 2 — it is a syntactically valid address
// that simply is not ours.
const BANNED = [
  ['astrowind', 'AstroWind template residue'],
  ['onwidget', 'template author reference'],
  ['Cupertino', 'template placeholder address'],
  ['is a Demo', 'template demo disclaimer'],
  ['somecoolemail@domain.com', 'placeholder contact address'],
  ['lorem ipsum', 'placeholder copy'],
  ['AstroWind LLC', 'template company name'],
];

for (const page of pages) {
  const html = readFileSync(page, 'utf8').toLowerCase();
  for (const [needle, why] of BANNED) {
    if (html.includes(needle.toLowerCase())) {
      failures.push(`[banned] ${rel(page)} contains "${needle}" (${why})`);
    }
  }
}

// ── CHECK 4: category-gating regression ─────────────────────────────────────
// SinglePost.astro and ListItem.astro render the category as a <span> when
// config.yaml sets category.isEnabled: false. The [category] route files were
// deleted in d0b2a55, so a link here is a guaranteed 404. This fails silently
// if the config shape changes, hence the test.
const configRaw = readFileSync('src/config.yaml', 'utf8');
const categoryEnabled = /category:\s*\n\s*isEnabled:\s*true/.test(configRaw);

if (!categoryEnabled) {
  const categoryLinks = pages.flatMap((page) => {
    const html = readFileSync(page, 'utf8');
    return [...html.matchAll(/href="\/category\/[^"]*"/g)].map(
      () => `[regression] ${rel(page)} emits a /category/ link while category.isEnabled is false`
    );
  });
  failures.push(...new Set(categoryLinks));
}

// ── report ──────────────────────────────────────────────────────────────────
const checked = `${pages.length} pages, ${linkCount} internal links, ${mailtoCount} mailtos`;

if (failures.length) {
  console.error(`\nSite integrity FAILED (${checked})\n`);
  for (const f of failures) console.error(`  ${f}`);
  console.error(`\n${failures.length} problem(s).\n`);
  process.exit(1);
}

console.log(`Site integrity OK — ${checked}, no banned strings, no category regressions.`);
