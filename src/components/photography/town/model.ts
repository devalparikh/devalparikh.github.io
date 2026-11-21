import * as T from "three";

// Static details share geometry and instance buffers. Moving parts have their
// own local group, so an entire skiff or tree moves as one object.
export function model() {
  const root = new T.Group();
  const shapes = {
    box: new T.BoxGeometry(1, 1, 1),
    leaf: new T.IcosahedronGeometry(0.55, 0),
    round: new T.SphereGeometry(0.5, 14, 10),
    drum: new T.CylinderGeometry(0.5, 0.5, 1, 16),
    cone: new T.ConeGeometry(0.5, 1, 12),
    spire: new T.ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4),
  };
  const paint = new T.MeshStandardMaterial({ roughness: 0.92 });
  const lit = new T.MeshStandardMaterial({ color: "#8eafb0", emissive: "#ffae4c", emissiveIntensity: 0 });
  const glazing = new T.MeshStandardMaterial({
    color: "#b8d9cf",
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    roughness: 0.28,
  });
  const batches = new Map<
    T.Group,
    Map<
      string,
      {
        geometry: T.BufferGeometry;
        glow: boolean;
        glazed: boolean;
        transforms: T.Matrix4[];
        colors: T.Color[];
      }
    >
  >();
  const temp = new T.Object3D();
  const choreographies: ((t: number) => void)[] = [];
  const trees: T.Group[] = [];
  let seed = 93;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) | 0) >>> 0) / 4294967296;
  function group(x: number, y: number, z: number, parent = root) {
    const g = new T.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  }
  function form(
    shape: keyof typeof shapes,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: string,
    parent = root,
    rx = 0,
    ry = 0,
    rz = 0,
  ) {
    let batch = batches.get(parent);
    if (!batch) batches.set(parent, (batch = new Map()));
    const glow = color === "glass";
    const glazed = color === "glazing";
    const key = shape + (glow ? "-lit" : glazed ? "-glazed" : "");
    let parts = batch.get(key);
    if (!parts)
      batch.set(key, (parts = { geometry: shapes[shape], glow, glazed, transforms: [], colors: [] }));
    temp.position.set(x, y, z);
    temp.scale.set(w, h, d);
    temp.rotation.set(rx, ry, rz);
    temp.updateMatrix();
    parts.transforms.push(temp.matrix.clone());
    parts.colors.push(new T.Color(glow || glazed ? "white" : color));
  }
  function beam(a: number[], b: number[], width: number, color: string, parent = root) {
    const start = new T.Vector3(...a),
      end = new T.Vector3(...b);
    const axis = end.clone().sub(start);
    const angles = new T.Euler().setFromQuaternion(
      new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), axis.clone().normalize()),
    );
    start.lerp(end, 0.5);
    form(
      "drum",
      start.x,
      start.y,
      start.z,
      width,
      axis.length(),
      width,
      color,
      parent,
      angles.x,
      angles.y,
      angles.z,
    );
  }
  const textures: T.CanvasTexture[] = [];
  const signs: T.Material[] = [];
  function sign(
    word: string,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    color: string,
    parent = root,
  ) {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 96;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 96);
    ctx.strokeStyle = "#e8d7ae";
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, 502, 86);
    ctx.fillStyle = "#fff3d2";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 50px Georgia";
    ctx.fillText(word, 256, 50, 454);
    const map = new T.CanvasTexture(c);
    map.colorSpace = T.SRGBColorSpace;
    textures.push(map);
    const material = new T.MeshBasicMaterial({ map });
    signs.push(material);
    const plaque = new T.Mesh(shapes.box, material);
    plaque.position.set(x, y, z);
    plaque.scale.set(w, h, 0.05);
    parent.add(plaque);
  }
  function finish() {
    for (const [parent, batch] of batches)
      for (const p of batch.values()) {
        const mesh = new T.InstancedMesh(
          p.geometry,
          p.glow ? lit : p.glazed ? glazing : paint,
          p.transforms.length,
        );
        p.transforms.forEach((matrix, i) => {
          mesh.setMatrixAt(i, matrix);
          mesh.setColorAt(i, p.colors[i]);
        });
        mesh.castShadow = !p.glow && !p.glazed;
        mesh.receiveShadow = true;
        parent.add(mesh);
      }
    batches.clear();
  }
  function dispose() {
    root.traverse((obj) => {
      if (obj instanceof T.InstancedMesh) obj.dispose();
    });
    Object.values(shapes).forEach((g) => g.dispose());
    textures.forEach((t) => t.dispose());
    signs.forEach((m) => m.dispose());
    paint.dispose();
    lit.dispose();
    glazing.dispose();
  }
  return { root, group, form, beam, sign, finish, dispose, random, lit, trees, choreographies };
}
export type Model = ReturnType<typeof model>;
