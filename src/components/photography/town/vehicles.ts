import type { Model } from "./model";
import { fitWheels, utilityWheels } from "./wheels";
import { runningGear } from "./car-designs";
export { carShapes as vehicleShapes } from "./car-designs";

export type Vehicle = "tesla" | "carrera" | "ferrari" | "jeep" | "estate";
export function vehicle(m: Model, kind: Vehicle, x: number, y: number, z: number, color: string) {
  const { group, form } = m;
  const g = group(x, y, z);
  if (kind !== "estate") {
    form(`${kind}Body`, 0, 0, 0, 1, 1, 1, color, g);
    form(`${kind}Trim`, 0, 0, 0, 1, 1, 1, "#ffffff", g);
    const { radius, axles } = runningGear(kind);
    const roll = fitWheels(m, g, radius, axles, (hub, side) =>
      form(`${kind}Wheel`, 0, 0, 0, 1, 1, 1, "#ffffff", hub, 0, side < 0 ? Math.PI : 0));
    return { body: g, roll };
  }

  const glass = "#415763",
    silver = "#c9c5b7";
  form("box", 0, 0.32, 0, 1.72, 0.33, 0.78, color, g);
  // Leave a recess behind the hinged curbside door so the passenger
  // can cross the sill and settle behind the glazing.
  form("box", -0.1, 0.62, 0.29, 1.24, 0.34, 0.14, glass, g);
  form("box", 0.23, 0.62, -0.035, 0.58, 0.34, 0.65, glass, g);
  form("box", -0.68, 0.62, -0.035, 0.08, 0.34, 0.65, glass, g);
  const door = group(-0.06, 0, -0.36, g);
  door.name = "estateDoor";
  door.userData.moving = true;
  form("box", -0.29, 0.44, -0.035, 0.58, 0.19, 0.042, color, door);
  form("box", -0.29, 0.64, 0, 0.58, 0.29, 0.046, glass, door);
  form("box", -0.49, 0.49, -0.061, 0.095, 0.025, 0.024, silver, door);
  form("box", -0.1, 0.82, 0, 1.31, 0.1, 0.8, color, g);
  for (const dx of [-0.74, -0.06, 0.5]) form("box", dx, 0.63, 0, 0.055, 0.36, 0.74, color, g);
  for (const side of [-1, 1]) {
    form("round", 0.868, 0.408, side * 0.293, 0.032, 0.045, 0.13, "#f9e9bc", g);
    form("round", 0.23, 0.58, side * 0.424, 0.108, 0.069, 0.087, color, g);
  }
  return { body: g, roll: utilityWheels(m, g, [-0.61, 0.61], 0.394, 0.175, 0.117) };
}
