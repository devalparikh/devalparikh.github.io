import { model } from "./model";
import { streets } from "./streets";

const pitch = 9;
const cream = "#f5ebd4",
  slate = "#506777",
  water = "#98c8df",
  moss = "#9bb977",
  brick = "#c36550",
  wood = "#946e4f";

export function buildTown() {
  const m = model();
  const { form, group, beam, random } = m;
  const { house, tree, lamp, table, patron, boat, person } = streets(m);
  let lot = m.root;
  function block(col: number, row: number, surface: string) {
    lot = m.place(col * pitch, row * pitch);
    form("box", 0, -0.22, 0, 9, 0.24, 9, "#e2dbd0");
    form("box", 0, -0.07, 0, 7.8, 0.22, 7.8, cream);
    form("box", 0, 0.045, 0, 7.7, 0.04, 7.7, surface);
    // Broken center stripes, crossing stripes, and worn marks in the paving.
    for (const n of [-3, 0, 3]) {
      form("box", n, -0.09, 4.47, 0.87, 0.014, 0.045, "#f5df9d");
      form("box", 4.47, -0.09, n, 0.045, 0.014, 0.87, "#f5df9d");
    }
    for (let i = 0; i < 5; i++) form("box", 3.98 + i * 0.19, -0.08, 3.4, 0.09, 0.02, 0.59, "#f2ead5");
    for (let i = 0; i < 110; i++)
      form(
        "box",
        (random() - 0.5) * 7.5,
        0.072,
        (random() - 0.5) * 7.5,
        0.06 + random() * 0.17,
        0.009,
        0.018,
        surface === water ? "#d4e2dc" : "#afaa89",
      );
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
  function dome(x: number, z: number, h: number, r: number, col: string) {
    form("drum", x, h * 0.45, z, r * 1.45, h * 0.9, r * 1.45, cream);
    form("round", x, h * 0.91, z, r * 1.6, r * 1.5, r * 1.6, col);
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      beam(
        [x + r * 0.78 * Math.cos(a), h * 0.92, z + r * 0.78 * Math.sin(a)],
        [x + r * 0.51 * Math.cos(a), h + r * 0.46, z + r * 0.51 * Math.sin(a)],
        0.07,
        cream,
      );
    }
    form("drum", x, h * 0.91 + r * 0.81, z, 0.32, 0.42, 0.32, cream);
    form("cone", x, h * 0.91 + r * 1.12, z, 0.39, 0.52, 0.39, col);
  }

  // Georgetown shop row and the towpath café.
  block(-1, 0, "#e3d6c3");
  house(-2.45, -0.95, 2.22, 3.3, "#c87967", "#a24b43", "COFFEE", "gable");
  house(-0.13, -1.05, 2.18, 4.15, "#b9b5c6", "#617d88", "BOOKS");
  house(2.15, -0.95, 2.13, 3.5, "#d9bd70", "#70917a", "BAKERY", "gable");
  table(-2.5, 1.85, "#bf5445");
  table(-0.5, 2.05, "#dfae54");
  patron(-2.5, 1.85, -1, "#7c97a9", 1);
  patron(-0.5, 2.05, 1, "#b66a5c", 3);
  tree(3.05, 2.75, 2.3);
  lamp(-3.5, 3.25);
  person(-2.5, 0.65, -1, 1.65, cream, "waiter", 1);
  person(2.6, 1.55, 0.94, 2.86, "#ac5351", "baker", 6);

  // The reflecting pool is a separate block from both Georgetown and the glasshouse.
  block(0, 0, moss);
  form("box", 0, 0.1, 0, 2.8, 0.07, 7.44, cream);
  form("box", 0, 0.145, 1.23, 2.14, 0.05, 3.92, water);
  form("box", 0, 0.31, -1.79, 1.24, 0.49, 1.24, cream);
  form("box", 0, 2.83, -1.79, 0.49, 4.72, 0.49, "#eee3c9");
  form("spire", 0, 5.42, -1.79, 0.5, 0.48, 0.5, cream);
  for (const side of [-1, 1])
    for (let i = 0; i < 4; i++)
      tree(side * 2.85, -2.86 + i * 1.83, 1.7 + (i % 2) * 0.28, i % 2 ? "#97b47e" : "#cfad9e");
  person(-1.15, 2.9, -1.15, -0.8, "#b26246", "photographer", 5);

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

  // Venice, a Florentine market, and the hillside vineyards.
  block(1, -1, water);
  form("box", 0, 0.17, -1.95, 7.6, 0.29, 3.75, "#d6c5a3");
  house(-2.45, -1.62, 2.18, 3.1, "#dca172", "#b85d48", "FORNO", "gable", 0.31);
  house(-0.28, -1.63, 1.95, 3.66, "#d6c88b", "#728b78", "CAFFÈ", "cornice", 0.31);
  house(1.84, -1.61, 2.06, 3.02, "#c7a39c", "#ad6550", "OSTERIA", "gable", 0.31);
  for (let i = 0; i < 9; i++) {
    const x = -3.44 + i * 0.85;
    form("drum", x, 0.29, 0.29, 0.12, 0.65, 0.12, wood);
  }
  {
    const gondola = group(0, 0.12, 1.97);
    gondola.userData.moving = true;
    form("leaf", 0, 0.13, 0, 3.18, 0.36, 0.72, "#38494a", gondola);
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
  block(1, -2, "#e4daca");
  dome(-0.98, -1.62, 3.5, 1.43, "#bc6450");
  form("box", 1.54, 2.04, -2.04, 0.82, 4.04, 0.82, "#d5ba94");
  form("box", 1.54, 4.22, -2.04, 0.98, 0.43, 0.98, cream);
  form("spire", 1.54, 4.93, -2.04, 1.04, 0.99, 1.04, "#6b897c");
  for (const h of [1.08, 2.08, 3.08, 4.15]) {
    form("box", 1.54, h, -1.61, 0.26, 0.49, 0.05, "glass");
    form("box", 1.97, h, -2.04, 0.05, 0.49, 0.26, "glass");
    form("box", 1.54, h - 0.32, -2.04, 0.9, 0.095, 0.9, cream);
  }
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const window = group(-0.98 + 1.04 * Math.sin(a), 1.79, -1.62 + 1.04 * Math.cos(a));
    window.rotation.y = a;
    form("box", 0, 0, 0, 0.35, 0.87, 0.065, "glass", window);
    form("round", 0, 0.42, 0, 0.35, 0.35, 0.066, "glass", window);
    form("box", 0, -0.48, 0, 0.45, 0.08, 0.11, cream, window);
  }
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
  block(0, -2, moss);
  for (let i = 0; i < 5; i++) {
    const z = -2.89 + i * 1.25,
      h = 0.16 + (4 - i) * 0.19;
    form("box", -0.85, h / 2, z, 5.55, h, 1.22, "#a7b47d");
    beam([-3.35, h + 0.59, z], [1.68, h + 0.59, z], 0.045, wood);
    for (let j = 0; j < 9; j++) {
      const x = -3.27 + j * 0.59;
      form("drum", x, h + 0.32, z, 0.06, 0.64, 0.06, wood);
      form("leaf", x, h + 0.59, z, 0.75, 0.6, 0.57, j % 2 ? "#789759" : "#8ca167");
    }
  }
  for (const z of [-2.7, -0.7, 1.6]) tree(2.96, z, 2.9, "#65815c", "pine");
  person(2.15, -1.95, 2.15, 2.3, "#9c6750", "gardener", 7);

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
  block(-2, 0, moss);
  mountain(-0.39, -1.5, 3.37, 5.64, false);
  form("box", 0, 0.09, 2.62, 7.62, 0.08, 2.4, "#e6ce9c");
  form("box", 0, 0.14, 3.4, 7.62, 0.04, 0.78, water);
  for (let i = 0; i < 25; i++)
    form("leaf", -3.6 + i * 0.29, 0.26, 1.57 + random() * 0.35, 0.43, 0.36, 0.48, "#707369", lot, 0, i);
  for (const x of [-2.92, 2.66]) tree(x, 0.41, 3.12, "#65885b", "palm");
  house(2.27, -1.98, 1.57, 1.4, "#d7b886", "#729695", "", "gable");
  person(-2.3, 2.57, 1.69, 2.57, "#b76454", "photographer", 4, 0.13);
  block(-2, 2, moss);
  for (const side of [-1, 1]) {
    form("round", side * 1.47, 0.16, side * 1.32, 3.98, 0.25, 2.92, "#b7ce83");
    form("round", side * 2.22, 0.26, side * 1.91, 1.35, 0.13, 0.78, "#e1cb96");
    const x = side * 1.21,
      z = side * 1.39;
    form("drum", x, 0.89, z, 0.048, 1.48, 0.048, cream);
    form("box", x + 0.22, 1.51, z, 0.44, 0.27, 0.035, "#bb5246");
  }
  for (const x of [-2.8, 2.8]) tree(x, -2.75, 2.75, "#65895b", "palm");
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

  // Three Swiss blocks: lake railway, alpine ridge and chalet village.
  block(2, -2, "#9cb298");
  mountain(-1.05, -0.92, 4.72, 4.43, true);
  mountain(1.35, -1.67, 3.88, 3.63, true);
  for (let i = 0; i < 7; i++)
    tree(-2.99 + i * 0.95, 0.88 + random() * 1.55, 1.77 + random() * 0.66, "#688779", "pine");
  person(-2.7, 2.93, 2.57, 2.85, "#d79f50", "hiker", 6);
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

  person(-2.49, 0.43, 0.97, 0.45, "#b76344", "hiker", 3);
  block(2, 0, moss);
  house(-1.61, -1.15, 2.56, 2.51, "#ad8766", "#945643", "CHALET", "gable");
  house(1.55, -1.96, 2.08, 2.11, "#c8a378", "#8f6353", "", "gable");
  tree(2.82, 1.2, 2.5, "#618065", "pine");
  tree(-3.29, 2.2, 2.16, "#70856e", "pine");
  flowerbed(0.27, 1.75, 1.81, 0.86);
  person(-1.4, 0.45, 0.47, 2.44, "#607e90", "gardener", 3);

  // Paris: ironwork, boulevard cafés, then the booksellers on the Seine.
  block(1, 0, "#aac180");
  {
    const tx = 0,
      tz = -0.51;
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        for (const [a, b, y, h] of [
          [1.42, 0.73, 0, 2.04],
          [0.73, 0.38, 2.04, 3.45],
          [0.38, 0.08, 3.45, 5.78],
        ]) {
          beam([tx + sx * a, y, tz + sz * a], [tx + sx * b, h, tz + sz * b], 0.13, slate);
          beam([tx + sx * a, y, tz + sz * a], [tx - sx * b, h, tz + sz * b], 0.06, wood);
          beam([tx + sx * a, y, tz + sz * a], [tx + sx * b, h, tz - sz * b], 0.06, wood);
        }
      }
    for (const [w, y] of [
      [1.8, 2.04],
      [1.04, 3.45],
      [0.4, 5.78],
    ])
      form("box", tx, y, tz, w, 0.17, w, slate);
    form("cone", tx, 6.16, tz, 0.22, 0.82, 0.22, slate);

    form("box", 0, 0.096, 1.94, 1.37, 0.04, 3.59, "#dfcca9");
    for (const side of [-1, 1]) {
      flowerbed(side * 2.49, 1.76, 1.18, 2.48);
      tree(side * 2.73, -2.45, 2.25);
    }
    person(-0.29, 2.92, 0.42, 1.56, "#9c6054", "photographer", 7);
  }
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
    form("spire", x, h + 0.62, -1.47, 2.48, 1.24, 2.52, slate);
    for (const dx of [-0.57, 0.57]) form("box", x + dx, h + 0.53, -0.56, 0.34, 0.42, 0.4, cream);
  }
  for (const x of [-2.42, 0, 2.42]) table(x, 1.57, x === 0 ? "#d5a448" : "#bd5e50");
  patron(-2.42, 1.57, -1, "#9e6b91", 2);
  patron(0, 1.57, 1, "#608475", 4);
  patron(2.42, 1.57, 1, "#c5784f", 6);
  lamp(-3.35, 2.94);
  lamp(3.35, 2.94);
  person(-1.52, 0.35, -1.41, 1.86, cream, "waiter", 2);
  person(2.44, 2.86, -0.78, 2.86, "#bf874a", "photographer", 7);
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

  // Street traffic travels across district boundaries on the shared roads.
  m.place(0, 0);
  function car(x: number, z: number, phase: number, color: string) {
    const g = group(x, -0.09, z);
    g.userData.moving = true;
    form("box", 0, 0.29, 0, 1.18, 0.3, 0.56, color, g);
    form("box", -0.07, 0.53, 0, 0.66, 0.25, 0.49, "glass", g);
    form("box", -0.07, 0.69, 0, 0.71, 0.065, 0.52, color, g);
    for (const xx of [-0.37, 0.36])
      for (const zz of [-0.27, 0.27]) form("drum", xx, 0.18, zz, 0.28, 0.09, 0.28, slate, g, Math.PI / 2);
    m.choreographies.push((t) => {
      // Four streets around one square, with rounded turns at the junctions.
      const lap = (t * 0.048 + phase) % 4,
        side = Math.floor(lap);
      const angle = (side * Math.PI) / 2,
        along = lap - side,
        radius = 0.48,
        half = 4.2;
      const turn = (Math.max(0, (along - 0.9) / 0.1) * Math.PI) / 2;
      const u =
        along < 0.9 ? ((along / 0.9) * 2 - 1) * (half - radius) : half - radius + Math.sin(turn) * radius;
      const v = half - radius + Math.cos(turn) * radius;
      g.position.set(
        x + u * Math.cos(angle) + v * Math.sin(angle),
        -0.09,
        z - u * Math.sin(angle) + v * Math.cos(angle),
      );
      g.rotation.y = angle + turn;
    });
  }
  car(-9, 0, 0.45, "#b75e4d");
  car(9, -9, 2.2, "#d5aa52");
  car(0, -18, 3.3, "#6499a6");
  m.finish();
  return m;
}
