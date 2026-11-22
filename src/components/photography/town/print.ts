import * as T from "three";

export type Surface = "foliage" | "masonry" | "slate" | "planks" | "meadow" | "lagoon" | "setts";

// Two world units of pen marks per repeat. Broken joints and open strokes
// leave plenty of the underlying wash visible between marks.
export function printTexture(surface: Surface) {
  const sheet = document.createElement("canvas");
  sheet.width = sheet.height = 256;
  const p = sheet.getContext("2d")!;
  p.fillStyle = "white";
  p.fillRect(0, 0, 256, 256);
  let seed = 31;
  const rand = () => (seed = Math.imul(seed, 16807) >>> 0) / 4294967296;
  p.lineCap = "round";
  const stroke = (x: number, y: number, dx: number, dy: number, bend: number) => {
    p.beginPath();
    p.moveTo(x, y);
    p.quadraticCurveTo(x + dx * 0.5, y + bend, x + dx, y + dy);
    p.stroke();
  };
  for (let row = 0; row < 8; row++) {
    for (let col = -1; col < 4; col++) {
      const x = col * 64 + (row % 2) * 32,
        y = row * 32;
      p.strokeStyle = `rgba(65,48,37,${0.12 + rand() * 0.28})`;
      p.lineWidth = 1.2 + rand() * 0.8;
      if (surface === "foliage") {
        const u = x + rand() * 29,
          v = y + rand() * 17;
        p.lineWidth = 2.6;
        stroke(u, v, 11, -3, -11);
        stroke(u + 11, v - 3, 9, -4, -9);
        if (rand() > 0.5) stroke(u + 5, v + 4, 8, -2, -5);
      } else if (surface === "lagoon" || surface === "meadow") {
        const u = x + rand() * 34,
          v = y + rand() * 20;
        if (surface === "meadow") {
          stroke(u, v, 4, -7, -6);
          stroke(u + 4, v, 7, -4, -4);
        } else {
          stroke(u, v, 21 + rand() * 28, -1, -5);
          p.strokeStyle = "rgba(252,251,235,0.9)";
          stroke(u + 3, v + 3, 23, -1, -3);
        }
      } else if (surface === "planks") {
        stroke(x, y + 1, 64, 0, rand());
        stroke(x + 6, y + 16, 45, -1, 3);
        if ((col + row) % 3 === 0) stroke(x, y, -1, 32, 16);
      } else {
        const slate = surface === "slate";
        if (surface !== "masonry" || rand() > 0.48) {
          stroke(x, y, 0, 26, 14);
          stroke(x, y + 26, 62, 0, slate ? 10 : 1.5);
          if (rand() > 0.42) stroke(x + 4, y + 23, 11, -1, -1);
        }
      }
    }
  }
  const texture = new T.CanvasTexture(sheet);
  texture.wrapS = texture.wrapT = T.RepeatWrapping;
  texture.colorSpace = T.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
