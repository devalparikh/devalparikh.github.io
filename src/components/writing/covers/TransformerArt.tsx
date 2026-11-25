import { ArtSvg, Halftone, type ArtProps } from "./shared";

const COLUMNS = 8;
const PREFILL = 5;
const X0 = 22;
const STEP = 21;
const cellX = (index: number) => X0 + index * STEP;

/**
 * Transformer basics - the KV cache. Prompt tokens are read in one prefill
 * pass and fill the cache at once (paper); every decoded token appends one
 * more key and value column (saffron), layer by layer behind it.
 */
export function TransformerArt({ uid }: ArtProps) {
  const layers = [
    { dx: 14, dy: -30, style: "dots" as const },
    { dx: 7, dy: -15, style: "line" as const },
    { dx: 0, dy: 0, style: "solid" as const },
  ];

  return (
    <ArtSvg>
      <defs>
        <Halftone id={`${uid}-dots`} ink="k1" pitch={2.6} dot={0.75} />
      </defs>

      {/* Tokens */}
      {Array.from({ length: COLUMNS }, (_, index) => {
        const decoded = index >= PREFILL;
        return (
          <rect
            key={index}
            className={decoded ? `tf-token tf-step-${index - PREFILL} k2` : "k1"}
            x={cellX(index)}
            y="10"
            width="15"
            height="15"
            rx="7.5"
          />
        );
      })}
      <path d={`M${cellX(0)} 34 H${cellX(PREFILL - 1) + 15}`} className="sk1" strokeWidth="1.4" />
      <path d={`M${cellX(PREFILL)} 34 H${cellX(COLUMNS - 1) + 15}`} className="sk2" strokeWidth="1.4" strokeDasharray="2 2" />
      <text x={cellX(0)} y="45" className="cover-svg-type k1" fontSize="7.5">PREFILL</text>
      <text x={cellX(PREFILL)} y="45" className="cover-svg-type k2" fontSize="7.5">DECODE →</text>

      {/* Three layers of the cache, back to front */}
      {layers.map((layer, depth) => (
        <g key={depth} transform={`translate(${layer.dx} ${layer.dy})`}>
          {["K", "V"].map((row, rowIndex) => {
            const y = 112 + rowIndex * 19;
            return (
              <g key={row}>
                {depth === 2 && (
                  <text x="6" y={y + 11.5} className="cover-svg-type k1" fontSize="12">{row}</text>
                )}
                {Array.from({ length: COLUMNS }, (_, index) => {
                  const decoded = index >= PREFILL;
                  const x = cellX(index);
                  if (layer.style === "dots") {
                    return <rect key={index} x={x} y={y} width="16" height="15" fill={`url(#${uid}-dots)`} />;
                  }
                  if (layer.style === "line") {
                    return <rect key={index} x={x} y={y} width="16" height="15" className={decoded ? "sk2" : "sk1"} fill="none" strokeWidth="1" />;
                  }
                  return (
                    <rect
                      key={index}
                      className={decoded ? `tf-cell tf-step-${index - PREFILL} k2` : "k1"}
                      x={x}
                      y={y}
                      width="16"
                      height="15"
                    />
                  );
                })}
              </g>
            );
          })}
        </g>
      ))}

      {/* Attention reads every cached key for the newest token */}
      <rect className="tf-scan sk2" x={cellX(0) - 2} y="110" width="20" height="38" fill="none" strokeWidth="1.6" />
    </ArtSvg>
  );
}
