# Review: mobile "More" menu, bookshelf preview card, thickness-only shelf, olive tree

Captured in headless Chrome from the static export (`npm run build` → `./out`).
`before-*` and `plant-before-*` are the same views on `origin/main` (b31469bc).
Phone sizes are touch-emulated at 2x; desktop is 1440x900 (1120x800 for the
narrowest width that shows the floor tree) at 1x.

## More menu

| File | Shows |
| --- | --- |
| `before-menu-390x844.png` | Before: the menu runs off the left edge |
| `menu-320x568.png`, `menu-360x740.png`, `menu-390x844.png` | Start-aligned under "More", fully on screen |
| `menu-430x932.png` | More items fit, so the trigger moves right; end-aligned again |
| `menu-844x390-landscape.png` | Landscape phone: end-aligned, height capped to the room below |
| `menu-1440x900-desktop.png` | Desktop: unchanged, right edges flush |
| `menu-home-390x844-flipped.png` | Home page, nav low on screen: opens upward instead of off the bottom |

## Bookshelf - nothing selected (no count, no hint, no view switcher)

| File | Shows |
| --- | --- |
| `before-shelf-default-top-390x844.png`, `before-shelf-default-end-390x844.png` | Before: view switcher above, "8 books. Hover or tap…" below |
| `shelf-default-{320x568,360x740,390x844,430x932,1440x900}.png` | Top of the shelf, now Thickness only |
| `shelf-default-end-*.png` | Foot of the shelf: no helper text |

## Bookshelf - first tap when the caption would be off screen

| File | Shows |
| --- | --- |
| `before-shelf-tap-390x844.png` | Before: book lifts, its detail renders below the fold |
| `shelf-card-{360x740,390x844,430x932}.png` | Bottom card with Read and Close |
| `shelf-card-390x844-dark.png` | Same, dark theme |
| `shelf-card-lifted-390x844.png` | A low book is scrolled up clear of the card |
| `shelf-compact-320x568.png` | Tiny-screen fallback: one-line bar (the card would cover >1/3) |
| `shelf-compact-844x390.png`, `shelf-compact-568x320.png` | Landscape phones: same bar |
| `bookshelf-interaction-390x844.webp` | Clip: tap → card rises, tap another → swaps, close, tap → tap again opens |

## Bookshelf - normal case, unchanged

| File | Shows |
| --- | --- |
| `shelf-inline-390x844.png` | Caption on screen: shown inline as before, no card |
| `shelf-inline-1440x900-desktop.png` | Desktop hover with the caption on screen: inline as before |
| `before-shelf-inline-1440x900-desktop.png` | The same on main, for comparison |
| `shelf-hover-card-1440x900-desktop.png` | Desktop hover with the caption off screen: passive card |
| `shelf-hover-card-top-1440x900-desktop.png` | Hovered book under the card band: the card docks at the top |

## Olive tree (desktop only - hidden below 1120px)

| File | Shows |
| --- | --- |
| `plant-before-1440x900.png` → `plant-after-1440x900.png` | Light |
| `plant-before-1440x900-dark.png` → `plant-after-1440x900-dark.png` | Dark |
| `plant-before-1120x800.png` → `plant-after-1120x800.png` (and `-dark`) | Narrowest width with the tree |
| `plant-after-room-1440x900.png` | Whole room for context |
| `plant-phone-390x844.png` | Phone: no floor tree; the shelf vase is untouched |
