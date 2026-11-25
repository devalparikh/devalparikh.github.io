import styles from "../JevVisuals.module.css";

export const INFERENCE_STOPS = [0, .24, .58, 1] as const;
export const INFERENCE_HEIGHT = 510;
export const INFERENCE_DURATION = 18000;

type Baseline = "json" | "scores";
type Point = readonly [number, number];
const fraction = (value: number, start: number, end: number) => Math.max(0, Math.min(1, (value - start) / (end - start)));
const QUESTIONS = ["team", "impact", "export_failure"] as const;
const TONES = ["blue", "pink", "green"] as const;
const JSON_LINES = ['{"team":[0.92,0.03,0.05],', ' "impact":[0.05,0.75,0.20],', ' "export_failure":0.96}'];

function Packet({ points, progress, start, end, tone = "blue" }: {
  points: readonly Point[]; progress: number; start: number; end: number; tone?: string;
}) {
  const amount = fraction(progress, start, end);
  if (amount <= 0 || amount >= 1) return null;
  const lengths = points.slice(1).map(([x, y], index) => Math.hypot(x - points[index][0], y - points[index][1]));
  let distance = amount * lengths.reduce((sum, length) => sum + length, 0);
  let location = points[points.length - 1];
  for (let index = 0; index < lengths.length; index++) {
    if (distance <= lengths[index]) {
      const ratio = lengths[index] ? distance / lengths[index] : 0;
      location = [points[index][0] + (points[index + 1][0] - points[index][0]) * ratio,
        points[index][1] + (points[index + 1][1] - points[index][1]) * ratio];
      break;
    }
    distance -= lengths[index];
  }
  return <g data-tone={tone} transform={`translate(${location[0] - 6} ${location[1] - 8})`} data-inference-packet="true">
    <rect className={styles.packet} width="12" height="16" rx="2" />
    <path className={styles.packetLines} d="M3 4h6M3 8h6M3 12h4" />
  </g>;
}

function Context({ progress, shared }: { progress: number; shared: boolean }) {
  const amount = fraction(progress, .1, .27);
  return <g className={styles.node} data-active={amount > 0}>
    <rect x="30" y="154" width="180" height="98" rx="4" />
    <text className={styles.comparison} x="44" y="179">{shared ? "SHARED PREFILL" : "PREFILL"}</text>
    <text className={styles.code} x="44" y="201">Read the context</text>
    <text className={styles.code} x="44" y="218">Reuse its KV cache</text>
    <rect className={styles.progressTrack} x="44" y="235" width="152" height="4" rx="1" />
    <rect className={styles.progressFill} x="44" y="235" width={152 * amount} height="4" rx="1" />
  </g>;
}

function JsonResponse({ progress }: { progress: number }) {
  const amount = fraction(progress, .34, .86);
  const total = JSON_LINES.reduce((sum, line) => sum + line.length, 0);
  const written = Math.floor(amount * total);
  return <g className={styles.node} data-active={progress >= .27} data-inference-process="json">
    <rect x="248" y="151" width="414" height="112" rx="4" />
    <text className={styles.comparison} x="264" y="174">JSON · ONE TOKEN AT A TIME</text>
    {JSON_LINES.map((line, index) => {
      const preceding = JSON_LINES.slice(0, index).reduce((sum, text) => sum + text.length, 0);
      const count = Math.max(0, Math.min(line.length, written - preceding));
      const active = progress >= .34 && written >= preceding && written < preceding + line.length;
      return <g key={line} data-tone="amber">
        <text className={styles.value} x="264" y={197 + index * 22} xmlSpace="preserve" opacity=".18">{line}</text>
        <text className={styles.value} x="264" y={197 + index * 22} xmlSpace="preserve">{line.slice(0, count)}</text>
        {active && <rect className={styles.movingPacket} x={265 + count * 7.2} y={187 + index * 22} width="5" height="12" />}
      </g>;
    })}
    <rect className={styles.progressTrack} x="445" y="247" width="201" height="3" rx="1" />
    <g data-tone="amber"><rect className={styles.progressFill} x="445" y="247" width={201 * amount} height="3" rx="1" /></g>
  </g>;
}

function ParallelAnswers({ progress, jev }: { progress: number; jev: boolean }) {
  const amount = fraction(progress, .32, .34);
  const distributions = [[.92, .03, .05], [.05, .75, .20], [.96, .04]];
  return <g className={styles.node} data-active={progress >= .27} data-inference-process={jev ? "typed-api" : "label-scores"}>
    <rect x="248" y="151" width="414" height="123" rx="4" />
    <text className={styles.comparison} x="264" y="174">PARALLEL FIELD READOUT</text>
    <text className={styles.label} x="264" y="193">Field suffix</text>
    <text className={styles.label} x="432" y="193" textAnchor="middle">Transformer</text>
    <text className={styles.label} x="532" y="193" textAnchor="middle">LM head</text>
    <text className={styles.label} x="620" y="193" textAnchor="middle" style={{ fontSize: 9 }}>Label softmax</text>
    <path className={styles.lane} d="M248 203H256V255H264M256 211H264M256 233H264" />
    <g className={styles.node}><rect x="385" y="201" width="94" height="64" rx="3" /></g>
    <g className={styles.node}><rect x="501" y="201" width="61" height="64" rx="3" /></g>
    {QUESTIONS.map((question, index) => <g key={question} data-tone={TONES[index]}>
      <g className={styles.node}>
        <rect x="264" y={202 + index * 22} width="98" height="18" rx="2" />
        <text className={styles.label} x="270" y={214 + index * 22}>{question.replace("_", " ")}</text>
      </g>
      <path className={styles.lane} d={`M362 ${211 + index * 22}H591`} />
      <rect className={styles.barTrack} x="591" y={206 + index * 22} width="57" height="10" rx="1" />
      {distributions[index].map((probability, label) => <rect key={label} className={styles.barFill}
        x={591 + 57 * distributions[index].slice(0, label).reduce((sum, value) => sum + value, 0)}
        y={206 + index * 22} width={57 * probability * amount} height="10" style={{ opacity: 1 - label * .28 }} />)}
      <Packet points={[[362, 211 + index * 22], [591, 211 + index * 22]]} progress={progress} start={.28} end={.34} tone={TONES[index]} />
    </g>)}
  </g>;
}

