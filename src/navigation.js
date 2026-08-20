import { getPermalink } from './utils/permalinks';

// Single source of truth for the contact link. Every Astro page imports this.
// It was previously hardcoded in 7 files; a find-and-replace across them ate the
// `@` and shipped `mailto:contact.com` to three pages, so it lives here now.
export const CONTACT_EMAIL = 'contact@vuldesk.com';

// Plain-English draft (design doc D8/9A): the buyer meets this text one click
// after the hero, so it obeys the same jargon gate as the page copy.
export const CONTACT_MAILTO =
  `mailto:${CONTACT_EMAIL}?subject=My pile of records` +
  `&body=Hi Himal,%0D%0A%0D%0A` +
  `What the pile is: %0D%0A` +
  `What I want to know from it: %0D%0A` +
  `Roughly how many per week: %0D%0A%0D%0AThanks`;

// Site navigation (design review D3, 2026-08-20): the header carries the
// wordmark and ONE action — nothing else. The page is one screen-flow; a
// 420-word letter needs no menu. Rendered by PageLayout for every page.
export const headerData = {
  links: [],
  actions: [{ text: 'Email me', href: CONTACT_MAILTO }],
};

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
