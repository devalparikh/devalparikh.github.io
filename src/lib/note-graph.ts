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
