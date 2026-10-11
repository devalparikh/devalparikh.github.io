# Claude Instructions for This Repo

Personal site for Deval Parikh - `devalparikh.me`. Next.js App Router, exported
as a static site and served from GitHub Pages.

## Stack

- Next.js 16 (App Router, Turbopack) with `output: "export"` and `trailingSlash: true`
- TypeScript, strict
- Tailwind CSS v4 - tokens declared in `src/app/globals.css`, no config file
- No UI framework and no CSS-in-JS; the interactive primitives are hand-rolled

Because the site is a static export there is no server at runtime: no route
handlers, no server actions, no `next/image` optimizer. Anything dynamic has to
run in the browser or at build time.

## Layout

```
src/
  app/           one directory per route; each page is a Server Component
  components/
    chrome/      nav bar, footer, page frame, the three icon buttons
    collection/  the shared row list, filter tabs and detail drawer
    home/        hero, social row, home-page preview lists
    photography/ gallery, photo frame, lightbox
    primitives/  Reveal, Portal, PageHeader, icons
  content/       all copy and data - see below
  lib/           theme, sound, and the gliding-indicator hook
photos/          full-resolution photo sources; never deployed
scripts/         build-photos.mjs
```

## Content lives in `src/content`

Every page reads from a typed module there. **Copy changes belong in
`src/content`, not in components.**

- `site.ts` - name, role, tagline, portrait, social links
- `nav.ts` - the nav bar's items and active-route matching
- `experience.ts`, `projects.ts`, `writing.ts` - the three collections
- `types.ts` - `Entry`, `Collection`, `Filter` and the filter helper

Experience, projects and writing all render through the same `CollectionView`,
so they share one `Entry` shape:

- `title` / `subtitle` / `badge` / `meta` - the row itself
- `summary` - the note under the row title
- `categories` - must match a `Filter.id` on the collection
- `mark` - the small square logo at the start of the row. Prefer `src` with a
  **square** asset in `public/img/logos/`; wide wordmarks are illegible at 22px,
  so those fall back to `{ monogram, color }` (Capital One does this today -
  drop in a square `capital-one.svg` and switch it over if one turns up)
- `tags`, `sections`, `highlights`, `links`, `image` - drawer content. Stack
  chips are reordered at render time by `lib/tags.ts`, so declare them in
  whatever order reads best
- `href` - where the row goes when it has no drawer content

An entry opens the drawer when it has `sections`, `highlights` or `tags`;
otherwise the row links straight to `href`. That rule lives in
`components/collection/entry-helpers.ts`.

To add a filter tab, add a `Filter` to the collection and tag entries with its
`id`. To add a page, add a route directory and an entry in `nav.ts`.

## Design system

All of it is in `src/app/globals.css`, in this order: tokens → base →
typography → reveal → nav → row list → drawer → hero → globe backdrop →
Preview window → polaroid → motion preferences.

- **Colours** - `parchment` (light) is the default, `inkember` (dark) overrides
  the same token names under `[data-theme="inkember"]`. Never write a raw hex
  outside the token blocks. Hairlines and hover washes use `--rule`,
  `--rule-soft` and `--wash`, which are the text colour at low alpha, so they
  work in both themes without a second palette.
- **Motion** - one easing curve, `--ease-out-quint`. The row hover wash appears
  instantly and fades out over 150ms; the moving parts (caret, underline,
  arrow) ease in both directions. That asymmetry is deliberate.
- **Type** - Fraunces for display (`.display`, `font-display`), DM Sans for
  body, system mono for `.kicker` and `.row-meta`. The hero name alone is set
  in `--font-grotesk`: real Helvetica where the OS has it, Inter Tight (loaded
  without preload, so Apple devices never fetch it) everywhere else.
- **Tailwind vs CSS** - use Tailwind utilities for layout and one-off styling.
  Reach for a class in `globals.css` only for multi-part interactive pieces
  where pseudo-elements and state selectors would be unreadable as utilities.

### Stack chip order

`lib/tags.ts` sorts every stack into five tiers - concept, cloud, language,
framework, service - so each entry reads the same way: what the work is, where
it runs, what it is written in, what it is built with, what it plugs into.
Within a tier the declared order is preserved.

The first four tiers are explicit sets; anything unlisted falls through to
`service`, which is the open-ended tier. When a new tag lands in the wrong
place, add it to the right set rather than reordering the entry.

### Entrances

`<Reveal index={n}>` staggers content in by 70ms per step. Above-the-fold
content animates straight from the server-rendered attribute - no JS needed.
Pass `onScroll` for anything below the fold and an IntersectionObserver
promotes it when it comes into view.

### Theme and sound

Both are external stores read through `useSyncExternalStore`, never mirrored
into component state.

- `lib/theme.ts` holds the constants and the pre-paint bootstrap script that
  `app/layout.tsx` inlines; `lib/theme-store.ts` is the store. The site follows
  the OS preference until the visitor picks a theme, after which the stored
  choice wins.
- `lib/interface-sound.ts` synthesises click tones with the Web Audio API - no
  audio files. `lib/sound-preference.ts` persists the setting. **Sounds are on
  by default.** Call `playInterfaceSound("tap")` on navigation and row clicks,
  `"toggle"` on switches.

### Overlays

The drawer and the lightbox render through `<Portal>` into `document.body`;
otherwise the sticky nav bar paints over them.

## Photography

`photos/` holds full-resolution originals - over 100MB, and deliberately
outside `public/` so they are never deployed. `npm run photos` derives web-sized
WebP into `public/img/photography/`, reads each shot's EXIF, and writes
`src/content/photos.generated.json`. Each photo also gets a ~360px
`-thumb.webp` for thumbnail-sized slots.

