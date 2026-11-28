import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import autoprefixer from 'autoprefixer';
import icon from 'astro-icon';
import tailwindcss from 'tailwindcss';

import astrowind from './vendor/integration';

import {
  readingTimeRemarkPlugin,
  responsiveTablesRehypePlugin,
  lazyImagesRehypePlugin,
} from './src/utils/frontmatter.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  output: 'static',
  site: 'https://www.vuldesk.com',
  compressHTML: true,

  redirects: {
    // Pentest-era lead magnet, retired. Nothing replaces it yet.
    '/free-recon': '/',
    // Pentest-era blog posts, drafted 2026-08-20 (blog disabled). Static
    // meta-refresh tombstones keep old backlinks/bookmarks from hard-404ing;
    // CHECK 6 in scripts/check-integrity.mjs asserts these stay redirects.
    '/email-marketing-platform-security': '/',
    '/oauth-token-security-saas': '/',
    '/saas-security-headers-guide': '/',
  },

  integrations: [
    sitemap(),
    icon({
      include: {
        tabler: ['*'],
        'flat-color-icons': [
          'gallery',
          'voice-presentation',
          'business-contact',
          'database',
          'support',
          'self-service-kiosk',
          'two-smartphones',
          'edit-image',
          'services',
          'synchronize',
        ],
      },
    }),

    astrowind({
      config: './src/config.yaml',
    }),
  ],

  image: {
    domains: ['cdn.pixabay.com'],
  },

  markdown: {
    processor: unified({
      remarkPlugins: [readingTimeRemarkPlugin],
      rehypePlugins: [responsiveTablesRehypePlugin, lazyImagesRehypePlugin],
    }),
  },

  vite: {
    css: {
      postcss: {
        plugins: [tailwindcss(), autoprefixer()],
      },
    },
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
  },
});
