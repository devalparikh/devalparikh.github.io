"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import type { NoteLink } from "@/lib/notes";
import { layoutGraph, zoomGraph, graphLabels, INITIAL_GRAPH_VIEW, type GraphView } from "@/lib/note-graph";
import { notesContent } from "@/content/notes";
import { playInterfaceSound } from "@/lib/interface-sound";

interface NoteGraphProps {
  notes: NoteLink[];
  current?: string;
  compact?: boolean;
  view?: GraphView;
  onViewChange?: (update: (previous: GraphView) => GraphView) => void;
}
export function NoteGraph({ notes, current, compact = false, view: savedView, onViewChange }: NoteGraphProps) {
  const width = compact ? 300 : 600, height = compact ? 250 : 500;
  const { nodes, edges } = useMemo(() => layoutGraph(notes, current, width, height), [notes, current, width, height]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [localView, setLocalView] = useState(INITIAL_GRAPH_VIEW);
  const view = savedView ?? localView;
  const setView = useCallback((update: (previous: GraphView) => GraphView) => {
    if (onViewChange) onViewChange(update);
    else setLocalView(update);
  }, [onViewChange]);
  const [gesture, setGesture] = useState("zoom");
  const canvasRef = useRef<SVGSVGElement>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const measure = () => setCanvasScale(canvas.getBoundingClientRect().width / width || 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [width]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const wheel = (event: WheelEvent) => {
      const matrix = canvas.getScreenCTM();
      if (!matrix) return;
      event.preventDefault();
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? canvas.clientHeight : 1);
      setGesture("zoom");
      setView((previous) => zoomGraph(previous, Math.exp(-Math.max(-300, Math.min(300, delta)) * 0.002), { x: point.x - width / 2, y: point.y - height / 2 }));
    };
    // A non-passive listener keeps page scrolling from competing with zoom.
    canvas.addEventListener("wheel", wheel, { passive: false });
    return () => canvas.removeEventListener("wheel", wheel);
  }, [setView, width, height]);
  // Keep labels legible when the SVG shrinks to a phone or sidebar width.
  const labelSize = Math.max(compact ? 14 : 11, (compact ? 9 : 11) / canvasScale);
  const labels = graphLabels(nodes, view, width, height, compact, current, hovered, labelSize);
  const zoom = (factor: number) => { setGesture("zoom"); setView((previous) => zoomGraph(previous, factor, { x: 0, y: 0 })); };
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const titleId = useId();
  const related = new Set([hovered, ...edges.flatMap(({ source, target }) => source.id === hovered ? [target.id] : target.id === hovered ? [source.id] : [])]);
  const focused = nodes.find((node) => node.id === hovered);
  return <div className={`note-graph${compact ? " note-graph-compact" : ""}`}>
    <div className="graph-toolbar">{compact && <span>{notesContent.connections}</span>}<div>
      <button type="button" aria-label={notesContent.zoomOut} disabled={view.scale <= 0.5} onClick={() => zoom(1 / 1.25)}>−</button>
      <button type="button" aria-label={notesContent.resetGraph} onClick={() => { setGesture("zoom"); setView(() => INITIAL_GRAPH_VIEW); }}>↺</button>
      <button type="button" aria-label={notesContent.zoomIn} disabled={view.scale >= 4} onClick={() => zoom(1.25)}>+</button>
    </div></div>
    <svg ref={canvasRef} viewBox={`0 0 ${width} ${height}`} aria-labelledby={titleId} className="graph-canvas"
      onPointerDown={(event) => { setGesture("pan"); drag.current = { x: event.clientX, y: event.clientY, moved: false }; }}
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
      <g className="graph-scene" data-gesture={gesture} transform={`translate(${width / 2 + view.x} ${height / 2 + view.y}) scale(${view.scale}) translate(${-width / 2} ${-height / 2})`}>
        {edges.map(({ source, target }) => <line key={`${source.id}:${target.id}`} x1={source.x} y1={source.y} x2={target.x} y2={target.y}
          className="graph-edge" data-active={hovered === source.id || hovered === target.id} />)}
        {nodes.map((node) => <Link key={node.id} href={`/notes/${node.id}/` as Route} aria-label={node.title}
          aria-current={current === node.id ? "page" : undefined}
          className="graph-node" data-muted={!!hovered && !related.has(node.id)} data-active={hovered === node.id || current === node.id}
          onMouseEnter={() => setHovered(node.id)} onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered(node.id)} onBlur={() => setHovered(null)} onClick={() => playInterfaceSound("tap")}>
          <title>{node.title}</title>
          <circle cx={node.x} cy={node.y} r={14} className="graph-hit" />
          <circle cx={node.x} cy={node.y} r={3.5 + Math.min(node.degree, 8) * 0.65} className="graph-dot" />
        </Link>)}
        {/* Labels paint last so a neighboring dot cannot cover a focused title. */}
        <g aria-hidden="true">{nodes.map((node) => <text key={node.id} data-note={node.id}
            data-muted={!!hovered && !related.has(node.id)}
            x={labels.get(node.id)?.x ?? node.x}
            y={labels.get(node.id)?.y ?? node.y + 3.5 + Math.min(node.degree, 8) * 0.65 + (labelSize + 3) / view.scale}
            textAnchor="middle" className="graph-label"
            style={{ fontSize: `${labelSize / view.scale}px` }} data-visible={labels.has(node.id)}>
            {node.title.length > 26 ? `${node.title.slice(0, 25)}…` : node.title}
          </text>)}</g>
      </g>
    </svg>
    <p className="graph-caption" aria-live="polite">{focused?.title ?? (compact && edges.length === 0 ? notesContent.noConnections : `${nodes.length} notes · ${edges.length} links`)}</p>
    {!compact && <p className="graph-help">{notesContent.graphHelp}</p>}
  </div>;
}
