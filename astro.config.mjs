// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import icon from "astro-icon";
import tailwindcss from '@tailwindcss/vite';

// Static-first: `astro build` produces a fully static site in ./dist,
// deployable as-is to Cloudflare Pages. `pagefind --site dist` runs after
// the build (npm run build:search) to index it — no runtime fetching.
export default defineConfig({
  site: 'https://cat-roadmaps.pages.dev',
  server: {
    allowedHosts: true
  },
  integrations: [react(), icon()],
  vite: {
    plugins: [tailwindcss()],
  },
});
