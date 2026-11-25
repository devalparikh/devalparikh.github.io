import { ArtSvg, Halftone, type ArtProps } from "./shared";

const ROWS = [
  { y: 84, label: 58, p: 0.32 },
  { y: 100, label: 70, p: 0.94 },
  { y: 116, label: 50, p: 0.18 },
];

/**
 * Building with Jev - a browser page whose options a decision model scores.
 * The chip is the answer; the bars are the probabilities behind it. In
 * motion the highlight scans the options and the chip lands on the winner.
 */
export function JevArt({ uid }: ArtProps) {
  return (
    <ArtSvg>
      <defs>
        <Halftone id={`${uid}-dots`} ink="k2" pitch={3} dot={0.95} />
      </defs>

      {/* Riso shadow, then the window */}
      <rect x="34" y="22" width="146" height="118" rx="4" fill={`url(#${uid}-dots)`} />
      <rect x="22" y="12" width="146" height="118" rx="4" className="k1" />
      <path d="M22 27 H168" className="sg" strokeWidth="1.4" />
      {[31, 38, 45].map((cx) => (
        <circle key={cx} cx={cx} cy="19.5" r="2" className="g" />
      ))}
      <rect x="56" y="16" width="100" height="7" rx="3.5" className="sg" fill="none" strokeWidth="1" />

      {/* Page copy */}
      <rect x="32" y="36" width="74" height="8" className="g" />
      {[52, 59, 66].map((y, index) => (
        <rect key={y} x="32" y={y} width={[118, 104, 112][index]} height="3" className="g" opacity="0.32" />
      ))}

      {/* The highlight that the decision settles on */}
      <rect className="jev-highlight k2" x="27" y="94" width="136" height="13" rx="2" />

      {ROWS.map((row, index) => (
        <g key={row.y} className={`jev-row jev-row-${index}`}>
          <rect x="32" y={row.y - 1.5} width="7" height="7" rx="1" className="sg" fill="none" strokeWidth="1.3" />
          <rect x="45" y={row.y} width={row.label} height="4" className="g" opacity="0.55" />
          <rect x="120" y={row.y} width="38" height="4" className="g" opacity="0.16" />
          <rect
            className="jev-bar g"
            x="120"
            y={row.y}
            width={38 * row.p}
            height="4"
            style={{ transformOrigin: `120px ${row.y}px` }}
          />
        </g>
      ))}
      <path d="M33.5 101.5 l2 2.2 l4 -5" className="sg" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Decision chip */}
      <g className="jev-chip" style={{ transformOrigin: "150px 76px" }}>
        <rect x="120" y="64" width="64" height="24" rx="12" className="k2 sg" strokeWidth="1.6" />
        <path d="M131 76.5 l3.6 3.8 l7 -8.4" className="sg" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <text x="147" y="81" className="cover-svg-type g" fontSize="13">0.94</text>
      </g>

      {/* Pointer */}
      <path
        className="jev-pointer k1 sg"
        d="M112 104 l0 17 l4.6 -4.2 l3.4 7.4 l3.2 -1.5 l-3.4 -7.2 l6.2 -0.4 z"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </ArtSvg>
  );
}
