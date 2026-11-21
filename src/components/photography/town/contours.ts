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
      const fold = Math.cos(7 * a + 0.6) * 0.063 + Math.sin(3 * a) * 0.047;
      const y = [0, 0.19, 0.45, 0.64 + 0.13 * Math.cos(5 * a), 0.86, 1][level];
      const r = Math.pow(1 - y, 0.84) * (0.46 + fold);
      vertices.push(r * Math.cos(a) + 0.17 * y, y - 0.5, r * Math.sin(a) - 0.07 * y);
      if (level !== (cap ? 3 : 0)) {
        const n = vertices.length / 3 - 1,
          next = n - i + ((i + 1) % count);
        triangles.push(n - count, n, next - count, next - count, n, next);
      }
    }
  }
  return surface(vertices, triangles);
}

// A bowed palm blade, split into pointed leaflets on either side of a spine.
export function frond() {
  const vertices: number[] = [],
    triangles: number[] = [];
  for (let i = 0; i <= 22; i++) {
    const u = i / 22,
      width = Math.sin(Math.PI * u) * (0.28 + 0.21 * (i % 2));
    const y = Math.sin(Math.PI * u) * 0.3 - u * 0.21;
    vertices.push(-width, y - 0.08, u - 0.5, 0, y, u - 0.5, width, y - 0.08, u - 0.5);
    if (i === 0) continue;
    const n = i * 3;
    triangles.push(n - 3, n, n - 2, n - 2, n, n + 1, n - 2, n + 1, n - 1, n - 1, n + 1, n + 2);
  }
  return surface(vertices, triangles);
}
