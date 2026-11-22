import { travel } from "./motion";
import type { Model } from "./model";

const ivory = "#f1e6d3", bronze = "#527269", sandstone = "#cfbfa6";

// Gate leaves meet upstream in a V. The balance beams project over the towpath.
export function georgetownLock({ form, beam, sign }: Model) {
  const z = 3.95;
  form("lagoon", 0, 0.1, z, 10.62, 0.055, 1.48, "#83ada8");
  for (const bank of [-1, 1])
    form("masonry", 0, 0.21, z + bank * 0.8, 10.64, 0.35, 0.22, sandstone);
  for (const x of [-2.55, 2.1]) {
    for (const side of [-1, 1]) {
      for (const y of [0.21, 0.37, 0.53])
        beam([x, y, z + side * 0.75], [x + 0.28, y, z], 0.18, "#6d5946");
      beam([x - 0.3, 0.68, z + side * 1.29], [x + 0.27, 0.68, z], 0.11, "#514e40");
      form("drum", x, 0.49, z + side * 0.73, 0.12, 0.77, 0.12, "#464c48");
    }
  }
  form("planks", 3.83, 0.49, z, 0.83, 0.12, 2.35, "#a68761");
  for (const x of [3.46, 4.2]) {
    for (const dz of [-1, 0, 1]) form("box", x, 0.76, z + dz, 0.06, 0.58, 0.06, bronze);
    form("box", x, 1.03, z, 0.07, 0.08, 2.11, bronze);
  }
  // Ground paddles and handwheels on the gate leaves.
  for (const x of [-2.55, 2.1]) {
    form("box", x + 0.08, 0.44, z + 0.52, 0.13, 0.63, 0.19, "#646457");
    form("rim", x + 0.08, 0.83, z + 0.52, 0.32, 0.32, 0.29, bronze);
    for (const angle of [0, Math.PI / 3, 2 * Math.PI / 3])
      form("box", x + 0.08, 0.83, z + 0.52, 0.026, 0.27, 0.026, bronze, undefined, 0, 0, angle);
  }
  sign("LOCK 3", -1.7, 0.49, 4.87, 0.88, 0.32, bronze);
}

export function lincolnMemorial({ form, beam }: Model) {
  const z = -3.85;
  for (let i = 0; i < 5; i++)
    form("box", 0, 0.14 + i * 0.095, z + 0.32 - i * 0.08, 4.35 - i * 0.1, 0.12, 2.51 - i * 0.16, ivory);
  form("masonry", 0, 1.21, z - 0.43, 2.86, 1.32, 0.34, "#ac9e89");
  for (const x of [-0.96, 0, 0.96]) {
    form("box", x, 1.23, z - 0.24, 0.7, 1.24, 0.045, "#817a6c");
    form("box", x, 1.24, z - 0.21, 0.54, 1.06, 0.043, "#655f57");
  }
  // The central seated figure is visible through the east colonnade.
  form("box", 0, 0.76, z, 0.52, 0.42, 0.47, ivory);
  form("box", 0, 1.06, z - 0.08, 0.39, 0.5, 0.29, ivory);
  form("round", 0, 1.41, z - 0.08, 0.24, 0.29, 0.23, ivory);
  for (const side of [-1, 1]) {
    form("box", side * 0.13, 0.79, z + 0.25, 0.17, 0.42, 0.27, ivory);
    form("box", side * 0.24, 0.89, z + 0.05, 0.12, 0.43, 0.39, ivory);
    beam([side * 0.16, 1.21, z - 0.07], [side * 0.23, 1.09, z + 0.17], 0.12, ivory);
    for (let i = 0; i < 8; i++) {
      const x = -1.66 + i * 0.475, cz = z + side * 0.78;
      form("drum", x, 1.28, cz, 0.2, 1.43, 0.2, ivory);
      form("drum", x, 1.94, cz, 0.27, 0.12, 0.27, ivory);
      form("box", x, 1.99, cz, 0.28, 0.07, 0.28, ivory);
      for (let flute = 0; flute < 7; flute++) {
        const a = flute * Math.PI * 2 / 7;
        form("drum", x + 0.091 * Math.cos(a), 1.26, cz + 0.091 * Math.sin(a), 0.019, 1.2, 0.019, "#c8bfae");
      }
    }
    for (const dz of [-0.27, 0.27])
      form("drum", side * 1.66, 1.28, z + dz, 0.2, 1.43, 0.2, ivory);
  }
  form("masonry", 0, 2.07, z, 3.81, 0.26, 1.94, ivory);
  form("box", 0, 2.27, z, 3.96, 0.14, 2.04, ivory);
  form("box", 0, 2.46, z, 3.38, 0.28, 1.59, "#e1d4bd");
  for (let i = 0; i < 18; i++)
    form("box", -1.74 + i * 0.205, 2.09, z + 0.98, 0.077, 0.17, 0.047, "#d0c3ae");
}

