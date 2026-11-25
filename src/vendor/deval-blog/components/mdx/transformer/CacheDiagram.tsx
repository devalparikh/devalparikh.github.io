import { cacheScene, fraction, PROMPT_TOKENS } from "./cache-model";
import styles from "../TransformerVisuals.module.css";

const CACHED_TOKENS = [...PROMPT_TOKENS, "Paris", "."];
const layerY = (index: number) => 177 + index * 77;

export function CacheDiagram({ progress }: { progress: number }) {
  const scene = cacheScene(progress);
  const { pass, passIndex, cacheCounts, selected, stopped, p } = scene;
  return <g data-cache-pass={passIndex} data-selected-token={selected ?? "pending"} data-cache-stopped={stopped}>
    <text className={styles.sectionLabel} x="30" y="30">PROMPT</text>
    <text className={styles.critical} x="140" y="30">The capital of France is</text>
    <text className={styles.sectionLabel} x="30" y="65">ANSWER</text>
    <text className={styles.critical} x="140" y="65" fill="var(--diagram-green)">{scene.output || "…"}</text>
    <text className={styles.label} x="30" y="105">{passIndex === 0 ? "PROCESS THE PROMPT" : "PROCESS THE NEWEST TOKEN"}</text>
    <text className={styles.comparison} x="420" y="105">THIS SEQUENCE&apos;S K/V AT EACH LAYER</text>
    <text className={styles.label} x="878" y="105" textAnchor="end">TOKENS CACHED</text>
    <path className={styles.lane} d="M184 130V371M184 371V399H420" />
    <g className={styles.node}>
      <rect x="30" y="117" width="310" height="38" rx="3" />
      <text className={styles.comparison} x="185" y="141" textAnchor="middle">{pass.input.join(" · ")}</text>
    </g>
    {pass.layers.map((end, layer) => {
      const start = layer === 0 ? pass.start : pass.layers[layer - 1] + .025;
      const amount = fraction(p, start, end);
      const moving = p > end && p < end + .025;
      const readAmount = fraction(p, start, start + (end - start) * .45);
      const readDistance = 106 * readAmount;
      const readX = readDistance <= 38 ? 420 - readDistance : readDistance <= 52 ? 382 : 382 - (readDistance - 52);
      const readY = readDistance <= 38 ? 47 : readDistance <= 52 ? 47 + readDistance - 38 : 61;
      const count = cacheCounts[layer];
      const y = layerY(layer);
      return <g key={layer} data-cache-layer={layer} data-cache-count={count}>
        <g className={styles.node} data-active={amount > 0}>
          <rect x="30" y={y} width="310" height="53" rx="4" />
          <text className={styles.nodeTitle} x="44" y={y + 20}>{layer === 2 ? "Final layer" : `Layer ${layer + 1}`}</text>
          <text className={styles.label} x="44" y={y + 39}>Attention + MLP</text>
          {pass.input.map((token, index) => <g key={token} data-tone={passIndex === 0 ? "blue" : "green"}>
            <rect className={styles.barTrack} x={180 + index * 28} y={y + 16} width="20" height="22" rx="1" />
            <rect className={styles.barFill} x={180 + index * 28} y={y + 38 - 22 * amount} width="20" height={22 * amount} rx="1" />
          </g>)}
        </g>
        <path className={styles.lane} d={`M340 ${y + 27}H420`} />
        <text className={styles.label} x="358" y={y + 16}>K / V</text>
        {passIndex > 0 && <g data-tone="blue">
          <path className={styles.route} d={`M420 ${y + 47}H382V${y + 61}H328l5 -4m-5 4 5 4`} opacity=".65" />
          <text className={styles.meta} x="388" y={y + 65}>read</text>
          {readAmount > 0 && readAmount < 1 && <rect className={styles.movingPacket} data-cache-read={layer} x={readX - 3.5} y={y + readY - 2.5} width="7" height="5" />}
        </g>}
        {moving && <g data-cache-packet={layer} data-tone={passIndex === 0 ? "blue" : "green"} transform={`translate(${340 + 80 * fraction(p, end, end + .025)} ${y + 27})`}>
          <rect className={styles.packet} x="-6" y="-9" width="12" height="18" rx="2" />
          <path className={styles.packetLines} d="M-3 -4h6M-3 1h6M-3 6h6" />
        </g>}
        {CACHED_TOKENS.map((token, index) => {
          const filled = index < count;
          return <g key={index} data-tone={index < 5 ? "blue" : "green"} opacity={filled ? 1 : .28} data-cached-token={filled ? token : undefined}>
            <rect className={filled ? styles.packet : styles.barTrack} x={420 + index * 62} y={y} width="54" height="53" rx="3" />
            <text className={styles.code} x={447 + index * 62} y={y + 21} textAnchor="middle">{filled ? token : "·"}</text>
            <text className={styles.label} x={447 + index * 62} y={y + 40} textAnchor="middle">{filled ? "K  V" : ""}</text>
          </g>;
        })}
        <text className={styles.critical} x="900" y={y + 33} textAnchor="middle">{count}</text>
        {layer < 2 && <g data-tone={passIndex === 0 ? "blue" : "green"}>
          <rect className={styles.movingPacket} x="180" y={y + 53 + 24 * fraction(p, end, end + .025)} width="8" height="4" opacity={p >= end && p < end + .025 ? 1 : 0} />
        </g>}
      </g>;
    })}
    <g className={styles.node}>
      <rect x="420" y="385" width="243" height="42" rx="3" />
      <text className={styles.comparison} x="541" y="411" textAnchor="middle">LM head → choose token</text>
    </g>
    <path className={styles.lane} d="M663 406H702" />
    <g className={styles.outcome} data-tone="green" data-ready={p >= pass.output}>
      <rect x="702" y="385" width="232" height="42" rx="3" />
      <text className={styles.critical} x="818" y="411" textAnchor="middle">{p >= pass.output ? pass.next === "end" ? "END → STOP" : `“${pass.next}” selected` : "Scoring…"}</text>
    </g>
    <text className={styles.comparison} x="30" y="467" fill={stopped ? "var(--diagram-green)" : "var(--diagram-ink)"}>
      {stopped ? "STOPPED · END TOKEN NEEDS NO FURTHER PASS" : p >= pass.output ? `“${pass.next}” IS SELECTED; ITS K/V ARE NOT CACHED YET` : passIndex === 0 ? "PROMPT POSITIONS PROCESSED TOGETHER" : `REUSE ${scene.past} PAST POSITIONS · PROCESS ONE NEW TOKEN`}
    </text>
  </g>;
}
