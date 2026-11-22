import * as T from "three";

function surface(vertices: number[], triangles: number[]) {
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
  g.setIndex(triangles);
  g.computeVertexNormals();
  return g;
}

// Both pieces share the same irregular snowline, including the tongues
// of snow on the northern face. The summit leans toward the eastern ridge.
export function ridge(cap: boolean) {
  const vertices: number[] = [],
    triangles: number[] = [];
  const count = 26;
  for (const level of cap ? [3, 4, 5] : [0, 1, 2, 3]) {
    for (let i = 0; i < count; i++) {
      const a = (2 * Math.PI * i) / count;
      const spur = 0.075 * Math.cos(5 * a + 0.7) + 0.035 * Math.sin(9 * a);
      const y = [0, 0.16, 0.39, 0.65 + 0.16 * Math.cos(5 * a + 0.7), 0.89, 1][level];
      // Long spur to the west, with an offset summit above a short rock wall.
      const r = Math.pow(1 - y, 0.72) * (0.42 + spur + 0.08 * Math.cos(a));
      vertices.push(r * Math.cos(a) + 0.24 * y * y, y - 0.5,
        r * Math.sin(a) * 0.89 - 0.12 * y + 0.08 * Math.sin(4 * a) * y * (1 - y));
      if (level !== (cap ? 3 : 0)) {
        const n = vertices.length / 3 - 1,
          next = n - i + ((i + 1) % count);
        triangles.push(n - count, n, next - count, next - count, n, next);
      }
    }
  }
  const faces = surface(vertices, triangles).toNonIndexed();
  faces.computeVertexNormals();
  return faces;
}

// A bowed palm blade, split into pointed leaflets on either side of a spine.
export function frond() {
  const vertices: number[] = [],
    triangles: number[] = [];
  const arch = (t: number) => 0.31 * Math.sin(Math.PI * t) - 0.2 * t;
  for (let i = 0; i < 16; i++) {
    const t = i / 16, end = (i + 1) / 16;
    const n = vertices.length / 3;
    vertices.push(-0.025, arch(t), t - 0.5, 0.025, arch(t), t - 0.5,
      -0.025, arch(end), end - 0.5, 0.025, arch(end), end - 0.5);
    triangles.push(n, n + 2, n + 1, n + 1, n + 2, n + 3);
    for (const side of [-1, 1]) {
      const reach = 0.48 * Math.sin(Math.PI * (0.08 + t * 0.89));
      const base = vertices.length / 3;
      vertices.push(0, arch(t), t - 0.5, side * reach * 0.55, arch(t) - 0.025, t - 0.47,
        side * reach, arch(t) - 0.095, t - 0.39, 0, arch(end), end - 0.5);
      triangles.push(base, base + 1, base + 3, base + 3, base + 1, base + 2);
    }
  }
  return surface(vertices, triangles);
}

// A stone footbridge along Z, with a clear barrel vault under its crown.
export function bridgeArch() {
  const profile = new T.Shape();
  profile.moveTo(-0.5, 0);
  profile.lineTo(-0.34, 0);
  profile.bezierCurveTo(-0.31, 0.93, 0.31, 0.93, 0.34, 0);
  profile.lineTo(0.5, 0);
  profile.lineTo(0.5, 0.29);
  profile.quadraticCurveTo(0, 1.58, -0.5, 0.29);
  profile.closePath();
  return new T.ExtrudeGeometry(profile, { depth: 1, bevelEnabled: false, curveSegments: 20 })
    .translate(0, 0, -0.5)
    .rotateY(Math.PI / 2);
}

export function gable() {
  const end = new T.Shape();
  end.moveTo(-0.5, -0.5);
  end.lineTo(0, 0.5);
  end.lineTo(0.5, -0.5);
  end.closePath();
  return new T.ExtrudeGeometry(end, { depth: 1, bevelEnabled: false })
    .translate(0, 0, -0.5)
    .rotateY(Math.PI / 2);
}

