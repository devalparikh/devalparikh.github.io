import styles from "../MultiAgentSystemsVisuals.module.css";
import { along, fraction, schedules, TASKS, TIME_LIMIT, workAt, type MergeCost } from "./timing";

const timeX = (time: number) => 166 + time * 35;

function Packet({ points, progress, tone }: { points: [number, number][]; progress: number; tone: string }) {
  if (progress <= 0 || progress >= 1) return null;
  const [x, y] = along(points, progress);
  return <g transform={`translate(${x - 10} ${y - 8})`} data-tone={tone}>
    <rect width="20" height="16" rx="2" fill="var(--diagram-bg)" stroke="var(--tone)" />
    <path d="M4 5h12M4 8h12M4 11h7" stroke="var(--tone)" strokeWidth="1" />
  </g>;
}

function Segment({ start, duration, elapsed, y, height = 18, tone, label }: {
  start: number; duration: number; elapsed: number; y: number; height?: number; tone?: string; label?: string;
}) {
  const width = duration * 35 - 2;
  const progress = fraction(elapsed, start, duration);
  return (
    <g className={styles.timeSegment} data-tone={tone}>
      <rect x={timeX(start)} y={y} width={width} height={height} rx="2" />
      <rect className={styles.segmentFill} x={timeX(start)} y={y} width={width * progress} height={height} rx="2" />
      {label && <text x={timeX(start) + width / 2} y={y + 12.5} textAnchor="middle">{label}</text>}
    </g>
  );
}

function SerialSegments({ elapsed, y, height = 18 }: { elapsed: number; y: number; height?: number }) {
  return <>
    <Segment start={0} duration={2} elapsed={elapsed} y={y} height={height} label={height > 10 ? "context" : undefined} />
    {TASKS.map((task, index) => <Segment key={task.label} start={2 + index * 3} duration={3} elapsed={elapsed} y={y} height={height} tone={task.tone} label={height > 10 ? task.label : undefined} />)}
    <Segment start={14} duration={2} elapsed={elapsed} y={y} height={height} label={height > 10 ? "write" : undefined} />
  </>;
}

