// Small painted surfaces are baked into two meshes per car so traffic only
// uploads two transforms as it rounds a corner. +X is the nose and +Y is up.
import { BoxGeometry, BufferGeometry, Color, Euler, Quaternion, Float32BufferAttribute, Vector3 } from "three";

export type Point = [number, number, number];
export type Finish = string | undefined; // undefined inherits the car's body colour
const lenses = new Map([
  ["headlamp", "#d8e7e4"],
  ["runningLight", "#faf1d7"],
  ["tailLight", "#c0564e"],
]);

class Surface {
  positions: number[] = [];
  colors: number[] = [];
  indices: number[] = [];
  lamps: number[] = [];

  geometry(tinted: boolean) {
    const mesh = new BufferGeometry();
    mesh.setAttribute("position", new Float32BufferAttribute(this.positions, 3));
    if (tinted) {
      mesh.setAttribute("color", new Float32BufferAttribute(this.colors, 3));
      mesh.setAttribute("lamp", new Float32BufferAttribute(this.lamps, 1));
    }
    mesh.setIndex(this.indices);
    mesh.computeVertexNormals();
    return mesh;
  }
}

export class Coachwork {
  paint = new Surface();
  trim = new Surface();

  surface(points: Point[], indices: number[], finish?: Finish) {
    const surface = finish ? this.trim : this.paint;
    const base = surface.positions.length / 3;
    const lens = finish && lenses.get(finish);
    const color = finish && new Color(lens || finish);
    for (const p of points) {
      surface.positions.push(...p);
      if (color) {
        surface.colors.push(color.r, color.g, color.b);
        surface.lamps.push(lens ? 1 : 0);
      }
    }
    for (const i of indices) surface.indices.push(base + i);
  }

  // Orient mirrored panels towards the outside of the coachwork.
  panel(points: Point[], outward: Point, finish?: Finish) {
    // Summed edge products also handle a cap that starts with collinear sill vertices.
    const normal = new Vector3();
    for (let i = 0; i < points.length; i++) {
      const a = points[i],
        b = points[(i + 1) % points.length];
      normal.x += (a[1] - b[1]) * (a[2] + b[2]);
      normal.y += (a[2] - b[2]) * (a[0] + b[0]);
      normal.z += (a[0] - b[0]) * (a[1] + b[1]);
    }
    const flip = normal.dot(new Vector3(...outward)) < 0;
    const indices: number[] = [];
    for (let i = 1; i < points.length - 1; i++) indices.push(0, flip ? i + 1 : i, flip ? i : i + 1);
    this.surface(points, indices, finish);
  }

  box(center: Point, size: Point, finish?: Finish, rotation: Point = [0, 0, 0]) {
    const box = new BoxGeometry(...size);
    box.applyQuaternion(new Quaternion().setFromEuler(new Euler(...rotation)));
    box.translate(...center);
    const points: Point[] = [];
    const pos = box.getAttribute("position");
    for (let i = 0; i < pos.count; i++) points.push([pos.getX(i), pos.getY(i), pos.getZ(i)]);
    this.surface(points, Array.from(box.index!.array), finish);
    box.dispose();
  }

  // Loft matching transverse rings. Split at each belt to retain designed
  // creases, but share normals along the length of each curved strip.
  loft(rings: Point[][], finish?: Finish) {
    const count = rings[0].length;
    for (let j = 0; j < count; j++) {
      const points = rings.flatMap((r) => [r[j], r[(j + 1) % count]]);
      const indices: number[] = [];
      for (let i = 0; i < points.length - 2; i += 2) indices.push(i, i + 2, i + 1, i + 1, i + 2, i + 3);
      this.surface(points, indices, finish);
    }
    this.panel(rings[0], [-1, 0, 0], finish);
    this.panel(rings[rings.length - 1], [1, 0, 0], finish);
  }
}
