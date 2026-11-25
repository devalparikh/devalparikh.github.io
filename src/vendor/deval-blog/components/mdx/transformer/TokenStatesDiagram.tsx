import styles from "../TransformerVisuals.module.css";

export const STATE_STOPS = [0, .2, .65, 1] as const;
export const STATE_HEIGHT = 566;

const TOKENS = ["The", "capital", "of", "France", "is"] as const;
const CENTERS = [230, 340, 450, 560, 670] as const;
const ROWS = [
  { name: "Embedding", id: "embedding", y: 134, start: .04, arrive: .10, end: .16 },
  { name: "Layer 1", id: "1", y: 215, start: .17, arrive: .24, end: .31 },
  { name: "Layer 2", id: "2", y: 296, start: .33, arrive: .40, end: .47 },
  { name: "Final layer", id: "final", y: 385, start: .49, arrive: .57, end: .65 },
] as const;
const PROBABILITIES = [
  { token: "Paris", value: .84 },
  { token: "Lyon", value: .06 },
  { token: "other tokens", value: .10 },
] as const;

const fraction = (value: number, start: number, end: number) => Math.max(0, Math.min(1, (value - start) / (end - start)));

// Stable, illustrative vector coordinates: layer updates change each position's state.
function coordinate(position: number, layer: number, dimension: number) {
  return .16 + ((position * 13 + layer * 19 + dimension * 11 + position * dimension * 3) % 31) / 40;
}

function Vector({ x, y, position, layer, progress, start, end, selected = false }: {
  x: number; y: number; position: number; layer: number; progress: number; start: number; end: number; selected?: boolean;
}) {
  const amount = fraction(progress, start, end);
  return <g data-tone={selected ? "green" : "blue"} data-state-position={position} data-state-ready={amount >= 1}>
    <rect className={amount > 0 ? styles.packet : styles.barTrack} x={x - 41} y={y - 16} width="82" height="32" rx="3" opacity={amount > 0 ? 1 : .3} />
    {amount > 0 && Array.from({ length: 6 }, (_, dimension) => {
      const previous = layer > 0 ? coordinate(position, layer - 1, dimension) : 0;
      const value = previous + (coordinate(position, layer, dimension) - previous) * amount;
      const height = 22 * value;
      return <rect key={dimension} className={styles.barFill} x={x - 31 + dimension * 11} y={y + 11 - height} width="7" height={height} rx=".8" />;
    })}
  </g>;
}

function VectorPacket({ x, from, to, progress, start, end }: {
  x: number; from: number; to: number; progress: number; start: number; end: number;
}) {
  const amount = fraction(progress, start, end);
  if (amount <= 0 || amount >= 1) return null;
  const y = from + (to - from) * amount;
  return <g data-state-packet="true" data-tone="blue" transform={`translate(${x - 12} ${y - 7})`}>
    <rect className={styles.packet} width="24" height="14" rx="2" />
    <path className={styles.packetLines} d="M5 4v6M10 3v8M15 5v5M20 4v6" />
  </g>;
}

export function TokenStatesDiagram({ progress }: { progress: number }) {
  const headAmount = fraction(progress, .68, .76);
  const distributionAmount = fraction(progress, .78, .86);
  const predictionReady = progress >= .91;

  return <g data-token-states="true">
    <text className={styles.sectionLabel} x="30" y="31">ONE VECTOR AT EACH TOKEN POSITION</text>
    <text className={styles.label} x="30" y="77">Prompt tokens</text>

    {TOKENS.map((token, position) => <g key={token} className={styles.node}>
      <rect x={CENTERS[position] - 41} y="57" width="82" height="32" rx="3" />
      <text className={styles.comparison} x={CENTERS[position]} y="78" textAnchor="middle">{token}</text>
    </g>)}

    {ROWS.map((row, layer) => <g key={row.id} data-token-state-layer={row.id}>
      {layer > 0 && <g className={styles.node}>
        <rect x="173" y={row.y - 27} width="554" height="54" rx="4" />
      </g>}
      <text className={styles.comparison} x="30" y={row.y + 5}>{row.name}</text>
      {layer === 0 && <text className={styles.label} x="30" y={row.y + 23}>Starting vectors</text>}
      {TOKENS.map((token, position) => {
        const previousY = layer === 0 ? 89 : ROWS[layer - 1].y + 16;
        return <g key={token}>
          <path className={styles.lane} d={`M${CENTERS[position]} ${previousY}V${row.y - 16}`} />
          <Vector x={CENTERS[position]} y={row.y} position={position} layer={layer} progress={progress} start={row.arrive} end={row.end} selected={layer === 3 && position === 4} />
          <VectorPacket x={CENTERS[position]} from={previousY} to={row.y - 16} progress={progress} start={row.start} end={row.arrive} />
        </g>;
      })}
    </g>)}

    <text className={styles.label} x="30" y="341">⋮</text>
    <text className={styles.label} x="450" y="439" textAnchor="middle">Five positions still have five hidden vectors</text>
    <g data-tone="green">
      <path className={styles.lane} d="M711 385H775" />
      {headAmount > 0 && headAmount < 1 && <rect className={styles.movingPacket} data-state-head-packet="true" x={708 + 64 * headAmount} y="381" width="8" height="8" rx="1" />}
      <text className={styles.label} x="829" y="343" textAnchor="middle">Use the last position</text>
      <g className={styles.node} data-active={headAmount > 0}>
        <rect x="775" y="362" width="165" height="46" rx="4" />
        <text className={styles.comparison} x="857" y="388" textAnchor="middle">LM head</text>
        <rect className={styles.progressFill} x="776" y="404" width={163 * headAmount} height="3" rx="1" />
      </g>
      <path className={styles.lane} d="M857 408V432" />
      <text className={styles.label} x="940" y="427" textAnchor="end">Next-token probabilities</text>
      {PROBABILITIES.map(({ token, value }, index) => <g key={token} data-state-probability={token}>
        <text className={styles.label} x="773" y={447 + index * 19}>{token}</text>
        <rect className={styles.barTrack} x="858" y={438 + index * 19} width="58" height="10" rx="1" />
        <rect className={styles.barFill} x="858" y={438 + index * 19} width={58 * value * distributionAmount} height="10" rx="1" />
        <text className={styles.meta} x="946" y={447 + index * 19} textAnchor="end">{distributionAmount >= 1 ? `${Math.round(value * 100)}%` : ""}</text>
      </g>)}
      <path className={styles.lane} d="M857 490V513" />
      <g className={styles.outcome} data-tone="green" data-ready={predictionReady} data-first-prediction={predictionReady}>
        <rect x="775" y="513" width="165" height="33" rx="3" />
        <text className={styles.critical} x="857" y="535" textAnchor="middle">{predictionReady ? "Paris" : "…"}</text>
      </g>
    </g>
    <text className={styles.comparison} x="30" y="502">The capital of France is{predictionReady ? " Paris" : " …"}</text>
    <text className={styles.label} x="30" y="524">The prompt pass predicts the first new token</text>
  </g>;
}
