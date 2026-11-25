import { useId, type ReactNode } from "react";
import styles from "./UseCases.module.css";

export function Canvas({ label, description, height, children }: { label: string; description: string; height: number; children: ReactNode }) {
  const id = useId();
  return <svg className={styles.svg} viewBox={`0 0 900 ${height}`} role="img" aria-label={label} aria-describedby={id}>
    <desc id={id}>{description}</desc>{children}
  </svg>;
}

export function Box({ x, y, w = 240, title, lines, selected = false }: { x: number; y: number; w?: number; title: string; lines: string[]; selected?: boolean }) {
  return <g transform={`translate(${x} ${y})`}>
    <rect width={w} height={54 + lines.length * 22} rx={4} className={selected ? styles.selected : styles.box} />
    <text x={16} y={24} className={styles.title}>{title}</text>
    {lines.map((line, index) => <text key={`${index}-${line}`} x={16} y={52 + index * 22} className={styles.small}>{line}</text>)}
  </g>;
}

export function Arrow({ x1, y1, x2, y2, active = false }: { x1: number; y1: number; x2: number; y2: number; active?: boolean }) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const tip = (offset: number) => `${x2 - 7 * Math.cos(angle + offset)},${y2 - 7 * Math.sin(angle + offset)}`;
  return <g><path d={`M${x1},${y1} L${x2},${y2}`} className={active ? styles.route : styles.line} /><polyline points={`${tip(-.5)} ${x2},${y2} ${tip(.5)}`} className={active ? styles.route : styles.line} /></g>;
}

export function Packet({ progress, start, end, from, to }: { progress: number; start: number; end: number; from: [number, number]; to: [number, number] }) {
  if (progress < start || progress >= end) return null;
  const t = (progress - start) / (end - start);
  return <rect data-decision-packet x={from[0] + (to[0] - from[0]) * t - 5} y={from[1] + (to[1] - from[1]) * t - 5} width={10} height={10} rx={2} className={styles.packet} />;
}
