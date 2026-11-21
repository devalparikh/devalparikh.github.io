import type { Model } from "./model";
import type { streets } from "./streets";

const ink = "#394949",
  ivory = "#fff0d1",
  timber = "#946b4d",
  green = "#538477",
  red = "#b95043";

// Furniture and working buildings around the original landmarks. Dimensions
// are in street units, so a bicycle, a counter and a seated figure agree.
export function neighborhood(m: Model, street: ReturnType<typeof streets>) {
  const { group, form, beam, sign } = m;
  const { house, person } = street;
  function bench(x: number, z: number, turn = 0) {
    const g = group(x, 0.09, z);
    g.rotation.y = turn;
    for (const dx of [-0.55, 0.55]) {
      form("box", dx, 0.17, 0, 0.07, 0.34, 0.46, ink, g);
      form("box", dx, 0.45, -0.18, 0.055, 0.58, 0.06, ink, g, -0.1);
    }
    for (let i = 0; i < 3; i++) form("planks", 0, 0.34, i * 0.12 - 0.12, 1.47, 0.047, 0.1, timber, g);
    for (const y of [0.56, 0.72]) form("planks", 0, y, -0.23, 1.47, 0.12, 0.055, timber, g);
  }
  function cycle(x: number, z: number, turn = 0) {
    const g = group(x, 0.09, z);
    g.rotation.y = turn;
    for (const dx of [-0.36, 0.36]) {
      form("rim", dx, 0.25, 0, 0.47, 0.47, 0.44, ink, g);
      for (let i = 0; i < 5; i++)
        form("box", dx, 0.25, 0, 0.016, 0.42, 0.018, "#8a8880", g, 0, 0, (i * Math.PI) / 5);
    }
    const rear = [-0.36, 0.25, 0],
      saddle = [-0.13, 0.57, 0],
      pedal = [0, 0.23, 0],
      stem = [0.24, 0.56, 0];
    for (const [a, b] of [
      [rear, saddle],
      [saddle, pedal],
      [pedal, rear],
      [saddle, stem],
      [stem, pedal],
      [stem, [0.36, 0.25, 0]],
    ])
      beam(a, b, 0.037, red, g);
    form("box", -0.13, 0.61, 0, 0.19, 0.06, 0.12, ink, g);
    form("box", 0.25, 0.6, 0, 0.07, 0.04, 0.3, ink, g);
    form("planks", 0.33, 0.55, 0, 0.21, 0.16, 0.23, "#cfaa74", g);
  }
  function barrel(x: number, z: number, base = 0.09) {
    form("drum", x, base + 0.27, z, 0.49, 0.53, 0.49, timber);
    for (const h of [0.09, 0.42]) form("drum", x, base + h, z, 0.51, 0.055, 0.51, ink);
  }
  function shop(x: number, z: number, w: number, h: number, color: string, roof: string, name: string) {
    const g = house(x, z, w, h, color, roof, name, "gable");
    g.scale.z = 0.67;
  }
  // Wide open counters. Trays, sequentially stacked prints, and jars of
  // stems have distinct profiles even when the awning hides half the table.
  function stall(x: number, z: number, wares: "flowers" | "prints" | "fruit", color: string) {
    const g = group(x, 0.07, z);
    form("planks", 0, 0.42, 0, 1.55, 0.76, 0.64, "#bd9b76", g);
    for (const side of [-1, 1]) form("drum", side * 0.75, 0.99, -0.21, 0.055, 1.91, 0.055, ink, g);
    for (let i = 0; i < 7; i++) {
      const u = (i - 3) * 0.25,
        c = i % 2 ? ivory : color;
      form("box", u, 1.87, -0.04, 0.251, 0.055, 1.12, c, g, 0.15);
      form("box", u, 1.74, 0.51, 0.25, 0.13, 0.035, c, g);
    }
    person(x - 0.33, z - 0.63, x + 0.48, z - 0.65, color, wares === "flowers" ? "gardener" : "baker", 2);
    person(x + 0.67, z + 0.61, x + 0.13, z + 0.58, "#898da3", "photographer", 5);
    for (let i = 0; i < 3; i++) {
      const u = (i - 1) * 0.48;
      if (wares === "flowers") {
        form("drum", u, 0.95, 0.03, 0.29, 0.33, 0.29, green, g);
        for (let j = 0; j < 6; j++) {
          const dx = Math.cos(j * 2.4) * 0.13,
            dz = Math.sin(j * 2.4) * 0.13,
            y = 1.25 + (j % 3) * 0.075;
          beam([u, 1.08, 0.03], [u + dx, y, dz], 0.023, green, g);
          form("leaf", u + dx, y, dz, 0.13, 0.14, 0.12, [red, "#e3be66", "#b99fb8"][i], g);
        }
      } else if (wares === "fruit") {
        form("planks", u, 0.86, 0, 0.43, 0.14, 0.51, timber, g);
        for (let j = 0; j < 8; j++)
          form(
            "round",
            u + ((j % 3) - 1) * 0.13,
            0.99,
            Math.floor(j / 3) * 0.13 - 0.12,
            0.15,
            0.15,
            0.15,
            [red, "#e7af56", "#839d5e"][i],
            g,
          );
      } else {
        form("box", u, 1.01, 0.04, 0.43, 0.42, 0.04, ivory, g, -0.16);
        form("box", u, 1.03, 0.07, 0.34, 0.27, 0.028, ["#789fa6", "#d3ab79", "#a4ac8a"][i], g, -0.16);
        form("round", u + 0.075, 1.08, 0.092, 0.075, 0.075, 0.015, ivory, g);
        form("spire", u - 0.02, 0.99, 0.095, 0.23, 0.14, 0.03, green, g);
      }
    }
  }
  function arbor(x: number, z: number) {
    const g = group(x, 0.08, z);
    for (const dx of [-1.4, 1.4])
      for (const dz of [-0.52, 0.52]) form("box", dx, 1.02, dz, 0.09, 2.04, 0.09, timber, g);
    for (const dz of [-0.52, 0.52]) form("planks", 0, 2, dz, 3.04, 0.13, 0.1, timber, g);
    for (let i = 0; i < 11; i++) {
      const dx = (i - 5) * 0.28;
      form("planks", dx, 2.09, 0, 0.09, 0.12, 1.4, ivory, g);
      for (let j = 0; j < 3; j++)
        form("leaf", dx, 2.17, 0.43 - j * 0.42, 0.38, 0.21, 0.49, j % 2 ? "#93a76d" : "#809b60", g, 0, i);
    }
    bench(x, z);
  }
  function laundry(z: number) {
    for (const x of [-2.2, 2.2]) form("drum", x, 1.29, z, 0.065, 2.45, 0.065, timber);
    for (let i = 0; i < 7; i++) {
      const x = -2.2 + (i * 4.4) / 7,
        y = (u: number) => 2.49 - 0.28 * Math.sin((Math.PI * u) / 7);
      beam([x, y(i), z], [x + 4.4 / 7, y(i + 1), z], 0.029, ink);
      const cloth = group(x + 0.32, (y(i) + y(i + 1)) / 2, z);
      cloth.userData.moving = true;
      form("box", 0, -0.26, 0, 0.42, 0.52, 0.03, [ivory, "#bf776a", "#8daab0"][i % 3], cloth);
      form("box", 0, -0.46, 0, 0.42, 0.04, 0.035, "#adb0a0", cloth);
      m.choreographies.push((t) => {
        cloth.rotation.x = 0.12 + 0.17 * Math.sin(t * 1.6 + i * 0.76);
      });
    }
  }
  function chalet(x: number, z: number, name: string) {
    shop(x, z, 2.38, 1.75, "#cfb08a", "#9c5748", name);
  }
  return {
    bench,
    cycle,
    barrel,
    shop,
    stall,
    arbor,
    laundry,
    chalet,
    visitors(x: number, z: number) {
      person(x, z, x + 1.42, z + 0.17, "#73879b", "photographer", 2);
      person(x + 1.78, z + 0.32, x + 2.88, z + 0.27, "#c27858", "hiker", 7);
    },
    quay(x: number, z: number) {
      form("planks", x, 0.18, z, 10.54, 0.23, 1.23, "#d6bc93");
      for (let i = 0; i <= 8; i++) {
        const u = x + (i - 4) * 1.24;
        form("drum", u, 0.62, z + 0.5, 0.1, 0.77, 0.1, green);
        if (i < 8) {
          beam([u, 0.91, z + 0.5], [u + 0.62, 0.72, z + 0.5], 0.03, ink);
          beam([u + 0.62, 0.72, z + 0.5], [u + 1.24, 0.91, z + 0.5], 0.03, ink);
        }
      }
    },
    signal(x: number, z: number) {
      form("drum", x, 1.06, z, 0.1, 1.96, 0.1, ink);
      form("box", x, 1.91, z, 0.31, 0.72, 0.18, ink);
      for (const [i, c] of [red, "#dda74f", green].entries())
        form("round", x, 2.12 - i * 0.21, z + 0.11, 0.16, 0.16, 0.06, c);
    },
    kiosk(x: number, z: number, name: string) {
      shop(x, z, 1.62, 1.38, "#e9dcb7", green, "");
      sign(name, x, 1.19, z + 0.79, 1.5, 0.28, green);
    },
  };
}
