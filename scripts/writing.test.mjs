import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  dropFrontmatterKey,
  findUsedComponents,
  frontmatterValue,
  importSnapshot,
  LOCAL_POSTS_DIR,
  localPostSlugs,
  parseComponentIndex,
  resolveImport,
  rewriteAssets,
  rewriteHref,
  rewriteLinks,
} from "./lib/blog-import.mjs";
import { countWords, formatWordCount } from "../src/lib/word-count.ts";
import { bookGeometry } from "../src/lib/book-geometry.ts";
import { choosePreviewLayout, MAX_CARD_SHARE } from "../src/lib/shelf-preview.ts";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const snapshot = JSON.parse(read("src/content/blog/snapshot.json"));
const siteRoot = new URL("../", import.meta.url).pathname;
const localSlugs = localPostSlugs(siteRoot);
/** Where a post's MDX lives: imported from deval-blog, or maintained here. */
const postPath = (slug) => (localSlugs.includes(slug) ? `${LOCAL_POSTS_DIR}/${slug}.mdx` : `src/content/blog/${slug}.mdx`);

/** The URLs agreed with the deval-blog side. They must not drift. */
const AGREED_SLUGS = [
  "building-with-jev",
  "transformer-basics-prefill-and-decode",
  "jev-and-system-one-models",
  "multi-agent-systems-scale-thought-in-parallel",
  "compound-engineering",
  "durable-execution-vs-atomic-execution",
  "speculative-decoding",
  "vision-action-transformers-vla-wam",
];

/* -------------------------------------------------------------- importer -- */

test("rejects paths outside the imported asset and module trees", () => {
  assert.throws(() => rewriteAssets('![image](/blog/../../private.png)'), /Unsafe asset/);
  assert.throws(() => resolveImport(".", "src/module.ts", "../private"), /Unsafe module/);
});

test("finds the MDX components a post renders, ignoring code", () => {
  const mdx = [
    "---",
    "title: x",
    "---",
    "<Callout>Hi</Callout> and <JevTerm id=\"a\" />",
    "`<NotAComponent />`",
    "```tsx",
    "<AlsoNot />",
    "```",
    "<Callout />",
  ].join("\n");
  assert.deepEqual(findUsedComponents(mdx), ["Callout", "JevTerm"]);
});

test("maps component names to their modules from the blog's MDX index", () => {
  const index = parseComponentIndex('import { A, B as C } from "./X";\nimport { D } from "./jev/Y";');
  assert.deepEqual(index.get("A"), { name: "A", specifier: "./X" });
  assert.deepEqual(index.get("C"), { name: "B", specifier: "./X" });
  assert.equal(index.get("D").specifier, "./jev/Y");
});

test("links to imported posts stay in-site; everything else goes to the live blog", () => {
  const slugs = new Set(["jev-and-system-one-models"]);
  assert.equal(rewriteHref("/blog/tech/jev-and-system-one-models", slugs), "/writing/jev-and-system-one-models/");
  assert.equal(
    rewriteHref("/blog/tech/jev-and-system-one-models#what-shared-prefill-means", slugs),
    "/writing/jev-and-system-one-models/#what-shared-prefill-means",
  );
  assert.equal(rewriteHref("/blog/tech/vision-transformers-astra", slugs), "https://deval-blog.vercel.app/blog/tech/vision-transformers-astra");
  assert.equal(rewriteHref("/notes", slugs), "https://deval-blog.vercel.app/notes");
  assert.equal(rewriteHref("https://example.com/blog/x", slugs), "https://example.com/blog/x");

  const mdx = "[a](/blog/tech/jev-and-system-one-models) [b](https://x.dev/y) <a href=\"/blog?category=tech\">c</a> [d](#local)";
  assert.equal(
    rewriteLinks(mdx, slugs),
    "[a](/writing/jev-and-system-one-models/) [b](https://x.dev/y) <a href=\"https://deval-blog.vercel.app/blog?category=tech\">c</a> [d](#local)",
  );
});

