import type { Model } from "./model";
import type { Group } from "three";

// The front of the canvas faces the painter. All supplies share the easel's scale.
export function easel({ group, form, beam }: Model, painter: Group) {
  const stand = group(0.43, 0, 0.39, painter);
  for (const side of [-1, 1])
    beam([side * 0.31, 0, -0.07], [side * 0.08, 1.08, 0.05], 0.046, "#956c46", stand);
  beam([0, 0, 0.37], [0, 1.05, 0.045], 0.049, "#76573e", stand);
  form("planks", 0, 0.42, -0.04, 0.71, 0.045, 0.13, "#aa8053", stand);
  form("box", 0, 0.72, -0.043, 0.65, 0.56, 0.039, "#f3dfbb", stand);
  form("box", 0, 0.72, -0.065, 0.59, 0.5, 0.012, "#abcad1", stand);
  form("round", -0.17, 0.86, -0.077, 0.112, 0.112, 0.009, "#e6b85f", stand);
  form("round", 0.06, 0.63, -0.079, 0.46, 0.17, 0.01, "#829984", stand, 0, 0, -0.12);
  form("box", 0, 0.559, -0.088, 0.59, 0.174, 0.01, "#8faec0", stand);
  for (const side of [-1, 1])
    beam([side * 0.12, 0.58, -0.10], [0, 0.86, -0.10], 0.028, "#7a655b", stand);
  beam([-0.076, 0.67, -0.10], [0.076, 0.67, -0.10], 0.023, "#7a655b", stand);
}

export function picnicBlanket({ group, form, beam }: Model, x: number, z: number) {
  const rug = group(x, 0.068, z);
  form("box", 0, 0.009, 0, 2.16, 0.018, 1.53, "#c97b70", rug);
  for (let i = -4; i <= 4; i++)
    form("box", i * 0.24, 0.019, 0, 0.065, 0.002, 1.52, "#eac6aa", rug);
  for (let i = -3; i <= 3; i++)
    form("box", 0, 0.022, i * 0.23, 2.15, 0.002, 0.043, "#f3d7b4", rug);
  const basket = group(0.12, 0.023, -0.41, rug);
  form("planks", 0, 0.11, 0, 0.46, 0.22, 0.31, "#c29660", basket);
  for (const y of [0.045, 0.12, 0.218])
    form("box", 0, y, 0, 0.47, 0.023, 0.32, "#986d4d", basket);
  for (const side of [-1, 1])
    beam([side * 0.17, 0.22, 0], [side * 0.10, 0.39, 0], 0.034, "#875f43", basket);
  beam([-0.1, 0.39, 0], [0.1, 0.39, 0], 0.034, "#875f43", basket);
  form("round", 0.10, 0.26, 0.05, 0.105, 0.39, 0.11, "#dca364", basket, 0.19, 0, -0.46);
  form("drum", 0.06, 0.043, 0.23, 0.37, 0.035, 0.37, "#eee1bb", rug);
  for (const [dx, dz] of [[-0.05, 0.22], [0.06, 0.29], [0.12, 0.17]])
    form("round", dx, 0.101, dz, 0.12, 0.105, 0.12, "#b55342", rug);
  form("drum", -0.21, 0.17, -0.39, 0.125, 0.29, 0.125, "#517c79", rug);
  form("drum", -0.21, 0.33, -0.39, 0.096, 0.04, 0.096, "#e4cead", rug);
}
