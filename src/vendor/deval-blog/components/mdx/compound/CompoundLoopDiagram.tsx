import styles from "../CompoundEngineeringVisuals.module.css";
import {
  along,
  clockX,
  correctionsTyped,
  fraction,
  LESSONS,
  LOAD_WINDOW,
  NIGHT_TIMING,
  NIGHT_WIDTH,
  NIGHTS,
  REVIEWS,
  skillAtThread,
  THREAD_WIDTH,
  threadState,
  THREADS,
  nightState,
  type Lane,
  type Point,
  type Source,
  type ThreadLine,
} from "./loop-model";

const SOURCE_TONES: Record<Source, string> = { me: "blue", others: "pink", itself: "green" };
const CARD_HEIGHT = 124;
const CARD_WIDTH = THREAD_WIDTH - 12;
const LANE_Y: Record<Lane, number> = { stateless: 96, compounding: 258 };
const STRIP_Y = 424;
const STRIP_HEIGHT = 56;

function Packet({
  points,
  progress,
  tone,
  kind,
}: {
  points: readonly Point[];
  progress: number;
  tone: string;
  kind: string;
}) {
  if (progress <= 0 || progress >= 1) return null;
  const [x, y] = along(points, progress);
  return (
    <g data-tone={tone} data-loop-packet={kind} transform={`translate(${x - 6} ${y - 8})`}>
      <rect className={styles.packet} width="12" height="16" rx="2" />
      <path className={styles.packetLines} d="M3 4h6M3 8h6M3 12h4" />
    </g>
  );
}

function statusText(status: string, index: number) {
  if (status === "loading") return `Loading skill v${index}`;
  if (status === "waiting") return "Waiting on me";
  if (status === "working") return "Working";
  if (status === "done") return "Done";
  return "";
}

function correctionText(corrections: number, done: boolean) {
  if (corrections === 0) return done ? "No corrections" : "";
  return `${corrections} correction${corrections === 1 ? "" : "s"}`;
}

function CardLine({ line, x, y }: { line: ThreadLine; x: number; y: number }) {
  if (line.kind === "correction") {
    return (
      <text className={styles.line} data-line-kind="correction" data-tone="amber" x={x} y={y}>
        <tspan className={styles.toned}>↩ </tspan>
        <tspan className={styles.toned}>{line.text}</tspan>
      </text>
    );
  }
  const tone = line.kind === "applied" ? SOURCE_TONES[line.source ?? "me"] : undefined;
  return (
    <text
      className={line.kind === "applied" ? styles.line : `${styles.line} ${styles.muted}`}
      data-line-kind={line.kind}
      x={x}
      y={y}
    >
      <tspan className={tone ? styles.toned : undefined} data-tone={tone}>
        ✓{" "}
      </tspan>
      {line.text}
    </text>
  );
}

function ThreadCard({ lane, index, progress }: { lane: Lane; index: number; progress: number }) {
  const thread = THREADS[index];
  const state = threadState(lane, index, progress);
  const x = thread.x + 6;
  const y = LANE_Y[lane];
  const statusTone =
    state.status === "waiting" ? "amber" : state.status === "loading" ? "green" : undefined;
  const countTone = state.corrections ? "amber" : "green";
  return (
    <g
      className={styles.node}
      data-active={state.started}
      data-loop-thread={`${lane}-${index}`}
      data-thread-status={state.status}
      data-corrections={state.corrections}
    >
      <rect x={x} y={y} width={CARD_WIDTH} height={CARD_HEIGHT} rx="4" />
      <text
        className={thread.film ? styles.cardTitle : `${styles.cardTitle} ${styles.muted}`}
        x={x + 12}
        y={y + 21}
      >
        {thread.film ?? "Next film"}
      </text>
      {state.lines.map((line, row) => (
        <CardLine key={line.id} line={line} x={x + 12} y={y + 39 + row * 13} />
      ))}
      <line
        className={styles.cardRule}
        x1={x + 12}
        y1={y + 99}
        x2={x + CARD_WIDTH - 12}
        y2={y + 99}
      />
      <rect
        className={styles.workFill}
        x={x + 12}
        y={y + 98}
        width={(CARD_WIDTH - 24) * state.work}
        height="2"
        rx="1"
      />
      <text
        className={
          statusTone ? `${styles.status} ${styles.toned}` : `${styles.status} ${styles.muted}`
        }
        data-tone={statusTone}
        x={x + 12}
        y={y + 115}
      >
        {statusText(state.status, index)}
      </text>
      <text
        className={`${styles.count} ${styles.toned}`}
        data-tone={countTone}
        x={x + CARD_WIDTH - 12}
        y={y + 115}
        textAnchor="end"
      >
        {state.started ? correctionText(state.corrections, state.done) : ""}
      </text>
    </g>
  );
}

