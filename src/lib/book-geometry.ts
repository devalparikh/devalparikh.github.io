/**
 * How long a post is, as a physical book. Pure and dependency-free so the
 * node test runner can check it.
 *
 * `thickness` is the spine depth of a turned book: linear in words, so a post
 * twice as long is twice as thick (about 1px per 125 words, between 8px and
 * 48px).
 */
export interface BookGeometry {
  thickness: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function bookGeometry(words: number): BookGeometry {
  const safe = Math.max(0, words);
  return { thickness: Math.round(clamp(6 + safe / 125, 8, 48)) };
}