test("moves blog assets under /img/writing and reports them for copying", () => {
  const { text, assets } = rewriteAssets('src="/blog/post/a.gif" url("/images/jev/b.png") href="/blog/tech/post"');
  assert.equal(text, 'src="/img/writing/post/a.gif" url("/img/writing/jev/b.png") href="/blog/tech/post"');
  assert.deepEqual(assets, ["/blog/post/a.gif", "/images/jev/b.png"]);
});

test("a canonicalUrl added on the blog side is dropped on import", () => {
  const source = '---\ntitle: "T"\ncanonicalUrl: "https://devalparikh.me/writing/t/"\ntags:\n  - a\n---\nBody';
  const result = dropFrontmatterKey(source, "canonicalUrl");
  assert.doesNotMatch(result, /canonicalUrl/);
  assert.match(result, /title: "T"\ntags:\n {2}- a\n---\nBody/);
});

/* -------------------------------------------------------------- snapshot -- */

test("the snapshot plus the local posts hold exactly the agreed posts, each once", () => {
  assert.match(snapshot.commit, /^[0-9a-f]{40}$/);
  assert.equal(snapshot.repository, "devalparikh/deval-blog");
  const imported = snapshot.posts.map((post) => post.slug);
  assert.deepEqual([...imported, ...localSlugs].sort(), [...AGREED_SLUGS].sort());
  for (const slug of localSlugs) assert.ok(!imported.includes(slug), `${slug} is both imported and local`);
  for (const post of snapshot.posts) {
    // The MDX filename is the slug, which is the public URL.
    assert.equal(post.source, `content/posts/${post.category}/${post.slug}.mdx`);
    assert.ok(existsSync(new URL(`../src/content/blog/${post.slug}.mdx`, import.meta.url)), `${post.slug}.mdx missing`);
  }
});

