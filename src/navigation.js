import { getPermalink, getBlogPermalink } from './utils/permalinks';

// Fallback navigation. Renders on any page that does not supply its own
// `header` slot — currently /terms, /privacy and /404.
export const headerData = {
  links: [
    { text: 'What I built', href: getPermalink('/#proof') },
    { text: 'How it works', href: getPermalink('/#how-it-works') },
    { text: 'Price', href: getPermalink('/#price') },
    { text: 'Writing', href: getBlogPermalink() },
  ],
  actions: [{ text: 'Describe your feature', href: 'mailto:contact@vuldesk.com?subject=AI feature build' }],
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
