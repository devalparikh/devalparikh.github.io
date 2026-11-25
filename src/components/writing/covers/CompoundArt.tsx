import { ArtSvg, type ArtProps } from "./shared";

const CX = 100;
const CY = 82;
const R = 58;

/** Point on the flywheel ring, clockwise from twelve o'clock. */
const at = (degrees: number, radius = R) => {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return { x: CX + radius * Math.cos(radians), y: CY + radius * Math.sin(radians) };
};

/**
 * Compound engineering - the flywheel. A conversation in a chat channel
 * becomes an agent's task, the finished task becomes a lesson, and the
 * lesson makes the next conversation shorter. One of the two covers with a
 * fluid swirl behind it, here for the compounding itself.
 */
export function CompoundArt({ uid }: ArtProps) {
  const arrows = [45, 135, 225, 315].map((degrees) => {
    const tip = at(degrees + 9);
    const tail = at(degrees - 9);
    return { degrees, tip, tail };
  });

  return (
    <ArtSvg>
      <defs>
        <radialGradient id={`${uid}-swirl`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" className="cover-stop-k1" stopOpacity="0.95" />
          <stop offset="70%" className="cover-stop-k1" stopOpacity="0.12" />
          <stop offset="100%" className="cover-stop-k1" stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}-fluid`} filterUnits="userSpaceOnUse" x="0" y="8" width="200" height="157">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="16" />
        </filter>
      </defs>

      {/* Fluid swirl: a spiral of bands, warped by noise */}
      <g filter={`url(#${uid}-fluid)`} opacity="0.9">
        <circle cx={CX} cy={CY} r="72" fill={`url(#${uid}-swirl)`} />
        {[0, 1, 2, 3].map((band) => (
          <path
            key={band}
            d={spiral(band * 90, 10 + band * 3)}
            className="sg"
            fill="none"
            strokeWidth={5 - band * 0.8}
            strokeLinecap="round"
            opacity={0.85}
          />
        ))}
      </g>

      {/* The ring and its direction of travel */}
      <circle cx={CX} cy={CY} r={R} className="sk1" fill="none" strokeWidth="2.6" />
      <g className="cf-arrows" style={{ transformOrigin: `${CX}px ${CY}px` }}>
        {arrows.map(({ degrees, tip }) => (
          <path
            key={degrees}
            d="M-5 -4.5 L3.5 0 L-5 4.5 Z"
            transform={`translate(${tip.x} ${tip.y}) rotate(${degrees + 9})`}
            className="k1"
          />
        ))}
      </g>

      {/* Four stations: channel, agent, finished task, memory */}
      <g className="cf-node cf-node-0" style={{ transformOrigin: `${at(0).x}px ${at(0).y}px` }}>
        <path d={`M${at(0).x - 15} ${at(0).y - 11} h30 a3 3 0 0 1 3 3 v14 a3 3 0 0 1 -3 3 h-18 l-6 6 v-6 h-6 a3 3 0 0 1 -3 -3 v-14 a3 3 0 0 1 3 -3 z`} className="k1" />
        <text x={at(0).x} y={at(0).y + 6} textAnchor="middle" className="cover-svg-type g" fontSize="15">#</text>
      </g>
      <g className="cf-node cf-node-1" style={{ transformOrigin: `${at(90).x}px ${at(90).y}px` }}>
        <rect x={at(90).x - 13} y={at(90).y - 11} width="26" height="22" rx="6" className="k2" />
        <path d={`M${at(90).x} ${at(90).y - 11} v-6`} className="sk2" strokeWidth="2.4" />
        <circle cx={at(90).x} cy={at(90).y - 18} r="2.6" className="k2" />
        <circle cx={at(90).x - 5} cy={at(90).y - 1} r="2.8" className="k1" />
        <circle cx={at(90).x + 5} cy={at(90).y - 1} r="2.8" className="k1" />
        <path d={`M${at(90).x - 4} ${at(90).y + 6} h8`} className="sk1" strokeWidth="1.8" strokeLinecap="round" />
      </g>
      <g className="cf-node cf-node-2" style={{ transformOrigin: `${at(180).x}px ${at(180).y}px` }}>
        <circle cx={at(180).x} cy={at(180).y} r="12" className="k1" />
        <path d={`M${at(180).x - 5.5} ${at(180).y} l4 4.2 l7.5 -8.6`} className="sg" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="cf-node cf-node-3" style={{ transformOrigin: `${at(270).x}px ${at(270).y}px` }}>
        {[6, 3, 0].map((offset) => (
          <rect key={offset} x={at(270).x - 11 + offset * 0.6} y={at(270).y - 12 + offset} width="22" height="16" rx="2" className={offset === 0 ? "k2" : "k1"} />
        ))}
        <path d={`M${at(270).x - 6} ${at(270).y - 6} h12 M${at(270).x - 6} ${at(270).y - 1} h8`} className="sk1" strokeWidth="1.6" />
      </g>

      {/* Centre: the curve that compounds */}
      <path d={`M${CX - 22} ${CY + 14} C${CX - 6} ${CY + 13} ${CX + 8} ${CY + 6} ${CX + 20} ${CY - 18}`} className="sk2" fill="none" strokeWidth="3.4" strokeLinecap="round" />
      <path d={`M${CX + 13} ${CY - 17} L${CX + 21} ${CY - 20} L${CX + 22} ${CY - 11}`} className="sk2" fill="none" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </ArtSvg>
  );
}

/** An Archimedean spiral arm around the centre. */
function spiral(startDegrees: number, growth: number) {
  const points: string[] = [];
  for (let step = 0; step <= 48; step++) {
    const turn = (step / 48) * 1.6 * Math.PI;
    const radius = 6 + growth * turn * 2.2;
    const angle = (startDegrees * Math.PI) / 180 + turn;
    points.push(`${(CX + radius * Math.cos(angle)).toFixed(1)} ${(CY + radius * Math.sin(angle)).toFixed(1)}`);
  }
  return `M${points.join(" L")}`;
}
