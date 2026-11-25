import { ArtSvg, Halftone, type ArtProps } from "./shared";

const FRAMES = [
  { x: 10, checked: 2, crash: false },
  { x: 72, checked: 2, crash: true },
  { x: 134, checked: 3, crash: false },
];
const FRAME_W = 56;
const TOP = 16;
const FRAME_H = 78;

/**
 * Durable vs atomic execution, as three frames of film. A workflow's
 * checklist is two steps in when the process crashes; the next frame resumes
 * with those two steps still done. Below, the atomic half: one stamp that
 * commits everything at once or nothing.
 */
export function DurableArt({ uid }: ArtProps) {
  return (
    <ArtSvg>
      <defs>
        <Halftone id={`${uid}-dots`} ink="k1" pitch={2.4} dot={0.7} />
      </defs>

      {/* The strip and its sprocket holes */}
      <rect x="2" y="2" width="196" height="106" rx="2" className="k2" />
      {Array.from({ length: 16 }, (_, index) => (
        <g key={index}>
          <rect x={7 + index * 12} y="6" width="6" height="5" rx="1" className="g" />
          <rect x={7 + index * 12} y="99" width="6" height="5" rx="1" className="g" />
        </g>
      ))}

      {FRAMES.map((frame, index) => (
        <g key={frame.x} className={`dx-frame dx-frame-${index}`} style={{ transformOrigin: `${frame.x + FRAME_W / 2}px ${TOP + FRAME_H / 2}px` }}>
          <rect x={frame.x} y={TOP} width={FRAME_W} height={FRAME_H} className="g" />
          {[0, 1, 2, 3].map((row) => {
            const y = TOP + 12 + row * 16;
            const done = row < frame.checked;
            const fresh = index === 2 && row === 2;
            return (
              <g key={row}>
                <rect x={frame.x + 7} y={y - 5} width="10" height="10" rx="1.5" className="sk1" fill="none" strokeWidth="1.6" />
                {done && (
                  <path
                    d={`M${frame.x + 9} ${y} l2.6 2.8 l5.2 -6.4`}
                    className={`sk1 ${fresh ? "dx-fresh" : ""}`}
                    fill="none"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={20}
                    strokeDasharray={fresh ? 20 : undefined}
                  />
                )}
                <rect x={frame.x + 21} y={y - 1.6} width={[26, 20, 24, 16][row]} height="3.2" className={done ? "k1" : "k2"} opacity={done ? 1 : 0.4} />
              </g>
            );
          })}
          {frame.crash && (
            <g className="dx-crash">
              <rect x={frame.x} y={TOP} width={FRAME_W} height={FRAME_H} fill={`url(#${uid}-dots)`} opacity="0.55" />
              <path
                d={`M${frame.x + 34} ${TOP + 4} L${frame.x + 22} ${TOP + 38} L${frame.x + 33} ${TOP + 40} L${frame.x + 19} ${TOP + 74} L${frame.x + 44} ${TOP + 32} L${frame.x + 33} ${TOP + 30} Z`}
                className="k2 sg"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </g>
          )}
        </g>
      ))}

      {/* The atomic commit: everything at once, or nothing */}
      <g className="dx-stamp" style={{ transformOrigin: "136px 136px" }}>
        <g transform="rotate(-12 136 136)">
          <circle cx="136" cy="136" r="26" fill={`url(#${uid}-dots)`} />
          <circle cx="136" cy="136" r="26" className="sk1" fill="none" strokeWidth="3" />
          <circle cx="136" cy="136" r="21" className="sk1" fill="none" strokeWidth="1.2" />
          <rect x="106" y="128" width="60" height="16" className="k1" />
          <text x="136" y="140.5" textAnchor="middle" className="cover-svg-type g" fontSize="11.5">COMMIT</text>
        </g>
      </g>
      <g className="k2">
        {[0, 1, 2, 3].map((index) => (
          <rect key={index} x={18 + index * 17} y="128" width="13" height="13" rx="2" className={index < 3 ? "k2" : "k1"} />
        ))}
      </g>
      <path d="M86 134.5 H100" className="sk2" strokeWidth="2" />
      <path d="M97 130.5 L102 134.5 L97 138.5" className="sk2" fill="none" strokeWidth="2" strokeLinejoin="round" />
    </ArtSvg>
  );
}
