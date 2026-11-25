import { ArtSvg, Halftone, type ArtProps } from "./shared";

const HEADS = [
  { cx: 120, cy: 46, p: 0.72 },
  { cx: 150, cy: 30, p: 0.9 },
  { cx: 180, cy: 46, p: 0.4 },
];

/**
 * Jev and System One models - a shared trunk that reads the context once and
 * answers several questions through small heads at the same moment, beside a
 * deep LLM that has to write its answer out one token at a time.
 */
export function SystemOneArt({ uid }: ArtProps) {
  return (
    <ArtSvg>
      <defs>
        <Halftone id={`${uid}-dots`} ink="k1" pitch={2.8} dot={0.85} />
      </defs>

      {/* The big LLM: a deep stack of layers */}
      <rect x="22" y="12" width="70" height="120" rx="5" fill={`url(#${uid}-dots)`} />
      <rect x="14" y="6" width="70" height="120" rx="5" className="k2" />
      {Array.from({ length: 13 }, (_, index) => (
        <path key={index} d={`M22 ${16 + index * 8.4} H76`} className="sg" strokeWidth="1.6" />
      ))}
      <text x="49" y="124" textAnchor="middle" className="cover-svg-type g" fontSize="9">LLM</text>

      {/* ...whose answer trickles out token by token */}
      {Array.from({ length: 6 }, (_, index) => (
        <rect key={index} className={`s1-token s1-token-${index} k2`} x={14 + index * 12.5} y="138" width="9" height="9" rx="1.5" />
      ))}

      {/* The shared trunk and its heads */}
      <rect x="128" y="96" width="44" height="40" rx="3" className="k1" />
      {Array.from({ length: 3 }, (_, index) => (
        <path key={index} d={`M134 ${106 + index * 10} H166`} className="sg" strokeWidth="1.6" />
      ))}
      <rect x="112" y="140" width="76" height="8" rx="1.5" className="k1" />
      <text x="150" y="160" textAnchor="middle" className="cover-svg-type k1" fontSize="7">ONE PREFILL</text>
      <path
        d="M150 96 V74 M150 74 C150 62 120 66 120 58 M150 74 V42 M150 74 C150 62 180 66 180 58"
        className="sk1"
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {HEADS.map((head, index) => (
        <g key={index} className={`s1-head s1-head-${index}`} style={{ transformOrigin: `${head.cx}px ${head.cy}px` }}>
          <circle cx={head.cx} cy={head.cy} r="12" className="k1" />
          <circle cx={head.cx} cy={head.cy} r="7.5" className="g" />
          <path
            d={`M${head.cx} ${head.cy} L${head.cx} ${head.cy - 7.5} A7.5 7.5 0 ${head.p > 0.5 ? 1 : 0} 1 ${head.cx + 7.5 * Math.sin(head.p * 2 * Math.PI)} ${head.cy - 7.5 * Math.cos(head.p * 2 * Math.PI)} Z`}
            className="k2"
          />
        </g>
      ))}
    </ArtSvg>
  );
}
