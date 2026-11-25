import { Arrow, Box, Packet } from "./drawing";
import { candidateSnapshot, fraction, MATCHES } from "./model";
import styles from "./UseCases.module.css";

export function CandidateScene({ progress, mode }: { progress: number; mode: "choice" | "noul" }) {
  const state = candidateSnapshot(progress, mode);
  return <g data-selection-mode={mode}>
    <text x={26} y={30} className={styles.title}>Query: “What does it cost to cancel?”</text>
    <Box x={26} y={67} w={252} title="Same three passages" lines={["Cancellation: a fee applies.", "Refund: medical exceptions.", "Delivery: takes two days."]} />
    <Arrow x1={278} y1={127} x2={348} y2={127} active />
    <Packet progress={progress} start={.05} end={.3} from={[278,127]} to={[348,127]} />
    <text x={348} y={69} className={styles.title}>{mode === "choice" ? "One Choice" : "Three Noul questions"}</text>
    <text x={348} y={92} className={styles.small}>{mode === "choice" ? "Which passage is the best match?" : "Does each passage address the query?"}</text>
    {MATCHES.filter((_, i) => mode === "choice" || i < 3).map((item, i) => {
      const y = 127 + i * 40;
      const value = item[mode];
      return <g key={item.name} data-candidate={i} data-selected={state.selected.includes(i)}>
        <text x={348} y={y}>{item.name}</text>
        <rect x={526} y={y - 7} width={175} height={14} rx={2} className={styles.track} />
        <rect x={526} y={y - 7} width={175 * value * fraction(progress,.3,.55)} height={14} rx={2} className={styles.bar} />
        <text x={718} y={y}>{state.answered ? value.toFixed(2) : "…"}</text>
        <text x={781} y={y} className={state.selected.includes(i) ? styles.green : styles.muted}>{state.applied && i < 3 ? state.selected.includes(i) ? "KEEP" : "SKIP" : ""}</text>
      </g>;
    })}
    <line x1={26} y1={293} x2={874} y2={293} className={styles.line} />
    <text x={26} y={322} className={styles.critical} data-candidate-result>{state.applied ? mode === "choice" ? "Top one: cancellation fee" : "Two matches survive independently" : "Waiting for the judgments"}</text>
    <text x={26} y={352} className={styles.small}>{mode === "choice" ? "All option probabilities sum to 1. Code can also inspect the runner-up." : "Each value is a separate probability. The example policy keeps p ≥ 0.80."}</text>
  </g>;
}

export function BrowserScene({ progress }: { progress: number }) {
  const chosen = progress >= .55;
  const acted = progress >= .65;
  return <g data-browser-state={acted ? "observed" : chosen ? "selected" : "pending"}>
    <text x={26} y={27} className={styles.title}>Goal: Find flights from Zurich to London</text>
    <Box x={26} y={55} title="Observe page" lines={acted ? ["[1] Where from?: Zurich", "[2] ZRH suggestion (new)", "[4] Where to? (was 2)"] : ["[1] Where from?: empty", "[2] Where to?: empty", "[4] Cabin · [5] Search"]} />
    <Arrow x1={266} y1={112} x2={330} y2={112} active />
    <Packet progress={progress} start={.05} end={.3} from={[266,112]} to={[330,112]} />
    <Box x={330} y={55} title="Jev: four Choices" lines={chosen ? ["operation → TYPE_TEXT", "type_text_target → 1", "click, select heads unused"] : ["operation", "type_text / click / select", "target heads, one request"]} selected={chosen} />
    <Arrow x1={570} y1={112} x2={634} y2={112} active={chosen} />
    <Packet progress={progress} start={.55} end={.65} from={[570,112]} to={[634,112]} />
    <Box x={634} y={55} title="Validate + execute" lines={["Index 1 → local action e1", 'Text model → {"text":"Zurich"}', "Page unchanged? Then type"]} />
    <path d="M754 175 V232 H146 V175" className={acted ? styles.route : styles.dashed} />
    <Packet progress={progress} start={.65} end={.76} from={[754,232]} to={[450,232]} />
    <Packet progress={progress} start={.76} end={.87} from={[450,232]} to={[146,232]} />
    <text x={450} y={211} textAnchor="middle" className={styles.small}>Fresh snapshot after the action</text>
    <text x={26} y={280} className={styles.critical}>{acted ? "Zurich typed → new snapshot renumbers the page" : "Nothing runs until the answer is validated"}</text>
    <text x={26} y={309} className={styles.small}>Jev picks an operation and an element index. A separate chat model writes field text.</text>
  </g>;
}
