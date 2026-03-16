import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import AstroPWA from '@vite-pwa/astro';

export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  integrations: [
    react(),
    AstroPWA({
      manifest: {
        background_color: '#09090b',
        description: 'Sparrow Sound Desk brings ambient sounds for focus and calm.',
        display: 'standalone',
        icons: [
          ...[72, 128, 144, 152, 192, 256, 512].map(size => ({
            sizes: `${size}x${size}`,
            src: `/assets/pwa/${size}.png`,
            type: 'image/png',
          })),
        ],
        name: 'Sparrow Sound Desk',
        orientation: 'any',
        scope: '/',
        short_name: 'Sparrow',
        start_url: '/',
        theme_color: '#09090b',
      },
      registerType: 'autoUpdate',
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        globPatterns: ['**/*'],
        maximumFileSizeToCacheInBytes: Number.MAX_SAFE_INTEGER,
        navigateFallback: '/',
        skipWaiting: true,
      },
    }),
  ],
});
