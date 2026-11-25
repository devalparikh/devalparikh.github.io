/**
 * The styled objects in the writing room - the things that make a bookcase
 * look lived-in rather than a list. All drawn here, in the room's --decor-*
 * and --case-* tokens, so they relight with the theme. Shading is black or
 * white at low alpha over those fills, the way a matte surface takes light.
 *
 * Purely decorative: every piece is aria-hidden.
 */

/** Deterministic jitter, so server and client draw identical leaves. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}

export type ShelfDecorKind = "vase" | "stack" | "plant" | "print";

export function ShelfDecor({ kind }: { kind: ShelfDecorKind }) {
  return (
    <span className="shelf-decor-art" data-kind={kind} aria-hidden="true">
      {kind === "vase" && <Vase />}
      {kind === "stack" && <Stack />}
      {kind === "plant" && <Plant />}
      {kind === "print" && <Print />}
    </span>
  );
}

/** A stoneware vase of eucalyptus stems. */
function Vase() {
  const random = seeded(11);
  const stems = [
    { d: "M50 132 C48 104 36 78 22 40", tip: [22, 40] },
    { d: "M50 132 C52 98 56 62 52 14", tip: [52, 14] },
    { d: "M51 132 C58 106 72 84 84 52", tip: [84, 52] },
    { d: "M50 132 C44 112 30 100 14 92", tip: [14, 92] },
  ];
  const leaves: { x: number; y: number; r: number }[] = [];
  for (const stem of stems) {
    const [tx, ty] = stem.tip;
    for (let index = 1; index <= 7; index++) {
      const t = index / 8;
      leaves.push({
        x: 50 + (tx - 50) * t + (random() - 0.5) * 10,
        y: 132 + (ty - 132) * t + (random() - 0.5) * 6,
        r: 4.2 + random() * 2.6,
      });
    }
  }
  return (
    <svg viewBox="0 0 100 200" preserveAspectRatio="xMidYMax meet" overflow="visible">
      {stems.map((stem) => (
        <path key={stem.d} d={stem.d} className="d-stem" fill="none" strokeWidth="1.4" strokeLinecap="round" />
      ))}
      {leaves.map((leaf, index) => (
        <circle key={index} cx={leaf.x} cy={leaf.y} r={leaf.r} className={index % 3 ? "d-leaf" : "d-leaf-light"} />
      ))}
      <path
        d="M38 200 C25 200 21 186 23 171 C25 155 35 149 39 139 L40 127 L60 127 L61 139 C65 149 75 155 77 171 C79 186 75 200 62 200 Z"
        className="d-ceramic"
      />
      <path d="M61 139 C65 149 75 155 77 171 C79 186 75 200 62 200 L55 200 C66 196 69 184 67 170 C65 156 57 149 55 139 Z" className="d-shade" />
      <path d="M31 160 C30 170 30 180 34 190" className="d-gloss" fill="none" strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="50" cy="127" rx="10" ry="2" className="d-ceramic-shade" />
    </svg>
  );
}

/** Three linen-bound books lying flat, a brass sphere on top. */
function Stack() {
  const books = [
    { y: 44, x: 4, w: 112, h: 16, tone: "d-linen-2" },
    { y: 31, x: 12, w: 100, h: 13, tone: "d-linen" },
    { y: 20, x: 8, w: 96, h: 11, tone: "d-linen-3" },
  ];
  return (
    <svg viewBox="0 0 120 60" preserveAspectRatio="xMidYMax meet" overflow="visible">
      {books.map((book) => (
        <g key={book.y}>
          <rect x={book.x} y={book.y} width={book.w} height={book.h} rx="1.5" className={book.tone} />
          {/* page block on the right, the spine's rounded edge on the left */}
          <rect x={book.x + book.w - 9} y={book.y + 1.5} width="8" height={book.h - 3} className="d-paper" />
          {Array.from({ length: Math.floor((book.h - 3) / 2.2) }, (_, line) => (
            <path key={line} d={`M${book.x + book.w - 9} ${book.y + 2.6 + line * 2.2} h8`} className="d-page-line" strokeWidth="0.4" />
          ))}
          <rect x={book.x} y={book.y} width="4" height={book.h} rx="1.5" className="d-shade" />
          <path d={`M${book.x + 14} ${book.y + book.h / 2} h${book.w * 0.36}`} className="d-emboss" strokeWidth="1.1" />
        </g>
      ))}
      <circle cx="54" cy="11" r="9" className="d-brass" />
      <circle cx="51" cy="8" r="3" className="d-gloss-fill" />
      <path d="M54 20 a9 9 0 0 0 9 -9 a9 9 0 0 1 -9 9" className="d-shade" />
    </svg>
  );
}

