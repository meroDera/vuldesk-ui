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

function statSafeIsDir(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

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
    // "/" must resolve to a real homepage, not to the dist directory itself
    // (existsSync(dist) is trivially true and hid a missing index.html).
    const resolves =
      bare === '/'
        ? existsSync(join(DIST, 'index.html'))
        : existsSync(join(DIST, href)) && !statSafeIsDir(join(DIST, href)) ||
          existsSync(join(DIST, bare)) && !statSafeIsDir(join(DIST, bare)) ||
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
  ['just a Demo', 'template demo disclaimer (wording variant that evaded "is a Demo")'],
  ['[photo', 'unshipped placeholder (ship-floor item D7 must never reach production)'],
  ['[todo', 'unshipped placeholder'],
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

// ── CHECK 5: copy gates — word budget + jargon inventory ────────────────────
// The design doc's primary language gate (eng review 4A, design review D8/D10).
// Scans the homepage's VISIBLE text plus the invisible preview strings
// (og:title, meta description, og:image alt) against the 212-term inventory.
// The confused-client incident started in a chat preview, not on the page.
const INVENTORY = 'docs/designs/assets/jargon-inventory.md';
const WORD_BUDGET = 450;
// Terms with a legitimate use in the new copy. Each entry is deliberate; add
// here only with a comment saying where and why the term is fine.
const JARGON_ALLOW = new Set([
  'live', // "See it live" — plain verb use, not "serving traffic"
  'fields', // rejected-terms list marks general form use as fine
]);

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    // Separator entities become spaces; in-word entities (rsquo, amp) vanish
    // so "team&rsquo;s" counts as one word, not two. Hex entities included.
    .replace(/&(?:nbsp|mdash|ndash|middot|bull);/gi, ' ')
    .replace(/&[a-z]+\d*;|&#x[0-9a-f]+;|&#\d+;/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const indexPath = join(DIST, 'index.html');
// Missing inputs FAIL — a gate that silently skips is not a gate.
if (!existsSync(indexPath)) failures.push('[copy] dist/index.html is missing — homepage did not build');
if (!existsSync(INVENTORY)) failures.push(`[copy] ${INVENTORY} is missing — jargon gate cannot run`);
if (existsSync(indexPath) && existsSync(INVENTORY)) {
  const indexHtml = readFileSync(indexPath, 'utf8');
  const metaBits = [];
  for (const attr of ['og:title', 'og:description', 'og:image:alt', 'twitter:title', 'twitter:description']) {
    const m = indexHtml.match(new RegExp(`<meta[^>]+property="${attr}"[^>]+content="([^"]*)"`, 'i')) ||
      indexHtml.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+property="${attr}"`, 'i')) ||
      indexHtml.match(new RegExp(`<meta[^>]+name="${attr}"[^>]+content="([^"]*)"`, 'i')) ||
      indexHtml.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+name="${attr}"`, 'i'));
    if (m) metaBits.push(m[1]);
  }
  const descM =
    indexHtml.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i) ||
    indexHtml.match(/<meta[^>]+content="([^"]*)"[^>]+name="description"/i);
  if (descM) metaBits.push(descM[1]);

  // Attribute-carried copy the tag-stripper would miss: alt text, aria-labels,
  // and the pre-filled mailto drafts (the buyer reads that text one click in).
  for (const [, alt] of indexHtml.matchAll(/\b(?:alt|aria-label)="([^"]*)"/gi)) {
    if (alt) metaBits.push(alt);
  }
  for (const [, mail] of indexHtml.matchAll(/href="(mailto:[^"]*)"/gi)) {
    try {
      metaBits.push(decodeURIComponent(mail.replace(/&amp;/g, '&')));
    } catch {
      metaBits.push(mail);
    }
  }

  const text = visibleText(indexHtml);
  const words = text.split(' ').filter((w) => w && !['—', '·'].includes(w));
  if (words.length > WORD_BUDGET) {
    failures.push(`[copy] index.html has ${words.length} visible words (budget ${WORD_BUDGET})`);
  }

  // Parse inventory terms from the markdown table: "| term | where | alt |".
  // Entries like "agent / AI agent" split into separate terms.
  // KNOWN LIMIT: the "Missed items" bullet section of the inventory is prose
  // and is NOT machine-parsed; its items are enforced by review, not this gate.
  const invRaw = readFileSync(INVENTORY, 'utf8');
  const terms = new Set();
  for (const line of invRaw.split('\n')) {
    const m = line.match(/^\|\s*([^|]+?)\s*\|/);
    if (!m || /^Term$|^---/.test(m[1])) continue;
    // Strip parentheticals and quotes BEFORE splitting: entries like
    // 'surface (as a verb)' or 'dead (of a filing)' must yield the bare term,
    // not unmatched debris (adversarial review F5).
    const cleaned = m[1].replace(/\([^)]*\)/g, ' ').replace(/["'“”‘’]/g, ' ');
    for (const t of cleaned.split('/')) {
      const term = t.trim().toLowerCase().replace(/\s+/g, ' ');
      if (term.length >= 3 && !JARGON_ALLOW.has(term)) terms.add(term);
    }
  }
  const haystack = ` ${(text + ' ' + metaBits.join(' ')).toLowerCase()} `;
  for (const term of terms) {
    // Whole-word/phrase match ("live" must not hit inside "deliver"); inner
    // spaces match hyphens too, so "data flow" catches "data-flow".
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '[\\s-]+');
    const re = new RegExp(`(^|[^a-z])${escaped}($|[^a-z])`);
    if (re.test(haystack)) {
      failures.push(`[jargon] index.html (or its meta/attribute strings) contains inventory term "${term}"`);
    }
  }
}

// ── CHECK 6: blog teardown is complete ──────────────────────────────────────
// Blog disabled + posts drafted (design doc route table). None of it may leak
// into the built output — no routes, no feed, no RSS chrome.
// Lazy unbounded match: the first isEnabled after the blog: label, however many
// comment lines sit between them (a 200-char window silently broke on comments).
const blogEnabledMatch = configRaw.match(/\bblog:\s*[\s\S]*?\bisEnabled:\s*(\S+)/);
if (!blogEnabledMatch) {
  // A gate that silently skips is not a gate (same rule as CHECK 5).
  failures.push('[teardown] config.yaml blog.isEnabled could not be parsed — teardown checks cannot run');
}
const blogEnabled = blogEnabledMatch ? blogEnabledMatch[1] === 'true' : true;
if (!blogEnabled) {
  if (existsSync(join(DIST, 'blog'))) failures.push('[teardown] dist/blog/ exists while blog is disabled');
  if (existsSync(join(DIST, 'rss.xml'))) failures.push('[teardown] dist/rss.xml exists while blog is disabled');
  // Old post URLs must survive as redirect tombstones (astro.config redirects
  // build meta-refresh pages) — a hard 404 breaks every old backlink/bookmark.
  for (const old of ['email-marketing-platform-security', 'oauth-token-security-saas', 'saas-security-headers-guide']) {
    const tomb = join(DIST, old, 'index.html');
    if (!existsSync(tomb)) {
      failures.push(`[teardown] dist/${old}/ has no redirect tombstone — old links hard-404`);
    } else if (!/http-equiv="refresh"/i.test(readFileSync(tomb, 'utf8'))) {
      failures.push(`[teardown] dist/${old}/ builds real content instead of a redirect while the post is drafted`);
    }
  }
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    if (/href="[^"]*rss\.xml"/.test(html)) failures.push(`[teardown] ${rel(page)} links rss.xml while blog is disabled`);
  }
}

// ── CHECK 7: preview metadata present ───────────────────────────────────────
// The chat-link preview is the buyer's step zero (design review D8).
if (existsSync(indexPath)) {
  const indexHtml = readFileSync(indexPath, 'utf8');
  const ogImg =
    indexHtml.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i) ||
    indexHtml.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
  if (!ogImg) {
    failures.push('[meta] index.html has no og:image');
  } else {
    // The declared image must actually exist in the build — a preview card
    // with a dead image URL passes a presence check and fails in every chat app.
    // Existence check applies only to our own origin — an external-CDN
    // og:image (if ever used) cannot be resolved against dist/.
    let imgUrl;
    try {
      imgUrl = new URL(ogImg[1], 'https://www.vuldesk.com');
    } catch {
      failures.push(`[meta] og:image URL is unparseable: ${ogImg[1]}`);
    }
    if (imgUrl && imgUrl.hostname === 'www.vuldesk.com' && !existsSync(join(DIST, imgUrl.pathname))) {
      failures.push(`[meta] og:image points at ${imgUrl.pathname} which is not in the build`);
    }
  }
  if (
    !/<meta[^>]+name="description"[^>]+content="[^"]+"/i.test(indexHtml) &&
    !/<meta[^>]+content="[^"]+"[^>]+name="description"/i.test(indexHtml)
  ) {
    failures.push('[meta] index.html has no meta description');
  }
}

// ── CHECK 8: external proof links (warn on push, fail on schedule) ──────────
// The page's load-bearing claims are links to systems outside this repo
// (eng review 1A). Push-triggered runs warn so a third-party outage never
// blocks a deploy; the weekly proof-links.yml workflow sets
// EXTERNAL_LINKS=fail and fails loud. HEAD request with one retry.
const EXTERNAL_MODE = process.env.EXTERNAL_LINKS || 'warn';

// The URLs under check are EXTRACTED from the built homepage, not hardcoded —
// a typo'd or swapped link on the page is checked as-published, and a link
// removed from the page stops being checked (adversarial review P2).
function externalLinks() {
  if (!existsSync(indexPath)) return [];
  const html = readFileSync(indexPath, 'utf8');
  const urls = new Set();
  for (const [, href] of html.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
    try {
      const u = new URL(href);
      // Scope: our own non-www subdomains — the proof links whose health the
      // page stakes claims on (ivf.vuldesk.com today). Third-party socials are
      // deliberately excluded: twitter/linkedin 403 bot-blocks from CI would
      // make the weekly cron cry wolf.
      if (u.hostname.endsWith('.vuldesk.com') && u.hostname !== 'www.vuldesk.com') {
        urls.add(href);
      }
    } catch {
      failures.push(`[external] unparseable external href on homepage: ${href}`);
    }
  }
  return [...urls];
}

// Known content fingerprints: a 200 from a parked page, expired hosting, or a
// dangling-CNAME takeover must not certify the proof link (adversarial F4).
// Marker observed live 2026-08-20; update if the client rebrands their page.
const PROOF_MARKERS = {
  'ivf.vuldesk.com': 'Gamma IVF',
};

async function linkOk(url) {
  const wantHost = new URL(url).hostname;
  const marker = PROOF_MARKERS[wantHost];
  let lastWhy = 'no response (network error or timeout on every attempt)';
  const methods = marker ? ['GET'] : ['HEAD', 'GET'];
  for (const method of methods) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(10000) });
        // A redirect that lands on a DIFFERENT host is a failure even with a
        // 200: a hijacked/parked destination must not certify as healthy.
        const finalHost = new URL(res.url || url).hostname;
        if (finalHost !== wantHost) {
          res.body?.cancel?.().catch(() => {});
          return { ok: false, why: `redirected off-host to ${finalHost}` };
        }
        if (res.ok) {
          if (marker && method === 'GET') {
            const body = await res.text();
            if (!body.includes(marker)) {
              return { ok: false, why: `responded 200 but expected content marker "${marker}" is missing (parked/hijacked?)` };
            }
          } else {
            res.body?.cancel?.().catch(() => {});
          }
          return { ok: true };
        }
        lastWhy = `HTTP ${res.status} via ${method}`;
        res.body?.cancel?.().catch(() => {});
        if (res.status === 405 && method === 'HEAD') break; // host rejects HEAD — try GET
      } catch (err) {
        lastWhy = `${err?.name || 'error'}: ${err?.message || 'fetch failed'} via ${method}`;
      }
    }
  }
  return { ok: false, why: lastWhy };
}

if (EXTERNAL_MODE !== 'skip') {
  for (const url of externalLinks()) {
    const res = await linkOk(url);
    if (!res.ok) {
      const msg = `[external] homepage link ${url} failed: ${res.why}`;
      if (EXTERNAL_MODE === 'fail') failures.push(msg);
      else console.warn(`  WARN ${msg} (push mode: not blocking the deploy)`);
    }
  }
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
