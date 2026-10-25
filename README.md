# Linebreak

A browser falling-block puzzle that ships as a static site on GitHub Pages.

## Docs

- [Game spec](./SPEC.md)
- [Implementation plan](./IMPLEMENTATION.md)

## Live site

Once GitHub Pages is pointed at **GitHub Actions** (Settings → Pages → Source: GitHub Actions), the placeholder ships at:

https://billtf.github.io/linebreak/

Pushes and merges to `main` run `.github/workflows/deploy.yml`. Until that Pages source is set, the deploy workflow cannot publish.

## Requirements

- Node 20 (see `.nvmrc`)

```sh
nvm use
npm install
```

## Scripts

| Command              | What it does                                            |
| -------------------- | ------------------------------------------------------- |
| `npm run dev`        | Vite dev server (open http://localhost:5173/linebreak/) |
| `npm run build`      | Typecheck and production build                          |
| `npm run preview`    | Serve the production build locally                      |
| `npm run lint`       | ESLint + Prettier check                                 |
| `npm run typecheck`  | `tsc --noEmit`                                          |
| `npm test`           | Vitest once, with v8 coverage                           |
| `npm run test:watch` | Vitest in watch mode                                    |
| `npm run size`       | Bundle size budget (`npm run build` first)              |

## License

[MIT](./LICENSE)
