import type { Model } from "./model";
import type { streets } from "./streets";

const lava = ["#474a48", "#545552", "#3e4546", "#655d57"];
const sand = "#e4cda0", sea = "#93c5d4";
type Street = ReturnType<typeof streets>;

// A ragged basalt shelf with small breaks where the Pacific reaches the sand.
function headland({ form }: Model, x: number, z: number, width: number, depth: number) {
  form("basalt", x, 0.14, z, width, 0.36, depth, lava[0]);
  for (let i = 0; i < 16; i++) {
    const a = i * Math.PI / 8;
    const dx = Math.sin(a) * width * 0.43, dz = Math.cos(a) * depth * 0.43;
    form("basalt", x + dx, 0.19, z + dz, 0.62 + 0.21 * Math.cos(i), 0.2 + 0.12 * Math.sin(i), 0.37, lava[i % 4], undefined, 0.15, i);
    if (i % 3 === 0) form("round", x + dx * 1.15, 0.11, z + dz * 1.24, 0.64, 0.055, 0.25, "#d9e7d6");
  }
}

export function konaCoast(m: Model, { tree, person }: Street) {
  const { form, group } = m;
  // Low shield profile behind a stepped residential slope.
  const mountain = group(-0.27, 0.08, -3.37);
  form("shield", 0, 0, 0, 9.84, 3.64, 3.83, "#899775", mountain);
  form("basalt", -1.63, 2.73, -0.04, 1.87, 0.82, 1.06, "#9a8168", mountain);
  form("basalt", 0.16, 3.62, 0.04, 1.04, 0.49, 0.78, "#977d67", mountain);
  for (let row = 0; row < 2; row++) {
    const z = -0.35 - row * 1.41, level = 0.53 + row * 0.78;
    form("meadow", 0, level / 2, z, 8.76, level, 1.67, "#9bad78");
    form("masonry", 0, level - 0.25, z + 0.81, 8.8, 0.47, 0.12, "#827d67");
    form("box", 0, level + 0.014, z + 0.49, 8.72, 0.03, 0.49, "#beaf92");
    for (let i = 0; i < 4; i++) {
      const x = -3.45 + i * 2.18 + row * 0.29;
      const home = group(x, level, z - 0.18 + 0.1 * Math.sin(i * 2));
      home.scale.set(0.9 + 0.13 * Math.sin(i), 0.87 + 0.1 * Math.cos(i), 0.88);
      home.rotation.y = 0.12 * Math.sin(i + row);
      const roof = ["#a56551", "#708a84", "#98745e", "#7c8793"][(row + i) % 4];
      form("planks", 0, 0.49, 0, 1.32, 0.97, 0.86, i % 2 ? "#dfc59d" : "#ebd6b0", home);
      form("gable", 0, 1.12, 0, 1.52, 0.36, 1.06, roof, home);
      for (const dx of [-0.4, 0.39]) form("box", dx, 0.59, 0.44, 0.28, 0.36, 0.04, "glass", home);
      form("box", 0, 0.38, 0.44, 0.23, 0.71, 0.05, roof, home);
      form("planks", 0, 0.17, 0.56, 1.37, 0.12, 0.32, "#b29674", home);
      form("box", 0, 0.89, 0.59, 1.45, 0.08, 0.38, roof, home, 0.12);
      for (const dx of [-0.59, 0.59]) form("box", dx, 0.52, 0.7, 0.05, 0.69, 0.05, "#eee1c5", home);
    }
  }
  form("lagoon", 0, 0.085, 3.32, 10.6, 0.045, 4, sea);
  form("round", 0, 0.12, 1.61, 9.68, 0.31, 3.16, sand);
  headland(m, -3.93, 2.63, 2.14, 2.43);
  headland(m, 3.53, 2.76, 2.66, 2.85);
  for (const x of [-3.22, 2.77]) tree(x, 1, 2.65, "#6d8f69", "palm");
  person(-1.94, 2.03, 1.46, 2.25, "#b76454", "photographer", 4, 0.27);
}

