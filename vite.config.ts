import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // GitHub Pages serves this repo at https://billtf.github.io/linebreak/
  base: '/linebreak/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [],
      manifest: {
        name: 'Linebreak',
        short_name: 'Linebreak',
        description: 'A browser falling-block puzzle',
        start_url: '/linebreak/',
        scope: '/linebreak/',
        display: 'standalone',
        background_color: '#121212',
        theme_color: '#121212',
      },
    }),
  ],
});