export function ParallelWorkDiagram({ progress, mergeCost }: { progress: number; mergeCost: MergeCost }) {
  const elapsed = progress * TIME_LIMIT;
  const context = fraction(elapsed, 0, 2);
  const reading = fraction(elapsed, 2, 3);
  const merging = fraction(elapsed, 5.8, mergeCost - .8);
  const { serial, split, duplicated } = schedules(mergeCost);
  const workRatio = workAt(split.intervals, TIME_LIMIT) / workAt(serial.intervals, TIME_LIMIT);
  const done = elapsed >= split.finish;
  return (
    <>
      <text className={styles.sectionLabel} x="30" y="34">EXAMPLE · PLAN A v1 → v2 API MIGRATION</text>
      <text className={styles.label} x="30" y="56">CONTEXT: EXISTING CLIENT USES v1 AUTH + PAGE-NUMBER PAGINATION</text>
      <g className={styles.node} data-active={context > 0}>
        <rect x="30" y="136" width="152" height="70" rx="4" />
        <text className={styles.nodeTitle} x="48" y="158">SHARED BRIEF</text>
        <text className={styles.label} x="48" y="178">What changes?</text>
        <text className={styles.label} x="48" y="194">What breaks?</text>
      </g>
      {TASKS.map((task, index) => {
        const y = 78 + index * 49;
        const assignment: [number, number][] = [[182, 171], [220, 171], [250, y + 20], [278, y + 20]];
        const result: [number, number][] = [[486, y + 20], [518, y + 20], [564, 171], [600, 171]];
        return <g key={task.label}>
          <path className={styles.lane} d={`M182 171H220L250 ${y + 20}H278M486 ${y + 20}H518L564 171H600`} />
          <g className={styles.taskNode} data-tone={task.tone} data-active={context > 0}>
            <rect x="278" y={y} width="208" height="40" rx="3" />
            <rect className={styles.taskProgress} x="279" y={y + 1} width={206 * reading} height="38" rx="2" />
            <text className={styles.nodeTitle} x="290" y={y + 16}>{task.label.toUpperCase()}</text>
            <text className={styles.label} x="290" y={y + 31} opacity={.25 + reading * .75}>{task.finding}</text>
          </g>
          <Packet points={assignment} progress={fraction(elapsed, index * .15, 1.3)} tone={task.tone} />
          <Packet points={result} progress={fraction(elapsed, 5 + index * .08, .55)} tone={task.tone} />
        </g>;
      })}
      <g className={styles.node} data-active={elapsed >= 5}>
        <rect x="600" y="136" width="144" height="70" rx="4" />
        <text className={styles.nodeTitle} x="672" y="158" textAnchor="middle">MERGE</text>
        <text className={styles.meta} x="672" y="176" textAnchor="middle">1 OF THE 4 AGENTS</text>
        <rect className={styles.progressTrack} x="616" y="188" width="112" height="4" rx="2" />
        <rect className={styles.progressFill} x="616" y="188" width={112 * merging} height="4" rx="2" />
      </g>
      <path className={styles.lane} d="M744 171H802" />
      <Packet points={[[744, 171], [802, 171]]} progress={fraction(elapsed, split.finish - .35, .35)} tone="green" />
      <g className={styles.outputDocument} data-complete={done}>
        <rect x="802" y="117" width="148" height="108" rx="3" />
        <text className={styles.nodeTitle} x="816" y="140">MIGRATION PLAN</text>
        {["v2 auth", "cursor pagination", "≤100 items / page"].map((line, index) =>
          <g key={line} opacity={fraction(merging, index / 3, 1 / 3)}>
            <rect data-tone={TASKS[index].tone} className={styles.movingPacket} x="816" y={153 + index * 19} width="4" height="4" />
            <text className={styles.label} x="827" y={158 + index * 19}>{line}</text>
          </g>)}
      </g>
      <text className={styles.meta} x="382" y="293" textAnchor="middle">4 AGENTS · ONE SOURCE EACH</text>
      <line className={styles.divider} x1="30" y1="313" x2="950" y2="313" />
      <text className={styles.sectionLabel} x="30" y="342">SAME TASK, THREE SCHEDULES</text>
      <text className={styles.label} x="950" y="342" textAnchor="end">ILLUSTRATIVE TIME UNITS</text>
      <text className={styles.meta} x="837" y="365">TIME</text>
      <text className={styles.meta} x="934" y="365" textAnchor="end">WORK</text>
      <text className={styles.nodeTitle} x="30" y="394">1 AGENT</text>
      <text className={styles.label} x="30" y="454">4 AGENTS</text>
      <text className={styles.meta} x="30" y="468">split sources</text>
      <text className={styles.label} x="30" y="514">4 AGENTS</text>
      <text className={styles.meta} x="30" y="528">each reads all</text>
      <SerialSegments elapsed={elapsed} y={380} />
      {TASKS.map((task, index) => <g key={task.label}>
        <Segment start={0} duration={2} elapsed={elapsed} y={431 + index * 9} height={6} />
        <Segment start={2} duration={3} elapsed={elapsed} y={431 + index * 9} height={6} tone={task.tone} />
      </g>)}
      <Segment start={5} duration={mergeCost} elapsed={elapsed} y={431} height={6} />
      <text className={styles.meta} x={timeX(5) + mergeCost * 17.5} y="426" textAnchor="middle">merge</text>
      {[0, 1, 2, 3].map(index => <SerialSegments key={index} elapsed={elapsed} y={491 + index * 9} height={6} />)}
      <Segment start={16} duration={2} elapsed={elapsed} y={491} height={6} />
      <text className={styles.meta} x={timeX(17)} y="486" textAnchor="middle">compare</text>
      {[serial, split, duplicated].map((schedule, index) => <g key={index} className={styles.counter} data-complete={elapsed >= schedule.finish}>
        <text x="863" y={[394, 454, 514][index]} textAnchor="end">{Math.min(elapsed, schedule.finish).toFixed(1)}</text>
        <text x="934" y={[394, 454, 514][index]} textAnchor="end">{workAt(schedule.intervals, elapsed).toFixed(1)}</text>
      </g>)}
      <line className={styles.playhead} x1={timeX(elapsed)} x2={timeX(elapsed)} y1="371" y2="534" />
      <circle className={styles.playheadTip} cx={timeX(elapsed)} cy="371" r="2.5" />
      <path className={styles.timeAxis} d="M166 547H796" />
      {[0, 4, 8, 12, 16, 18].map(tick => <g key={tick}>
        <line className={styles.timeAxis} x1={timeX(tick)} x2={timeX(tick)} y1="547" y2="551" />
        <text className={styles.meta} x={timeX(tick)} y="565" textAnchor="middle">{tick}</text>
      </g>)}
      <text className={styles.label} x="30" y="594">{mergeCost === 3 ? "SPLIT: 2.0× FASTER" : "SPLIT: 1 UNIT SLOWER"} · {workRatio.toFixed(1)}× THE WORK</text>
      <text className={styles.meta} x="950" y="594" textAnchor="end">{mergeCost === 3 ? "short merge preserves the gain" : "coordination consumes the time saved"}</text>
    </>
  );
}
