import { ease, travel } from "./motion";
import { picnicBlanket } from "./activities";
import { vehicle, type Vehicle } from "./vehicles";
import { maunakea } from "./maunakea";
import { shopCat } from "./pets";
import { hillside } from "./landscape";
import { model } from "./model";
import { streets } from "./streets";

import { eiffelTower, georgetownLock, lincolnMemorial, bartholdiFountain, piazzaDuomo, rialtoShops } from "./landmarks";
import { makaleiCart, konaCoast, oceanCourse } from "./kona";
import { neighborhood } from "./neighborhood";

const curbWidth = 10.78;
const laneWidth = 1.31;
const boulevardLane = 1.9;
export const pitch = curbWidth + 2 * laneWidth;
export const rowPitch = curbWidth + 2 * boulevardLane;
const roadHeight = -0.1;
const markingHeight = roadHeight + 0.0005;
const cream = "#f5ebd4",
  slate = "#506777",
  water = "#98c8df",
  moss = "#9bb977",
  brick = "#c36550",
  wood = "#946e4f";

export function buildTown() {
  const m = model();
  const { form, group, beam, random } = m;
  const street = streets(m);
  const { house, tree, lamp, table, patron, boat, person } = street;
  const n = neighborhood(m, street);
  const footprints: [number, number][] = [];
  let lot = m.root;
  function block(col: number, row: number, surface: string) {
    footprints.push([col * pitch, row * rowPitch]);
    lot = m.place(col * pitch, row * rowPitch);
    form("box", 0, roadHeight - 0.12, 0, pitch, 0.24, rowPitch, "#ded8cb");
    form("box", 0, -0.07, 0, curbWidth, 0.24, curbWidth, cream);
    const ground =
      surface === water
        ? "lagoon"
        : [moss, "#b1c38d", "#9cb298", "#aac180"].includes(surface)
          ? "meadow"
          : "setts";
    form(ground, 0, 0.045, 0, 10.66, 0.045, 10.66, surface);
    for (const n of [-4, -2, 0, 2, 4]) {
      form("box", n, markingHeight, rowPitch / 2 - 0.024, 0.79, 0.001, 0.046, "#f6e3ac");
      form("box", pitch / 2 - 0.024, markingHeight, n, 0.046, 0.001, 0.79, "#f6e3ac");
    }
    for (let i = 0; i < 5; i++) {
      form("box", curbWidth / 2 + (i + 0.5) * laneWidth / 5, markingHeight, 4.87, 0.12, 0.001, 0.61, "#f7f1e2");
      form("box", 4.87, markingHeight, curbWidth / 2 + (i + 0.5) * boulevardLane / 5, 0.61, 0.001, 0.17, "#f7f1e2");
    }
  }
  function flowerbed(x: number, z: number, w: number, d: number) {
    form("box", x, 0.18, z, w, 0.19, d, cream);
    form("box", x, 0.31, z, w - 0.09, 0.14, d - 0.1, "#718351");
    for (let i = 0; i < w * d * 19; i++)
      form(
        "leaf",
        x + (random() - 0.5) * (w - 0.1),
        0.42 + random() * 0.08,
        z + (random() - 0.5) * (d - 0.1),
        0.15,
        0.14,
        0.14,
        ["#f5d099", "#d98675", "#bac380"][i % 3],
      );
  }
  function mountain(x: number, z: number, h: number, w: number, snow: boolean) {
    form("ridge", x, h / 2, z, w, h, w * 0.85, snow ? "#9cabae" : "#83a171", lot, 0, 0.32);
    form("summit", x, h / 2, z, w, h, w * 0.85, snow ? "#f6f4e6" : "#8ca57b", lot, 0, 0.32);
  }
  // Georgetown shop row and the towpath café.
  block(-1, 0, "#e3d6c3");
  house(-2.45, -0.95, 2.22, 3.3, "#c87967", "#a24b43", "COFFEE", "gable");
  house(-0.13, -1.05, 2.18, 4.15, "#b9b5c6", "#536c70", "BOOKS", "oriel");
  house(2.15, -0.95, 2.13, 3.5, "#d9bd70", "#70917a", "BAKERY", "mansard");
  table(-2.5, 1.85, "#bf5445");
  table(-0.5, 2.05, "#dfae54");
  patron(-2.5, 1.85, -1, "#7c97a9", 1);
  patron(-0.5, 2.05, 1, "#b66a5c", 3);
  tree(3.05, 2.75, 2.3);
  lamp(-3.5, 3.25);
  person(-2.5, 0.65, -1, 1.65, cream, "waiter", 1);
  person(2.6, 1.55, 0.94, 2.86, "#ac5351", "baker", 6);

  n.shop(-3.7, -4.39, 2.55, 2.63, "#d9b389", slate, "PRINTS");
  n.shop(-0.98, -4.36, 2.7, 3.05, "#a5b8b2", brick, "BINDERY");
  n.shop(2.13, -4.35, 3.16, 2.47, "#e3c5a0", "#527f7c", "STUDIO");
  // The bookshop rolls a two-tier display out under the reading-room bay.
  const bookcart = group(-0.28, 0.1, 0.66);
  for (const dx of [-0.45, 0.45]) {
    form("rim", dx, 0.12, 0.14, 0.21, 0.21, 0.15, slate, bookcart);
    form("planks", dx, 0.46, 0, 0.06, 0.77, 0.34, wood, bookcart);
  }
  for (let shelf = 0; shelf < 2; shelf++) {
    const y = 0.24 + 0.37 * shelf;
    form("planks", 0, y, 0, 0.98, 0.062, 0.34, wood, bookcart);
    for (let i = 0; i < 8; i++)
      form("box", -0.35 + i * 0.097, y + 0.15, 0.01, 0.074, 0.23 + 0.06 * Math.sin(i), 0.22,
        [slate, brick, cream, "#65877a"][(i + shelf) % 4], bookcart, 0, 0, 0.05 * Math.cos(i));
  }
  form("planks", 0.45, 0.31, 0.91, 0.59, 0.48, 0.48, wood);
  shopCat(m, 0.45, 0.55, 0.91);
  n.stall(4.35, -0.45, "prints", "#548477");
  n.cycle(-3.86, 2.7, -0.25);
  georgetownLock(m);
  n.pedestrian(-1.5, 2.83);

  // The reflecting pool is a separate block from both Georgetown and the glasshouse.
  block(0, 0, moss);
  form("box", 0, 0.1, 0, 2.8, 0.07, 7.44, cream);
  form("box", 0, 0.145, -0.15, 2.14, 0.05, 3.92, water);
  form("box", 0, 0.31, 3.02, 1.24, 0.49, 1.24, cream);
  form("obelisk", 0, 2.83, 3.02, 1.31, 4.72, 1.31, "#eee3c9");
  form("spire", 0, 5.42, 3.02, 0.464, 0.48, 0.464, cream);
  for (const side of [-1, 1])
    for (let i = 0; i < 4; i++)
      tree(side * 2.85, -2.86 + i * 1.83, 1.7 + (i % 2) * 0.28, i % 2 ? "#97b47e" : "#cfad9e");
  person(-1.29, 2.9, -1.29, -0.8, "#b26246", "photographer", 5);

  lincolnMemorial(m);
  n.bench(-4.37, 0, Math.PI / 2);
  n.bench(4.37, 0, -Math.PI / 2);
  n.kiosk(-3.64, 4.25, "POST");
  n.pedestrian(0.17, 4.36);

  block(-1, -1, "#b1c38d");
  {
    const gx = 0,
      gz = -0.65;
    for (let i = 0; i < 15; i++) {
      const x = gx + (random() - 0.5) * 3.21,
        z = gz + (random() - 0.5) * 1.61,
        h = 0.64 + random() * 0.98;
      form("drum", x, h / 2, z, 0.055, h, 0.055, wood);
      form("leaf", x, h, z, 0.54, 0.63, 0.56, i % 3 ? "#678c61" : "#a5ad72", lot, 0, i);
    }
    form("box", gx, 0.77, gz, 3.65, 1.36, 2.03, "glazing");
    form("round", gx, 1.42, gz, 3.68, 2.34, 2.06, "glazing");
    form("box", gx, 0.18, gz, 3.84, 0.3, 2.15, cream);
    for (let i = 0; i <= 10; i++) {
      const x = gx - 1.78 + i * 0.356,
        arch = Math.sqrt(Math.max(0, 1 - ((x - gx) / 1.84) ** 2));
      form("box", x, 0.82, gz + 1.025, 0.057, 1.29, 0.06, cream);
      for (let k = 0; k < 8; k++) {
        const p = (k * Math.PI) / 8,
          q = ((k + 1) * Math.PI) / 8;
        beam(
          [x, 1.42 + 1.18 * arch * Math.sin(p), gz + 1.04 * arch * Math.cos(p)],
          [x, 1.42 + 1.18 * arch * Math.sin(q), gz + 1.04 * arch * Math.cos(q)],
          0.045,
          cream,
        );
      }
    }
    form("box", gx, 1.32, gz + 1.04, 3.63, 0.07, 0.08, cream);
    form("box", gx, 1.08, gz + 1.04, 3.63, 0.06, 0.08, cream);

    for (const side of [-1, 1]) {
      flowerbed(side * 2.48, 1.8, 1.35, 2.63);
      tree(side * 2.87, -2.22, 2.5);
    }
    form("box", 0, 0.1, 2.33, 1.19, 0.05, 2.95, cream);
    person(-1.12, 1.1, -1.45, 2.75, "#738d70", "gardener", 4);
  }

  n.shop(-2.94, -4.36, 3.46, 1.63, "#d3bc94", "#738b74", "NURSERY");
  for (const x of [0.76, 2.66, 4.12]) {
    form("planks", x, 0.31, -4.45, 1.26, 0.48, 1.17, wood);
    form("box", x, 0.63, -4.45, 1.33, 0.09, 1.27, "#a9c9bd", lot, 0.16);
    for (const dx of [-0.59, 0, 0.59]) form("box", x + dx, 0.69, -4.45, 0.04, 0.03, 1.24, cream, lot, 0.16);
  }
  n.stall(-3.7, 4, "flowers", moss);
  bartholdiFountain(m);
  n.pedestrian(-1.89, 4.2);

  // A Paris garden carousel gives the intersection its own moving landmark.
  block(0, -1, "#dcd5b7");
  const ride = group(-0.8, 0.08, -0.8);
  ride.userData.moving = true;
  form("drum", 0, 0.19, 0, 3.7, 0.32, 3.7, "#ab594a", ride);
  form("drum", 0, 0.39, 0, 3.6, 0.12, 3.6, cream, ride);
  form("drum", 0, 1.35, 0, 0.72, 2, 0.72, "#89a9a2", ride);
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6,
      x = 1.34 * Math.sin(angle),
      z = 1.34 * Math.cos(angle);
    form("canopyPanel", 0, 2.72, 0, 4.15, 0.91, 4.15, i % 2 ? "#e1af59" : "#fff2d5", ride, 0, angle);
    form("round", 1.94 * Math.sin(angle), 2.25, 1.94 * Math.cos(angle), 0.24, 0.22, 0.24, "glass", ride);
    if (i % 2) continue;
    form("drum", x, 1.32, z, 0.06, 1.83, 0.06, "#bb9557", ride);
    const horse = group(x, 1, z, ride);
    horse.rotation.y = angle + Math.PI / 2;
    form("round", 0, 0, 0, 0.22, 0.28, 0.51, cream, horse);
    form("round", 0, 0.17, 0.21, 0.17, 0.36, 0.19, cream, horse, -0.36);
    form("round", 0, 0.3, 0.28, 0.16, 0.16, 0.25, cream, horse);
    form("box", 0, 0.13, -0.03, 0.23, 0.055, 0.18, "#b5554d", horse);
    for (const side of [-1, 1])
      for (const leg of [-1, 1])
        beam([side * 0.07, -0.07, leg * 0.16], [side * 0.09, -0.28, leg * 0.23], 0.05, cream, horse);
    m.choreographies.push((t) => (horse.position.y = 0.93 + 0.12 * Math.sin(t * 1.9 + angle)));
  }
  form("round", 0, 3.22, 0, 0.22, 0.24, 0.22, "#be8c41", ride);
  m.choreographies.push((t) => (ride.rotation.y = t * 0.24));
  for (const side of [-1, 1]) {
    tree(side * 2.76, 2.82, 2.16, "#a2b97e");
    lamp(side * 2.85, -2.81);
  }
  flowerbed(2.66, -0.63, 1.05, 2.78);
  person(-2.56, 1.36, 0.91, 1.46, "#697f99", "photographer", 2);
  person(1.95, 1.57, 2.07, -0.8, "#ad675c", "gardener", 6);

  n.shop(-2.43, -4.41, 3.03, 2.41, "#aebfc0", "#657d89", "ATELIER");
  n.stall(1.42, -4.18, "prints", "#7195a1");
  n.stall(3.62, -4.16, "flowers", brick);
  n.bench(-3.7, 3.98);
  n.cycle(3.47, 2.97);
  person(0.15, 4.03, -0.77, 3.62, "#657c91", "artist", 5);

  // Venice, a Florentine market, and the hillside vineyards.
  block(1, -1, water);
  form("box", 0, 0.17, -1.95, 10.62, 0.29, 3.75, "#d6c5a3");
  house(-2.45, -1.62, 2.18, 3.1, "#dca172", "#b85d48", "FORNO", "palazzo", 0.31);
  house(-0.28, -1.63, 1.95, 3.66, "#d6c88b", "#728b78", "CAFFÈ", "palazzo", 0.31);
  house(1.84, -1.61, 2.06, 3.02, "#c7a39c", "#ad6550", "OSTERIA", "palazzo", 0.31);
  for (let i = 0; i < 9; i++) {
    const x = -3.44 + i * 0.85;
    const high = i % 3 === 0;
    form("drum", x, high ? 0.62 : 0.29, 0.29, 0.12, high ? 1.21 : 0.65, 0.12, high ? cream : wood);
    if (high) {
      for (const y of [0.44, 0.7, 0.96])
        form("drum", x, y, 0.29, 0.126, 0.12, 0.126, "#a95948");
      form("cone", x, 1.28, 0.29, 0.16, 0.17, 0.16, "#a95948");
    }
  }
  {
    const gondola = group(0, 0.12, 1.97);
    gondola.userData.moving = true;
    form("hull", 0, 0.1, 0, 3.18, 0.43, 0.76, "#283c42", gondola);
    form("planks", 0, 0.17, 0, 1.92, 0.09, 0.43, wood, gondola);
    for (const side of [-1, 1]) {
      for (let i = 0; i < 12; i++) {
        const point = (j: number) => {
          const u = j / 6 - 1;
          return [u * 1.59, 0.1 + 0.43 * (0.36 + 0.7 * u ** 4), side * 0.38 * (1 - u * u)];
        };
        beam(point(i), point(i + 1), 0.034, "#c9a26a", gondola);
      }
    }
    for (const x of [-0.24, 0.52]) {
      form("box", x, 0.29, 0, 0.33, 0.13, 0.53, "#9a5045", gondola);
      form("box", x - 0.14, 0.43, 0, 0.095, 0.28, 0.52, "#aa6554", gondola);
    }
    form("round", 0.49, 0.58, 0, 0.24, 0.36, 0.27, "#708c96", gondola);
    form("round", 0.49, 0.85, 0, 0.2, 0.22, 0.2, "#b48364", gondola);
    form("drum", 0.49, 0.96, 0, 0.28, 0.063, 0.29, cream, gondola);
    for (const side of [-1, 1]) beam([side * 1.12, 0.13, 0], [side * 1.48, 0.41, 0], 0.08, slate, gondola);
    form("box", -0.87, 0.31, 0, 0.18, 0.34, 0.17, slate, gondola);
    form("box", -0.87, 0.62, 0, 0.24, 0.29, 0.17, cream, gondola);
    for (let i = 0; i < 3; i++) form("box", -0.87, 0.53 + i * 0.09, 0, 0.25, 0.04, 0.18, slate, gondola);
    form("round", -0.87, 0.89, 0, 0.23, 0.24, 0.22, "#bb825d", gondola);
    form("drum", -0.87, 1.02, 0, 0.37, 0.07, 0.34, "#d9ac67", gondola);
    const oar = group(-0.86, 0.64, 0.13, gondola);
    beam([0, 0, 0], [0.58, -0.61, 0.47], 0.052, wood, oar);
    form("leaf", 0.59, -0.61, 0.47, 0.24, 0.07, 0.13, wood, oar);
    m.choreographies.push((t) => {
      gondola.position.x = 0.2 + 1.39 * Math.sin(t * 0.19);
      gondola.rotation.z = 0.022 * Math.sin(t);
      oar.rotation.y = 0.38 * Math.sin(t * 1.3);
    });
  }
  person(-2.97, -0.15, 1.9, -0.15, "#9573a1", "photographer", 6, 0.32);
  form("setts", 0, 0.22, -4.23, 10.62, 0.38, 2.15, "#d8c9ac");
  for (const [i, tint] of ["#cb9580", "#e4c579", "#b8bbb2", "#bb9d96"].entries())
    n.shop(-3.94 + i * 2.52, -4.44, 2.34, 2.65 + (i % 3) * 0.57, tint, i % 2 ? "#698579" : brick, "");
  n.laundry(-3.27);
  // A stepped stone crossing joins the back streets to the waterside promenade.
  const bx = 4.48,
    bz = 1.28,
    length = 6.04;
  form("bridge", bx, 0.17, bz, 1.65, 1.15, length, "#dabb9a");
  const bridgeTop = (t: number) => 0.53 + 3.02 * t * (1 - t);
  for (let i = 0; i <= 26; i++) {
    const u = i / 26,
      z = bz + (u - 0.5) * length;
    form("setts", bx, bridgeTop(u), z, 1.72, 0.11, 0.235, cream);
  }
  for (const side of [-1, 1])
    for (let step = 0; step < 2; step++)
      form("setts", bx, 0.365 + step * 0.086, bz + side * (length / 2 + 0.32 - step * 0.17),
        1.72, 0.13, 0.21, cream);
  rialtoShops(m, bx, bz);
  person(bx, bz - 2.8, bx, bz + 2.8, "#bb6e4e", "photographer", 3, 0, {
    route: t => {
      const u = 0.045 + 0.91 * t;
      return [bx, bridgeTop(u) + 0.055, bz + length * (u - 0.5)];
    },
  });
  n.quay(0, 4.62);
  boat(-3.94, 1.78, cream);
  n.barrel(-3.94, 4.62, 0.3);
  n.barrel(-3.41, 4.58, 0.3);
  person(-1.4, 4.5, 2.34, 4.5, "#b97d60", "hiker", 8, 0.31);

  block(1, -2, "#e4daca");
  piazzaDuomo(m);
  for (let i = 0; i < 3; i++) {
    const x = -2.42 + i * 2.28,
      z = 1.13;
    form("box", x, 0.49, z, 1.78, 0.74, 0.88, wood);
    for (const side of [-1, 1]) form("drum", x + side * 0.79, 1, z, 0.066, 1.85, 0.066, wood);
    for (let j = 0; j < 9; j++)
      form(
        "box",
        x + (j - 4) * 0.216,
        1.93,
        z,
        0.217,
        0.09,
        1.42,
        j % 2 ? cream : ["#ba514c", "#c89d49", "#618d79"][i],
        lot,
        0.12,
      );
    for (let j = 0; j < 12; j++)
      form(
        "round",
        x + ((j % 6) - 2.5) * 0.24,
        0.94,
        z + Math.floor(j / 6) * 0.22,
        0.23,
        0.21,
        0.24,
        ["#c65f4a", "#d89445", "#86a551"][i],
      );
  }
  person(0.3, -0.18, -2.25, 0.12, "#9da368", "baker", 7);
  person(1.94, 2.63, 2.61, 2.11, "#b76955", "photographer", 1);
  person(-2.5, 2.55, 2.45, 2.35, "#5d8193", "baker", 4);
  n.shop(-3.24, -4.43, 3.17, 2.78, "#d9b48c", brick, "FORNO");
  n.shop(0.17, -4.42, 3.44, 2.51, "#cebcb1", "#74877a", "CARTA");
  n.stall(-3.8, 3.7, "fruit", brick);
  n.stall(-1.58, 3.68, "flowers", moss);
  n.stall(0.65, 3.7, "prints", slate);
  n.barrel(3.4, 1.6);
  n.pedestrian(1.17, 4.52);

  block(0, -2, moss);
  // The crest levels out into a farmyard. Contour rows bow around the
  // shoulder, leaving a continuous gravel lane for the harvest crew.
  const farm = hillside(m, (x, z) =>
    Math.min(1, Math.max(0, (3.55 - z) / 6.8)) * (2.12 + 0.28 * Math.cos(x * 0.63)),
    "#a6b378");
  const farmRoad = (z: number) => 2.63 + 0.91 * Math.sin(z * 0.89);
  const farmWalk = farm.lane(farmRoad, -4.12, 5.31, 0.92, "#ddc7a0");
  farm.lane(() => -3.53, -2.73, farmRoad(-3.53), 0.58, "#ddc7a0", "x");
  person(0, 0, 0, 0, "#a75c43", "gardener", 3, 0, {
    route: t => farmWalk(0.13 + 0.78 * t), groundHeight: farm.laneHeight,
  });
  for (let i = 0; i < 5; i++) {
    const rowZ = (x: number) => -2.64 + i * 1.21 + 0.32 * Math.cos(0.64 * x + 0.18 * i);
    for (let j = 0; j < 10; j++) {
      const x = -3.91 + j * 0.58, z = rowZ(x), h = farm.height(x, z);
      form("drum", x, h + 0.39, z, 0.057, 0.78, 0.057, wood);
      if (j === 9) continue;
      const end = x + 0.58, ez = rowZ(end);
      if (i === 1 || i === 3) {
        for (let k = 0; k < 2; k++) {
          const sx = x + k * 0.29, sz = rowZ(sx) + 0.37;
          form("basalt", sx, farm.height(sx, sz) + 0.065, sz, 0.4, 0.21 + 0.045 * Math.sin(j),
            0.24, j % 3 ? "#af9f81" : "#a39378", lot, 0, j * 0.3);
        }
      }
      beam([x, h + 0.68, z], [end, farm.height(end, ez) + 0.68, ez], 0.026, slate);
      for (let k = 0; k < 3; k++) {
        const dx = x + k * 0.18, dz = rowZ(dx), y = farm.height(dx, dz);
        form("leaf", dx, y + 0.61 + 0.06 * Math.sin(j+k), dz, 0.46, 0.44, 0.47,
          ["#789159", "#939e5d", "#718951"][(k+j+i)%3], lot, 0.14, j + k);
        if (k === 1) form("leaf", dx, y + 0.44, dz + 0.17, 0.11, 0.22, 0.12, "#805e73");
      }
    }
  }
  for (let i = 0; i < 4; i++) {
    const z = -3.02 + i * 1.41, x = farmRoad(z) - 0.67, h = farm.height(x, z);
    form("drum", x, h + 0.42, z, 0.1, 0.86, 0.1, wood);
    form("leaf", x, h + 1.55, z, 0.56, 2.04 + Math.sin(i) * 0.34, 0.56,
      i % 2 ? "#58785e" : "#71885e");
  }
  const cellarY = farm.height(-2.73, -3.82);
  form("masonry", -2.73, cellarY / 2, -3.98, 2.58, cellarY, 1.69, "#bba184");
  house(-2.73, -3.98, 2.57, 1.7, "#d6b689", "#aa624d", "CANTINA", "gable", cellarY).scale.z = 0.74;
  const yard = group(0, farm.height(0.17, -4.1), 0);
  form("setts", 0.37, -0.06, -4.07, 2.37, 0.14, 1.2, "#cfb792", yard);
  // The harvest yard has a basket press, its screw and a long turning bar.
  form("drum", 0.17, 0.58, -4.1, 0.96, 0.97, 0.96, wood, yard);
  for (const y of [0.28, 0.82]) form("drum", 0.17, y, -4.1, 1, 0.083, 1, slate, yard);
  for (const x of [-0.54, 0.88]) form("planks", x, 0.91, -4.1, 0.15, 1.74, 0.19, wood, yard);
  form("planks", 0.17, 1.75, -4.1, 1.61, 0.18, 0.23, wood, yard);
  form("drum", 0.17, 1.57, -4.1, 0.12, 0.95, 0.12, slate, yard);
  beam([-0.44, 1.93, -4.17], [0.78, 1.93, -4.03], 0.09, slate, yard);
  for (const x of [-3.9, -3.31, -2.7]) n.barrel(x, 3.97);
  n.stall(0, 3.86, "fruit", "#ae8249");
  n.bench(4.31, 3.61, Math.PI / 2);

  // The Kona shore opens onto its own marina and Makalei putting green.
  block(-2, 1, water);
  form("box", -2.35, 0.16, 0, 2.9, 0.25, 7.6, "#e1c693");
  form("box", -0.19, 0.24, -2.5, 3.25, 0.17, 0.61, wood);
  for (let j = 0; j < 9; j++) form("box", 0.58, 0.23, -2.42 + j * 0.52, 0.63, 0.15, 0.49, "#b69265");
  for (const z of [-1.3, 0.1, 1.83]) boat(1.65, z, z < 0 ? cream : "#d66c52").rotation.y = 1.5;
  tree(-2.92, -2.3, 2.7, "#719261", "palm");
  tree(-2.75, 2.8, 2.98, "#619061", "palm");
  person(-1.92, -2.57, -0.19, -2.57, "#668f9c", "photographer", 8, 0.3);
  person(-2.87, -0.73, -2.6, 1.69, "#bf785e", "hiker", 2, 0.29);
  form("meadow", -4.56, 0.15, 0, 1.52, 0.25, 10.6, "#d6c692");
  n.quay(0, -4.61);
  n.kiosk(-2.97, -4.39, "TACKLE");
  for (const x of [0.6, 1.21, 1.88]) n.barrel(x, -4.67, 0.32);
  boat(3.53, -1.75, cream);
  boat(3.68, 1.33, "#c79753");
  tree(-4.55, 0.6, 3.3, "#71926b", "palm", 0.27);

  block(-2, 0, moss);
  konaCoast(m, street);
  block(-2, -1, "#b09480");
  maunakea(m);

  block(-2, 2, moss);
  for (const side of [-1, 1]) {
    form("round", side * 1.47, 0.16, side * 1.32, 3.98, 0.25, 2.92, "#b7ce83");
    form("round", side * 2.22, 0.26, side * 1.91, 1.35, 0.13, 0.78, "#e1cb96");
    const x = side * 1.21,
      z = side * 1.39;
    form("drum", x, 0.89, z, 0.048, 1.48, 0.048, cream);
    form("box", x + 0.22, 1.51, z, 0.44, 0.27, 0.035, "#bb5246");
  }
  form("round", 0.83, 0.1, -3.57, 7.41, 3, 3.04, "#86966b");
  form("basalt", 2.03, 1.35, -3.69, 2.55, 0.96, 1.73, "#89715e");
  for (let i = 0; i < 8; i++) {
    const x = -4.5 + i * 1.28;
    tree(x, -3.29 - 0.69 * Math.cos(i * 2), 2.51 + 0.48 * Math.sin(i), "#668467", "deciduous", 0.23);
  }
  for (let i = 0; i < 19; i++) {
    const x = -4.65 + i * 0.51, z = -2.57 + 0.22 * Math.sin(i * 0.4);
    form("basalt", x, 0.28, z, 0.68, 0.48, 0.5, "#69675e", lot, 0, i);
    form("basalt", x + 0.14, 0.53, z, 0.48, 0.34, 0.39, "#807c68", lot, 0, i + 1);
  }
  // A strip of mown fairway runs between the greens and a paved cart path.
  form("round", 0, 0.115, 0.08, 3.32, 0.12, 7.82, "#a8bf7c", lot, 0, 0.6);
  form("setts", -3.75, 0.096, 0.48, 0.99, 0.033, 7.31, "#c4b79b", lot, 0, 0.12);
  makaleiCart(m, person);
  // A peacock picks its way along the wooded Makalei green.
  const peacock = group(-2.7, 0.23, 0.58);
  peacock.userData.moving = true;
  form("round", 0, 0.16, 0, 0.23, 0.28, 0.42, "#48786f", peacock);
  form("round", 0, 0.31, 0.14, 0.12, 0.29, 0.13, "#407792", peacock);
  for (let i = -3; i <= 3; i++)
    form(
      "leaf",
      i * 0.075,
      0.34,
      -0.18,
      0.15,
      0.53,
      0.095,
      i % 2 ? "#4b8171" : "#668b5f",
      peacock,
      -0.3,
      0,
      -i * 0.21,
    );
  m.choreographies.push((t) => {
    peacock.position.x = -2.7 + 0.42 * Math.sin(t * 0.44);
    peacock.rotation.y = 0.6 * Math.sin(t * 0.44);
  });
  person(-1.9, -1.18, -0.72, -1.21, "#dfaa62", "golfer", 6, 0.28);
  person(1.1, 1.89, 2.24, 1.56, "#6a8d9c", "golfer", 2, 0.26);

  n.kiosk(3.45, 3.69, "MAKALEI");
  n.bench(-4.65, 2.24, Math.PI / 2);
  picnicBlanket(m, -0.75, 4.12);
  person(-1.46, 4.11, -0.15, 4.38, "#638c86", "picnicker", 2, 0.092);
  person(-0.04, 4.23, -1.46, 4.11, "#d19b52", "picnicker", 7, 0.092);

  block(-1, 2, moss);
  oceanCourse(m, street);

  // Three Swiss blocks: lake railway, alpine ridge and chalet village.
  block(2, -2, "#9cb298");
  mountain(-1.05, -0.92, 4.72, 4.43, true);
  mountain(1.35, -1.67, 3.88, 3.63, true);
  const alp = hillside(m, (x, z) =>
    (1.08 + 0.52 * Math.sin(0.59 * x - 0.36 * z)) * Math.exp(-0.22 * (z - 0.63) ** 2),
    "#9aaf84");
  const trailX = (z: number) => 1.03 + 1.09 * Math.sin(z * 1.02) + 3.91 / (1 + Math.exp(2.7 * z));
  const traverse = alp.lane(trailX, -1.48, 5.31, 0.58, "#d5c4a0");
  const trailHead = group(trailX(-1.48), alp.height(trailX(-1.48), -1.48), -1.48);
  for (let i = 0; i < 4; i++)
    form("basalt", 0.04 * Math.sin(i), 0.09 + i * 0.13, 0, 0.58 - i * 0.11,
      0.22 - i * 0.028, 0.54 - i * 0.093, i % 2 ? "#99998b" : "#858879", trailHead, 0, i);
  form("drum", 0.31, 0.71, 0, 0.068, 1.42, 0.068, wood, trailHead);
  form("box", 0.51, 1.28, 0, 0.67, 0.14, 0.045, "#eaaa42", trailHead);
  form("box", 0.18, 1.09, 0, 0.56, 0.13, 0.046, "#eaaa42", trailHead, 0, 0.68);
  for (let i = 0; i < 7; i++) {
    const x = -3.91 + i * 0.55, z = 0.87 + random() * 1.18;
    tree(x, z, 1.77 + random() * 0.66, "#688779", "pine", alp.height(x,z));
  }
  person(0, 0, 0, 0, "#b97838", "hiker", 3, 0, {
    route: t => traverse(0.03 + t * 0.94), groundHeight: alp.laneHeight,
  });
  // A cableway above the footpath, with an inclined haul rope and a glazed cabin.
  for (const side of [-1, 1]) {
    const x = side * 4.39,
      y = side > 0 ? 4.15 : 2.21;
    form("box", x, y / 2, 2.3, 0.13, y, 0.18, slate);
    form("box", x, y, 2.3, 0.19, 0.13, 0.89, slate);
  }
  for (const z of [1.96, 2.64]) beam([-4.39, 2.21, z], [4.39, 4.15, z], 0.039, slate);
  const cabin = group(0, 3.18, 2.64);
  cabin.userData.moving = true;
  form("box", 0, -0.19, 0, 0.06, 0.38, 0.065, slate, cabin);
  form("box", 0, -0.72, 0, 0.89, 0.76, 0.6, brick, cabin);
  for (const x of [-0.21, 0.21]) form("box", x, -0.59, 0, 0.35, 0.32, 0.62, "glass", cabin);
  form("box", 0, -0.32, 0, 0.97, 0.1, 0.7, cream, cabin);
  m.choreographies.push((t) => {
    cabin.position.x = 3.88 * Math.sin(t * 0.18);
    cabin.position.y = 3.18 + 0.221 * cabin.position.x;
  });
  n.chalet(-2.83, 4.18, "ALP");
  n.bench(3.26, 4.2);

  block(2, -1, "#cabc9d");
  house(-1.64, -1.39, 2.65, 1.97, "#b89168", "#aa5947", "BAHN", "gable");
  tree(2.74, -2.15, 2.91, "#69816b", "pine");
  for (let i = 0; i < 17; i++) form("box", -3.62 + i * 0.45, 0.12, 1.37, 0.13, 0.09, 0.8, wood);
  for (const z of [1.15, 1.62]) form("box", 0, 0.21, z, 7.71, 0.08, 0.07, slate);
  const tram = group(0, 0.22, 1.37);
  tram.userData.moving = true;
  form("box", 0, 0.44, 0, 2.48, 0.78, 0.75, "#b45444", tram);
  form("box", 0, 0.87, 0, 2.62, 0.13, 0.82, cream, tram);
  for (let i = 0; i < 6; i++) form("box", -0.99 + i * 0.4, 0.59, 0, 0.29, 0.37, 0.77, "glass", tram);
  for (const x of [-0.8, 0.8]) form("round", x, 0.09, 0, 0.32, 0.32, 0.76, slate, tram);
  m.choreographies.push((t) => (tram.position.x = 2.37 * Math.sin(t * 0.19)));

  person(-2.49, 0.43, 0.97, 0.45, "#b76344", "hiker", 3, 0.24);
  n.chalet(-2.96, -4.37, "POST");
  n.chalet(0.12, -4.36, "GASTHOF");
  // A sheltered platform and Swiss railway clock beside the passing railcar.
  form("setts", -0.11, 0.16, 0.29, 6.47, 0.17, 0.94, "#c1afa0");
  for (const x of [-2.8, -0.2, 2.4]) form("drum", x, 1.21, 0, 0.09, 2.05, 0.09, slate);
  form("slate", -0.2, 2.23, 0.1, 5.78, 0.13, 1.08, slate, lot, 0.11);
  const clock = group(1.61, 1.81, 0.54);
  form("box", 0, 0.28, 0, 0.08, 0.26, 0.09, slate, clock);
  form("drum", 0, 0, 0, 0.69, 0.11, 0.69, slate, clock, Math.PI / 2);
  form("drum", 0, 0, 0.06, 0.61, 0.045, 0.61, cream, clock, Math.PI / 2);
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    form("box", 0.25 * Math.sin(a), 0.25 * Math.cos(a), 0.09, 0.027, 0.068, 0.02, slate, clock, 0, 0, -a);
  }
  beam([0, 0, 0.11], [-0.14, 0.09, 0.11], 0.047, slate, clock);
  beam([0, 0, 0.11], [0.14, 0.16, 0.11], 0.035, slate, clock);
  beam([0, 0, 0.13], [0.12, -0.16, 0.13], 0.025, brick, clock);
  form("round", 0.12, -0.16, 0.13, 0.07, 0.07, 0.04, brick, clock);
  n.signal(4.58, 0.87);
  n.signal(-4.71, 1.89);
  for (const x of [-4.75, -4.3, -3.86, 3.86, 4.3, 4.75]) form("box", x, 0.12, 1.37, 0.13, 0.09, 0.8, wood);
  for (const z of [1.15, 1.62])
    for (const x of [-4.56, 4.56]) form("box", x, 0.21, z, 1.45, 0.08, 0.07, slate);
  n.bench(0, 3.71);
  n.cycle(2.38, 3.6);
  n.kiosk(-3.77, 3.57, "BILLETS");
  n.pedestrian(-1.62, 2.81);

  block(2, 0, moss);
  house(-1.61, -1.15, 2.56, 2.51, "#ad8766", "#945643", "CHALET", "gable");
  house(1.55, -1.96, 2.08, 2.11, "#c8a378", "#8f6353", "", "gable");
  tree(2.82, 1.2, 2.5, "#618065", "pine");
  tree(-3.29, 2.2, 2.16, "#70856e", "pine");
  flowerbed(0.27, 1.75, 1.81, 0.86);
  person(-1.4, 0.45, 0.47, 2.44, "#607e90", "gardener", 3);

  n.chalet(-2.74, -4.43, "LAITERIE");
  n.chalet(0.12, -4.42, "");
  n.arbor(-1.18, 4.25);
  n.cycle(3.9, 2.7);

  // Paris: ironwork, boulevard cafés, then the booksellers on the Seine.
  block(1, 0, "#aac180");
  {
    eiffelTower(m);
    form("box", 0, 0.096, 1.94, 1.37, 0.04, 3.59, "#dfcca9");
    for (const side of [-1, 1]) {
      flowerbed(side * 2.49, 1.76, 1.18, 2.48);
      tree(side * 2.73, -2.45, 2.25);
    }
    person(-0.29, 2.92, 0.42, 1.56, "#9c6054", "photographer", 7);
  }
  n.arbor(-2.58, -4.41);
  n.kiosk(2.69, -4.32, "JARDIN");
  n.stall(-3.76, 4.02, "prints", "#6b92a1");
  n.bench(2.88, 4.13);
  // They approach from opposite sides, then hold the pose for the photograph.
  person(-1.8, 3.92, -0.66, 4.04, "#73879b", "photographer", 4, 0.07, { portraitPartner: true });
  person(1.08, 4.24, 0.31, 4.14, "#c27858", "hiker", 7, 0.07, { portraitPartner: true });

  block(0, 1, "#e6d7c7");
  for (let i = 0; i < 3; i++) {
    const x = -2.4 + i * 2.37,
      h = i === 1 ? 3.72 : 3.04;
    house(
      x,
      -1.47,
      2.23,
      h,
      i === 1 ? "#d3ac91" : "#e2cca5",
      slate,
      ["BISTRO", "FLEURS", "CAFÉ"][i],
      "mansard",
    );
  }
  for (const x of [-2.42, 0, 2.42]) table(x, 1.57, x === 0 ? "#d5a448" : "#bd5e50");
  patron(-2.42, 1.57, -1, "#9e6b91", 2);
  patron(0, 1.57, 1, "#608475", 4);
  patron(2.42, 1.57, 1, "#c5784f", 6);
  lamp(-3.35, 2.94);
  lamp(3.35, 2.94);
  person(-1.52, 0.35, -1.41, 1.86, cream, "waiter", 2);
  person(2.44, 2.86, -0.78, 2.86, "#bf874a", "photographer", 7);
  n.shop(-2.96, -4.41, 3.32, 3.43, "#b4bfc2", slate, "CHAMBRES");
  n.shop(0.72, -4.39, 3.54, 3.03, "#e2c2ab", slate, "PENSION");
  n.stall(4.33, -1.08, "flowers", "#678f78");
  // A Morris column carries illustrated playbills beside the café terraces.
  const column = group(3.57, 0.07, 3.95);
  form("drum", 0, 0.19, 0, 0.94, 0.33, 0.94, "#496759", column);
  form("drum", 0, 1.02, 0, 0.79, 1.46, 0.79, "#64816b", column);
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3;
    const bill = group(0.39 * Math.sin(a), 1.03, 0.39 * Math.cos(a), column);
    bill.rotation.y = a;
    form("box", 0, 0, 0, 0.34, 1.12, 0.035, i % 2 ? cream : "#d8ad7e", bill);
    form("round", 0, 0.09, 0.025, 0.24, 0.43, 0.035, i % 2 ? brick : slate, bill);
    for (const y of [-0.34, -0.41, 0.41]) form("box", 0, y, 0.029, 0.22, 0.028, 0.024, slate, bill);
  }
  form("drum", 0, 1.83, 0, 1, 0.18, 1, "#476859", column);
  form("round", 0, 1.98, 0, 0.91, 0.43, 0.91, "#537361", column);
  form("cone", 0, 2.25, 0, 0.19, 0.31, 0.19, "#476859", column);
  n.cycle(-3.36, 3.89);
  n.pedestrian(-1.2, 4.03);

  block(-1, 1, water);
  form("box", 0, 0.15, -1.44, 7.64, 0.26, 4.76, "#c9b99c");
  for (let i = 0; i < 5; i++) {
    const x = -2.9 + i * 1.44;
    form("box", x, 0.63, 0.62, 1.18, 0.65, 0.53, "#517f6f");
    form("box", x, 1.19, 0.84, 1.21, 0.56, 0.07, "#5e8874", lot, -0.4);
    for (let j = 0; j < 7; j++)
      form("box", x - 0.47 + j * 0.15, 1, 0.59, 0.123, 0.21, 0.21, [cream, brick, wood][j % 3], lot, -0.28);
  }
  tree(-2.96, -2.54, 2.66);
  tree(2.83, -2.53, 2.37);
  boat(0.16, 2.31, "#e4b376").rotation.y = 1.45;
  person(-2.22, -0.28, 1.52, -0.28, "#7b93a1", "photographer", 4, 0.29);

  form("setts", 0, 0.16, -4.53, 10.55, 0.24, 1.6, "#cdc0ab");
  n.shop(-3.46, -4.44, 2.83, 2.33, "#e5cead", slate, "ESTAMPE");
  n.shop(-0.43, -4.44, 2.88, 2.84, "#b6bdad", brick, "RELIURE");
  n.shop(2.66, -4.43, 3.02, 2.41, "#d7b0a2", slate, "PRESSE");
  n.quay(0, 4.62);
  boat(3.84, 2.32, cream);
  person(-2.91, 4.46, 1.9, 4.46, "#7e9879", "photographer", 3, 0.31);

  // Street traffic travels across district boundaries on the shared roads.
  m.place(0, 0);
  function car(x: number, z: number, phase: number, kind: Vehicle, color: string) {
    // Let the lowest tread facets meet the pavement over a small contact patch.
    const g = vehicle(m, kind, x, roadHeight - 0.004, z, color);
    g.userData.moving = true;
    // The vineyard estate pulls up opposite the footpath for a passenger.
    const door = g.getObjectByName("estateDoor");
    const boarding = Boolean(door);
    const stopX = 1.82;
    const stopZ = z + curbWidth / 2 + 0.61;
    const radius = 1.18;
    const halfX = (curbWidth + laneWidth) / 2, halfZ = (curbWidth + boulevardLane) / 2;
    const southStraight = 2 * (halfX - radius);
    const stopPhase = (stopX + southStraight / 2) / (southStraight + Math.PI * radius / 2);
    const lapSeconds = 4 / 0.048;
    // The passenger crosses the curb after the estate stops, settles into the rear seat,
    // then steps back out on the next visit. Both use the same stop clock.
    const stopClock = (t: number) => (t + 5) % (lapSeconds + 10);
    m.choreographies.push((t) => {
      // Four streets around one square, with rounded turns at the junctions.
      const clock = stopClock(t);
      const lap = boarding ? (stopPhase + 4 * travel((clock - 10) / lapSeconds, 0.025)) % 4
        : (t * 0.048 + phase) % 4,
        side = Math.floor(lap);
      const angle = (side * Math.PI) / 2,
        along = lap - side,
        halfAlong = side % 2 ? halfZ : halfX,
        halfAcross = side % 2 ? halfX : halfZ;
      const straight = 2 * (halfAlong - radius);
      const distance = along * (straight + Math.PI * radius / 2);
      const turn = Math.max(0, distance - straight) / radius;
      const u = Math.min(distance, straight) - straight / 2 + Math.sin(turn) * radius;
      const pullIn = boarding && side === 0 ? 1 - ease(Math.abs(u - stopX) / 1.8) : 0;
      const v = halfAcross - radius + Math.cos(turn) * radius - (halfZ + z - stopZ) * pullIn;
      g.position.set(
        x + u * Math.cos(angle) + v * Math.sin(angle),
        g.position.y,
        z - u * Math.sin(angle) + v * Math.cos(angle),
      );
      const approach = Math.min(1, Math.abs(u - stopX) / 1.8);
      const slope = (halfZ + z - stopZ) * Math.sign(u - stopX) * 6 * approach * (1 - approach) / 1.8;
      g.rotation.y = angle + turn - (pullIn ? Math.atan(slope) : 0);
      if (door) door.rotation.y = -1.24 * ease(clock / 1.4) * (1 - ease((clock - 7.5) / 1.5));
    });
    if (door) {
      person(0, 0, 0, 0, "#ba7353", "commuter", 5, 0, {
        perform(t) {
          const clock = stopClock(t);
          const trip = Math.floor((t + 5) / (lapSeconds + 10));
          const progress = trip % 2 ? 1 - ease((clock - 2) / 5) : ease((clock - 2) / 5);
          const sit = ease((progress - 0.68) / 0.32);
          const waiting = clock >= 10 && trip % 2 === 1;
          const bearing = waiting ? 0 : g.rotation.y;
          const side = -1.16 + 1.03 * progress;
          return {
            x: (waiting ? stopX : g.position.x) - 0.40 * Math.cos(bearing) + side * Math.sin(bearing),
            z: (waiting ? stopZ : g.position.z) + 0.40 * Math.sin(bearing) + side * Math.cos(bearing),
            y: 0.068 + 0.235 * sit - 0.16 * ease(progress / 0.38),
            facing: Math.PI / 2 * sit + bearing,
            step: Math.sin(progress * Math.PI * 5) * (1 - sit), sitting: sit,
            reach: Math.sin(Math.PI * progress),
          };
        },
      });
    }
  }
  car(2 * pitch, 0, 1.45, "tesla", "#e3e3da");
  car(pitch, 0, 0.43, "ferrari", "#cc473c");
  car(0, -2 * rowPitch, 3.3, "estate", "#6499a6");
  car(0, rowPitch, 0.54, "carrera", "#809eab");
  car(-2 * pitch, 0, 0.57, "jeep", "#333a3c");
  m.finish();
  return { ...m, footprints };
}
