import { actionSpace, type Observation, type SnapshotAction } from "./browser-flow";
import styles from "./BrowserSnapshot.module.css";

type Decision = { operation: string; head: string; target: string; actionId: string; node: number; ignoredHeads: string[] };
type Answers = Record<string, { choice: string; probabilities: Record<string, number> }>;
type Props = { observation: Observation; label: string; decision?: Decision; answers?: Answers; previous?: Observation };

const OX = 24;
const OY = 44;
const KIND = { fill: "type", click: "click", select: "select", wait: "wait" } as const;

function Control({ action, value }: { action: SnapshotAction; value?: string }) {
  const { x, y, w, h } = action.rect!;
  const cy = y + h / 2;
  if (action.role === "link") return <text x={x} y={cy} className={styles.link}>{action.label}</text>;
  const button = action.role === "button";
  const text = action.role === "combobox" ? `${action.current_value} ▾` : action.role === "textbox" ? value || action.label : action.label;
  return <g>
    <rect x={x} y={y} width={w} height={h} rx={3} className={button ? styles.button : styles.control} />
    <text x={x + 12} y={cy} className={action.role === "textbox" && !value ? styles.placeholder : undefined}>{text}</text>
  </g>;
}

/** The page a snapshot describes, with each model-facing index drawn on its bounding box. */
export function BrowserSnapshot({ observation, label, decision, answers, previous }: Props) {
  const { elements, indexByNode } = actionSpace(observation.actions);
  const before = previous ? actionSpace(previous.actions).indexByNode : undefined;
  const byNode = new Map<number, SnapshotAction[]>();
  for (const action of observation.actions) if (action.node) byNode.set(action.node, [...(byNode.get(action.node) ?? []), action]);
  const pickedNode = (head: string) => {
    const choice = answers?.[head]?.choice;
    const index = choice?.split(":")[0];
    return Number(Object.entries(indexByNode).find(([, i]) => i === index)?.[0]);
  };
  const ignored = new Set(decision?.ignoredHeads.map(pickedNode));
  const pageHeight = observation.viewport.h;
  const tableY = OY + pageHeight + 34;
  const rows = elements.length;
  const height = tableY + 22 + Math.ceil(rows / 2) * 22 + (decision ? 34 : 8);

  return <figure className={styles.figure}>
    <svg viewBox={`0 0 700 ${height}`} className={styles.svg} role="img" aria-label={label}>
      <title>{label}</title>
      <rect x={0.5} y={0.5} width={699} height={OY + pageHeight + 8} rx={4} className={styles.frame} />
      <line x1={0} y1={30} x2={700} y2={30} className={styles.rule} />
      {[14, 28, 42].map(cx => <circle key={cx} cx={cx} cy={15} r={4} className={styles.dot} />)}
      <text x={62} y={15} className={styles.url}>{observation.url}</text>
      <g transform={`translate(${OX} ${OY})`}>
        <text x={24} y={24} className={styles.heading}>{observation.title}</text>
        {[...byNode].map(([node, actions]) => {
          const first = actions[0];
          const { x, y, w, h } = first.rect!;
          const index = indexByNode[node];
          const moved = before && before[node] && before[node] !== index;
          const isNew = before && !before[node];
          const chosen = decision?.node === node;
          const state = chosen ? "chosen" : ignored.has(node) ? "ignored" : moved || isNew ? "changed" : "idle";
          const badge = moved ? `${index} ← ${before![node]}` : index;
          const bw = 12 + badge.length * 8.4;
          return <g key={node} data-node={node} data-state={state}>
            <Control action={first} value={first.value} />
            <rect x={x - 3} y={y - 3} width={w + 6} height={h + 6} rx={4} className={styles.box} />
            <rect x={x + w - bw + 3} y={y - 16} width={bw} height={18} rx={3} className={styles.badge} />
            <text x={x + w - bw / 2 + 3} y={y - 7} textAnchor="middle" className={styles.badgeText}>{badge}</text>
          </g>;
        })}
      </g>

      <text x={OX} y={tableY} className={styles.caption}>{"model index → local executor actions (never sent to Jev)"}</text>
      {elements.map((element, i) => {
        const node = Number(Object.entries(indexByNode).find(([, index]) => index === element.index)![0]);
        const local = byNode.get(node)!.map(a => a.kind === "select" ? `${a.id} ${a.label.split(" → ")[1]}` : `${a.id} ${KIND[a.kind]}`).join(", ");
        const col = i < Math.ceil(rows / 2) ? 0 : 1;
        const row = col ? i - Math.ceil(rows / 2) : i;
        return <text key={element.index} x={OX + col * 340} y={tableY + 24 + row * 22} className={styles.mapping} data-state={decision?.node === node ? "chosen" : undefined}>
          <tspan className={styles.index}>{`[${element.index}]`}</tspan>{` ${element.label.length > 18 ? `${element.label.slice(0, 17)}…` : element.label}  →  ${local}`}
        </text>;
      })}
      {decision && <text x={OX} y={height - 14} className={styles.result}>
        <tspan className={styles.chosenText}>{`${decision.head} → ${decision.target} → ${decision.actionId}`}</tspan>
        <tspan className={styles.ignoredText}>{`   unused: ${decision.ignoredHeads.map(head => `${head} → ${answers?.[head]?.choice}`).join(", ")}`}</tspan>
      </text>}
    </svg>
  </figure>;
}
