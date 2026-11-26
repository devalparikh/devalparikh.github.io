/**
 * Where the bookshelf shows the detail of the book being looked at. Pure and
 * DOM-free so the node test runner can check it; rects are viewport pixels.
 *
 * - `inline` - the caption under the shelf, as it has always been, whenever
 *   that caption is fully on screen.
 * - `card` - otherwise, a small card that rises from the bottom edge.
 * - `compact` - a one-line bar instead of the card when the card would take
 *   too much of a short screen: more than MAX_CARD_SHARE of its height, or
 *   so much that the book itself (the second-tap target) no longer fits in
 *   the space left above it. Landscape phones are the usual case.
 *
 * A card or bar that would sit on top of the book is resolved per input:
 * a tapped or focused book is scrolled up clear of it, since that book is
 * what the next tap or Enter acts on; a hovered book is never scrolled under
 * the pointer, so its card docks at the top instead when there is room.
 */

export type PreviewMode = "inline" | "card" | "compact";
export type PreviewSource = "hover" | "focus" | "tap";

export interface Box {
  top: number;
  bottom: number;
}

export interface PreviewLayoutInput {
  /** The visible part of the layout viewport: visualViewport offset and height. */
  viewport: { top: number; height: number };
  /** Bottom edge of the sticky chrome over the top of the page. */
  obstructedTop: number;
  /** The caption under the shelf. */
  caption: Box | null;
  /** The book being previewed. */
  book: Box;
  /** Rendered heights of the two overlay variants. */
  cardHeight: number;
  compactHeight: number;
  /** Clearance kept between an overlay and the viewport edge (safe area included), and above it. */
  margin: number;
  source: PreviewSource;
}

export interface PreviewLayout {
  mode: PreviewMode;
  dock: "bottom" | "top";
  /** How far to scroll the page so the book clears the overlay. */
  scrollBy: number;
}

/** The card may cover at most this share of the viewport's height. */
export const MAX_CARD_SHARE = 0.34;

export const INLINE_LAYOUT: PreviewLayout = { mode: "inline", dock: "bottom", scrollBy: 0 };

export function choosePreviewLayout(input: PreviewLayoutInput): PreviewLayout {
  const { viewport, caption, book, margin, source } = input;
  const top = Math.max(viewport.top, input.obstructedTop);
  const bottom = viewport.top + viewport.height;

  if (caption && caption.top >= top - 1 && caption.bottom <= bottom + 1) return INLINE_LAYOUT;

  const bookHeight = book.bottom - book.top;
  const cardBand = input.cardHeight + margin * 2;
  const cardFits = cardBand <= viewport.height * MAX_CARD_SHARE && bottom - top - cardBand >= bookHeight;
  const mode: PreviewMode = cardFits ? "card" : "compact";

  const band = (mode === "card" ? input.cardHeight : input.compactHeight) + margin * 2;
  const coverLine = bottom - band;
  if (book.bottom <= coverLine) return { mode, dock: "bottom", scrollBy: 0 };

  if (source === "hover") {
    return { mode, dock: book.top - top >= band ? "top" : "bottom", scrollBy: 0 };
  }

  // Lift the book clear of the overlay, but never up under the sticky chrome.
  const scrollBy = Math.max(0, Math.min(book.bottom - coverLine, book.top - top - margin));
  return { mode, dock: "bottom", scrollBy: Math.ceil(scrollBy) };
}

export function sameLayout(a: PreviewLayout, b: PreviewLayout) {
  return a.mode === b.mode && a.dock === b.dock;
}
