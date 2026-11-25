import styles from "../JevVisuals.module.css";

export const CALIBRATION_STOPS = [0, .2, .58, 1] as const;
// Invented statements and outcomes for teaching, never an evaluation of Jev.
export const CALIBRATION_OUTCOMES = [true, true, false, true, true, true, true, false, true, true, true, false, true, true, true, true, true, false, true, true] as const;
export const OBSERVED_RATE = CALIBRATION_OUTCOMES.filter(Boolean).length / CALIBRATION_OUTCOMES.length;
const fraction = (value: number, start: number, duration: number) => Math.max(0, Math.min(1, (value - start) / duration));

export function JevCalibrationDiagram({ progress, forecast }: { progress: number; forecast: .8 | .95 }) {
  const checked = Math.floor(fraction(progress, .26, .31) * CALIBRATION_OUTCOMES.length);
  const foundTrue = CALIBRATION_OUTCOMES.slice(0, checked).filter(Boolean).length;
  const complete = progress >= .66;
  const gap = Math.round((forecast - OBSERVED_RATE) * 100);
  const tone = gap === 0 ? "green" : "amber";
  return (
    <g transform="translate(0 -130)">
      <text className={styles.sectionLabel} x="30" y="160">CALIBRATION</text>
      <text className={styles.label} x="30" y="182">20 statements, each assigned P(true) = {forecast.toFixed(2)}</text>
      {CALIBRATION_OUTCOMES.map((outcome, index) => {
        const revealed = index < checked;
        const x = 30 + (index % 10) * 40;
        const y = 204 + Math.floor(index / 10) * 52;
        return (
          <g key={index} data-tone={revealed ? outcome ? "green" : "amber" : "blue"} data-outcome={revealed ? String(outcome) : "unknown"}>
            <rect className={styles.packet} x={x} y={y} width="30" height="39" rx="3" />
            {revealed ? <path className={styles.packetLines} strokeWidth="2" d={outcome ? `M${x + 8} ${y + 20}l5 5 10-12` : `M${x + 9} ${y + 14}l12 12m0-12-12 12`} /> : <path className={styles.packetLines} d={`M${x + 8} ${y + 12}h14m-14 7h14m-14 7h9`} />}
          </g>
        );
      })}
      <text className={styles.comparison} x="30" y="325" data-checked={checked}>{checked === 20 ? "16 TRUE · 4 FALSE" : `${checked} OF 20 CHECKED`}</text>
      <text className={styles.label} x="30" y="348">{checked === 20 ? "Observed rate: 16 / 20 = 80%" : `${foundTrue} true outcomes found so far`}</text>

      <text className={styles.label} x="505" y="182">SHARE OF STATEMENTS THAT ARE TRUE</text>
      <text className={styles.nodeTitle} x="505" y="212">FORECAST</text>
      <text className={styles.critical} x="945" y="212" textAnchor="end">{Math.round(forecast * 100)}%</text>
      <rect className={styles.barTrack} x="505" y="227" width="440" height="21" rx="2" />
      <g data-tone="blue"><rect className={styles.barFill} x="505" y="227" width={440 * forecast * fraction(progress, .05, .13)} height="21" rx="2" /></g>
      <text className={styles.nodeTitle} x="505" y="283">OBSERVED</text>
      <text className={styles.critical} x="945" y="283" textAnchor="end">{complete ? "80%" : "…"}</text>
      <rect className={styles.barTrack} x="505" y="298" width="440" height="21" rx="2" />
      <g data-tone="green"><rect className={styles.barFill} x="505" y="298" width={440 * OBSERVED_RATE * fraction(progress, .59, .07)} height="21" rx="2" /></g>
      {[0, 50, 100].map(value => <text key={value} className={styles.meta} x={505 + 440 * value / 100} y="339" textAnchor={value === 0 ? "start" : value === 100 ? "end" : "middle"}>{value}%</text>)}
      {complete && gap > 0 && <path className={styles.route} data-tone="amber" d={`M${505 + 440 * OBSERVED_RATE} 251v41m0-37h${440 * (forecast - OBSERVED_RATE)}v-4`} />}
      <g className={styles.outcome} data-tone={tone} data-ready={complete} data-calibration-gap={complete ? gap : undefined}>
        <rect x="30" y="371" width="920" height="51" rx="4" />
        <text className={styles.critical} x="490" y="403" textAnchor="middle">{complete ? gap === 0 ? "FORECAST MATCHES THIS GROUP" : "FORECAST 15 POINTS ABOVE OBSERVED" : "COMPARE THE FORECAST WITH THE OUTCOMES"}</text>
      </g>
    </g>
  );
}
