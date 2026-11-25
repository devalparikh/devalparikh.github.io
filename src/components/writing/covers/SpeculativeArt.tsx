import { ArtSvg, Halftone, type ArtProps } from "./shared";

const TILE_Y = 124;
const TILES = [
  { x: 12, verdict: "accept" },
  { x: 48, verdict: "accept" },
  { x: 84, verdict: "accept" },
  { x: 120, verdict: "reject" },
  { x: 156, verdict: "discard" },
] as const;

/**
 * Speculative decoding - a small, quick drafter guesses five tokens ahead; a
 * big checker reads them all in one pass, keeps the good prefix, rejects the
 * first wrong guess and writes its own token in its place. The guesses after
 * the rejection are thrown away.
 */
export function SpeculativeArt({ uid }: ArtProps) {
  return (
    <ArtSvg>
      <defs>
        <Halftone id={`${uid}-dots`} ink="k1" pitch={2.6} dot={0.8} />
      </defs>

      {/* The checker: big, slow, exact */}
      <rect x="112" y="10" width="76" height="72" rx="12" fill={`url(#${uid}-dots)`} />
      <rect x="104" y="4" width="76" height="72" rx="12" className="k2" />
      <rect x="114" y="22" width="56" height="20" rx="10" className="g" />
      <circle className="sd-eye k1" cx="142" cy="32" r="6.5" style={{ transformOrigin: "142px 32px" }} />
      <path d="M118 56 H166 M118 64 H154" className="sg" strokeWidth="2.6" strokeLinecap="round" opacity="0.5" />

      {/* The drafter: small and quick */}
      <g className="sd-drafter" style={{ transformOrigin: "34px 96px" }}>
        <rect x="18" y="64" width="32" height="30" rx="7" className="k1" />
        <circle cx="34" cy="76" r="5" className="g" />
        <circle cx="35.5" cy="76" r="2" className="k1" />
        <path d="M34 64 v-7" className="sk1" strokeWidth="2.2" />
        <circle cx="34" cy="55" r="2.6" className="k1" />
      </g>

      {/* One verification pass reads every drafted token together */}
      <path className="sd-beam k2" d="M134 76 L12 118 L186 118 L150 76 Z" opacity="0.18" />

      {TILES.map((tile, index) => (
        <g key={tile.x} className={`sd-tile sd-tile-${index}`} style={{ transformOrigin: `${tile.x + 15}px ${TILE_Y + 12}px` }}>
          {tile.verdict === "accept" && (
            <>
              <rect x={tile.x} y={TILE_Y} width="30" height="24" rx="4" className="k1" />
              <path d={`M${tile.x + 8} ${TILE_Y + 12} l4.5 4.8 l9.5 -10`} className="sg" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}
          {tile.verdict === "reject" && (
            <>
              <rect x={tile.x} y={TILE_Y} width="30" height="24" rx="4" className="sk1" fill="none" strokeWidth="2" />
              <path d={`M${tile.x + 9} ${TILE_Y + 6} l12 12 M${tile.x + 21} ${TILE_Y + 6} l-12 12`} className="sk1" strokeWidth="2.6" strokeLinecap="round" />
            </>
          )}
          {tile.verdict === "discard" && (
            <rect x={tile.x} y={TILE_Y} width="30" height="24" rx="4" className="sk1" fill="none" strokeWidth="1.6" strokeDasharray="3 3" opacity="0.6" />
          )}
        </g>
      ))}

      {/* The checker's own token replaces the first wrong guess */}
      <g className="sd-fix">
        <rect x="120" y="94" width="30" height="24" rx="4" className="k2 sg" strokeWidth="1.6" />
        <path d="M135 99 v14 M129 107 l6 6 l6 -6" className="sg" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </ArtSvg>
  );
}