export function bartholdiFountain({ form }: Model) {
  const x = 0.52, z = 4.12;
  form("drum", x, 0.18, z, 2.06, 0.2, 2.06, sandstone);
  form("drum", x, 0.29, z, 1.86, 0.04, 1.86, "#92c5c4");
  form("drum", x, 0.62, z, 0.31, 0.69, 0.31, bronze);
  for (let i = 0; i < 3; i++) {
    const a = i * Math.PI * 2 / 3;
    form("leaf", x + 0.22 * Math.sin(a), 0.68, z + 0.22 * Math.cos(a), 0.2, 0.59, 0.21, bronze);
  }
  form("round", x, 0.98, z, 1.22, 0.25, 1.22, bronze);
  form("drum", x, 1.22, z, 0.17, 0.47, 0.17, bronze);
  form("round", x, 1.46, z, 0.57, 0.13, 0.57, bronze);
  form("drum", x, 1.59, z, 0.18, 0.2, 0.18, bronze);
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    form("round", x + 0.58 * Math.sin(a), 1.12, z + 0.58 * Math.cos(a), 0.11, 0.13, 0.11, "glass");
  }
}

export function piazzaDuomo({ form, group, beam }: Model) {
  const marble = "#71877c", tile = "#bd6147";
  const cx = -2.26, cz = -1.82;
  // The cathedral stretches from the crossing drum to the west doors and Baptistery.
  form("masonry", -0.49, 1.13, cz, 3.67, 2.1, 1.62, ivory);
  form("gable", -0.56, 2.44, cz, 3.85, 0.67, 1.89, tile);
  for (const side of [-1, 1]) {
    form("box", -0.48, 0.92, cz + side * 0.9, 3.58, 1.72, 0.47, ivory);
    for (const y of [0.36, 1.13, 1.71])
      form("box", -0.48, y, cz + side * 0.91, 3.66, 0.085, 0.51, marble);
  }
  for (const [dx, dz] of [[-0.86, 0], [0, 0.83], [0, -0.83]]) {
    form("octagon", cx + dx, 1.03, cz + dz, 1.68, 1.97, 1.68, ivory);
    form("octagonalRoof", cx + dx, 2.26, cz + dz, 1.84, 0.55, 1.84, tile);
  }
  form("octagon", cx, 2.15, cz, 2.72, 2.44, 2.72, ivory);
  form("octagon", cx, 3.35, cz, 2.78, 0.14, 2.78, marble);
  form("cupola", cx, 3.42, cz, 2.76, 1.98, 2.76, tile);
  const rib = [[1.38, 3.42], [1.27, 3.97], [1.02, 4.53], [0.635, 5.04], [0.22, 5.4]];
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    const points = rib.map(([r, y]) => [cx + r * Math.sin(a), y, cz + r * Math.cos(a)]);
    for (let j = 1; j < points.length; j++) beam(points[j - 1], points[j], 0.071, ivory);
    const b = a + Math.PI / 8;
    const bay = group(cx + 1.26 * Math.sin(b), 2.84, cz + 1.26 * Math.cos(b));
    bay.rotation.y = b;
    form("round", 0, 0, 0, 0.4, 0.4, 0.08, marble, bay);
    form("round", 0, 0, 0.04, 0.28, 0.28, 0.06, "glass", bay);
  }
  form("octagon", cx, 5.61, cz, 0.42, 0.44, 0.42, ivory);
  form("octagonalRoof", cx, 5.97, cz, 0.5, 0.33, 0.5, ivory);
  form("round", cx, 6.21, cz, 0.17, 0.17, 0.17, "#c89c4d");

  const tower = group(1.35, 0.06, -0.5);
  form("box", 0, 2.12, 0, 0.95, 4.24, 0.95, ivory, tower);
  for (const y of [0.27, 0.94, 1.72, 2.51, 3.34, 4.18])
    form("box", 0, y, 0, 1.03, 0.1, 1.03, marble, tower);
  for (let i = 0; i < 4; i++) {
    const face = group(0, 0, 0, tower);
    face.rotation.y = i * Math.PI / 2;
    for (const x of [-0.39, 0.39])
      form("box", x, 2.19, 0.48, 0.067, 3.93, 0.043, "#bf9682", face);
    for (const y of [2.12, 2.92, 3.76]) {
      for (const x of [-0.14, 0.14]) {
        form("box", x, y, 0.484, 0.19, 0.47, 0.04, "#51676a", face);
        form("round", x, y + 0.22, 0.487, 0.19, 0.21, 0.04, "#51676a", face);
      }
    }
  }
  form("box", 0, 4.36, 0, 1.22, 0.19, 1.22, ivory, tower);
  form("box", 0, 4.47, 0, 0.95, 0.05, 0.95, marble, tower);
  for (const [y, h, w, color] of [
    [1.06, 2, 2.22, ivory], [0.37, 0.1, 2.26, marble], [1.03, 0.12, 2.26, marble],
    [1.87, 0.12, 2.26, marble],
  ] as const) form("octagon", 3.61, y, cz, w, h, w, color);
  for (let i = 0; i < 8; i++) {
    const a = (i + 0.5) * Math.PI / 4;
    const face = group(3.61 + 1.03 * Math.sin(a), 0, cz + 1.03 * Math.cos(a));
    face.rotation.y = a;
    for (const dx of [-0.32, 0, 0.32])
      form("box", dx, 1.43, 0, 0.046, 0.65, 0.065, marble, face);
    form("box", 0, 0.62, 0, 0.39, 0.79, 0.05, i % 2 ? marble : "#9d8869", face);
    for (const dx of [-0.12, 0.12])
      form("box", dx, 1.47, 0.012, 0.11, 0.26, 0.035, marble, face);
  }
  form("octagonalRoof", 3.61, 2.39, cz, 2.43, 0.69, 2.43, ivory);
  form("octagon", 3.61, 2.8, cz, 0.4, 0.23, 0.4, ivory);
  form("octagonalRoof", 3.61, 2.99, cz, 0.49, 0.22, 0.49, marble);
}

