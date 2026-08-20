import { getPermalink } from './utils/permalinks';

// Single source of truth for the contact link. Every Astro page imports this.
// It was previously hardcoded in 7 files; a find-and-replace across them ate the
// `@` and shipped `mailto:contact.com` to three pages, so it lives here now.
export const CONTACT_EMAIL = 'contact@vuldesk.com';

// Plain-English draft (design doc D8/9A): the buyer meets this text one click
// after the hero, so it obeys the same jargon gate as the page copy.
// Fully RFC 6068-encoded (raw spaces truncate the subject in some clients).
export const CONTACT_MAILTO =
  `mailto:${CONTACT_EMAIL}` +
  `?subject=${encodeURIComponent('My pile of records')}` +
  `&body=${encodeURIComponent(
    'Hi Himal,\r\n\r\nWhat the pile is: \r\nWhat I want to know from it: \r\nRoughly how many per week: \r\n\r\nThanks'
  )}`;

// The header is SiteHeader.astro (wordmark + one action, design review D3) —
// it imports CONTACT_MAILTO directly. There is deliberately no headerData
// export any more: the old AstroWind Header widget is unused, and a config
// object nothing consumes is a drift trap.

export const footerData = {
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    {
      ariaLabel: 'LinkedIn',
      icon: 'tabler:brand-linkedin',
      href: 'https://www.linkedin.com/company/vuldesk-technology/',
    },
    {
      ariaLabel: 'Twitter',
      icon: 'tabler:brand-twitter',
      href: 'https://twitter.com/vuldesk_tech',
    },
  ],
  footNote: `
    © 2026 Vuldesk Technologies Private Limited. All rights reserved.
  `,
};
