import { hillside } from "./landscape";
import type { Model } from "./model";

// A compressed summit precinct. The domes sit on a shoulder, leaving the
// russet puʻu above them clear. The road enters at the Kona-facing edge.
export function maunakea(m: Model) {
  const { form, group, sign } = m;
  const cones = [
    [1.65, -2.35, 2.1, 1.8],
    [-0.58, -3.12, 1.24, 1.09],
    [-3.2, 1.3, 1.2, 1.46],
  ];
  function coneRise(x: number, z: number) {
    let h = 0;
    for (const [cx, cz, r, top] of cones) {
      const d = Math.hypot(x - cx, (z - cz) * 1.12) / r;
      h += top * Math.max(0, 1 - d) - top * 0.78 * Math.max(0, 1 - d / 0.43);
    }
    return h;
  }
  const { height, lane } = hillside(
    m,
    (x, z) => 1.5 + 0.63 * Math.cos(x * 0.32) - 0.19 * z + coneRise(x, z),
    "#bc927d",
    (x, z) => {
      const scatter = coneRise(x, z) + 0.09 * Math.sin(x * 2.1 + z) + 0.05 * Math.cos(z * 3.2 - x);
      if (scatter > 0.57) return "#a46c59";
      if (scatter > 0.24) return "#b17c69";
      return scatter > 0.07 ? "#ba907a" : "#bd9985";
    },
  );
  const road = (z: number) => -0.8 + 2.55 * Math.sin(z * 0.94 - 0.1);
  lane(road, -2.15, 5.31, 0.7, "#c7b7a8");
  lane((x) => 1.45 - 0.32 * (x - road(1.45)), road(1.45), 2.76, 0.4, "#c7b7a8", "x");
  for (const [x, z, r] of [
    [-3.01, -2.0, 0.81],
    [-1.47, -1.65, 0.66],
    [2.76, 0.64, 0.48],
  ]) {
    const y = height(x, z);
    const dome = group(x, y, z);
    form("octagon", 0, 0.035, 0, 2.02 * r, 0.75 * r, 2.02 * r, "#a6a7a2", dome);
    form("drum", 0, 0.43 * r, 0, 1.92 * r, 0.59 * r, 1.92 * r, "#dbdbca", dome);
    form("drum", 0, 0.73 * r, 0, 2 * r, 0.1 * r, 2 * r, "#637583", dome);
    form("cupola", 0, 0.78 * r, 0, 2 * r, 0.92 * r, 2 * r, "#f1eee1", dome);
    form("box", -0.76 * r, 0.18 * r, -0.45 * r, 1.2 * r, 0.59 * r, 0.84 * r, "#b9b6aa", dome);
    form("box", -0.76 * r, 0.5 * r, -0.45 * r, 1.25 * r, 0.08 * r, 0.88 * r, "#8e9899", dome);
    for (const side of [-1, 1]) {
      form(
        "box",
        side * 0.46 * r,
        0.38 * r,
        0.79 * r,
        0.29 * r,
        0.29 * r,
        0.075 * r,
        "#657984",
        dome,
        0,
        side * 0.45,
      );
    }
    // Shutter follows the meridian over the dome.
    for (let i = 0; i < 9; i++) {
      const a = (i * Math.PI) / 18,
        b = ((i + 1) * Math.PI) / 18;
      m.beam(
        [0, r * (0.79 + 0.93 * Math.sin(a)), r * Math.cos(a)],
        [0, r * (0.79 + 0.93 * Math.sin(b)), r * Math.cos(b)],
        0.092 * r,
        "#6c777c",
        dome,
      );
    }
  }
  for (let i = 0; i < 126; i++) {
    const x = 4.9 * Math.sin(i * 17.7),
      z = 4.8 * Math.sin(i * 4.11);
    if (Math.abs(x - road(z)) < 0.48) continue;
    const w = 0.09 + 0.19 * (0.5 + 0.5 * Math.sin(i * 2.7));
    form(
      "basalt",
      x,
      height(x, z) + 0.025,
      z,
      w,
      0.49 * w,
      0.79 * w,
      ["#855e53", "#998273", "#b08169"][i % 3],
      undefined,
      0.1,
      i,
    );
  }
  const z = 3.74,
    x = road(z) + 0.98,
    y = height(x, z);
  for (const dx of [-0.45, 0.45]) form("box", x + dx, y + 0.32, z, 0.068, 0.8, 0.064, "#72584a");
  sign("MAUNA KEA", x, y + 0.68, z, 1.4, 0.34, "#65564d");
}
