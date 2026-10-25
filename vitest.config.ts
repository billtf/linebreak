import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/engine/**/*.ts'],
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 75,
      },
    },
  },
});