function DroppedContext({ index, progress }: { index: number; progress: number }) {
  const night = NIGHTS[index];
  const center = night.x + NIGHT_WIDTH / 2;
  const opacity = fraction(progress, night.start, night.start + 0.03);
  if (!opacity) return null;
  return (
    <g opacity={opacity} data-stateless-night={index}>
      <text className={`${styles.small} ${styles.muted}`} x={center} y="154" textAnchor="middle">
        Context
      </text>
      <text className={`${styles.small} ${styles.muted}`} x={center} y="168" textAnchor="middle">
        dropped
      </text>
    </g>
  );
}

function XTwitterLink({ progress }: { progress: number }) {
  const night = NIGHTS[0];
  const state = nightState(0, progress);
  const center = night.x + NIGHT_WIDTH / 2;
  const arrived = state.started && state.local >= 0.05;
  const top = LANE_Y.compounding + 4;
  return (
    <g data-tone="pink">
      <g className={styles.node} data-active={arrived} data-ready={arrived}>
        <rect x={night.x + 6} y={top} width={NIGHT_WIDTH - 12} height="56" rx="4" />
        <text
          className={`${styles.nodeTitle} ${styles.toned}`}
          x={center}
          y={top + 18}
          textAnchor="middle"
        >
          X/Twitter DM
        </text>
        <text
          className={`${styles.small} ${styles.muted}`}
          x={center}
          y={top + 34}
          textAnchor="middle"
        >
          Link with a tip:
        </text>
        <text className={styles.small} x={center} y={top + 47} textAnchor="middle">
          check the page
        </text>
      </g>
      {state.started && <path className={styles.lane} d={`M${center} ${top + 56}V${STRIP_Y}`} />}
      <Packet
        points={[
          [center, top + 56],
          [center, STRIP_Y],
        ]}
        progress={state.started ? fraction(state.local, ...NIGHT_TIMING.xdm) : 0}
        tone="pink"
        kind="from-others"
      />
    </g>
  );
}

function NightReview({ index, progress }: { index: number; progress: number }) {
  const night = NIGHTS[index];
  const review = REVIEWS[index];
  const state = nightState(index, progress);
  const center = night.x + NIGHT_WIDTH / 2;
  const x = night.x + 6;
  const width = NIGHT_WIDTH - 12;
  const sourceX = THREADS[index].x + 130;
  const inputRoute: Point[] = [
    [sourceX, LANE_Y.compounding + CARD_HEIGHT],
    [sourceX, 400],
    [center - 20, 400],
    [center - 20, STRIP_Y],
  ];
  const [inputStart, inputEnd] = NIGHT_TIMING.inputs;
  const stagger = 0.07;
  const status = state.reviewed
    ? `Kept ${review.kept}${review.cut ? ` · cut ${review.cut}` : ""}`
    : state.review > 0
      ? "Reviewing"
      : state.started
        ? `${review.fromMe + review.fromOthers} new notes`
        : "";
  return (
    <g data-tone="green" data-loop-review={index} data-reviewed={state.reviewed}>
      {state.started && (
        <path
          className={styles.lane}
          d={`M${inputRoute.map(([px, py]) => `${px} ${py}`).join("L")}`}
        />
      )}
      {Array.from({ length: review.fromMe }, (_, packet) => (
        <Packet
          key={packet}
          points={inputRoute}
          progress={
            state.started
              ? fraction(
                  state.local,
                  inputStart + packet * stagger,
                  inputEnd - (review.fromMe - 1 - packet) * stagger,
                )
              : 0
          }
          tone="blue"
          kind="from-me"
        />
      ))}
      <g className={styles.node} data-active={state.started} data-ready={state.reviewed}>
        <rect x={x} y={STRIP_Y} width={width} height={STRIP_HEIGHT} rx="4" />
        <text
          className={state.started ? `${styles.nodeTitle} ${styles.toned}` : styles.nodeTitle}
          x={center}
          y={STRIP_Y + 18}
          textAnchor="middle"
        >
          Dreaming
        </text>
        <rect
          className={styles.progressTrack}
          x={x + 12}
          y={STRIP_Y + 26}
          width={width - 24}
          height="2"
          rx="1"
        />
        <rect
          className={styles.progressFill}
          x={x + 12}
          y={STRIP_Y + 26}
          width={(width - 24) * state.review}
          height="2"
          rx="1"
        />
        <text
          className={`${styles.small} ${styles.muted}`}
          x={center}
          y={STRIP_Y + 44}
          textAnchor="middle"
          data-review-result={state.reviewed ? status : undefined}
        >
          {status}
        </text>
      </g>
      <Packet
        points={[
          [x + width, STRIP_Y + 28],
          [THREADS[index + 1].x + 16, STRIP_Y + 28],
        ]}
        progress={state.started ? fraction(state.local, ...NIGHT_TIMING.write) : 0}
        tone="green"
        kind="write-skill"
      />
    </g>
  );
}