function Decisions({ progress, readyAt, decoding }: { progress: number; readyAt: number; decoding: boolean }) {
  const ready = progress >= readyAt;
  const heading = ready ? "DECISIONS READY" : decoding && progress >= .34 ? "DECODING RESPONSE" : "PROCESSING INPUT";
  return <g className={styles.outcome} data-tone={ready ? "green" : "amber"} data-ready={ready || decoding && progress >= .34} data-inference-ready={ready}>
    <rect x="704" y="151" width="246" height="123" rx="4" />
    <text className={styles.comparison} x="720" y="176">{heading}</text>
    {[['team: P(engineering)', '.92'], ['impact: expected score', '1.15'], ['export failure: P(yes)', '.96']].map(([label, value], index) => <g key={label}>
      <text className={styles.label} x="720" y={202 + index * 25}>{label}</text>
      <text className={styles.value} x="934" y={203 + index * 25} textAnchor="end">{ready ? value : "…"}</text>
    </g>)}
  </g>;
}

function InferenceLane({ progress, baseline, jev = false }: { progress: number; baseline: Baseline; jev?: boolean }) {
  const serial = !jev && baseline === "json";
  const readyAt = serial ? .90 : .44;
  return <g data-inference-lane={jev ? "jev" : baseline} transform={jev ? "translate(0 190)" : undefined}>
    <text className={styles.critical} x="30" y="128">{jev ? "Decision model" : "Generative model"}</text>
    <text className={baseline === "scores" ? styles.comparison : styles.value} x="248" y="128" fill={baseline === "scores" ? jev ? "var(--diagram-green)" : "var(--diagram-blue)" : undefined}>{jev ? "Trained on decision probabilities" : "Trained to predict text"}</text>
    <path className={styles.lane} d="M210 203H248" />
    {serial ? <path className={styles.lane} d="M662 207H704" /> : QUESTIONS.map((question, index) => <path key={question} className={styles.lane} d={`M648 ${211 + index * 22}H682V${198 + index * 25}H704`} />)}
    <Context progress={progress} shared={!serial} />
    {serial ? <JsonResponse progress={progress} /> : <ParallelAnswers progress={progress} jev={jev} />}
    <Decisions progress={progress} readyAt={readyAt} decoding={serial} />
    <Packet points={[[210, 203], [248, 203]]} progress={progress} start={.27} end={.28} />
    {serial
      ? <Packet points={[[662, 207], [704, 207]]} progress={progress} start={.86} end={.90} tone="amber" />
      : QUESTIONS.map((question, index) => <Packet key={question} points={[[648, 211 + index * 22], [682, 211 + index * 22], [682, 198 + index * 25], [704, 198 + index * 25]]} progress={progress} start={.34} end={.44} tone={TONES[index]} />)}
    {baseline === "json" && <text className={styles.comparison} x="30" y="289" fill={serial ? "var(--diagram-amber)" : "var(--diagram-green)"}>{serial ? "SEQUENTIAL GENERATION" : "FIELDS IN PARALLEL"}</text>}
  </g>;
}

export function JevInferenceDiagram({ progress, baseline }: { progress: number; baseline: Baseline }) {
  return <g data-jev-inference={baseline}>
    <text className={styles.sectionLabel} x="30" y="28">SUPPORT TICKET</text>
    <path className={styles.lane} d="M30 68H18V393H30M18 203H30" />
    <g className={styles.node}>
      <rect x="30" y="44" width="920" height="48" rx="4" />
      <text className={styles.comparison} x="46" y="65">CSV export is empty. JSON export works.</text>
      <text className={styles.code} x="46" y="82">team: engineering / billing / other · impact: 0 / 1 / 2 · export failure: yes / no</text>
    </g>
    <Packet points={[[30, 68], [18, 68], [18, 203], [30, 203]]} progress={progress} start={.025} end={.1} />
    <Packet points={[[30, 68], [18, 68], [18, 393], [30, 393]]} progress={progress} start={.025} end={.1} />
    <InferenceLane progress={progress} baseline={baseline} />
    <line className={styles.divider} x1="30" y1="305" x2="950" y2="305" />
    <InferenceLane progress={progress} baseline={baseline} jev />
    {baseline === "scores" && <text className={styles.comparison} x="490" y="493" textAnchor="middle">SAME FAST READOUT · DIFFERENT TRAINING</text>}
  </g>;
}