test("imported posts have no links back to /blog and no canonicalUrl", () => {
  for (const slug of AGREED_SLUGS) {
    const mdx = read(postPath(slug));
    assert.doesNotMatch(mdx, /\]\(\/blog|href=["']\/blog/, `${slug} still links to /blog`);
    assert.doesNotMatch(mdx, /^canonicalUrl:/m);
  }
});

test("no vendored module calls an /api route the static export cannot serve", () => {
  for (const file of snapshot.vendored) {
    const source = read(`src/vendor/deval-blog/${file}`);
    assert.doesNotMatch(source, /fetch\(\s*["'`]\/api\//, `${file} calls /api`);
  }
  assert.ok(Object.keys(snapshot.overrides).includes("src/components/mdx/jev-use-cases/useLiveDemo"));
});

test("every referenced asset was copied", () => {
  for (const asset of snapshot.assets) {
    assert.ok(existsSync(new URL(`../public${asset}`, import.meta.url)), `${asset} missing`);
  }
});

/* ------------------------------------------------------------ local posts -- */

test("local posts match their shelf metadata and render only this repo's components", () => {
  const index = read(`${LOCAL_POSTS_DIR}/index.ts`);
  const declared = [...index.matchAll(/slug: "([^"]+)"/g)].map((match) => match[1]).sort();
  assert.deepEqual(declared, localSlugs, "src/content/posts/index.ts lists exactly the local MDX files");
  const registry = read("src/components/writing/posts/index.ts");
  for (const slug of localSlugs) {
    const mdx = read(postPath(slug));
    for (const key of ["title", "summary", "date"]) {
      const value = frontmatterValue(mdx, key);
      assert.ok(index.includes(JSON.stringify(value)), `${slug}: ${key} in index.ts must equal the frontmatter`);
    }
    for (const name of findUsedComponents(mdx)) {
      assert.match(registry, new RegExp(`\\b${name},`), `${slug} renders <${name}>, which postComponents does not register`);
    }
    assert.doesNotMatch(mdx, /\/img\/writing\//, `${slug} must not use assets the sync deletes`);
  }
});

test("the importer never imports a local post, and links to one stay in-site", async () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "local-posts-"));
  try {
    mkdirSync(path.join(root, LOCAL_POSTS_DIR), { recursive: true });
    writeFileSync(path.join(root, LOCAL_POSTS_DIR, "mine.mdx"), "---\ntitle: x\n---\n");
    assert.deepEqual(localPostSlugs(root), ["mine"]);
    await assert.rejects(
      importSnapshot({ blogRoot: root, siteRoot: root, posts: [{ slug: "mine", category: "tech" }], commit: "x", committedAt: "x" }),
      /maintained in src\/content\/posts/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
  const slugs = new Set(["jev-and-system-one-models", ...localSlugs]);
  assert.equal(rewriteHref("/blog/tech/speculative-decoding#exact", slugs), "/writing/speculative-decoding/#exact");
});

test("the sync carries local slugs over from an old snapshot without importing them", () => {
  const sync = read("scripts/sync-blog.mjs");
  assert.match(sync, /\.filter\(\(\{ slug \}\) => !local\.has\(slug\)\)/);
  assert.match(sync, /is maintained in \$\{LOCAL_POSTS_DIR\}\/, not imported/);
  assert.ok(!existsSync(new URL("../src/vendor/deval-blog/components/mdx/SpeculativeDecodingVisuals.tsx", import.meta.url)));
  assert.ok(readdirSync(new URL(`../${LOCAL_POSTS_DIR}/`, import.meta.url)).includes("speculative-decoding.mdx"));
});

test("local post components only import vendored modules the snapshot carries", () => {
  const root = new URL("../src/components/writing/posts/", import.meta.url);
  const files = readdirSync(root, { recursive: true }).filter((file) => /\.(tsx?|mjs)$/.test(file));
  for (const file of files) {
    const source = readFileSync(new URL(file, root), "utf8");
    for (const [, target] of source.matchAll(/from "@blog\/([^"]+)"/g)) {
      const listed = snapshot.vendored.some((entry) => entry.replace(/\.(tsx?|css)$/, "") === target);
      assert.ok(listed, `${file} imports @blog/${target}, which the snapshot does not vendor`);
    }
  }
});

/* ------------------------------------------------------------------ shelf -- */

const writingSource = read("src/content/writing.ts");
const shelfBooks = writingSource
  .split(/\n {2}\{\n {4}slug: /)
  .slice(1)
  .map((chunk) => ({
    slug: /^"([^"]+)"/.exec(chunk)[1],
    ground: /ground: "(\w+)"/.exec(chunk)[1],
    text: /text: "(\w+)"/.exec(chunk)[1],
    inks: /inks: \["(\w+)", "(\w+)"\]/.exec(chunk).slice(1),
  }));

test("every shelf book is a post and has a hand-drawn cover", () => {
  const covers = read("src/components/writing/covers/index.ts");
  assert.deepEqual(shelfBooks.map((book) => book.slug).sort(), [...AGREED_SLUGS].sort());
  for (const book of shelfBooks) assert.match(covers, new RegExp(`"${book.slug}": \\w+Art`));
});

test("each cover has its own ground colour", () => {
  const grounds = shelfBooks.map((book) => book.ground);
  assert.equal(new Set(grounds).size, grounds.length);
});

/** WCAG relative luminance contrast between two #rrggbb colours. */
function contrast(a, b) {
  const luminance = (hex) => {
    const [r, g, b] = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
    const linear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
  };
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

test("cover type is legible: small print 4.5:1, the big headline 3:1", () => {
  const css = read("src/app/globals.css");
  const palette = Object.fromEntries([...css.matchAll(/--cover-(\w+): (#[0-9a-f]{6});/g)].map((match) => [match[1], match[2]]));
  assert.equal(Object.keys(palette).length, 12, "the palette has 12 colours");
  for (const book of shelfBooks) {
    const small = contrast(palette[book.text], palette[book.ground]);
    const headline = contrast(palette[book.inks[0]], palette[book.ground]);
    assert.ok(small >= 4.5, `${book.slug}: small type ${small.toFixed(2)}:1`);
    assert.ok(headline >= 3, `${book.slug}: headline ${headline.toFixed(2)}:1`);
  }
});

/* ------------------------------------------------------- length and size -- */

test("counts prose words and skips frontmatter, code, JSX and link targets", () => {
  const mdx = [
    "---",
    "title: Not counted",
    "---",
    "import X from 'y'",
    "## Two words",
    "One [linked phrase](https://example.com/a/b/c) here.",
    "<Figure caption=\"not counted {either}\" data={{ a: '}' }} />",
    "<Callout>Three more words</Callout>",
    "```js",
    "const notCounted = true;",
    "```",
    "Inline `code` skipped.",
  ].join("\n");
  assert.equal(countWords(mdx), 2 + 4 + 3 + 2);
  assert.equal(formatWordCount(4852), "4,852 words");
});

test("longer posts make thicker books, within bounds", () => {
  const short = bookGeometry(479);
  const long = bookGeometry(4852);
  assert.ok(long.thickness > short.thickness * 3, "thickness is roughly linear in length");
  assert.equal(bookGeometry(0).thickness, 8);
  assert.equal(bookGeometry(1e6).thickness, 48);
  assert.deepEqual(Object.keys(bookGeometry(1000)), ["thickness"]);
});

/* ----------------------------------------------------- shelf preview -- */

const phone = { viewport: { top: 0, height: 844 }, obstructedTop: 56, cardHeight: 176, compactHeight: 56, margin: 12 };
const preview = (overrides) => choosePreviewLayout({ ...phone, caption: { top: 1500, bottom: 1620 }, book: { top: 150, bottom: 303 }, source: "tap", ...overrides });

test("the caption under the shelf is used whenever it is fully on screen", () => {
  assert.equal(preview({ caption: { top: 600, bottom: 720 } }).mode, "inline");
  // Partly hidden under the sticky nav, or below the fold, it is not.
  assert.equal(preview({ caption: { top: 30, bottom: 150 } }).mode, "card");
  assert.equal(preview({ caption: { top: 800, bottom: 920 } }).mode, "card");
});

test("an off-screen caption becomes the bottom card on a phone", () => {
  assert.deepEqual(preview({}), { mode: "card", dock: "bottom", scrollBy: 0 });
});

test("short or tiny screens get the one-line bar instead of the card", () => {
  // Landscape phone: the card would take over a third of the height.
  const landscape = preview({ viewport: { top: 0, height: 390 }, book: { top: 85, bottom: 309 } });
  assert.equal(landscape.mode, "compact");
  assert.ok((phone.cardHeight + 24) / 390 > MAX_CARD_SHARE);
  // Small portrait phone where the card no longer leaves room for the book above it.
  const small = preview({ viewport: { top: 0, height: 568 }, cardHeight: 190 });
  assert.equal(small.mode, "compact");
  // Even when the share is fine, the book must still fit above the card.
  const tallBook = preview({ viewport: { top: 0, height: 700 }, book: { top: 60, bottom: 520 } });
  assert.equal(tallBook.mode, "compact");
});

test("a tapped book under the overlay is scrolled clear of it, never under the nav", () => {
  const low = preview({ book: { top: 600, bottom: 753 } });
  assert.equal(low.dock, "bottom");
  assert.equal(low.scrollBy, Math.ceil(753 - (844 - 176 - 24)));
  // A book that would have to pass under the sticky nav only moves as far as it can.
  const tall = preview({ viewport: { top: 0, height: 600 }, cardHeight: 120, book: { top: 80, bottom: 500 } });
  assert.ok(tall.scrollBy <= 80 - 56 - 12);
});

test("a hovered book is never scrolled; its card docks at the top instead", () => {
  const hover = preview({ source: "hover", viewport: { top: 0, height: 900 }, book: { top: 600, bottom: 820 } });
  assert.deepEqual(hover, { mode: "card", dock: "top", scrollBy: 0 });
  // No room above either: stay at the bottom rather than jump around.
  const cramped = preview({ source: "hover", viewport: { top: 0, height: 900 }, book: { top: 120, bottom: 860 } });
  assert.equal(cramped.dock, "bottom");
  assert.equal(cramped.scrollBy, 0);
});

test("the shelf ships one view and no helper text in its resting state", () => {
  const shelf = read("src/components/writing/Bookshelf.tsx");
  assert.doesNotMatch(shelf, /Hover or tap|shelf-views|data-view|ShelfView/);
  assert.ok(!existsSync(new URL("../src/lib/shelf-view.ts", import.meta.url)));
  const css = read("src/components/writing/bookshelf.css");
  assert.doesNotMatch(css, /data-view|shelf-views|shelf-caption-hint/);
});
