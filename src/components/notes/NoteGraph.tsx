"use client";

import { useId, useMemo, useRef, useState } from "react";
import type { NoteLink } from "@/lib/notes";
import { layoutGraph } from "@/lib/note-graph";
import { notesContent } from "@/content/notes";
import { playInterfaceSound } from "@/lib/interface-sound";

export function NoteGraph({ notes, current, compact = false }: { notes: NoteLink[]; current?: string; compact?: boolean }) {
  const width = compact ? 300 : 600, height = compact ? 250 : 420;
  const { nodes, edges } = useMemo(() => layoutGraph(notes, current, width, height), [notes, current, width, height]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const titleId = useId();
  const related = new Set([hovered, ...edges.flatMap(({ source, target }) => source.id === hovered ? [target.id] : target.id === hovered ? [source.id] : [])]);
  const focused = nodes.find((node) => node.id === hovered);
  return <div className={`note-graph${compact ? " note-graph-compact" : ""}`}>
    <div className="graph-toolbar"><span>{compact ? notesContent.connections : notesContent.graph}</span><div>
      <button type="button" aria-label={notesContent.zoomOut} disabled={view.scale <= 0.75} onClick={() => setView((v) => ({ ...v, scale: Math.max(0.75, v.scale - 0.25) }))}>−</button>
      <button type="button" aria-label={notesContent.resetGraph} onClick={() => setView({ x: 0, y: 0, scale: 1 })}>↺</button>
      <button type="button" aria-label={notesContent.zoomIn} disabled={view.scale >= 3} onClick={() => setView((v) => ({ ...v, scale: Math.min(3, v.scale + 0.25) }))}>+</button>
    </div></div>
    <svg viewBox={`0 0 ${width} ${height}`} aria-labelledby={titleId} className="graph-canvas"
      onPointerDown={(event) => { drag.current = { x: event.clientX, y: event.clientY, moved: false }; }}
      onPointerMove={(event) => {
        if (!drag.current || !event.buttons) return;
        const dx = event.clientX - drag.current.x, dy = event.clientY - drag.current.y;
        if (!drag.current.moved && Math.hypot(dx, dy) < 4) return;
        drag.current = { x: event.clientX, y: event.clientY, moved: true };
        event.currentTarget.setPointerCapture(event.pointerId);
        const ratio = width / event.currentTarget.getBoundingClientRect().width;
        setView((v) => ({ ...v, x: v.x + dx * ratio, y: v.y + dy * ratio }));
      }}
      onClickCapture={(event) => { if (drag.current?.moved) { event.preventDefault(); event.stopPropagation(); } drag.current = null; }}
      onPointerCancel={() => { drag.current = null; }}>
      <title id={titleId}>{notesContent.graphDescription}</title>
      <g transform={`translate(${width / 2 + view.x} ${height / 2 + view.y}) scale(${view.scale}) translate(${-width / 2} ${-height / 2})`}>
        {edges.map(({ source, target }) => <line key={`${source.id}:${target.id}`} x1={source.x} y1={source.y} x2={target.x} y2={target.y}
          className="graph-edge" data-active={hovered === source.id || hovered === target.id} />)}
        {nodes.map((node) => <a key={node.id} href={`/notes/${node.id}/`} aria-label={node.title}
          aria-current={current === node.id ? "page" : undefined}
          className="graph-node" data-muted={!!hovered && !related.has(node.id)} data-active={hovered === node.id || current === node.id}
          onMouseEnter={() => setHovered(node.id)} onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered(node.id)} onBlur={() => setHovered(null)} onClick={() => playInterfaceSound("tap")}>
          <title>{node.title}</title>
          <circle cx={node.x} cy={node.y} r={14} className="graph-hit" />
          <circle cx={node.x} cy={node.y} r={3.5 + Math.min(node.degree, 8) * 0.65} className="graph-dot" />
          <text x={node.x} y={node.y + 17} textAnchor="middle" className="graph-label" data-visible={nodes.length <= 4 || hovered === node.id || current === node.id}>
            {node.title.length > 26 ? `${node.title.slice(0, 25)}…` : node.title}
          </text>
        </a>)}
      </g>
    </svg>
    <p className="graph-caption" aria-live="polite">{focused?.title ?? (compact && edges.length === 0 ? notesContent.noConnections : `${nodes.length} notes · ${edges.length} links`)}</p>
    {!compact && <p className="graph-help">{notesContent.graphHelp}</p>}
  </div>;
}
