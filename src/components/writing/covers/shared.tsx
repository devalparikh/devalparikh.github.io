import type { ReactNode } from "react";

/**
 * Building blocks for the cover illustrations.
 *
 * Every cover is drawn in a 200x165 box with at most three inks, read from
 * CSS variables the cover frame sets: `--g` (the ground), `--k1` (the main
 * ink) and `--k2` (the accent). The classes below map to them - `k1` fills,
 * `sk1` strokes - so one drawing reprints in any palette.
 *
 * Motion lives in bookshelf.css under `.cover[data-playing="true"]`. The
 * resting state of each drawing is its poster, so nothing here animates by
 * default and a cover with motion off still tells its story.
 */

export interface ArtProps {
  /** Unique per rendered cover, so pattern ids never collide on a page. */
  uid: string;
}

export const ART_VIEWBOX = "0 0 200 165";

/** A rotated dot screen in one ink - the riso halftone used for shading. */
export function Halftone({ id, ink, pitch = 3.2, dot = 0.85 }: { id: string; ink: "k1" | "k2" | "g"; pitch?: number; dot?: number }) {
  return (
    <pattern id={id} width={pitch} height={pitch} patternUnits="userSpaceOnUse" patternTransform="rotate(32)">
      <circle cx={pitch / 2} cy={pitch / 2} r={dot} className={ink} />
    </pattern>
  );
}

/**
 * The second ink printed slightly off register, as riso drums drift. Purely
 * decorative: the layer multiplies over the first so overlaps darken.
 */
export function OffRegister({ children, dx = 0.9, dy = -0.6 }: { children: ReactNode; dx?: number; dy?: number }) {
  return (
    <g transform={`translate(${dx} ${dy})`} className="cover-offreg">
      {children}
    </g>
  );
}

export function ArtSvg({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <svg viewBox={ART_VIEWBOX} className="cover-svg" aria-hidden={label ? undefined : true} role={label ? "img" : undefined} aria-label={label}>
      {children}
    </svg>
  );
}
