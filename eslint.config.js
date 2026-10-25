import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['src/engine/**/*.ts'],
    rules: {
      // Engine purity: no UI, render, audio, or DOM. Randomness must be seeded.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/render', '**/render/**', '@/render', '@/render/**'],
              message: 'Engine cannot import from render.',
            },
            {
              group: ['**/ui', '**/ui/**', '@/ui', '@/ui/**'],
              message: 'Engine cannot import from ui.',
            },
            {
              group: ['**/audio', '**/audio/**', '@/audio', '@/audio/**'],
              message: 'Engine cannot import from audio.',
            },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        {
          name: 'window',
          message: 'Engine cannot use DOM globals.',
        },
        {
          name: 'document',
          message: 'Engine cannot use DOM globals.',
        },
        {
          name: 'navigator',
          message: 'Engine cannot use DOM globals.',
        },
        {
          name: 'localStorage',
          message: 'Engine cannot use DOM globals.',
        },
        {
          name: 'sessionStorage',
          message: 'Engine cannot use DOM globals.',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.object.name='Math'][callee.property.name='random']",
          message: 'Use the seeded PRNG instead of Math.random.',
        },
        {
          selector:
            "CallExpression[callee.object.name='Date'][callee.property.name='now']",
          message: 'Engine cannot use Date.now; pass time in from the caller.',
        },
      ],
    },
  },
);
