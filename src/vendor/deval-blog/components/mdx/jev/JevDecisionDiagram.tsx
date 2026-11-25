import styles from "../JevVisuals.module.css";

export const DECISION_STOPS = [0, .27, .59, 1] as const;
export const DECISION_SCENARIOS = {
  clear: {
    lines: ["CSV export returns", "an empty file.", "JSON export works."],
    team: [.92, .03, .05], impact: [.05, .75, .20], exportFailure: .96,
  },
  mixed: {
    lines: ["Export failed.", "I also see a charge", "I do not recognize."],
    team: [.46, .44, .10], impact: [.10, .50, .40], exportFailure: .94,
  },
} as const;

type Point = readonly [number, number];
const fraction = (value: number, start: number, duration: number) => Math.max(0, Math.min(1, (value - start) / duration));

function Packet({ points, progress, start, duration, tone = "blue" }: {
  points: readonly Point[]; progress: number; start: number; duration: number; tone?: string;
}) {
  const position = fraction(progress, start, duration);
  if (position <= 0 || position >= 1) return null;
  const lengths = points.slice(1).map(([x, y], index) => Math.hypot(x - points[index][0], y - points[index][1]));
  let distance = position * lengths.reduce((sum, length) => sum + length, 0);
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
  return (
    <g data-tone={tone} transform={`translate(${location[0] - 7} ${location[1] - 9})`} data-jev-packet="true">
      <rect className={styles.packet} width="14" height="18" rx="2" />
      <path d="M4 5h6M4 9h6M4 13h4" className={styles.packetLines} />
    </g>
  );
}

function ChoiceAnswer({ values, amount, ready }: { values: readonly number[]; amount: number; ready: boolean }) {
  return (
    <g className={styles.node} data-answer-type="Choice">
      <rect x="437" y="78" width="270" height="119" rx="4" />
      <text className={styles.nodeTitle} x="452" y="98">Choice</text>
      <text className={styles.label} x="692" y="98" textAnchor="end">team</text>
      <text className={styles.label} x="452" y="117">Which team owns this ticket?</text>
      {["engineering", "billing", "other"].map((label, index) => (
        <g key={label} data-tone={["blue", "pink", "amber"][index]}>
          <text className={styles.label} x="452" y={141 + index * 21}>{label}</text>
          <rect className={styles.barTrack} x="527" y={133 + index * 21} width="120" height="9" rx="1" />
          <rect className={styles.barFill} x="527" y={133 + index * 21} width={120 * values[index] * amount} height="9" rx="1" />
          <text className={styles.value} x="692" y={142 + index * 21} textAnchor="end">{ready ? `${Math.round(values[index] * 100)}%` : "…"}</text>
        </g>
      ))}
    </g>
  );
}

function ScoreAnswer({ values, amount, ready }: { values: readonly number[]; amount: number; ready: boolean }) {
  const expected = values.reduce((sum, probability, index) => sum + probability * index, 0);
  return (
    <g className={styles.node} data-answer-type="Score">
      <rect x="437" y="209" width="270" height="108" rx="4" />
      <text className={styles.nodeTitle} x="452" y="229">Score</text>
      <text className={styles.label} x="692" y="229" textAnchor="end">impact</text>
      <text className={styles.meta} x="452" y="248">0 cosmetic · 1 degraded · 2 blocked</text>
      <rect className={styles.barTrack} x="452" y="260" width="240" height="10" rx="1" />
      {values.map((probability, index) => (
        <g key={index} data-tone={["green", "amber", "pink"][index]}>
          <rect className={styles.barFill} x={452 + 240 * values.slice(0, index).reduce((sum, value) => sum + value, 0)} y="260" width={240 * probability * amount} height="10" />
          <text className={styles.meta} x={452 + index * 87} y="285">{index}: {ready ? probability.toFixed(2) : "…"}</text>
        </g>
      ))}
      <text className={styles.value} x="452" y="306" data-expected-impact={ready ? expected.toFixed(2) : undefined}>Expected impact: {ready ? expected.toFixed(2) : "…"}</text>
    </g>
  );
}

function NoulAnswer({ probability, amount, ready }: { probability: number; amount: number; ready: boolean }) {
  return (
    <g className={styles.node} data-tone="green" data-answer-type="Noul">
      <rect x="437" y="329" width="270" height="96" rx="4" />
      <text className={styles.nodeTitle} x="452" y="349">Noul</text>
      <text className={styles.label} x="692" y="349" textAnchor="end">export_failure</text>
      <text className={styles.label} x="452" y="368">Does the message report</text>
      <text className={styles.label} x="452" y="382">an export failure?</text>
      <rect className={styles.barTrack} x="452" y="396" width="188" height="9" rx="1" />
      <rect className={styles.barFill} x="452" y="396" width={188 * probability * amount} height="9" rx="1" />
      <text className={styles.value} x="692" y="406" textAnchor="end">{ready ? probability.toFixed(2) : "…"}</text>
      <text className={styles.meta} x="452" y="419">P(yes)</text>
    </g>
  );
}