// Shop ranges step up the single stone span. The cross passage is left open at the crown.
export function rialtoShops({ form, group }: Model, x: number, z: number) {
  for (const side of [-1, 1]) {
    const row = group(x + side * 0.57, 0, z);
    for (const bank of [-1, 1]) {
      for (let i = 1; i <= 4; i++) {
        const dz = bank * (0.43 + i * 0.47);
        const y = 1.29 - 0.083 * dz * dz;
        form("masonry", 0, y + 0.38, dz, 0.49, 0.81, 0.48, ivory, row);
        form("box", side * 0.25, y + 0.34, dz, 0.04, 0.58, 0.32, "#526a63", row);
        form("arcade", side * 0.284, y + 0.04, dz, 0.49, 0.72, 0.085, ivory, row, 0, Math.PI/2);
        form("slate", 0, y + 0.83, dz, 0.63, 0.12, 0.51, "#a66e58", row, bank * 0.21);
      }

    }
    form("arcade", 0, 1.28, 0, 1.12, 1.25, 0.5, ivory, row, 0, Math.PI/2);
    form("box", 0, 2.48, 0, 0.54, 0.15, 1.03, ivory, row);
    form("gable", 0, 2.69, 0, 0.62, 0.3, 1.16, ivory, row);
  }
}

