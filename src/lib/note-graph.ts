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
  // The full vault needs looser clusters than the small related-notes graph.
  const repulsion = current ? 4000 : 7500;
  const linkLength = current ? 65 : 95;
  const gravity = current ? 0.025 : 0.015;
  for (let step = 0; step < 180; step++) {
    const forces = nodes.map(() => ({ x: 0, y: 0 }));
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
      const d2 = Math.max(dx * dx + dy * dy, 25);
      const force = repulsion / (d2 * Math.sqrt(d2));
      forces[i].x += dx * force; forces[i].y += dy * force;
      forces[j].x -= dx * force; forces[j].y -= dy * force;
    }
    for (const { source, target } of edges) {
      const dx = target.x - source.x, dy = target.y - source.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const force = (distance - linkLength) * 0.04 / distance;
      const a = forces[nodes.indexOf(source)], b = forces[nodes.indexOf(target)];
      a.x += dx * force; a.y += dy * force; b.x -= dx * force; b.y -= dy * force;
    }
    nodes.forEach((node, i) => {
      const cooling = 0.8 * (1 - step / 200);
      node.x += Math.max(-12, Math.min(12, (forces[i].x + (300 - node.x) * gravity) * cooling));
      node.y += Math.max(-12, Math.min(12, (forces[i].y + (210 - node.y) * gravity) * cooling));
    });
  }
  if (nodes.length) {
    const minX = Math.min(...nodes.map((node) => node.x)), maxX = Math.max(...nodes.map((node) => node.x));
    const minY = Math.min(...nodes.map((node) => node.y)), maxY = Math.max(...nodes.map((node) => node.y));
    const scale = Math.min((width - 80) / Math.max(maxX - minX, 1), (height - 80) / Math.max(maxY - minY, 1), 2);
    // Fill both axes in the full view, giving labels horizontal space instead
    // of squeezing the whole network into a circle set by the canvas height.
    const scaleX = current ? scale : Math.min((width - 112) / Math.max(maxX - minX, 1), 2);
    const scaleY = current ? scale : Math.min((height - 88) / Math.max(maxY - minY, 1), 2);
    nodes.forEach((node) => {
      node.x = width / 2 + (node.x - (minX + maxX) / 2) * scaleX;
      node.y = height / 2 + (node.y - (minY + maxY) / 2) * scaleY;
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
  size = compact ? 14 : 11,
) {
  const visible = new Map<string, { x: number; y: number }>();
  const boxes: { x: number; y: number; width: number; height: number }[] = [];
  const limit = compact ? 4 : Math.max(3, Math.round(Math.max(6, Math.min(40, 14 * view.scale)) * Math.min(1, (11 / size) ** 2)));
  const dots = nodes.map((node) => ({
    id: node.id,
    x: width / 2 + view.x + (node.x - width / 2) * view.scale,
    y: height / 2 + view.y + (node.y - height / 2) * view.scale,
    radius: (3.5 + Math.min(node.degree, 8) * 0.65) * view.scale + 3,
  }));
  const onScreen = nodes.filter((node, index) => node.id === hovered || node.id === current ||
    (dots[index].x >= 0 && dots[index].x <= width && dots[index].y >= 0 && dots[index].y <= height));
  // Reserve labels by connectivity before considering clearance. Dense hubs
  // must not lose their titles to isolated nodes with more empty space.
  const prioritized = onScreen.sort((a, b) =>
    Number(b.id === hovered || b.id === current) - Number(a.id === hovered || a.id === current) ||
    b.degree - a.degree || a.title.localeCompare(b.title)).slice(0, limit);
  const overlap = (a: typeof boxes[number], b: typeof boxes[number]) =>
    Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) *
    Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  for (const node of prioritized) {
    const x = width / 2 + view.x + (node.x - width / 2) * view.scale;
    const y = height / 2 + view.y + (node.y - height / 2) * view.scale;
    const radius = (3.5 + Math.min(node.degree, 8) * 0.65) * view.scale;
    const labelWidth = Math.min(node.title.length, 26) * size * 0.55;
    const side = radius + labelWidth / 2 + 6;
    const below = y + radius + size + 3, above = y - radius - 6;
    const candidates = [
      { x, y: below }, { x, y: above },
      { x: x + side, y: y + size * 0.35 }, { x: x - side, y: y + size * 0.35 },
      { x: x + labelWidth / 2, y: below }, { x: x - labelWidth / 2, y: below },
      { x: x + labelWidth / 2, y: above }, { x: x - labelWidth / 2, y: above },
      ...[x, x + labelWidth / 2, x - labelWidth / 2].flatMap((labelX) => [
        { x: labelX, y: below + size + 8 }, { x: labelX, y: above - size - 8 },
      ]),
    ].map((point, index) => {
      const box = {
        x: Math.max(3, Math.min(width - labelWidth - 9, point.x - labelWidth / 2 - 3)),
        y: Math.max(3, Math.min(height - size - 9, point.y - size)),
        width: labelWidth + 6, height: size + 6,
      };
      // Title collisions matter most; nearby dots are a soft constraint so
      // they can never suppress an important title. The text halo preserves contrast.
      const titleOverlap = boxes.reduce((sum, other) => sum + overlap(box, other), 0);
      const score = titleOverlap * 1000 +
        dots.reduce((sum, dot) => sum + overlap(box, {
          x: dot.x - dot.radius, y: dot.y - dot.radius, width: dot.radius * 2, height: dot.radius * 2,
        }), 0) + (index >= 8 ? size * size : 0) + index * 0.01;
      return { box, score, titleOverlap };
    });
    const { box, titleOverlap } = candidates.reduce((best, candidate) => candidate.score < best.score ? candidate : best);
    // Keep the strongest hubs visible. If further titles cannot fit, stop
    // here instead of replacing this node with lower-priority labels.
    if (titleOverlap > 0 && visible.size >= 3) break;
    visible.set(node.id, {
      x: width / 2 + (box.x + box.width / 2 - width / 2 - view.x) / view.scale,
      y: height / 2 + (box.y + size - height / 2 - view.y) / view.scale,
    });
    boxes.push(box);
  }
  return visible;
}
