import { fraction } from "./execution-model";
import styles from "../DurableExecutionVisuals.module.css";

export function Packet({ progress, start, end, x1, y1, x2, y2, tone = "blue", name }: {
  progress: number; start: number; end: number; x1: number; y1: number; x2: number; y2: number; tone?: string; name: string;
}) {
  if (progress < start || progress >= end) return null;
  const t = fraction(progress, start, end);
  return <rect data-packet={name} data-tone={tone} className={styles.packet} x="-5" y="-4" width="10" height="8" rx="1" transform={`translate(${x1 + (x2 - x1) * t} ${y1 + (y2 - y1) * t})`} />;
}

export function Step({ x, y, title, detail, work = 0, tone = "blue", width = 156, faded = false }: {
  x: number; y: number; title: string; detail: string; work?: number; tone?: string; width?: number; faded?: boolean;
}) {
  return <g className={styles.step} data-tone={tone} opacity={faded ? .4 : 1}>
    <rect x={x} y={y} width={width} height="66" rx="3" />
    <rect className={styles.work} x={x + 1} y={y + 1} width={(width - 2) * work} height="64" rx="2" />
    <text className={styles.nodeTitle} x={x + 12} y={y + 26}>{title}</text>
    <text className={styles.small} x={x + 12} y={y + 48}>{detail}</text>
  </g>;
}

export function FlowStep({ x, y, width = 200, title, detail, work = 0, tone = "blue" }: {
  x: number; y: number; width?: number; title: string; detail: string; work?: number; tone?: string;
}) {
  return <g className={styles.flowStep} data-tone={tone}>
    <rect x={x} y={y} width={width} height="54" rx="3" />
    <text className={styles.nodeTitle} x={x + 12} y={y + 20}>{title}</text>
    <text className={styles.small} x={x + 12} y={y + 37}>{detail}</text>
    <rect className={styles.progressTrack} x={x + 12} y={y + 46} width={width - 24} height="2" rx="1" />
    <rect className={styles.progressFill} x={x + 12} y={y + 46} width={(width - 24) * work} height="2" rx="1" />
  </g>;
}
