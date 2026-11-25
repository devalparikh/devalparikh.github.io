import styles from "../MultiAgentSystemsVisuals.module.css";
import { along, fraction, TASKS } from "./timing";

export const COORDINATION_STOPS = [0, .2, .6, 1] as const;
export const COORDINATION_DURATION = 18000;

type Point = readonly [number, number];

function route(points: readonly Point[]) {
  return points.map(([x, y], index) => `${index ? "L" : "M"}${x} ${y}`).join(" ");
}

function DocumentPacket({ points, progress, start, duration, tone, label, kind }: {
  points: readonly Point[]; progress: number; start: number; duration: number;
  tone: string; label?: string; kind: string;
}) {
  const position = fraction(progress, start, duration);
  if (position <= 0 || position >= 1) return null;
  const [x, y] = along(points, position);
  const width = label ? 58 : 20;
  return (
    <g transform={`translate(${x - width / 2} ${y - 10})`} data-tone={tone} data-message-kind={kind}>
      <rect width={width} height="20" rx="3" fill="var(--diagram-bg)" stroke="var(--tone)" strokeWidth="1" />
      {label
        ? <text className={styles.meta} x={width / 2} y="13" textAnchor="middle">{label}</text>
        : <path d="M5 6h10M5 10h10M5 14h6" fill="none" stroke="var(--tone)" strokeWidth="1" />}
    </g>
  );
}

function AgentNode({ index, x, progress, readStart, readEnd, finish }: {
  index: number; x: number; progress: number; readStart: number; readEnd: number; finish: number;
}) {
  const task = TASKS[index];
  const received = progress >= .12 + index * .012;
  const reading = index === 2 && progress >= readStart && progress < readEnd;
  const corrected = index === 2 && progress >= readEnd;
  const beforeRead = Math.min(.88, fraction(Math.min(progress, readStart), .2, .5));
  const work = index === 0
    ? fraction(progress, .2, .1)
    : index === 2
      ? beforeRead + (1 - beforeRead) * fraction(progress, readEnd, finish - readEnd)
      : fraction(progress, .2, .52);
  const note = index === 0 ? progress >= .3 ? "v2 uses cursors" : "read v2 docs"
    : index === 1 ? "new v2 auth"
      : index === 2 ? corrected ? "cursor=…" : "page=2"
        : "100 / page";
  const state = reading ? "pause · read" : corrected ? "sample updated" : index === 2 && progress >= .4 ? "still v1" : index === 0 && progress >= .3 ? "correction found" : work >= 1 ? "finding ready" : received ? "working" : "await brief";
  return (
    <g className={styles.taskNode} data-tone={task.tone} data-active={received} data-agent={task.label} data-recipient-state={index === 2 ? reading ? "reading" : corrected ? "corrected" : "original" : undefined}>
      <rect x={x} y="310" width="96" height="84" rx="4" />
      <rect className={styles.taskProgress} x={x + 1} y="311" width={94 * work} height="82" rx="3" />
      <text className={styles.nodeTitle} x={x + 48} y="330" textAnchor="middle">{task.label.toUpperCase()}</text>
      <text className={styles.label} x={x + 48} y="351" textAnchor="middle" data-code={index === 2 ? note : undefined} style={index === 2 ? { fill: corrected ? "var(--diagram-green)" : "var(--diagram-amber)", fontSize: 14, fontWeight: 700 } : undefined}>{note}</text>
      <text className={styles.meta} x={x + 48} y="369" textAnchor="middle">{state}</text>
      <rect className={styles.progressTrack} x={x + 12} y="382" width="72" height="3" rx="1" />
      <rect className={styles.progressFill} x={x + 12} y="382" width={72 * work} height="3" rx="1" />
      {reading && <path d={`M${x + 83} 319v6m4 -6v6`} stroke="var(--diagram-pink)" strokeWidth="1.5" />}
    </g>
  );
}