function SkillCell({ index, progress }: { index: number; progress: number }) {
  const x = THREADS[index].x + 16;
  const width = THREAD_WIDTH - 32;
  const center = x + width / 2;
  const written = index > 0 && nightState(index - 1, progress).written;
  const thread = threadState("compounding", index, progress);
  if (!written) {
    return (
      <g className={styles.pending} data-skill-cell={index} data-skill-version="none">
        <rect x={x} y={STRIP_Y} width={width} height={STRIP_HEIGHT} rx="4" />
        <text
          className={`${styles.small} ${styles.muted}`}
          x={center}
          y={STRIP_Y + 32}
          textAnchor="middle"
        >
          {index === 0 ? "No skill yet" : "Written overnight"}
        </text>
      </g>
    );
  }
  const lessons = skillAtThread(index).map((id) => LESSONS[id].short);
  return (
    <g data-tone="green">
      <g
        className={styles.node}
        data-ready="true"
        data-skill-cell={index}
        data-skill-version={index}
      >
        <rect x={x} y={STRIP_Y} width={width} height={STRIP_HEIGHT} rx="4" />
        <text className={`${styles.file} ${styles.toned}`} x={x + 12} y={STRIP_Y + 19}>
          add-film.md
        </text>
        <text
          className={`${styles.file} ${styles.muted}`}
          x={x + width - 12}
          y={STRIP_Y + 19}
          textAnchor="end"
        >
          {`v${index}`}
        </text>
        <text className={`${styles.small} ${styles.muted}`} x={x + 12} y={STRIP_Y + 35}>
          {lessons.slice(0, 2).join(", ")}
        </text>
        <text className={`${styles.small} ${styles.muted}`} x={x + 12} y={STRIP_Y + 48}>
          {lessons.slice(2).join(", ")}
        </text>
      </g>
      {thread.started && (
        <path
          className={styles.lane}
          d={`M${center} ${STRIP_Y}V${LANE_Y.compounding + CARD_HEIGHT}`}
        />
      )}
      <Packet
        points={[
          [center, STRIP_Y],
          [center, LANE_Y.compounding + CARD_HEIGHT],
        ]}
        progress={thread.started ? fraction(thread.local, ...LOAD_WINDOW) : 0}
        tone="green"
        kind="load-skill"
      />
    </g>
  );
}