/** Pothos in a stone pot, its vines spilling over the shelf edge. */
function Plant() {
  const random = seeded(29);
  const vines = [
    "M34 52 C22 62 16 84 18 112 C19 124 22 134 20 146",
    "M66 52 C80 60 86 82 84 104 C83 114 86 122 90 128",
    "M50 48 C48 36 40 24 30 16",
    "M52 48 C58 34 68 26 78 22",
  ];
  const leaves: { x: number; y: number; a: number; s: number }[] = [];
  const points = [
    [22, 70], [17, 92], [19, 114], [21, 136], [80, 70], [85, 92], [84, 112], [89, 126],
    [42, 30], [33, 20], [62, 32], [74, 24], [50, 42], [36, 48], [64, 46],
  ];
  for (const [x, y] of points) leaves.push({ x, y, a: random() * 80 - 40, s: 0.8 + random() * 0.5 });
  return (
    <svg viewBox="0 0 100 110" preserveAspectRatio="xMidYMax meet" overflow="visible">
      {vines.map((vine) => (
        <path key={vine} d={vine} className="d-stem-green" fill="none" strokeWidth="1.3" strokeLinecap="round" />
      ))}
      <path d="M26 56 H74 L70 108 C70 110 68 110 66 110 H34 C32 110 30 110 30 108 Z" className="d-stone" />
      <path d="M58 56 H74 L70 108 C70 110 68 110 66 110 H60 Z" className="d-shade" />
      <rect x="24" y="52" width="52" height="6" rx="1.5" className="d-stone" />
      <rect x="24" y="52" width="52" height="2" rx="1" className="d-gloss-fill" />
      {leaves.map((leaf, index) => (
        <path
          key={index}
          transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.a}) scale(${leaf.s})`}
          d="M0 -6 C5 -6 7 -1 0 6 C-7 -1 -5 -6 0 -6 Z"
          className={index % 3 === 0 ? "d-leaf-light" : index % 2 ? "d-leaf" : "d-leaf-dark"}
        />
      ))}
    </svg>
  );
}

/** A small framed print - an arch and a low sun - leaning on the back panel. */
function Print() {
  return (
    <svg viewBox="0 0 100 130" preserveAspectRatio="xMidYMax meet" overflow="visible">
      <g transform="rotate(-4 50 130)">
        <rect x="6" y="4" width="88" height="124" className="d-wood" />
        <rect x="10" y="8" width="80" height="116" className="d-paper" />
        <rect x="22" y="22" width="56" height="88" className="d-linen" />
        <path d="M30 110 V70 a20 20 0 0 1 40 0 V110 Z" className="d-clay" />
        <circle cx="62" cy="48" r="8" className="d-brass" />
        <rect x="22" y="94" width="56" height="16" className="d-linen-2" opacity="0.85" />
        <rect x="6" y="4" width="88" height="124" className="d-frame-edge" fill="none" strokeWidth="1" />
      </g>
    </svg>
  );
}

/* ---------------------------------------------------------- room pieces -- */

/** A tripod floor lamp with a lit linen drum shade. Stands on the floor at right. */
export function FloorLamp() {
  return (
    <svg className="room-lamp" viewBox="0 0 120 420" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <defs>
        <filter id="room-lamp-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="26" />
        </filter>
      </defs>
      {/* The pool of light the shade throws on the wall, up and down. */}
      <ellipse cx="60" cy="92" rx="70" ry="96" className="d-lamp-glow" filter="url(#room-lamp-glow)" />
      <path d="M60 120 V330" className="d-wood-stroke" strokeWidth="3" />
      <path d="M60 300 L22 418 M60 300 L98 418 M60 300 L60 418" className="d-wood-stroke" strokeWidth="4" strokeLinecap="round" />
      <path d="M26 60 H94 L102 124 H18 Z" className="d-lamp-shade" />
      <path d="M26 60 H94 L102 124 H18 Z" className="d-lamp-weave" />
      <path d="M18 124 H102" className="d-shade-stroke" strokeWidth="2" />
      <ellipse cx="60" cy="126" rx="34" ry="4" className="d-lamp-bulb" />
    </svg>
  );
}

/** An olive tree in a seagrass basket. Stands on the floor at left. */
export function OliveTree() {
  const random = seeded(7);
  const leaves: { x: number; y: number; a: number; tone: string }[] = [];
  const clusters = [
    [60, 74, 42], [100, 50, 48], [142, 78, 40], [78, 120, 36], [126, 124, 34], [100, 94, 34], [40, 112, 26], [160, 116, 24],
  ];
  for (const [cx, cy, r] of clusters) {
    for (let index = 0; index < 64; index++) {
      const angle = random() * Math.PI * 2;
      const distance = Math.sqrt(random()) * r;
      leaves.push({
        x: cx + Math.cos(angle) * distance,
        y: cy + Math.sin(angle) * distance * 0.8,
        a: random() * 180,
        tone: ["d-leaf", "d-leaf-dark", "d-leaf-light"][Math.floor(random() * 3)],
      });
    }
  }
  return (
    <svg className="room-tree" viewBox="0 0 200 420" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <path
        d="M98 340 C96 290 104 250 96 212 C90 186 78 160 70 120 M98 250 C112 214 124 170 126 122 M97 214 C104 180 102 140 100 96"
        className="d-trunk"
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {leaves.map((leaf, index) => (
        <ellipse key={index} cx={leaf.x} cy={leaf.y} rx="7" ry="1.9" transform={`rotate(${leaf.a} ${leaf.x} ${leaf.y})`} className={leaf.tone} />
      ))}
      <path d="M56 330 H144 L134 418 H66 Z" className="d-basket" />
      {Array.from({ length: 11 }, (_, index) => (
        <path key={index} d={`M${57 + index * 0.9} ${336 + index * 7.6} H${143 - index * 0.9}`} className="d-weave" strokeWidth="2.2" />
      ))}
      <path d="M118 330 H144 L134 418 H112 Z" className="d-shade" />
    </svg>
  );
}
