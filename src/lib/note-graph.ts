import type { NoteLink } from "./notes";

// Deterministic, bounded force layout. No animation loop, random hydration
// differences, or background work once the graph has settled.
export function layoutGraph(notes: NoteLink[], current?: string, width = 600, height = 420) {
  const included = current ? new Set([current, ...notes.filter((note) => note.id === current || note.outgoing.includes(current)).flatMap((note) => note.id === current ? note.outgoing : [note.id])]) : null;
  const selected = notes.filter((note) => !included || included.has(note.id));
  const nodes = selected.map((note, index) => {
    const angle = index * 2.399963;
    const radius = 25 + 170 * Math.sqrt(index / Math.max(selected.length, 1));
    return { ...note, x: 300 + Math.cos(angle) * radius, y: 210 + Math.sin(angle) * radius, degree: 0 };
  });
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const seen = new Set<string>();
  const edges = nodes.flatMap((node) => node.outgoing.flatMap((id) => {
    const target = byId.get(id);
    const key = [node.id, id].sort().join("|");
    if (!target || target === node || seen.has(key)) return [];
    seen.add(key); node.degree++; target.degree++;
    return [{ source: node, target }];
  }));
  for (let step = 0; step < 180; step++) {
    const forces = nodes.map(() => ({ x: 0, y: 0 }));
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
      const d2 = Math.max(dx * dx + dy * dy, 25);
      const force = 4000 / (d2 * Math.sqrt(d2));
      forces[i].x += dx * force; forces[i].y += dy * force;
      forces[j].x -= dx * force; forces[j].y -= dy * force;
    }
    for (const { source, target } of edges) {
      const dx = target.x - source.x, dy = target.y - source.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const force = (distance - 65) * 0.04 / distance;
      const a = forces[nodes.indexOf(source)], b = forces[nodes.indexOf(target)];
      a.x += dx * force; a.y += dy * force; b.x -= dx * force; b.y -= dy * force;
    }
    nodes.forEach((node, i) => {
      const cooling = 0.8 * (1 - step / 200);
      node.x += Math.max(-12, Math.min(12, (forces[i].x + (300 - node.x) * 0.025) * cooling));
      node.y += Math.max(-12, Math.min(12, (forces[i].y + (210 - node.y) * 0.025) * cooling));
    });
  }
  if (nodes.length) {
    const minX = Math.min(...nodes.map((node) => node.x)), maxX = Math.max(...nodes.map((node) => node.x));
    const minY = Math.min(...nodes.map((node) => node.y)), maxY = Math.max(...nodes.map((node) => node.y));
    const scale = Math.min((width - 80) / Math.max(maxX - minX, 1), (height - 80) / Math.max(maxY - minY, 1), 2);
    nodes.forEach((node) => {
      node.x = width / 2 + (node.x - (minX + maxX) / 2) * scale;
      node.y = height / 2 + (node.y - (minY + maxY) / 2) * scale;
    });
  }
  return { nodes, edges };
}

export interface GraphView { x: number; y: number; scale: number }
export const INITIAL_GRAPH_VIEW: GraphView = { x: 0, y: 0, scale: 1 };

/** Keep the point under the pointer stationary as the graph zooms. */
export function zoomGraph(view: GraphView, factor: number, anchor: { x: number; y: number }): GraphView {
  const scale = Math.max(0.5, Math.min(4, view.scale * factor));
  const ratio = scale / view.scale;
  return { scale, x: anchor.x - (anchor.x - view.x) * ratio, y: anchor.y - (anchor.y - view.y) * ratio };
}

export function graphLabels(
  nodes: ReturnType<typeof layoutGraph>["nodes"], view: GraphView,
  width: number, height: number, compact: boolean, current?: string, hovered?: string | null,
) {
  const visible = new Set<string>();
  const boxes: { x: number; y: number; width: number; height: number }[] = [];
  const size = compact ? 14 : 11;
  const limit = compact ? 4 : Math.max(6, Math.min(30, Math.round(10 * view.scale)));
  const prioritized = [...nodes].sort((a, b) =>
    Number(b.id === hovered || b.id === current) - Number(a.id === hovered || a.id === current) ||
    b.degree - a.degree || a.title.localeCompare(b.title));
  for (const node of prioritized) {
    const forced = node.id === hovered || node.id === current;
    const x = width / 2 + view.x + (node.x - width / 2) * view.scale;
    const y = height / 2 + view.y + (node.y - height / 2) * view.scale + (3.5 + Math.min(node.degree, 8) * 0.65) * view.scale + 14;
    const labelWidth = Math.min(node.title.length, 26) * size * 0.55;
    const box = { x: x - labelWidth / 2 - 3, y: y - size, width: labelWidth + 6, height: size + 6 };
    if (!forced && (visible.size >= limit || box.x < 3 || box.x + box.width > width - 3 || box.y < 3 || box.y + box.height > height - 3)) continue;
    if (!forced && boxes.some((other) => box.x < other.x + other.width && box.x + box.width > other.x && box.y < other.y + other.height && box.y + box.height > other.y)) continue;
    visible.add(node.id);
    boxes.push(box);
  }
  return visible;
}
