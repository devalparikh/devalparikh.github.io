import * as T from "three";
import type { Model } from "./model";

type Point = [number, number, number];
type Grade = (x: number, z: number) => number;

// Ground, worn paths and their verges use the same survey of the hill.
// The outer bank feathers down to the pavement on all four sides.
export function hillside(m: Model, rise: Grade, turf: string, groundColor?: (x: number, z: number) => string) {
  const height: Grade = (x, z) => {
    const edge = T.MathUtils.smoothstep(5.31 - Math.max(Math.abs(x), Math.abs(z)), 0, 1.08);
    return 0.068 + edge * rise(x, z);
  };
  function patch(cols: number, rows: number, sample: (u: number, v: number) => Point, tint: string, tintAt?: (x: number, z: number) => string) {
    const vertices: number[] = [], indices: number[] = [], colors: number[] = [];
    const paint = new T.Color(tint);
    for (let j = 0; j <= rows; j++) {
      for (let i = 0; i <= cols; i++) {
        const [x, y, z] = sample(i / cols, j / rows);
        vertices.push(x, y, z);
        const wash = 0.96 + 0.045 * Math.sin(x * 1.6 + z) + 0.03 * Math.sin(z * 2.3);
        if (tintAt) paint.set(tintAt(x, z));
        colors.push(paint.r * wash, paint.g * wash, paint.b * wash);
        if (!i || !j) continue;
        const d = j * (cols + 1) + i, a = d - cols - 2;
        indices.push(a, d - 1, d, a, d, a + 1);
      }
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    m.ground(geometry);
  }
  patch(64, 64, (u, v) => {
    const x = (u - 0.5) * 10.62, z = (v - 0.5) * 10.62;
    return [x, height(x, z), z];
  }, turf, groundColor);
  // Walkers take both bearing and foot height from the painted centerline.
  const laneHeight: Grade = (x, z) => height(x, z) + 0.025;
  function lane(
    center: (along: number) => number,
    from: number,
    to: number,
    width: number | ((along: number) => number),
    color: string,
    axis: "x" | "z" = "z",
  ) {
    const point = (v: number, offset = 0): Point => {
      const along = from + v * (to - from);
      const x = axis === "z" ? center(along) + offset : along;
      const z = axis === "z" ? along : center(along) - offset;
      return [x, laneHeight(x, z), z];
    };
    patch(6, 80, (u, v) => {
      const span = typeof width === "number" ? width : width(from + v * (to - from));
      return point(v, (u - 0.5) * span);
    }, color);
    return (v: number) => point(v);
  }
  return { height, lane, laneHeight };
}
