import { model } from "./model";
import { streets } from "./streets";

export function buildSquare(index: number) {
  const m = model();
  const { form, group, beam, random } = m;
  const { house, tree, lamp, table, boat, ripples, person } = streets(m);
  const cream = "#efd9af",
    slate = "#586668",
    water = "#74aea7",
    moss = "#8eac70",
    brick = "#ab6450",
    wood = "#966b49";
  // A cutaway slice of earth, with a waterline on the visitor's side.
  form("box", 0, -0.79, 0, 14, 1.1, 10.8, "#ae8a6c");
  form("box", 0, -1.26, 0, 14.06, 0.15, 10.86, "#947957");
  form("box", 0, -0.21, 0, 14.04, 0.12, 10.84, cream);
  form("box", 0, -0.095, 0, 14, 0.19, 10.8, water);
  form("box", 0, 0.005, -1.55, 14, 0.17, 7.7, index === 2 || index === 3 ? moss : "#c2b597");

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
  function bridge(x: number) {
    form("box", x, 0.075, 5.14, 2.24, 0.15, 0.52, "#b79a73");
    for (const side of [-1, 1]) form("drum", x + side * 0.94, 0.24, 5.15, 0.12, 0.56, 0.12, wood);
    for (let i = 0; i < 15; i++) {
      const z = 2.28 + i * 0.21,
        y = 0.13 + 0.36 * Math.sin((i * Math.PI) / 14);
      form("box", x, y, z, 1.18, 0.14, 0.22, wood);
      for (const side of [-1, 1]) {
        form("box", x + side * 0.59, y + 0.51, z, 0.07, 0.08, 0.23, cream);
        if (i % 3 === 0) form("box", x + side * 0.59, y + 0.26, z, 0.08, 0.55, 0.09, wood);
      }
    }
  }
  function mountain(x: number, z: number, h: number, w: number, snow: boolean) {
    form("cone", x, h * 0.5, z, w, h, w * 0.83, snow ? "#969a91" : "#87836a", m.root, 0, 0.32);
    // Folded rock faces and uneven snow lines soften the regular silhouette.
    for (const side of [-1, 1]) {
      form(
        "leaf",
        x + side * w * 0.18,
        h * 0.31,
        z + 0.12,
        w * 0.6,
        h * 0.75,
        w * 0.62,
        snow ? "#819086" : "#878d6b",
        m.root,
        0,
        side * 0.42,
        side * 0.24,
      );
      if (snow)
        form(
          "spire",
          x + side * w * 0.22,
          h * 0.62,
          z + 0.12,
          w * 0.19,
          h * 0.2,
          w * 0.21,
          "#e6e4d6",
          m.root,
          0,
          side * 0.42,
          side * 0.22,
        );
    }
    if (snow) form("cone", x, h * 0.85, z, w * 0.31, h * 0.31, w * 0.26, "#faf4df", m.root, 0, 0.32);
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
  function quay() {
    for (let i = 0; i < 35; i++) {
      form("box", -6.8 + i * 0.4, 0.16, 2.3, 0.38, 0.27, 0.25, i % 3 ? cream : "#bfad8f");
      if (i % 5 === 0) form("drum", -6.8 + i * 0.4, 0.32, 2.17, 0.14, 0.48, 0.14, slate);
    }
    for (let i = 0; i < 130; i++) {
      const x = -6.8 + random() * 13.6,
        z = 0.33 + random() * 1.78;
      form("box", x, 0.101, z, 0.12 + random() * 0.24, 0.018, 0.055, "#ac9e88");
    }
    ripples(0, 3.85, 13.7, 2.85);
  }
  if (index !== 2) quay();
  if (index === 0) {
    // Georgetown's shopfronts, a ribbed conservatory and the Mall obelisk.
    house(-4.9, -1, 2.45, 3.8, brick, "#52665f", "COFFEE");
    house(-2.48, -1.16, 2.22, 4.62, "#b18e69", "#47686a", "BOOKS");
    house(-0.25, -1.13, 2.05, 3.18, "#dca77e", "#aa5649", "BAKERY");
    form("box", 2, 0.16, -3.75, 8.6, 0.16, 2.6, moss);
    form("box", 3, 0.3, -3.85, 1.35, 0.44, 1.35, cream);
    form("box", 3, 3.15, -3.85, 0.52, 5.45, 0.52, "#e7d7b5");
    form("spire", 3, 6.12, -3.85, 0.53, 0.52, 0.53, cream);
    const gx = 4.4,
      gz = -0.58;
    for (let i = 0; i < 15; i++) {
      const x = gx + (random() - 0.5) * 3.21,
        z = gz + (random() - 0.5) * 1.61,
        h = 0.64 + random() * 0.98;
      form("drum", x, h / 2, z, 0.055, h, 0.055, wood);
      form("leaf", x, h, z, 0.54, 0.63, 0.56, i % 3 ? "#678c61" : "#a5ad72", m.root, 0, i);
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
    flowerbed(4.45, 1.35, 2.6, 0.64);
    tree(-5.6, -3.25, 3.6);
    tree(-2.8, -3.8, 3.3);
    tree(1.45, 1.25, 2.5, "#bd907c");
    tree(6.1, -3.48, 3.2);
    tree(-5.95, 1.52, 2.2, "#b39661");
    table(-4.25, 1.28, "#a15846");
    bridge(-2.5);
    boat(3.1, 3.76, "#efcf8c").rotation.y = 1.23;
    // A flower cart at the bookseller's end of the towpath.
    form("box", -0.9, 0.41, 1.13, 0.88, 0.25, 0.49, wood);
    for (const x of [-1.18, -0.61]) form("drum", x, 0.24, 1.13, 0.34, 0.56, 0.34, slate, m.root, Math.PI / 2);
    for (let i = 0; i < 12; i++)
      form(
        "leaf",
        -1.22 + (i % 4) * 0.2,
        0.61 + random() * 0.07,
        0.98 + Math.floor(i / 4) * 0.14,
        0.19,
        0.21,
        0.19,
        i % 2 ? "#d78275" : "#e2b263",
      );
    person(-4.98, 0.53, -3.78, 1.1, "#f2e4c8", "waiter", 1);
    person(2.55, 0.85, 5.92, 0.85, "#657f6e", "gardener", 4);
    person(-2.5, 1.75, 0.65, 1.78, "#c86c4c", "photographer", 7);
  } else if (index === 1) {
    house(-5.38, -0.95, 2.14, 3.4, "#c6856d", "#984f39", "OSTERIA", "gable");
    house(-3.25, -1.05, 1.92, 4.23, "#e2b979", "#a95e42", "CAFFÈ");
    house(-1.12, -1.2, 2.03, 3.48, "#c19179", "#aa5c45", "FORNO", "gable");
    dome(-1.65, -3.71, 3.65, 1.25, "#b96648");
    form("box", -4.2, 2.45, -3.68, 0.85, 4.86, 0.85, brick);
    form("box", -4.2, 4.98, -3.68, 1.03, 0.58, 1.03, cream);
    form("spire", -4.2, 5.8, -3.68, 1.12, 1.14, 1.12, "#668677");
    for (let i = 0; i < 4; i++) {
      const z = 0.04 - i * 1.32,
        y = 0.23 + i * 0.27;
      form("box", 4.42, y / 2, z, 4.87, y, 1.4, moss);
      for (let j = 0; j < 9; j++) {
        const x = 2.32 + j * 0.51;
        form("drum", x, y + 0.26, z, 0.055, 0.57, 0.055, wood);
        form("leaf", x, y + 0.49, z, 0.63, 0.48, 0.53, "#78894c");
      }
    }
    tree(6, -4.2, 3, "#576d4a", "pine", 1);
    tree(1.5, -3, 3.4, "#576d4a", "pine");
    table(-4.3, 1.15, "#af6648");
    bridge(0.46);
    // A gondolier works a single oar from the stern of a long, low hull.
    const gondola = group(-2, 0.12, 3.91);
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
      gondola.position.x = -2 + 0.9 * Math.sin(t * 0.19);
      gondola.rotation.z = 0.022 * Math.sin(t);
      oar.rotation.y = 0.38 * Math.sin(t * 1.3);
    });
    person(2.6, 1.48, 5.8, 1.48, "#78814f", "gardener", 4);
    person(-5.35, 0.45, -4.58, 1, "#eee0bd", "waiter", 8);
  } else if (index === 2) {
    form("box", 0, 0.09, 2.56, 14, 0.14, 1.36, "#dfc999");
    ripples(0, 4.33, 13.7, 1.78);
    mountain(2.8, -3.27, 3.85, 5.35, false);
    for (let i = 0; i < 32; i++) {
      const x = -6.8 + i * 0.43;
      if (x > -0.9 && x < 2.5) continue;
      form(
        "leaf",
        x,
        0.14,
        3.38 + random() * 0.34,
        0.52 + random() * 0.5,
        0.32 + random() * 0.46,
        0.63,
        "#595751",
        m.root,
        0,
        i,
      );
    }
    for (let i = 0; i < 3; i++) {
      const x = -5.8 + i * 1.68,
        z = -3.75 + i * 0.51,
        y = 0.6 - i * 0.16;
      form("box", x, y / 2, z, 2, y, 2.6, moss);
      house(x, z, 1.35, 1.15, "#d1b389", i % 2 ? "#7c8273" : "#ad6c52", "", "gable", y);
    }
    for (const [x, z, y] of [
      [-3.58, -0.8, 0.32],
      [3.58, 1.06, 0.15],
    ]) {
      form("round", x, y, z, 5.56, 0.36, 2.12, "#9eb875");
      form("round", x - 1.26, y + 0.06, z + 0.25, 0.99, 0.31, 0.56, "#dac694");
      form("drum", x + 0.76, y + 0.85, z, 0.06, 1.49, 0.06, cream);
      form("box", x + 1.04, y + 1.43, z, 0.56, 0.32, 0.04, "#bc6450");
    }
    for (const [x, z, h] of [
      [-5.7, 1.8, 2.85],
      [5.9, 2.35, 3.7],
      [5.4, -2.25, 3.13],
      [-0.65, -2.3, 2.5],
    ])
      tree(x, z, h, "#65875b", "palm");
    tree(-6.15, -1.36, 2.2);
    boat(0.25, 4.27, cream).rotation.y = 1.4;
    // A peacock picks its way along the wooded Makalei green.
    const peacock = group(-5, 0.65, -0.92);
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
      peacock.position.x = -5 + 0.42 * Math.sin(t * 0.44);
      peacock.rotation.y = 0.6 * Math.sin(t * 0.44);
    });
    person(2.7, 0.82, 4.1, 1.14, "#dbac68", "golfer", 6, 0.28);
    person(-4.9, -0.9, -3, -0.62, "#7f9c91", "golfer", 2, 0.58);
    person(-0.8, 2.8, 1.95, 2.71, "#be7967", "photographer", 3);
  } else if (index === 3) {
    mountain(-3.8, -3.63, 5.85, 4.5, true);
    mountain(0.14, -3.42, 4.1, 3.86, true);
    mountain(3.52, -3.39, 5, 4, true);
    house(-4, -0.96, 2.58, 2.65, "#9b7256", "#794e3d", "CHALET", "gable");
    house(-1.25, -0.87, 2.48, 2.15, "#b18e69", "#935941", "BAHN", "gable");
    const clock = group(2.08, 0.1, 0.05);
    form("drum", 0, 0.94, 0, 0.095, 1.86, 0.095, slate, clock);
    form("drum", 0, 1.91, 0, 0.53, 0.12, 0.53, slate, clock, Math.PI / 2);
    form("drum", 0, 1.91, 0.066, 0.44, 0.04, 0.44, cream, clock, Math.PI / 2);
    beam([0, 1.91, 0.094], [0.13, 1.98, 0.094], 0.025, slate, clock);
    beam([0, 1.91, 0.094], [-0.07, 2.03, 0.094], 0.025, slate, clock);
    for (let i = 0; i < 24; i++) form("box", -6.59 + i * 0.57, 0.13, 1.05, 0.16, 0.08, 0.79, wood);
    for (const z of [0.82, 1.29]) form("box", 0, 0.2, z, 13.87, 0.07, 0.07, slate);
    const tram = group(0, 0.22, 1.05);
    form("box", 0, 0.44, 0, 2.48, 0.78, 0.75, "#b45444", tram);
    form("box", 0, 0.87, 0, 2.62, 0.13, 0.82, cream, tram);
    for (let i = 0; i < 6; i++) form("box", -0.99 + i * 0.4, 0.59, 0, 0.29, 0.37, 0.77, "glass", tram);
    for (const x of [-0.8, 0.8]) form("round", x, 0.09, 0, 0.32, 0.32, 0.76, slate, tram);
    m.choreographies.push((t) => (tram.position.x = 3.9 * Math.sin(t * 0.19)));
    for (const [x, z, h] of [
      [2, -1.5, 3.1],
      [3, -1.1, 2.4],
      [5, -2, 3.3],
      [6, -0.82, 2.9],
      [-6, -2, 3],
    ])
      tree(x, z, h, "#57735f", "pine");
    person(-4.6, 0.36, -2.1, 0.34, "#aa694d", "hiker", 1);
    person(2.05, 1.89, 5.55, 1.88, "#bf9a54", "photographer", 6);
    boat(-2, 3.76, cream);
  } else {
    for (let i = 0; i < 3; i++) {
      const x = -5.32 + i * 2.3,
        h = 3.23 + (i % 2) * 0.76;
      house(x, -1.11, 2.23, h, i % 2 ? "#c7ae92" : "#dfc6a0", slate, ["BISTRO", "FLEURS", "CAFÉ"][i]);
      form("spire", x, h + 0.68, -1.11, 2.54, 1.26, 2.59, slate);
      for (const xx of [-0.55, 0.55]) form("box", x + xx, h + 0.56, -0.27, 0.39, 0.44, 0.39, cream);
    }
    // Four splayed legs and crossed ironwork under the observation decks.
    const tx = 3.56,
      tz = -1.65;
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
    tree(5.86, 0.88, 2.8);
    tree(1.28, -3.5, 2.62);
    tree(-5.65, -3.65, 3.25);
    table(-2, 1.15, "#b35f4f");
    table(-4.95, 1.24, cream);
    // Hinged green book boxes on the river wall.
    for (let i = 0; i < 2; i++) {
      const x = 3.02 + i * 1.18;
      form("box", x, 0.58, 1.9, 1.04, 0.58, 0.39, "#527366");
      form("box", x, 1.05, 2.05, 1.09, 0.42, 0.075, "#527366", m.root, -0.36);
      for (let j = 0; j < 6; j++)
        form(
          "box",
          x - 0.4 + j * 0.15,
          0.88,
          1.89,
          0.125,
          0.19,
          0.19,
          [cream, brick, wood][j % 3],
          m.root,
          -0.27,
        );
    }
    flowerbed(0.52, 1.24, 1.5, 0.58);
    boat(2.7, 3.9, cream).rotation.y = 1.25;
    person(-1, 0.33, -1.65, 1.15, "#ece1c3", "waiter", 4);
    person(-5.6, 1.86, -3.31, 1.85, "#a96650", "baker", 2);
    person(2.14, 1.03, 3.99, 1.58, "#73886f", "photographer", 8);
  }
  if (index !== 2) {
    lamp(-6.45, 2);
    lamp(1.04, 1.99);
    lamp(6.53, 1.94);
  }
  m.finish();
  return m;
}