// Four inclined piers surround an open esplanade. Build a face at a time so
// the arch, tapering lattice bays and balconies meet around all four corners.
export function eiffelTower({ group, form, beam, choreographies }: Model) {
  const tower = group(0, 0.07, -0.51);
  const iron = { floodlit: "#54616a" }, edge = "#947862", trim = { floodlit: "#b39a79" }, cab = "#ab5446";
  form("setts", 0, 0.018, 0, 3.75, 0.036, 3.75, "#d9cbb7", tower);
  const levels = [[0.18, 1.46], [0.77, 1.27], [1.52, 0.93], [2.14, 0.67],
    [2.68, 0.49], [3.34, 0.32], [4.04, 0.22], [4.82, 0.15], [5.62, 0.105]];
  for (let i = 0; i < 4; i++) {
    const face = group(0, 0, 0, tower);
    face.rotation.y = i * Math.PI / 2;
    form("masonry", 1.31, 0.14, 1.31, 0.64, 0.28, 0.64, "#c4b19a", face);
    for (let j = 1; j < levels.length; j++) {
      const [y, r] = levels[j - 1], [top, next] = levels[j];
      const width = Math.min(0.36, r * 0.57), endWidth = Math.min(0.36, next * 0.57);
      const left = j >= 5 ? -r : r - width, endLeft = j >= 5 ? -next : next - endWidth;
      beam([r, y, r], [next, top, next], j < 5 ? 0.094 : 0.057, iron, face);
      if (j < 5) {
        beam([left, y, r], [endLeft, top, next], 0.064, iron, face);
        // Return flange of the same pier on its adjacent face.
        beam([r, y, left], [next, top, endLeft], 0.064, iron, face);
        beam([r, y, left], [next, top, next], 0.045, edge, face);
        beam([r, y, r], [next, top, endLeft], 0.045, edge, face);
      }
      beam([left, y, r], [next, top, next], 0.043, edge, face);
      beam([r, y, r], [endLeft, top, next], 0.043, edge, face);
      beam([endLeft, top, next], [next, top, next], 0.039, iron, face);
    }
    // The decorative arch spans the two piers beneath the first gallery.
    const archPoint = (x: number) => {
      const y = 0.34 + 0.99 * Math.sqrt(Math.max(0, 1 - (x / 1.29) ** 2));
      return [x, y, 1.47 - y * 0.31];
    };
    for (let j = 0; j < 12; j++) {
      const x = 1.29 * (j / 6 - 1);
      const a = archPoint(x), b = archPoint(x + 1.29 / 6);
      beam(a, b, 0.084, iron, face);
      if (Math.abs(x) < 0.91) beam(a, [x, 1.51, 0.95], 0.042, edge, face);
    }
    for (const [y, r] of [[1.53, 1.09], [2.71, 0.65], [5.64, 0.27]]) {
      form("box", 0, y, r - 0.12, 2 * r, 0.105, 0.24, iron, face);
      form("box", 0, y + 0.17, r, 2 * r, 0.034, 0.034, trim, face);
      if (y < 3) {
        for (const x of [-0.72 * r, 0, 0.72 * r])
          form("box", x, y - 0.018, r + 0.005, 0.065, 0.027, 0.018, "glass", face);
      }
      for (let j = -3; j <= 3; j++)
        form("box", r * j / 3, y + 0.10, r, 0.026, 0.15, 0.026, edge, face);
    }
    form("box", 0, 2.86, 0.42, 0.91, 0.19, 0.20, iron, face);
    for (const x of [-0.30, 0, 0.30])
      form("box", x, 2.87, 0.525, 0.24, 0.12, 0.018, "glazing", face);
    if (i === 1) {
      // A stair approach tucked into the foot of the south pier.
      for (let j = 0; j < 5; j++) {
        const h = 0.055 * (j + 1);
        form("masonry", 1.30, 0.036 + h / 2, 1.84 - j * 0.093, 0.36, h, 0.105, sandstone, face);
      }
    }
    if (i % 2 === 0) {
      // Recessed glazed first-floor pavilions leave the central well open.
      form("box", 0, 1.73, 0.75, 1.32, 0.29, 0.35, cab, face);
      for (let j = -2; j <= 2; j++)
        form("box", j * 0.25, 1.75, 0.936, 0.215, 0.17, 0.022, "glazing", face);
      form("box", 0, 1.9, 0.75, 1.39, 0.052, 0.41, edge, face);
      // Twin guide rails and a level, windowed lift car inside the inclined leg.
      for (const dx of [-0.10, 0.10])
        beam([1.27 + dx, 0.28, 1.29], [0.41 + dx, 2.63, 0.44], 0.038, iron, face);
      const lift = group(0, 0, 0, face);
      lift.userData.moving = true;
      form("box", 0, 0, 0, 0.29, 0.26, 0.3, cab, lift);
      form("box", 0, 0.035, 0.152, 0.22, 0.08, 0.015, "glass", lift);
      form("box", 0.148, 0.035, 0, 0.015, 0.08, 0.23, "glass", lift);
      choreographies.push(t => {
        // The two cars load at different times and dwell at each gallery.
        const cycle = (t + i * 4.3) % (30 + i * 1.7);
        const u = travel((cycle - 2) / 10) - travel((cycle - 16) / 10);
        lift.position.set(1.27 - 0.86 * u, 0.43 + 2.15 * u, 1.29 - 0.85 * u);
      });
    }
  }
  form("octagon", 0, 5.78, 0, 0.39, 0.22, 0.39, "glazing", tower);
  form("octagonalRoof", 0, 5.94, 0, 0.51, 0.14, 0.51, edge, tower);
  form("drum", 0, 6.21, 0, 0.057, 0.58, 0.057, iron, tower);
  for (const y of [6.04, 6.14, 6.24]) form("drum", 0, y, 0, 0.117, 0.035, 0.117, trim, tower);
  form("masonry", -1.01, 0.27, 1.62, 0.24, 0.48, 0.22, sandstone, tower);
  form("round", -1.01, 0.57, 1.62, 0.25, 0.16, 0.13, bronze, tower);
  form("round", -1.01, 0.69, 1.62, 0.126, 0.16, 0.13, bronze, tower);
}
