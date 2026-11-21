import * as T from "three";
import { printTexture, type Surface } from "./print";
import { bridgeArch, frond, gable, hull, ridge } from "./contours";

// Static details share geometry and instance buffers. Moving parts have their
// own local group, so an entire skiff or tree moves as one object.
export function model() {
  const root = new T.Group();
  let origin = root;
  const shapes = {
    octagon: new T.CylinderGeometry(0.5, 0.5, 1, 8),
    octagonalRoof: new T.ConeGeometry(0.5, 1, 8),
    cupola: new T.LatheGeometry(
      [[0.5, 0], [0.46, 0.28], [0.37, 0.56], [0.23, 0.82], [0.08, 1]].map(([x, y]) => new T.Vector2(x, y)),
      8,
    ),
    obelisk: new T.CylinderGeometry(0.25, 0.37, 1, 4).rotateY(Math.PI / 4),
    shield: new T.LatheGeometry(
      [[0.5, 0], [0.42, 0.17], [0.3, 0.43], [0.2, 0.72], [0.12, 0.91], [0.04, 1], [0, 1]]
        .map(([x, y]) => new T.Vector2(x, y)), 24,
    ),
    basalt: new T.DodecahedronGeometry(0.53),
    hull: hull(),
    bridge: bridgeArch(),
    gable: gable(),
    rim: new T.TorusGeometry(0.46, 0.042, 5, 22),
    ridge: ridge(false),
    summit: ridge(true),
    frond: frond(),
    canopyPanel: new T.ConeGeometry(0.5, 1, 1, 1, true, 0, Math.PI / 6),
    box: new T.BoxGeometry(1, 1, 1),
    leaf: new T.IcosahedronGeometry(0.53, 1),
    round: new T.SphereGeometry(0.5, 14, 10),
    drum: new T.CylinderGeometry(0.5, 0.5, 1, 16),
    cone: new T.ConeGeometry(0.5, 1, 12),
    spire: new T.ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4),
  };
  const wash = { value: 1 };
  function illustratedMaterial(ruled: boolean, surface?: Surface) {
    const material = new T.MeshLambertMaterial();
    if (surface) material.map = printTexture(surface);
    material.customProgramCacheKey = () => (ruled ? "ruled-paper" : "painted-paper");
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, { wash });
      const varyings = "varying vec3 localPoint; varying vec3 faceNormal;\n";
      shader.vertexShader =
        varyings +
        shader.vertexShader.replace(
          "#include <begin_vertex>",
          `
        #include <begin_vertex>
        localPoint = position; faceNormal = normal;

      `,
        );
      if (surface && surface !== "foliage") {
        shader.vertexShader = shader.vertexShader.replace(
          "#include <uv_vertex>",
          `
          #include <uv_vertex>
          vec3 dimensions = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
          vec3 page = position * dimensions;
          vMapUv = (abs(normal.y) > 0.5 ? page.xz : abs(normal.x) > 0.5 ? page.zy : page.xy) * 0.5;
        `,
        );
      }
      const lines = ruled
        ? `
        vec3 dist = (0.5 - abs(localPoint)) / max(fwidth(localPoint), vec3(0.0001)) + abs(faceNormal) * 1000.0;
        float nearest = min(dist.x, min(dist.y, dist.z));
        vec3 footprint = fwidth(localPoint);
        float width = 1.0 / max(max(footprint.x, footprint.y), max(footprint.z, 0.0001));
        stroke = max(stroke, (1.0 - smoothstep(0.0, 1.50, nearest)) * smoothstep(2.0, 8.0, width));
      `
        : "";
      shader.fragmentShader =
        varyings +
        "uniform float wash;\n" +
        shader.fragmentShader.replace(
          "#include <opaque_fragment>",
          `
          outgoingLight = mix(outgoingLight, diffuseColor.rgb, wash * 0.69);
          float stroke = 0.58 * (1.0 - smoothstep(0.02, 0.22, abs(normal.z)));
          ${lines}
          outgoingLight = mix(outgoingLight, vec3(0.046, 0.041, 0.032), stroke * 0.98);
          #include <opaque_fragment>
        `,
        );
    };
    return material;
  }
  const paint = illustratedMaterial(false),
    ruled = illustratedMaterial(true);
  const leafPaint = illustratedMaterial(false, "foliage");
  const papers = new Map<Surface, T.MeshLambertMaterial>();
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
  function group(x: number, y: number, z: number, parent = origin) {
    const g = new T.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  }
  function form(
    shape: keyof typeof shapes | Surface,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: string,
    parent = origin,
    rx = 0,
    ry = 0,
    rz = 0,
  ) {
    const geometry = shape in shapes ? shapes[shape as keyof typeof shapes] : shapes.box;
    if (!(shape in shapes) && !papers.has(shape as Surface))
      papers.set(shape as Surface, illustratedMaterial(true, shape as Surface));
    let batch = batches.get(parent);
    if (!batch) batches.set(parent, (batch = new Map()));
    const glow = color === "glass";
    const glazed = color === "glazing";
    const key = shape + (glow ? "-lit" : glazed ? "-glazed" : "");
    let parts = batch.get(key);
    if (!parts) batch.set(key, (parts = { geometry, glow, glazed, transforms: [], colors: [] }));
    temp.position.set(x, y, z);
    temp.scale.set(w, h, d);
    temp.rotation.set(rx, ry, rz);
    temp.updateMatrix();
    parts.transforms.push(temp.matrix.clone());
    parts.colors.push(new T.Color(glow || glazed ? "white" : color));
  }
  function beam(a: number[], b: number[], width: number, color: string, parent = origin) {
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
    parent = origin,
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
  function place(x: number, z: number) {
    origin = group(x, 0, z, root);
    return origin;
  }
  // Moving residents share draw calls with the architecture. Only their
  // instance transforms need to be rewritten after the choreography runs.
  const moving: { mesh: T.InstancedMesh; parent: T.Group; local: T.Matrix4; index: number }[] = [];
  const matrix = new T.Matrix4();
  function sync() {
    root.updateMatrixWorld();
    for (const part of moving) {
      part.mesh.setMatrixAt(part.index, matrix.multiplyMatrices(part.parent.matrixWorld, part.local));
      part.mesh.instanceMatrix.needsUpdate = true;
    }
  }
  function finish() {
    root.updateMatrixWorld(true);
    const counts = new Map<string, number>();
    for (const batch of batches.values())
      for (const [key, p] of batch) counts.set(key, (counts.get(key) ?? 0) + p.transforms.length);
    const meshes = new Map<string, T.InstancedMesh>();
    const offsets = new Map<string, number>();
    for (const [parent, batch] of batches) {
      let dynamic = false;
      parent.traverseAncestors((a) => {
        if (a.userData.moving) dynamic = true;
      });
      for (const [key, p] of batch) {
        let mesh = meshes.get(key);
        if (!mesh) {
          mesh = new T.InstancedMesh(
            p.geometry,
            p.glow
              ? lit
              : p.glazed
                ? glazing
                : (papers.get(key as Surface) ??
                  (key === "leaf" ? leafPaint : key === "box" ? ruled : paint)),
            counts.get(key)!,
          );
          mesh.frustumCulled = false;
          mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
          mesh.castShadow = !p.glow && !p.glazed;
          mesh.receiveShadow = true;
          meshes.set(key, mesh);
          root.add(mesh);
        }
        let index = offsets.get(key) ?? 0;
        for (const [i, local] of p.transforms.entries()) {
          mesh.setMatrixAt(index, matrix.multiplyMatrices(parent.matrixWorld, local));
          mesh.setColorAt(index, p.colors[i]);
          if (dynamic || parent.userData.moving) moving.push({ mesh, parent, local, index });
          index++;
        }
        offsets.set(key, index);
      }
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
    papers.forEach((material) => {
      material.map?.dispose();
      material.dispose();
    });
    leafPaint.map?.dispose();
    leafPaint.dispose();
    ruled.dispose();
    paint.dispose();
    lit.dispose();
    glazing.dispose();
  }
  return {
    wash,
    root,
    place,
    sync,
    group,
    form,
    beam,
    sign,
    finish,
    dispose,
    random,
    lit,
    trees,
    choreographies,
  };
}
export type Model = ReturnType<typeof model>;
