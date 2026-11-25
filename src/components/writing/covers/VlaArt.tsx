import type { CSSProperties } from "react";
import { ArtSvg, Halftone, type ArtProps } from "./shared";

/** Joint angles (degrees) for reach -> lift -> place. The cup counter-rotates to stay upright. */
const POSES = [
  { shoulder: -20, elbow: -110 },
  { shoulder: 10, elbow: -60 },
  { shoulder: 15, elbow: 110 },
];
const CYCLE_MS = 4200;

const FRAMES = [
  { x: 6, label: "VAT" },
  { x: 70, label: "VLA" },
  { x: 134, label: "WAM" },
];

const joint = (degrees: number, phase: number): CSSProperties => ({
  transform: `rotate(${degrees}deg)`,
  // Each arm starts the shared loop at its own pose, so the motion travels
  // across the strip like successive Muybridge frames.
  animationDelay: `${-(CYCLE_MS / 3) * phase}ms`,
});

function Arm({ phase, ghost = false }: { phase: number; ghost?: boolean }) {
  const pose = POSES[phase % 3];
  const stroke = ghost ? "sk2" : "sk1";
  const dash = ghost ? "2.5 2.5" : undefined;
  return (
    <g className={ghost ? "vla-arm vla-ghost" : "vla-arm"}>
      <g className="vla-shoulder" style={joint(pose.shoulder, phase)}>
        <path d="M0 0 V-26" className={stroke} strokeWidth={ghost ? 1.6 : 5} strokeLinecap="round" strokeDasharray={dash} />
        <g transform="translate(0 -26)">
          <g className="vla-elbow" style={joint(pose.elbow, phase)}>
            <path d="M0 0 V-20" className={stroke} strokeWidth={ghost ? 1.6 : 4.2} strokeLinecap="round" strokeDasharray={dash} />
            <g transform="translate(0 -20)">
              <g className="vla-cup" style={joint(-(pose.shoulder + pose.elbow), phase)}>
                <path d="M-6 0 H6 M-6 0 V6 M6 0 V6" className={stroke} fill="none" strokeWidth={ghost ? 1.4 : 2.2} strokeLinecap="round" strokeDasharray={dash} />
                {!ghost && <rect x="-4.5" y="2.5" width="9" height="9" rx="1.2" className="k2" />}
              </g>
            </g>
          </g>
          {!ghost && <circle r="3.4" className="g sk1" strokeWidth="1.8" />}
        </g>
      </g>
    </g>
  );
}

/**
 * Vision-action transformers vs. VLA vs. world-action models - one
 * pick-and-place carried across three robot arms, one per model family. The
 * VLA arm takes an instruction (the speech bubble); the world-action arm also
 * predicts where the scene goes next (its dashed ghost).
 */
export function VlaArt({ uid }: ArtProps) {
  return (
    <ArtSvg>
      <defs>
        <Halftone id={`${uid}-dots`} ink="k2" pitch={2.4} dot={0.7} />
        {FRAMES.map((frame, phase) => (
          <clipPath key={frame.label} id={`${uid}-frame-${phase}`}>
            <rect x={frame.x} y="15" width="60" height="102" />
          </clipPath>
        ))}
      </defs>

      <rect x="0" y="4" width="200" height="124" rx="2" className="k1" />
      {Array.from({ length: 17 }, (_, index) => (
        <g key={index}>
          <rect x={3 + index * 11.7} y="7" width="6" height="4.5" rx="1" className="g" />
          <rect x={3 + index * 11.7} y="120.5" width="6" height="4.5" rx="1" className="g" />
        </g>
      ))}

      {FRAMES.map((frame, phase) => (
        <g key={frame.label}>
          <rect x={frame.x} y="15" width="60" height="102" className="g" />
          <rect x={frame.x + 4} y="100" width="52" height="10" fill={`url(#${uid}-dots)`} />
          <path d={`M${frame.x + 2} 98 H${frame.x + 58}`} className="sk1" strokeWidth="2" />
          <rect x={frame.x + 23} y="90" width="14" height="8" rx="1.5" className="k1" />
          <g clipPath={`url(#${uid}-frame-${phase})`}>
            <g transform={`translate(${frame.x + 30} 90) scale(1.3)`}>
              {phase === 2 && <Arm phase={0} ghost />}
              <Arm phase={phase} />
            </g>
          </g>
          {phase === 1 && (
            <g>
              <path d={`M${frame.x + 6} 21 h22 a3 3 0 0 1 3 3 v9 a3 3 0 0 1 -3 3 h-14 l-5 5 v-5 h-3 a3 3 0 0 1 -3 -3 v-9 a3 3 0 0 1 3 -3 z`} className="k2" />
              {[0, 1, 2].map((dot) => (
                <circle key={dot} cx={frame.x + 11 + dot * 6} cy="28.5" r="1.6" className="g" />
              ))}
            </g>
          )}
          <text x={frame.x + 30} y="148" textAnchor="middle" className="cover-svg-type k1" fontSize="14">{frame.label}</text>
        </g>
      ))}
    </ArtSvg>
  );
}