function LaneHeading({ lane, progress }: { lane: Lane; progress: number }) {
  const y = LANE_Y[lane];
  const typed = correctionsTyped(lane, progress);
  const saved = correctionsTyped("stateless", progress) - correctionsTyped("compounding", progress);
  return (
    <g data-lane-heading={lane}>
      <text className={styles.rowTitle} x="30" y={y + 21}>
        {lane === "stateless" ? "No carryover" : "Compounding"}
      </text>
      <text className={`${styles.small} ${styles.muted}`} x="30" y={y + 38}>
        {lane === "stateless" ? "Each thread starts blank" : "Lessons carry forward"}
      </text>
      <text className={styles.counter} x="30" y={y + 90} data-corrections-typed={typed}>
        {typed}
      </text>
      <text className={`${styles.small} ${styles.muted}`} x="30" y={y + 107}>
        corrections I typed
      </text>
      {lane === "compounding" && saved > 0 && (
        <text
          className={`${styles.count} ${styles.toned}`}
          data-tone="green"
          x="30"
          y={y + 123}
          data-corrections-saved={saved}
        >
          {`${saved} fewer`}
        </text>
      )}
    </g>
  );
}

function Legend() {
  const sources: [Source, string, number][] = [
    ["me", "From me", 724],
    ["others", "From others", 796],
    ["itself", "From itself", 884],
  ];
  return (
    <g>
      <g data-tone="amber">
        <text className={`${styles.small} ${styles.toned}`} x="628" y="31">
          ↩
        </text>
        <text className={`${styles.small} ${styles.muted}`} x="642" y="31">
          My correction
        </text>
      </g>
      {sources.map(([source, label, x]) => (
        <g key={source} data-tone={SOURCE_TONES[source]}>
          <rect className={styles.swatch} x={x} y="22" width="9" height="9" rx="2" />
          <text className={`${styles.small} ${styles.muted}`} x={x + 14} y="31">
            {label}
          </text>
        </g>
      ))}
    </g>
  );
}

function ColumnHeaders({ progress }: { progress: number }) {
  const columns = [
    ...THREADS.map((thread) => ({
      label: thread.day,
      start: thread.start,
      end: thread.end,
      center: thread.x + THREAD_WIDTH / 2,
    })),
    ...NIGHTS.map((night) => ({
      label: "Overnight",
      start: night.start,
      end: night.end,
      center: night.x + NIGHT_WIDTH / 2,
    })),
  ];
  return (
    <g>
      {columns.map((column) => {
        const current = progress >= column.start && progress < column.end;
        return (
          <text
            key={`${column.label}-${column.center}`}
            className={current ? styles.columnCurrent : styles.column}
            x={column.center}
            y="80"
            textAnchor="middle"
          >
            {column.label}
          </text>
        );
      })}
    </g>
  );
}

export function CompoundLoopDiagram({ progress }: { progress: number }) {
  const value = Math.max(0, Math.min(1, progress));
  const showClock = value < THREADS[2].end;
  return (
    <g data-compound-loop>
      <text className={styles.title} x="30" y="31">
        One request, three days
      </text>
      <text className={`${styles.small} ${styles.muted}`} x="30" y="49">
        Each day a new Slack thread adds a film to my Notes. Corrections are illustrative.
      </text>
      <Legend />
      <ColumnHeaders progress={value} />
      {showClock && (
        <line className={styles.clock} x1={clockX(value)} y1="88" x2={clockX(value)} y2="486" />
      )}
      <LaneHeading lane="stateless" progress={value} />
      {THREADS.map((thread, index) => (
        <ThreadCard key={thread.day} lane="stateless" index={index} progress={value} />
      ))}
      {NIGHTS.map((night, index) => (
        <DroppedContext key={night.x} index={index} progress={value} />
      ))}
      <line className={styles.divider} x1="30" y1="240" x2="950" y2="240" />
      <LaneHeading lane="compounding" progress={value} />
      {THREADS.map((thread, index) => (
        <ThreadCard key={thread.day} lane="compounding" index={index} progress={value} />
      ))}
      <XTwitterLink progress={value} />
      <text className={styles.rowTitle} x="30" y={STRIP_Y + 21}>
        Saved skill
      </text>
      <text className={`${styles.small} ${styles.muted}`} x="30" y={STRIP_Y + 38}>
        Loaded by the next thread
      </text>
      {THREADS.map((thread, index) => (
        <SkillCell key={thread.day} index={index} progress={value} />
      ))}
      {NIGHTS.map((night, index) => (
        <NightReview key={night.x} index={index} progress={value} />
      ))}
    </g>
  );
}
