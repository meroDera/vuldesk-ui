import { getPermalink, getBlogPermalink } from './utils/permalinks';

// Single source of truth for the contact link. Every Astro page imports this.
// It was previously hardcoded in 7 files; a find-and-replace across them ate the
// `@` and shipped `mailto:contact.com` to three pages, so it lives here now.
export const CONTACT_EMAIL = 'contact@vuldesk.com';

export const CONTACT_MAILTO =
  `mailto:${CONTACT_EMAIL}?subject=AI feature build` +
  `&body=Hi Himal,%0D%0A%0D%0AThe feature we want built:%0D%0A%0D%0A` +
  `Product: %0D%0AWhat it should do: %0D%0A` +
  `What it reads (docs, tickets, filings, transcripts, records): %0D%0A` +
  `Stack: %0D%0A%0D%0AThanks`;

// Site navigation. Rendered by PageLayout for every page — pages no longer
// override the header slot, so this is the only place the nav is defined.
export const headerData = {
  links: [
    { text: 'What I built', href: getPermalink('/#proof') },
    { text: 'How it works', href: getPermalink('/#how-it-works') },
    { text: 'Price', href: getPermalink('/#price') },
    { text: 'Writing', href: getBlogPermalink() },
  ],
  actions: [{ text: 'Describe your feature', href: CONTACT_MAILTO }],
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
