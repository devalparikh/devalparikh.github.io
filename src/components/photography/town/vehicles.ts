import { BufferGeometry, Float32BufferAttribute } from "three";
import type { Model } from "./model";

// Transverse sections give each car its own plan view, shoulder and roofline.
// x runs from tail to nose. Widths taper independently of height.
type Section = [x: number, bottom: number, top: number, halfWidth: number];
function coachwork(sections: Section[]) {
  const vertices: number[] = [],
    faces: number[] = [];
  for (const [x, low, high, w] of sections) {
    for (const [y, z] of [
      [low, -0.88],
      [low, 0.88],
      [low + (high - low) * 0.54, 1],
      [high - 0.018, 0.81],
      [high, 0],
      [high - 0.018, -0.81],
      [low + (high - low) * 0.54, -1],
    ])
      vertices.push(x, y, z * w);
  }
  const ring = 7,
    end = (sections.length - 1) * ring;
  for (let a = 0; a < end; a++) {
    const b = a % ring === ring - 1 ? a - ring + 1 : a + 1;
    faces.push(a, b + ring, b, a, a + ring, b + ring);
  }
  for (let i = 1; i < ring - 1; i++) faces.push(0, i, i + 1, end, end + i + 1, end + i);
  const mesh = new BufferGeometry();
  mesh.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  mesh.setIndex(faces);
  mesh.computeVertexNormals();
  return mesh;
}
export function vehicleShapes() {
  const shells = {
    teslaBody: coachwork([
      [-0.99, 0.17, 0.36, 0.3],
      [-0.83, 0.13, 0.46, 0.42],
      [-0.35, 0.13, 0.45, 0.45],
      [0.4, 0.13, 0.42, 0.45],
      [0.81, 0.16, 0.38, 0.41],
      [1, 0.18, 0.31, 0.33],
    ]),
    teslaRoof: coachwork([
      [-0.81, 0.39, 0.43, 0.31],
      [-0.55, 0.4, 0.61, 0.34],
      [-0.21, 0.41, 0.72, 0.35],
      [0.12, 0.4, 0.72, 0.34],
      [0.36, 0.4, 0.64, 0.33],
      [0.63, 0.38, 0.41, 0.36],
    ]),
    carreraBody: coachwork([
      [-0.94, 0.17, 0.39, 0.33],
      [-0.77, 0.14, 0.47, 0.46],
      [-0.55, 0.13, 0.48, 0.45],
      [-0.18, 0.14, 0.37, 0.41],
      [0.33, 0.14, 0.36, 0.4],
      [0.62, 0.13, 0.39, 0.43],
      [0.94, 0.17, 0.29, 0.35],
    ]),
    carreraRoof: coachwork([
      [-0.78, 0.39, 0.43, 0.3],
      [-0.51, 0.38, 0.58, 0.32],
      [-0.23, 0.36, 0.67, 0.32],
      [0.07, 0.35, 0.68, 0.32],
      [0.2, 0.35, 0.64, 0.33],
      [0.44, 0.35, 0.38, 0.34],
    ]),
    ferrariBody: coachwork([
      [-1, 0.19, 0.43, 0.39],
      [-0.74, 0.13, 0.47, 0.47],
      [-0.44, 0.13, 0.37, 0.44],
      [-0.02, 0.12, 0.32, 0.4],
      [0.5, 0.12, 0.35, 0.45],
      [0.81, 0.13, 0.29, 0.43],
      [1, 0.14, 0.21, 0.34],
    ]),
    ferrariRoof: coachwork([
      [-0.56, 0.35, 0.42, 0.34],
      [-0.32, 0.34, 0.59, 0.31],
      [-0.04, 0.32, 0.62, 0.31],
      [0.17, 0.32, 0.58, 0.29],
      [0.52, 0.31, 0.34, 0.33],
    ]),
  };
  // Split the painted roof and sail panels from the glazing along the actual
  // roof sections, so the pillars meet the rear haunches in three-quarter view.
  function roofPanels(roof: BufferGeometry, roofBay: number) {
    const indices = Array.from(roof.getIndex()!.array);
    const paint: number[] = [],
      glass: number[] = [];
    const sideTriangles = (roof.getAttribute("position").count - 7) * 6;
    for (let i = 0; i < indices.length; i += 3) {
      const bay = Math.floor(i / 42),
        face = Math.floor(i / 6) % 7;
      const crown = bay === roofBay && face >= 2 && face <= 5;
      const sail = bay <= 1 && (face === 2 || face === 5);
      const panel = i < sideTriangles && (crown || sail) ? paint : glass;
      panel.push(indices[i], indices[i + 1], indices[i + 2]);
    }
    const cap = roof.clone().setIndex(paint);
    roof.setIndex(glass);
    return cap;
  }
  return {
    ...shells,
    teslaCap: roofPanels(shells.teslaRoof, 2),
    carreraCap: roofPanels(shells.carreraRoof, 2),
    ferrariCap: roofPanels(shells.ferrariRoof, 1),
  };
}
export type Vehicle = "tesla" | "carrera" | "ferrari" | "jeep" | "estate";
export function vehicle(
  { group, form, beam }: Model,
  kind: Vehicle,
  x: number,
  y: number,
  z: number,
  color: string,
) {
  const g = group(x, y, z);
  const tire = "#333637",
    glass = "#415763",
    silver = "#c9c5b7";
  const jeep = kind === "jeep",
    estate = kind === "estate";
  const axle = jeep ? 0.56 : 0.61,
    radius = jeep ? 0.22 : 0.175;
  if (jeep || estate) {
    form("box", 0, 0.32, 0, 1.72, 0.33, 0.78, color, g);
    form("box", jeep ? -0.24 : -0.1, 0.62, 0, jeep ? 1.08 : 1.24, 0.34, 0.72, glass, g);
    form("box", jeep ? -0.24 : -0.1, 0.82, 0, jeep ? 1.14 : 1.31, 0.1, 0.8, jeep ? tire : color, g);
    for (const dx of [-0.74, -0.22, jeep ? 0.27 : 0.5]) form("box", dx, 0.63, 0, 0.055, 0.36, 0.74, color, g);
    if (jeep) {
      form("box", 0.57, 0.46, 0, 0.61, 0.16, 0.68, color, g);
      form("drum", -0.92, 0.48, 0, 0.42, 0.16, 0.42, tire, g, 0, 0, Math.PI / 2);
      for (let i = -3; i <= 3; i++) form("box", 0.869, 0.348, i * 0.048, 0.018, 0.14, 0.02, "#a4aaa4", g);
    }
  } else {
    form(`${kind}Body`, 0, 0, 0, 1, 1, 1, color, g);
    form(`${kind}Roof`, 0, 0, 0, 1, 1, 1, glass, g);
    const roof = kind === "carrera" ? 0.67 : kind === "tesla" ? 0.715 : 0.616;
    form(`${kind}Cap`, 0, 0, 0, 1, 1, 1, kind === "tesla" ? "#384951" : color, g);
    for (const side of [-1, 1]) {
      beam([-0.4, roof - 0.06, side * 0.24], [-0.73, 0.435, side * 0.31], 0.046, color, g);
      beam(
        [0.16, roof - 0.035, side * 0.25],
        [kind === "tesla" ? 0.61 : 0.43, 0.397, side * 0.33],
        0.027,
        color,
        g,
      );
      if (kind === "tesla") {
        beam([-0.12, 0.7, side * 0.27], [-0.15, 0.43, side * 0.35], 0.028, tire, g);
        for (const dx of [-0.39, 0.16]) form("box", dx, 0.397, side * 0.426, 0.09, 0.019, 0.018, silver, g);
      }
      if (kind === "carrera") {
        form("box", 0.918, 0.235, side * 0.223, 0.04, 0.061, 0.21, tire, g, 0, side * 0.15);
        form("round", 0.66, 0.374, side * 0.3, 0.43, 0.14, 0.205, color, g);
        form("round", 0.786, 0.426, side * 0.299, 0.151, 0.061, 0.145, "#f6e7bc", g, 0, 0, -0.48);
      }
      if (kind === "ferrari") {
        beam([-0.62, 0.42, side * 0.355], [-0.23, 0.35, side * 0.413], 0.058, color, g);
        form("leaf", -0.4, 0.316, side * 0.408, 0.31, 0.153, 0.052, tire, g, 0, 0, 0.38);
        form("box", -0.92, 0.382, side * 0.28, 0.13, 0.07, 0.12, "#ac3d33", g);
      }
    }
    if (kind === "carrera") form("box", -0.945, 0.346, 0, 0.024, 0.036, 0.65, "#b84841", g);
    if (kind === "ferrari")
      for (let i = 0; i < 5; i++) form("box", -0.61 - i * 0.057, 0.46, 0, 0.028, 0.022, 0.4, tire, g);
  }
  for (const side of [-1, 1]) {
    for (const dx of [-axle, axle]) {
      form("drum", dx, radius, side * 0.394, radius * 2, 0.117, radius * 2, tire, g, Math.PI / 2);
      form("drum", dx, radius, side * 0.454, radius * 1.25, 0.012, radius * 1.25, silver, g, Math.PI / 2);
      for (let i = 0; i < 3; i++)
        form("box", dx, radius, side * 0.462, 0.027, radius * 1.06, 0.012, tire, g, 0, 0, (i * Math.PI) / 3);
      form("drum", dx, radius, side * 0.471, 0.078, 0.015, 0.078, jeep ? tire : silver, g, Math.PI / 2);
      if (kind === "ferrari") form("round", dx, 0.318, side * 0.36, 0.48, 0.115, 0.21, color, g);
      if (jeep) form("box", dx, 0.416, side * 0.408, 0.51, 0.084, 0.17, tire, g);
    }
    if (kind !== "carrera")
      form(
        "round",
        jeep || estate ? 0.868 : kind === "tesla" ? 0.903 : 0.82,
        jeep || estate ? 0.408 : kind === "tesla" ? 0.354 : 0.294,
        side * 0.293,
        jeep || estate ? 0.032 : 0.16,
        jeep ? 0.11 : 0.045,
        jeep ? 0.11 : 0.13,
        "#f9e9bc",
        g,
      );
    form("round", 0.23, jeep || estate ? 0.58 : 0.424, side * 0.424, 0.108, 0.069, 0.087, color, g);
  }
  return g;
}
