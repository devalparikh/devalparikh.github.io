import type { Model } from "./model";
export { carShapes as vehicleShapes } from "./car-designs";

export type Vehicle = "tesla" | "carrera" | "ferrari" | "jeep" | "estate";
export function vehicle({ group, form }: Model, kind: Vehicle, x: number, y: number, z: number, color: string) {
  const g = group(x, y, z);
  if (kind !== "estate") {
    form(`${kind}Body`, 0, 0, 0, 1, 1, 1, color, g);
    form(`${kind}Trim`, 0, 0, 0, 1, 1, 1, "#ffffff", g);
    return g;
  }

  const tire = "#333637",
    glass = "#415763",
    silver = "#c9c5b7";
  form("box", 0, 0.32, 0, 1.72, 0.33, 0.78, color, g);
  form("box", -0.1, 0.62, 0, 1.24, 0.34, 0.72, glass, g);
  form("box", -0.1, 0.82, 0, 1.31, 0.1, 0.8, color, g);
  for (const dx of [-0.74, -0.22, 0.5]) form("box", dx, 0.63, 0, 0.055, 0.36, 0.74, color, g);
  for (const side of [-1, 1]) {
    for (const dx of [-0.61, 0.61]) {
      form("drum", dx, 0.175, side * 0.394, 0.35, 0.117, 0.35, tire, g, Math.PI / 2);
      form("drum", dx, 0.175, side * 0.454, 0.175 * 1.25, 0.012, 0.175 * 1.25, silver, g, Math.PI / 2);
      for (let i = 0; i < 3; i++)
        form("box", dx, 0.175, side * 0.462, 0.027, 0.175 * 1.06, 0.012, tire, g, 0, 0, (i * Math.PI) / 3);
      form("drum", dx, 0.175, side * 0.471, 0.078, 0.015, 0.078, silver, g, Math.PI / 2);
    }
    form("round", 0.868, 0.408, side * 0.293, 0.032, 0.045, 0.13, "#f9e9bc", g);
    form("round", 0.23, 0.58, side * 0.424, 0.108, 0.069, 0.087, color, g);
  }
  return g;
}
