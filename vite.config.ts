import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages serves this repo at https://billtf.github.io/linebreak/
  base: '/linebreak/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
