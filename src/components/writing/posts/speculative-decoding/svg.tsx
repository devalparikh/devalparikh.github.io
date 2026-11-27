import type { ReactNode } from "react";
import { pathD, pointAlong, type Pt } from "./scene";

/**
 * SVG building blocks shared by the figures. One colour per role, reused in
 * every figure: draft (small model), target (big model), math, good, bad.
 */
export type Tone = "ink" | "muted" | "draft" | "target" | "math" | "good" | "bad";

export const tone = (name: Tone) => `sdv-tone-${name}`;
export const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");

interface TxtProps {
  x: number;
  y: number;
  size?: number;
  anchor?: "start" | "middle" | "end";
  tone?: Tone;
  muted?: boolean;
  bold?: boolean;
  opacity?: number;
  strike?: boolean;
  children: ReactNode;
}

export function Txt({ x, y, size = 11, anchor = "middle", tone: t, muted, bold, opacity, strike, children }: TxtProps) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      textAnchor={anchor}
      dominantBaseline="central"
      opacity={opacity}
      textDecoration={strike ? "line-through" : undefined}
      className={cx("sdv-txt", muted && "sdv-txt-muted", t && tone(t), t && "sdv-txt-tone", bold && "sdv-bold")}
    >
      {children}
    </text>
  );
}

export type Look = "soft" | "lit" | "line" | "solid" | "ghost";

interface BoxProps {
  x: number;
  y: number;
  w: number;
  h: number;
  tone?: Tone;
  look?: Look;
  dashed?: boolean;
  r?: number;
  opacity?: number;
  label?: ReactNode;
  sub?: ReactNode;
  labelSize?: number;
  labelTone?: Tone;
  strike?: boolean;
}

export function Box({ x, y, w, h, tone: t = "ink", look = "soft", dashed, r = 4, opacity, label, sub, labelSize = 11, labelTone, strike }: BoxProps) {
  const middle = y + h / 2;
  return (
    <g opacity={opacity} className={tone(t)}>
      <rect x={x} y={y} width={w} height={h} rx={r} className={cx(`sdv-box-${look}`, dashed && "sdv-dashed")} />
      {label !== undefined ? (
        <Txt x={x + w / 2} y={sub ? middle - 7 : middle} size={labelSize} bold={look === "lit" || look === "solid"} tone={labelTone} strike={strike}>
          {label}
        </Txt>
      ) : null}
      {sub ? (
        <Txt x={x + w / 2} y={middle + 8} size={9.5} muted>
          {sub}
        </Txt>
      ) : null}
    </g>
  );
}

interface RouteProps {
  pts: readonly Pt[];
  tone?: Tone;
  on?: boolean;
  arrow?: boolean;
  dashed?: boolean;
  opacity?: number;
  width?: number;
}

/** A connection. `on` lights it in its tone; the arrowhead sits on the last point. */
export function Route({ pts, tone: t = "muted", on, arrow = true, dashed, opacity, width }: RouteProps) {
  const [x1, y1] = pts[pts.length - 1];
  const [x0, y0] = pts[pts.length - 2];
  const angle = Math.round((Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI);
  return (
    <g className={tone(t)} opacity={opacity}>
      <path d={pathD(pts)} className={cx(on ? "sdv-route-on" : "sdv-route", dashed && "sdv-dashed")} strokeWidth={width} />
      {arrow ? <path d="M0 0 L-6 -3.2 L-6 3.2 Z" transform={`translate(${x1} ${y1}) rotate(${angle})`} className={on ? "sdv-arrow-on" : "sdv-arrow"} /> : null}
    </g>
  );
}

/** A small token travelling along a route; null hides it. */
export function Packet({ pts, f, tone: t = "draft", size = 7 }: { pts: readonly Pt[]; f: number | null; tone?: Tone; size?: number }) {
  if (f === null) return null;
  const [x, y] = pointAlong(pts, f);
  return (
    <g className={tone(t)}>
      <rect x={x - size / 2} y={y - size / 2} width={size} height={size} rx={1.4} className="sdv-packet" />
    </g>
  );
}

/** A check mark, cross or dash drawn as paths so it renders the same everywhere. */
export function Mark({ x, y, kind, size = 7 }: { x: number; y: number; kind: "match" | "miss" | "skip" | "bonus"; size?: number }) {
  const s = size;
  if (kind === "match" || kind === "bonus") {
    return (
      <g className={tone("good")}>
        <path d={`M${x - s} ${y} l${s * 0.7} ${s * 0.7} l${s * 1.3} ${-s * 1.4}`} className="sdv-mark" />
      </g>
    );
  }
  if (kind === "miss") {
    return (
      <g className={tone("bad")}>
        <path d={`M${x - s * 0.75} ${y - s * 0.75} l${s * 1.5} ${s * 1.5} M${x + s * 0.75} ${y - s * 0.75} l${-s * 1.5} ${s * 1.5}`} className="sdv-mark" />
      </g>
    );
  }
  return (
    <g className={tone("muted")}>
      <path d={`M${x - s * 0.7} ${y} h${s * 1.4}`} className="sdv-mark" />
    </g>
  );
}