function Team({ peer, progress }: { peer: boolean; progress: number }) {
  const offset = peer ? 490 : 0;
  const center = offset + 245;
  const agentXs = [141, 28, 254, 367].map(x => x + offset);
  const centers = agentXs.map(x => x + 48);
  const readStart = peer ? .38 : .81;
  const readEnd = peer ? .44 : .87;
  const discovered = progress >= .3;
  const complete = progress >= .99;
  const relayWaiting = !peer && progress >= .4 && progress < .73;
  const corrected = progress >= readEnd;
  const firstHop: Point[] = [[centers[0], 310], [offset + 112, 270], [offset + 112, 154], [center - 96, 154]];
  const secondHop: Point[] = [[center + 96, 154], [offset + 378, 154], [offset + 378, 270], [centers[2], 310]];
  const directHop: Point[] = [[centers[0], 310], [centers[0], 278], [centers[2], 278], [centers[2], 310]];
  const hopsDelivered = peer ? Number(progress >= .38) : Number(progress >= .4) + Number(progress >= .81);
  const status = complete ? "migration brief ready" : progress >= .9 ? "combine findings" : relayWaiting ? "correction waiting" : progress >= .2 ? "agents working" : "brief + source links";
  const outcome = corrected ? "SAMPLE UPDATED" : relayWaiting ? "WAITING FOR COORDINATOR" : progress >= readStart ? "READING CORRECTION" : discovered ? "CORRECTION IN TRANSIT" : "SAME TASK · SAME TEAM";
  return (
    <g data-coordination-mode={peer ? "peer" : "relay"}>
      <text className={styles.sectionLabel} x={center} y="89" textAnchor="middle" style={{ fontSize: 15 }}>{peer ? "DIRECT MESSAGING" : "COORDINATOR RELAY"}</text>
      {centers.map((x, index) => <path key={index} className={styles.lane} d={`M${center} 192L${x} 310`} />)}
      {discovered && <g opacity={fraction(progress, .3, .025)}>
        <path className={styles.messageRoute} d={route(peer ? directHop : firstHop)} />
        {!peer && <path className={styles.messageRoute} d={route(secondHop)} opacity={progress >= .73 ? 1 : .2} />}
      </g>}
      <g className={styles.node} data-active={progress >= .03}>
        <rect x={center - 96} y="112" width="192" height="80" rx="4" style={relayWaiting ? { stroke: "var(--diagram-amber)" } : undefined} />
        <text className={styles.nodeTitle} x={center} y="132" textAnchor="middle">COORDINATOR</text>
        <text className={styles.label} x={center} y="151" textAnchor="middle">v1 → v2 migration</text>
        <text className={styles.meta} x={center} y="169" textAnchor="middle" style={relayWaiting ? { fill: "var(--diagram-amber)", fontSize: 12 } : undefined}>{status}</text>
        <g>{TASKS.map((task, index) => <rect key={task.label} className={styles.movingPacket} data-tone={task.tone} x={center - 34 + index * 19} y="179" width="11" height="5" rx="1" opacity={fraction(progress, .945 + index * .007, .01)} />)}</g>
      </g>
      <text className={styles.nodeTitle} x={center} y="224" textAnchor="middle" data-correction-outcome={corrected ? "updated" : relayWaiting ? "waiting" : "pending"} style={{ fontSize: 16, fill: corrected ? "var(--diagram-green)" : discovered ? "var(--diagram-amber)" : "var(--diagram-muted)" }}>{outcome}</text>
      <text className={styles.label} x={center} y="246" textAnchor="middle" style={{ fontSize: 13, fill: corrected ? "var(--diagram-green)" : "var(--diagram-muted)" }}>{corrected ? "cursor=… replaces page=2" : discovered ? "“v2 uses cursors”" : "v1 → v2 API migration"}</text>
      {agentXs.map((x, index) => <AgentNode key={index} index={index} x={x} progress={progress} readStart={readStart} readEnd={readEnd} finish={peer ? .72 : .9} />)}
      {centers.map((x, index) => (
        <g key={index}>
          <DocumentPacket points={[[center, 192], [x, 310]]} progress={progress} start={.02 + index * .012} duration={.1} tone={TASKS[index].tone} kind="assignment" />
          <DocumentPacket points={[[x, 310], [center, 192]]} progress={progress} start={.9 + index * .007} duration={.045} tone={TASKS[index].tone} kind="result" />
        </g>
      ))}
      {peer
        ? <DocumentPacket points={directHop} progress={progress} start={.3} duration={.08} tone="blue" label="cursors" kind="correction-direct" />
        : <>
            <DocumentPacket points={firstHop} progress={progress} start={.3} duration={.1} tone="blue" label="cursors" kind="correction-up" />
            <DocumentPacket points={secondHop} progress={progress} start={.73} duration={.08} tone="blue" label="cursors" kind="correction-down" />
          </>}
      <text className={styles.nodeTitle} x={center} y="422" textAnchor="middle" style={{ fontSize: 14 }}>{peer ? "1 hop · no coordinator handoff" : "2 hops + coordinator handoff"}</text>
      <text className={styles.label} x={center} y="443" textAnchor="middle" style={{ fontSize: 12 }}>{peer && corrected ? "Correction arrives earlier · same shared merge" : complete ? "Extra handoff before delivery · same shared merge" : `${hopsDelivered} / ${peer ? 1 : 2} hops delivered${relayWaiting ? " · page=2 still unchanged" : ""}`}</text>
    </g>
  );
}

export function CoordinationDiagram({ progress }: { progress: number }) {
  const value = Math.max(0, Math.min(1, progress));
  return (
    <g>
      <text className={styles.sectionLabel} x="30" y="34">EXAMPLE · A DOCS CORRECTION</text>
      <text className={styles.label} x="30" y="56">THE EXAMPLES AGENT IS STILL WRITING v1 PAGINATION</text>
      <line className={styles.divider} x1="490" y1="78" x2="490" y2="440" />
      <Team peer={false} progress={value} />
      <Team peer progress={value} />
    </g>
  );
}
