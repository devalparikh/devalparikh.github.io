/**
 * How long a post is, as a physical book. Pure and dependency-free so the
 * node test runner can check it.
 *
 * - `thickness` is linear in words, so a post twice as long is twice as thick
 *   (about 1px per 125 words, between 8px and 48px).
 * - `scale` sizes the whole cover for "Scaled to length". It grows with the
 *   square root of length so the longest post does not dwarf the rest.
 * - `spine` is the spine width in "Shelf" view: the same thickness, widened
 *   enough to carry a vertical title.
 */
export interface BookGeometry {
  thickness: number;
  scale: number;
  spine: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function bookGeometry(words: number): BookGeometry {
  const safe = Math.max(0, words);
  const thickness = Math.round(clamp(6 + safe / 125, 8, 48));
  return {
    thickness,
    scale: Number(clamp(0.55 + Math.sqrt(safe) / 150, 0.62, 1).toFixed(3)),
    spine: Math.round(24 + thickness * 0.9),
  };
}