- Both `npm run dev` and `npm run build` run it first.
- The derived images are gitignored; the manifest is committed.
- A source file named `hero` leads the page.
- Sharp cannot read HEIC - convert to JPEG before adding.

Project screenshots in `public/img/` are converted to WebP by hand; they change
rarely enough not to warrant a pipeline.

## Drawer media

The detail drawer shows, in order of preference: the entry's own `image` (a
screenshot, GIF, or `.mp4`/`.webm`, which plays inline muted and looping), or
the linked site's Open Graph image.

Share images are captured at build time by `npm run previews`, stored under
`public/img/previews/` and recorded in `src/content/previews.generated.json`.
Both are committed, so builds do not depend on those sites being up and a
fetch failure is logged rather than fatal. Pass `--refresh` to re-fetch.

## Hero

The home hero fills the first screen less the nav bar: a masthead of
bracketed kickers (`site.mastheadLabels`), the name large in the grotesk, a
hairline, then the tagline and socials.

- **Entrance** - each letter rises out of its line's mask, 45ms apart, then the
  hairline draws in. Pure CSS from server-rendered markup, so no JS is needed.
- **Halo** - the name is rendered twice. The lower copy is a thick stroke in
  the page colour that knocks the dot field back from the letterforms; as a
  separate layer it never paints over a neighbouring letter.
- **Portrait** - an inline round plate in the first line. `Portrait.tsx`
  keeps `CirclePortrait` and `PolaroidPortrait` (which keeps the `.polaroid`
  styles alive); both are deliberately unreferenced, not dead code.
- **Scroll** - `HeroStage` publishes `--hero-progress` (0 at the top, 1 once a
  viewport has scrolled) on a `display: contents` wrapper, so only the hero and
  globe restyle. CSS uses it to drift the two lines apart and to settle the
  globe.

## Hero globe

The home page renders a rotating Earth as a halftone dot field
(`components/home/GlobeHalftone.tsx`), fixed behind the whole page at
`z-index: -1`. It starts large behind the name and, as the hero scrolls away,
shrinks to the middle of the screen and fades to a watermark (`.globe-backdrop`),
then rides behind the content. Its size is pinned to the viewport width so a
mobile URL bar collapsing never reallocates the canvas.

The spin follows the scroll: scrolling down turns it one way, up the other, a
fast scroll speeds it up, and it keeps turning in the last direction. The speed
eases through zero on a reversal rather than snapping. Tuning is `SPIN` in
`lib/halftone.ts`.

The source is `public/img/earth-sprite.webp`: 240 greyscale frames of one
rotation in a 16x15 grid, 160px each, ~366KB. It is a sprite sheet rather than
a video because the effect only ever reads luminance per dot, so a video would
cost megabytes plus decoding, autoplay handling and codec fallbacks for no gain.
It was derived on macOS from a 1920x1080 stock clip with AVFoundation
(`AVAssetImageGenerator`) and sharp, cropped to the globe and reduced; the
original clip is not in the repo. Regenerating it means updating `SPRITE` in
`lib/halftone.ts` to match.

Each frame is drawn once into a sampling canvas sized one pixel per dot, then
the dots are filled as a single `Path2D` - about 12k squares in ~4.5ms. Draws
are capped at `SPIN.maxDrawRate` and stop while the tab is hidden. Dots take the
theme's text colour, so the field flips with the theme.

Resting rotation is `SPRITE.frames / FRAMES_PER_SECOND` seconds per turn.
Slow it down by adding frames to the sheet rather than by lowering the frame
rate: below about 20fps the angular step between frames starts to read as
stutter.

Dot tuning lives in `DEFAULT_OPTIONS` in `lib/halftone.ts`: `cell` is the dot
pitch, `floor` is the luminance below which a cell stays empty, and `gamma`
lifts the very dark mid-tones of the night-side Earth so its body reads.

## Photography peek

The bottom of the home page frames a few photographs as a macOS Preview window
(`components/home/PhotoPeek.tsx`): a thumbnail sidebar picks the photo (arrow
keys work), the title bar reads its file name and EXIF, and the photo opens
`/photography`. Below 640px the sidebar becomes a filmstrip under the photo.
Thumbnails use the `-thumb.webp` derivatives; hovering one prefetches the full
file. The traffic-light colours are tokens in the `@theme` block.

## Icons and portrait

The home page portrait (`public/img/portrait.webp`), the favicon, `app/icon.png`,
`app/apple-icon.png` and everything in `public/icons/` are all crops of the same
photo, `oldportfolio/img/profile.jpg`. Regenerate them together if the photo
changes - `public/icons/` alone holds 27 sizes, and a half-updated set leaves the
old mark showing on some platforms.

The `<link rel="icon">` tags come from Next's `app/icon.png` and
`app/apple-icon.png` file conventions, so `metadata.icons` is deliberately unset.

## Commands

```
npm run dev        # photos, then dev server
npm run build      # photos, then static export to ./out
npm run lint
npm run typecheck
npm run photos     # rebuild derived images and the manifest
```

## Deployment

`.github/workflows/deploy.yml` runs lint, typecheck and build on push to `main`,
then publishes `./out` with `peaceiris/actions-gh-pages`. `public/CNAME` pins
the apex domain and `public/.nojekyll` stops Pages from dropping `_next`.

`public/about/` and `public/blog/` are meta-refresh stubs holding the old URLs
open - `/about` moved to `/experience`, `/blog` to `/writing`. A static export
cannot serve real redirects. Add a stub whenever a route is renamed.

`oldportfolio/` is a static archive of a much older version of the site. Leave
it alone.
