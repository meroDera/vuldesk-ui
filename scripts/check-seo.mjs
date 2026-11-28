import assert from 'node:assert/strict';
import { buildTags } from '../vendor/astrolib/seo/utils/buildTags.ts';

const tags = buildTags({
  title: 'Outside CTO',
  titleTemplate: '%s | Vuldesk',
  description: 'Engineering & support',
  canonical: 'https://www.vuldesk.com/',
  noindex: false,
  nofollow: false,
  openGraph: {
    type: 'website',
    images: [{ url: 'https://www.vuldesk.com/preview.png', width: 1200, height: 628, alt: 'Your outside CTO' }],
  },
  twitter: { cardType: 'summary_large_image' },
});

for (const expected of [
  '<title>Outside CTO | Vuldesk</title>',
  '<meta name="description" content="Engineering &amp; support">',
  '<meta name="robots" content="index,follow">',
  '<link rel="canonical" href="https://www.vuldesk.com/">',
  '<meta property="og:image:width" content="1200">',
  '<meta property="og:image:height" content="628">',
  '<meta name="twitter:card" content="summary_large_image">',
]) {
  assert.ok(tags.includes(expected), `Missing metadata: ${expected}`);
}

const escaped = buildTags({
  title: '<img src=x onerror=alert(1)>',
  description: '" onmouseover="alert(1)',
  canonical: 'https://example.com/?q="&x=<tag>',
  openGraph: { images: [{ url: 'https://example.com/image.png', alt: '"><script>alert(1)</script>' }] },
});
assert.ok(escaped.includes('<title>&lt;img src=x onerror=alert(1)&gt;</title>'));
assert.ok(escaped.includes('content="&quot; onmouseover=&quot;alert(1)"'));
assert.ok(escaped.includes('href="https://example.com/?q=&quot;&amp;x=&lt;tag&gt;"'));
assert.ok(escaped.includes('content="&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;"'));
assert.ok(!escaped.includes('<img') && !escaped.includes('<script>'));
assert.equal(buildTags({}), '');
assert.equal(buildTags({ noindex: true, nofollow: true }), '<meta name="robots" content="noindex,nofollow">');

console.log('SEO rendering OK — metadata, crawler controls, and HTML escaping.');
