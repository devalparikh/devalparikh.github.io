# Writing

`/writing` is the canonical home of the posts imported from
[deval-blog](https://github.com/devalparikh/deval-blog). Each one is served at
`https://devalparikh.me/writing/<slug>/` with a single self-referencing
`rel=canonical` and a matching `og:url`; deval-blog points its copies here.
There are no redirects - the article is the page.

Pieces published elsewhere (Rolodex, Towards Data Science) stay outbound links
in the small "Published elsewhere" group under the shelf.

## The snapshot

The posts are a pinned snapshot of one deval-blog commit:

| Path | What |
| --- | --- |
| `src/content/blog/snapshot.json` | commit SHA, post list, components, vendored modules, assets |
| `src/content/blog/<slug>.mdx` | the posts' MDX (filename = slug = URL) |
| `src/vendor/deval-blog/` | the MDX components the posts use, and everything they import, mirroring deval-blog's `src/` |
| `public/img/writing/` | images and GIFs the posts and components reference |
| `src/components/writing/blog-overrides/` | local replacements for upstream modules (hand-written) |

Everything except the overrides is generated: **edit posts in deval-blog and
re-sync**, never in place. The import is mechanical (see
`scripts/lib/blog-import.mjs`):

- `@/x` imports in vendored code become `@blog/x` (a tsconfig path).
- Only the components the posts actually render are copied, found from the
  MDX and deval-blog's `components/mdx/index.ts`; a trimmed index is generated.
- Links to imported posts become `/writing/<slug>/`, keeping `#fragments`.
  Any other root-relative link (other posts, `/notes`) points at the live blog,
  `https://deval-blog.vercel.app`.
- `/blog/<dir>/<file>` and `/images/<dir>/<file>` assets move to
  `/img/writing/<dir>/<file>`. Visible frontmatter covers are re-encoded to
  WebP; hidden ones (`hideCoverImage: true`) are not copied.
- `canonicalUrl` frontmatter is dropped and never read.
- `useLiveDemo` (the Jev demos' call to `/api/jev-demo`) is replaced by a
  static version that keeps the hand-authored samples and links "Try live
  inference" to the same demo on the live blog.

The vendored modules may import only `react`, `react-dom` and `next`; a sync
that needs another package fails and says which.

### Refreshing it

On a machine that can read deval-blog with git and has `gh` signed in:

```bash
npm run sync:blog                         # latest deval-blog main, opens a PR
npm run sync:blog -- --ref <sha>          # a specific commit
npm run sync:blog -- --source ../deval-blog
npm run sync:blog -- --add tech/<slug>    # import another post (also add it to the shelf)
npm run sync:blog -- --no-pr              # just update the working tree
```

With a PR it branches `blog-sync/<sha>` from `origin/main`, imports, runs
`test:writing`, typecheck and lint, commits, pushes and opens the PR with the
upstream compare link. CI never runs the sync and holds no deval-blog token;
GitHub Pages builds only from this repository.

## The shelf

Shelf books are declared in `src/content/writing.ts`: slug, filter categories
and the cover design (headline lines, italic subtitle, ground and inks from
the 12-colour palette, headline position, corner label). Titles, summaries
and dates come from the MDX frontmatter; word counts are computed at build
time by `src/lib/word-count.ts` (prose only - no code, JSX or link targets).

The shelf is a furnished room, drawn entirely in CSS and SVG: a built-in
bookcase (crown, side panels, board-and-groove back, plinth) on a limewashed
wall, oak planks with puck lights pooling under each shelf, an oak floor and
rug, and styled objects between the books (`ShelfDecor.tsx`: a vase of
eucalyptus, a linen stack, a bonsai, a leaning print; an olive tree
and a floor lamp beside the case on wide screens). Day is white oak in window
light; inkember is walnut at lamp-light. Every surface reads the `--room-*`,
`--case-*` and `--decor-*` tokens in `globals.css`; wood, plaster and grain
are cached noise tiles, so nothing is filtered per frame. Phones keep two
objects so the case stays scannable.

Inside the case is real 3D (`ShelfStage.tsx`). The case front is the
screen plane and the case is `--depth` deep. One perspective, set on the case
(eye level with the middle shelf), projects the back panel, both side walls,
the ceiling, every shelf (top, lip and underside, the LED strip in its
underside) and every book and object. Each of those stands at its own depth
(`--z`) on the shelf. So contact, occlusion and parallax come from geometry:
upper shelves show their undersides and lower ones their tops, a high shelf's
lip hides the feet of what stands behind it, and turned books meet the shelf
where it really is. Contact shadows are footprints lying on the shelf, soft
in their own gradient because the shelf is seen nearly edge-on, and each
object leaves a soft shadow on the back panel, offset away from the floor
lamp. Face-out books and the print lean back against the panel. Rows are
measured after layout; until then (and without JS) the flat planks stand in,
on the same standing line. Phones use a flatter, shallower case with thinner
shelves.

Views: Same size, Scaled to length (sqrt of words), **Thickness** (default;
spine depth linear in words) and Shelf (spines). The choice is remembered per
browser. Geometry is in `src/lib/book-geometry.ts`.

Hovering a cover with a mouse (or keyboard focus) lifts it and, after 320ms,
plays its motif as a muted CSS loop; on touch the first tap previews and
shows the caption, the second opens the post. Motion never runs under
`prefers-reduced-motion`, `prefers-reduced-data` or Save-Data - the still
drawing is always the poster.

### Covers

One hand-drawn SVG per post in `src/components/writing/covers/`, drawn in a
200x165 box with the classes `k1`/`k2`/`g` (and `sk1`/`sk2`/`sg` for strokes)
so a drawing reprints in any palette. Motion is CSS in
`components/writing/bookshelf.css`, keyed off `[data-playing="true"]`.
Grain is one cached noise tile; halftone is an SVG dot pattern. The cover
palette is `--cover-*` in `globals.css`; `test:writing` checks every cover's
small print reaches 4.5:1 and its headline 3:1.

## PR previews

`.github/workflows/preview.yml` builds every PR against `main`, runs the same
checks as the deploy, verifies the exported writing pages, strips `CNAME`,
adds `noindex`, and uploads the site as the `site-preview` artifact. It has
`contents: read` only and never touches `gh-pages` or the Pages deploy.

Preview builds use the checked-in notes snapshot. Download the artifact and serve it locally.

## Verify

```bash
npm run test:writing
npm run lint
npm run typecheck
npm run build
npm run test:writing:build   # after build: URLs, canonicals, og:url, links
```
