import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  dropFrontmatterKey,
  findUsedComponents,
  parseComponentIndex,
  resolveImport,
  rewriteAssets,
  rewriteHref,
  rewriteLinks,
} from "./lib/blog-import.mjs";
import { countWords, formatWordCount } from "../src/lib/word-count.ts";
import { bookGeometry } from "../src/lib/book-geometry.ts";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const snapshot = JSON.parse(read("src/content/blog/snapshot.json"));

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

test("the snapshot is pinned to one deval-blog commit and holds exactly the agreed posts", () => {
  assert.match(snapshot.commit, /^[0-9a-f]{40}$/);
  assert.equal(snapshot.repository, "devalparikh/deval-blog");
  assert.deepEqual(snapshot.posts.map((post) => post.slug).sort(), [...AGREED_SLUGS].sort());
  for (const post of snapshot.posts) {
    // The MDX filename is the slug, which is the public URL.
    assert.equal(post.source, `content/posts/${post.category}/${post.slug}.mdx`);
    assert.ok(existsSync(new URL(`../src/content/blog/${post.slug}.mdx`, import.meta.url)), `${post.slug}.mdx missing`);
  }
});

test("imported posts have no links back to /blog and no canonicalUrl", () => {
  for (const slug of AGREED_SLUGS) {
    const mdx = read(`src/content/blog/${slug}.mdx`);
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

test("every shelf book is in the snapshot and has a hand-drawn cover", () => {
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

test("longer posts make thicker, larger books, within bounds", () => {
  const short = bookGeometry(479);
  const long = bookGeometry(4852);
  assert.ok(long.thickness > short.thickness * 3, "thickness is roughly linear in length");
  assert.ok(long.scale > short.scale);
  assert.ok(long.spine > short.spine);
  assert.equal(bookGeometry(0).thickness, 8);
  assert.equal(bookGeometry(1e6).thickness, 48);
  assert.ok(bookGeometry(1e6).scale <= 1);
});