export function JevDecisionDiagram({ progress, scenario }: { progress: number; scenario: "clear" | "mixed" }) {
  const example = DECISION_SCENARIOS[scenario];
  const evaluating = fraction(progress, .16, .15);
  const answering = fraction(progress, .42, .15);
  const ready = progress >= .57;
  const decided = progress >= .66;
  const maximum = Math.max(...example.team);
  const routed = maximum >= .8;
  const tone = routed ? "green" : "amber";
  return (
    <g data-jev-scenario={scenario}>
      <text className={styles.sectionLabel} x="30" y="34">ONE REQUEST · THREE INDEPENDENT QUESTIONS</text>
      <text className={styles.label} x="30" y="55">FUNCTIONAL API VIEW · THE APPLICATION CHOOSES THE BRANCH</text>
      <path className={styles.lane} d="M248 214H293M393 220H415V140H437M415 220V263H437M415 263V377H437M707 140H735" />
      <g className={styles.node}>
        <rect x="30" y="136" width="218" height="156" rx="4" />
        <text className={styles.nodeTitle} x="46" y="158">STATE · SUPPORT TICKET</text>
        {example.lines.map((line, index) => <text key={line} className={styles.ticketText} x="46" y={188 + index * 23}>{line}</text>)}
      </g>
      <text className={styles.meta} x="30" y="314">questions: Choice · Score · Noul</text>
      <g className={styles.node} data-active={evaluating > 0}>
        <rect x="293" y="185" width="100" height="70" rx="4" />
        <text className={styles.critical} x="343" y="211" textAnchor="middle">Jev</text>
        <text className={styles.label} x="343" y="230" textAnchor="middle">1 API call</text>
        <rect className={styles.progressTrack} x="307" y="242" width="72" height="3" rx="1" />
        <rect className={styles.progressFill} x="307" y="242" width={72 * evaluating} height="3" rx="1" />
      </g>
      <ChoiceAnswer values={example.team} amount={answering} ready={ready} />
      <ScoreAnswer values={example.impact} amount={answering} ready={ready} />
      <NoulAnswer probability={example.exportFailure} amount={answering} ready={ready} />
      <Packet points={[[248, 214], [293, 214]]} progress={progress} start={.04} duration={.12} />
      {[140, 263, 377].map((y, index) => <Packet key={y} points={[[393, 220], [415, 220], [415, y], [437, y]]} progress={progress} start={.31} duration={.11} tone={["blue", "pink", "green"][index]} />)}
      <Packet points={[[707, 140], [735, 140]]} progress={progress} start={.59} duration={.07} />
      <g className={styles.node}>
        <rect x="735" y="98" width="215" height="172" rx="4" />
        <text className={styles.nodeTitle} x="750" y="119">APPLICATION CODE</text>
        <g data-tone={tone} opacity={decided ? 1 : 0}>
          <rect className={styles.branchHighlight} x="745" y={routed ? 177 : 217} width="195" height="18" rx="2" />
        </g>
        {["p = max(team_probs)", "if p >= 0.80:", "  route(top_team)", "else:", "  manual_triage()"].map((line, index) => <text key={line} className={styles.code} xmlSpace="preserve" x="750" y={147 + index * 20}>{line}</text>)}
      </g>
      <path className={styles.lane} d="M842 270V294" />
      <g className={styles.outcome} data-tone={tone} data-ready={decided} data-route={decided ? routed ? "engineering" : "review" : "pending"}>
        <rect x="735" y="294" width="215" height="119" rx="4" />
        <text className={styles.critical} x="842" y="329" textAnchor="middle">{decided ? routed ? "ENGINEERING" : "REVIEW THE" : "WAITING FOR"}</text>
        <text className={styles.critical} x="842" y="353" textAnchor="middle">{decided ? routed ? "QUEUE" : "TICKET" : "ANSWERS"}</text>
        <text className={styles.comparison} x="842" y="388" textAnchor="middle">{decided ? `${maximum.toFixed(2)} ${routed ? "≥" : "<"} 0.80` : "…"}</text>
      </g>
      <text className={styles.meta} x="842" y="432" textAnchor="middle">0.80 is application policy</text>
      <text className={styles.meta} x="30" y="447">ILLUSTRATIVE PROBABILITIES · NO LIVE API CALL</text>
    </g>
  );
}