// Parked on the path with the club heads projecting above the rear bag.
export function golfCart({ form, group, beam }: Model, x: number, z: number, heading: number) {
  const cart = group(x, 0.09, z);
  cart.rotation.y = heading;
  for (const dx of [-0.46, 0.46])
    for (const dz of [-0.31, 0.31]) {
      form("drum", dx, 0.18, dz, 0.36, 0.13, 0.36, "#535652", cart, Math.PI / 2);
      form("drum", dx, 0.18, dz * 1.14, 0.17, 0.08, 0.17, "#b2afa2", cart, Math.PI / 2);
    }
  form("box", 0, 0.34, 0, 1.43, 0.18, 0.68, "#769584", cart);
  form("box", 0.5, 0.49, 0, 0.39, 0.24, 0.7, sand, cart);
  form("box", -0.22, 0.53, 0, 0.46, 0.14, 0.62, sand, cart);
  form("box", -0.39, 0.69, 0, 0.1, 0.36, 0.62, sand, cart);
  for (const dz of [-0.29, 0.29]) {
    beam([0.48, 0.57, dz], [0.32, 1.32, dz], 0.047, "#647367", cart);
    beam([-0.47, 0.48, dz], [-0.47, 1.32, dz], 0.047, "#647367", cart);
  }
  form("box", -0.04, 1.33, 0, 1.28, 0.11, 0.83, "#ede2ca", cart);
  form("drum", -0.65, 0.72, 0, 0.23, 0.63, 0.22, "#9d6150", cart, 0, 0, -0.13);
  for (const dz of [-0.06, 0.06]) {
    beam([-0.65, 0.9, dz], [-0.72, 1.24, dz], 0.032, "#58615f", cart);
    form("box", -0.68, 1.24, dz, 0.13, 0.059, 0.06, "#717674", cart);
  }
}

export function oceanCourse(m: Model, { tree, person }: Street) {
  const { form, group, sign } = m;
  form("lagoon", 0, 0.085, 3.35, 10.58, 0.05, 3.91, sea);
  form("round", -0.77, 0.14, 0.37, 8.27, 0.29, 4.36, "#a8bf83");
  for (let i = 0; i < 6; i++)
    headland(m, -4.33 + i * 1.7, 1.91 + 0.41 * Math.sin(i * 1.7), 1.94, 1.39);
  form("round", -2.56, 0.32, 0.06, 3.75, 0.15, 2.04, "#b9ce8f");
  form("round", -3.82, 0.28, -0.93, 1.72, 0.15, 0.81, sand);
  form("round", -1.11, 0.29, 0.87, 1.26, 0.09, 0.74, sand);
  form("drum", -2.62, 1.03, 0.12, 0.05, 1.42, 0.05, "#f0e6ca");
  form("box", -2.42, 1.62, 0.12, 0.4, 0.22, 0.045, "#b65d51");
  // Hole 13's blowhole is a neighboring vignette to the oceanfront green.
  const spray = group(2.64, 0.26, 2.01);
  spray.userData.moving = true;
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4, r = 0.09 + i * 0.027;
    form("round", r * Math.cos(a), 0.21 + 0.63 * Math.sin(i * 0.35), r * Math.sin(a),
      0.085, 0.26, 0.085, "#e1efea", spray, 0.22, a);
  }
  m.choreographies.push(t => { spray.scale.y = 0.12 + 1.13 * ((1 + Math.cos(t * 1.2)) / 2) ** 4; });
  // A low, open lanai faces the green.
  form("planks", -1.1, 0.27, -3.44, 4.98, 0.39, 2.27, "#aa8b68");
  form("planks", -1.1, 1.08, -3.9, 4.48, 1.52, 1.13, "#dfc79f");
  for (const x of [-3.35, -1.85, -0.35, 1.15]) form("box", x, 1.16, -2.51, 0.12, 1.7, 0.12, "#806f57");
  form("gable", -1.1, 2.28, -3.46, 5.36, 0.75, 2.71, "#73887d");
  sign("KONA COUNTRY CLUB", -1.1, 1.93, -2.2, 2.73, 0.34, "#536b5b");
  golfCart(m, 2.48, -2, -0.36);
  tree(3.57, -2.75, 3.25, "#638665", "palm");
  tree(4.45, -0.88, 2.74, "#7b9565", "palm");
  person(1.66, 0.12, 2.12, -0.18, "#bc7b53", "golfer", 4, 0.25);
}
