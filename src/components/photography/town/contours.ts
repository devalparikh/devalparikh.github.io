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