// Open double-ended hull, wider at the gunwales. The bow and stern turn
// upward above the waterline, leaving the seats visible from the street.
export function hull() {
  const vertices: number[] = [],
    triangles: number[] = [];
  for (let i = 0; i <= 24; i++) {
    const u = i / 12 - 1,
      halfBeam = 0.5 * (1 - u * u);
    const sheer = 0.36 + 0.7 * Math.pow(Math.abs(u), 4);
    for (const [width, y] of [
      [-1, sheer],
      [-0.72, 0.1],
      [0, -0.12],
      [0.72, 0.1],
      [1, sheer],
    ]) {
      vertices.push(u * 0.5, y, width * halfBeam);
    }
    if (i === 0) continue;
    const base = (i - 1) * 5;
    for (let j = 0; j < 4; j++) {
      const a = base + j;
      triangles.push(a, a + 5, a + 1, a + 1, a + 5, a + 6);
    }
  }
  return surface(vertices, triangles);
}

// Square plan, with the break in pitch and short flat ridge of a mansard.
export function mansard() {
  const vertices: number[] = [], indices: number[] = [];
  for (const [y, x, z] of [[-0.5, 0.5, 0.5], [0.33, 0.4, 0.32], [0.5, 0.34, 0.21]]) {
    vertices.push(-x, y, -z, x, y, -z, x, y, z, -x, y, z);
  }
  for (let ring = 0; ring < 2; ring++) {
    for (let i = 0; i < 4; i++) {
      const a = ring * 4 + i, b = ring * 4 + (i + 1) % 4;
      indices.push(a, a + 4, b, b, a + 4, b + 4);
    }
  }
  indices.push(8, 11, 10, 8, 10, 9);
  const g = surface(vertices, indices).toNonIndexed();
  g.computeVertexNormals();
  return g;
}

// Solid spandrel with a clear semicircular opening and two narrow piers.
export function arcade() {
  const shape = new T.Shape();
  shape.moveTo(-0.5, 0);
  shape.lineTo(-0.36, 0);
  shape.lineTo(-0.36, 0.54);
  shape.bezierCurveTo(-0.36, 1.02, 0.36, 1.02, 0.36, 0.54);
  shape.lineTo(0.36, 0);
  shape.lineTo(0.5, 0);
  shape.lineTo(0.5, 1);
  shape.lineTo(-0.5, 1);
  shape.closePath();
  return new T.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false, curveSegments: 12 })
    .translate(0, 0, -0.5);
}

// Mark just the open and creased edges. Each component interpolates to zero
// on one edge of a triangle. Smooth dome facets keep their continuous wash.
export function inkCreases(source: T.BufferGeometry) {
  const edges = new T.EdgesGeometry(source, 27);
  const positions = edges.getAttribute("position");
  const vertexKey = (p: T.BufferAttribute | T.InterleavedBufferAttribute, i: number) =>
    [p.getX(i), p.getY(i), p.getZ(i)].map(v => Math.round(v * 10000)).join(",");
  const pair = (a: string, b: string) => a < b ? a + "/" + b : b + "/" + a;
  const marked = new Set<string>();
  for (let i = 0; i < positions.count; i += 2)
    marked.add(pair(vertexKey(positions, i), vertexKey(positions, i + 1)));
  edges.dispose();
  const g = source.index ? source.toNonIndexed() : source;
  if (g !== source) source.dispose();
  const vertices = g.getAttribute("position"), bary = [];
  for (let i = 0; i < vertices.count; i += 3) {
    const keys = [0, 1, 2].map(n => vertexKey(vertices, i + n));
    const ink = keys.map((_, n) => marked.has(pair(keys[(n + 1) % 3], keys[(n + 2) % 3])));
    for (let j = 0; j < 3; j++)
      bary.push(...ink.map((active, n) => !active || n === j ? 1 : 0));
  }
  g.setAttribute("crease", new T.Float32BufferAttribute(bary, 3));
  return g;
}

// A whorl of spruce branches, with a scalloped, slightly drooping skirt.
export function spruceWhorl() {
  const vertices = [0.02, 0.5, 0, 0, -0.36, 0], triangles: number[] = [];
  for (let i = 0; i < 28; i++) {
    const a = i * Math.PI / 14;
    const tip = i % 2 === 0, r = (tip ? 0.5 : 0.32) * (0.94 + 0.06 * Math.sin(i * 1.8));
    vertices.push(Math.cos(a) * r, tip ? -0.44 - 0.06 * Math.sin(i) : -0.21, Math.sin(a) * r);
    triangles.push(0, 2 + (i+1)%28, 2 + i, 1, 2 + i, 2 + (i+1)%28);
  }
  return surface(vertices, triangles);
}
