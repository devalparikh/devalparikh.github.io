import { ArtSvg, Halftone, type ArtProps } from "./shared";

const COLUMNS = [28, 76, 124, 172];
const ROWS = [8, 56];

/** One agent mid-stride. `phase` 0..3 picks the arm and leg positions. */
function Agent({ cx, top, phase }: { cx: number; top: number; phase: number }) {
  const swing = [-1, -0.35, 1, 0.35][phase % 4];
  const arm = (side: -1 | 1) => {
    const lift = side * swing;
    return `M${cx + side * 7} ${top + 15} L${cx + side * (11 + 2 * Math.abs(lift))} ${top + 24 - lift * 9}`;
  };
  const leg = (side: -1 | 1) => `M${cx + side * 3.5} ${top + 27} L${cx + side * 3.5 + side * swing * 5} ${top + 37}`;
  return (
    <g>
      <circle cx={cx} cy={top + 6} r="5.5" className="k1" />
      <rect x={cx - 7.5} y={top + 13} width="15" height="15" rx="4" className="k1" />
      <path d={`${arm(-1)} ${arm(1)} ${leg(-1)} ${leg(1)}`} className="sk1" strokeWidth="3.4" strokeLinecap="round" fill="none" />
      <circle cx={cx - 2} cy={top + 5.5} r="1.1" className="g" />
      <circle cx={cx + 2} cy={top + 5.5} r="1.1" className="g" />
    </g>
  );
}

/**
 * Multi-agent systems - a Muybridge grid of agents, each working its own
 * stride of the task, whose results merge into one answer. Each agent has two
 * poses; in motion the frames advance like a zoetrope, then the strands draw
 * in and the merged result lands.
 */
export function MultiAgentArt({ uid }: ArtProps) {
  return (
    <ArtSvg>
      <defs>
        <Halftone id={`${uid}-dots`} ink="k2" pitch={2.6} dot={0.7} />
      </defs>

      {ROWS.map((top, row) =>
        COLUMNS.map((cx, column) => {
          const phase = row * 4 + column;
          return (
            <g key={`${row}-${column}`}>
              <g className="ma-pose-a">
                <Agent cx={cx} top={top} phase={phase} />
              </g>
              <g className="ma-pose-b" opacity="0">
                <Agent cx={cx} top={top} phase={phase + 2} />
              </g>
            </g>
          );
        }),
      )}

      {/* Their work flows down and merges */}
      {COLUMNS.map((cx, index) => (
        <path
          key={cx}
          className="ma-strand sk1"
          d={`M${cx} 100 C${cx} 120 100 112 100 132`}
          fill="none"
          strokeWidth="2.2"
          strokeDasharray="60"
          pathLength={60}
          style={{ animationDelay: `${index * 90}ms` }}
        />
      ))}
      <g className="ma-result" style={{ transformOrigin: "100px 146px" }}>
        <rect x="76" y="132" width="56" height="30" rx="3" fill={`url(#${uid}-dots)`} />
        <rect x="70" y="128" width="56" height="30" rx="3" className="k2" />
        <path d="M78 137 H118 M78 143 H112 M78 149 H104" className="sg" strokeWidth="2.2" />
        <circle cx="116" cy="149" r="5" className="k1" />
        <path d="M113.6 149 l1.7 1.8 l3.2 -3.6" className="sg" fill="none" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    </ArtSvg>
  );
}
