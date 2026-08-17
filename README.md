# devalparikh.me

Personal site - experience, projects, writing and photography.

Next.js 16 App Router, TypeScript and Tailwind v4, exported as a static site and
served from GitHub Pages at [devalparikh.me](https://devalparikh.me).

## Develop

```bash
npm install
npm run dev
```

`npm run dev` derives the photography images first, so the first run takes a
moment.

## Build

```bash
npm run build   # static export to ./out
```

Pushing to `main` runs lint, typecheck and build, then deploys `./out`.

## Where things live

- `src/content` - all copy and data. Edit here, not in components.
- `src/app/globals.css` - the whole design system: colour tokens, typography,
  and the row, nav and drawer primitives.
- `photos/` - full-resolution photo originals. Never deployed; `npm run photos`
  derives the web-sized versions into `public/img/photography/`.

See [CLAUDE.md](CLAUDE.md) for the full conventions.
