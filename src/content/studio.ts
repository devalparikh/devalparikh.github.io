/**
 * Copy and assets for the photography page, which is set as "Studio Deval" -
 * its own vibe, apart from the career pages.
 */
export const studio = {
  /** The hero title, one entry per line on phones; one line on wide screens. */
  title: ["Studio", "Deval"],
  /** The bracketed label above the title. */
  label: "The ever-evolving photo journal",
} as const;

/**
 * A cut-out image for the hero's cursor trail - a person, a thing, a scene with
 * its background removed. Unlike photographs, stickers show with no frame, so
 * they need a transparent PNG or WebP.
 *
 * Drop the files in `public/img/stickers/` and list them below; the trail
 * interleaves them with the polaroids of the photographs.
 */
export interface Sticker {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const stickers: Sticker[] = [];
