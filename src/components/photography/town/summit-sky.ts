import {
  BufferGeometry, Color, Float32BufferAttribute, InstancedMesh, Matrix4, Mesh,
  MeshBasicMaterial, MeshLambertMaterial, OctahedronGeometry,
} from "three";
import type { Model } from "./model";

// A shallow scalloped shell. The pale crowns roll down to a blue-grey,
// feathered skirt. The road and vehicles clip the shell in world space.
function cloudRoll(phase: number) {
  const positions: number[] = [], colors: number[] = [], indices: number[] = [];
  const rings = 28, sides = 12;
  const tint = new Color(), crown = new Color("#ecf3f5"), base = new Color("#96aabc");
  for (let i = 0; i <= rings; i++) {
    const u = i / rings, x = 2 * u - 1;
    const taper = Math.sqrt(Math.max(0, 1 - x * x));
    for (let j = 0; j < sides; j++) {
      const a = 2 * Math.PI * j / sides, y = Math.sin(a), z = Math.cos(a);
      const billow = 0.77 + 0.18 * Math.cos(17 * u + phase + 1.2 * z) + 0.09 * Math.cos(33 * u - z);
      const height = y > 0 ? y * billow : y * 0.32;
      positions.push(x, taper * height, taper * z * billow + 0.14 * Math.sin(7 * u + phase));
      tint.copy(base).lerp(crown, Math.min(1, Math.max(0, 0.48 + 0.56 * y + 0.1 * billow)));
      colors.push(tint.r, tint.g, tint.b, taper * (0.71 + 0.26 * Math.max(0, y)));
      if (i === rings) continue;
      const left = i * sides + j, next = i * sides + (j + 1) % sides;
      indices.push(left, left + sides, next, next, left + sides, next + sides);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 4));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function summitSky(m: Model) {
  const sky = m.group(0, 0, 0);
  const mist = new MeshLambertMaterial({ vertexColors: true, transparent: true, depthWrite: false });
  // Overlapping shoals across the lower switchback. Keep a clear approach
  // below them and let the grade carry each roof out above the deck.
  const banks = [
    [-3.08, 1.43, 2.83, 1.95, 0.47, 1.02, -0.21],
    [-0.03, 1.49, 2.49, 2.53, 0.55, 1.15, 0.22],
    [2.94, 1.45, 2.12, 1.85, 0.44, 0.94, 0.39],
    [-2.11, 1.36, 3.55, 2.31, 0.39, 0.94, -0.31],
    [1.50, 1.43, 2.99, 1.42, 0.38, 0.77, 0.21],
    [-3.21, 1.26, 4.06, 1.36, 0.21, 0.55, -0.08],
  ].map(([x, y, z, width, height, depth, turn], i) => {
    const mesh = new Mesh(cloudRoll(i * 1.71), mist);
    mesh.position.set(x, y, z);
    mesh.rotation.y = turn;
    mesh.scale.set(width, height, depth);
    sky.add(mesh);
    return { mesh, x, z };
  });

  // Tiny solid flecks read from either side when the visitor orbits.
  const stars = [
    [-3.9, 4.9, -1.8, .026], [-3.3, 5.62, -2.65, .042], [-2.78, 5.34, -3.12, .021],
    [-2.29, 5.89, -2.97, .032], [-1.62, 5.08, -3.86, .024], [-.96, 5.72, -2.2, .041],
    [-.45, 6.14, -3.08, .023], [.36, 5.25, -3.47, .029], [1.12, 5.82, -3.64, .038],
    [1.78, 5.39, -3.14, .021], [2.36, 5.59, -2.46, .026], [3.32, 4.94, -3.25, .033],
  ];
  const ink = new MeshBasicMaterial({ color: "#e4e2cc", transparent: true, depthWrite: false });
  const field = new InstancedMesh(new OctahedronGeometry(1), ink, stars.length);
  const matrix = new Matrix4();
  stars.forEach(([x, y, z, r], i) => {
    field.setMatrixAt(i, matrix.makeScale(r, 1.42 * r, r).setPosition(x, y, z));
  });
  sky.add(field);
  m.choreographies.push(t => {
    for (const [i, { mesh, x, z }] of banks.entries()) {
      const phase = t * 0.12 + i * 0.58;
      mesh.position.x = x + 0.57 * Math.sin(phase);
      mesh.position.z = z + 0.12 * Math.sin(phase * 0.77);
    }
    ink.opacity = 0.83 * Math.max(0, 1 - 1.75 * m.wash.value);
    field.visible = ink.opacity > 0.001;
  });
  m.onDispose.push(() => {
    for (const { mesh } of banks) mesh.geometry.dispose();
    mist.dispose();
    field.geometry.dispose();
    ink.dispose();
  });
}
