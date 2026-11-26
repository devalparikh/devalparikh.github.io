/**
 * Checks the exported HTML for the writing pages. Run after `npm run build`.
 * The URLs and canonicals were agreed with deval-blog and must be exact.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";

const out = new URL("../out/", import.meta.url);
const snapshot = JSON.parse(readFileSync(new URL("../src/content/blog/snapshot.json", import.meta.url), "utf8"));
/** Imported posts plus the ones maintained in src/content/posts. */
const posts = [
  ...snapshot.posts,
  ...readdirSync(new URL("../src/content/posts/", import.meta.url))
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => ({ slug: file.slice(0, -4) })),
];
const html = (path) => readFileSync(new URL(path, out), "utf8");

test("each post is exported at /writing/<slug>/ with one self-referencing canonical and matching og:url", () => {
  for (const { slug } of posts) {
    const file = `writing/${slug}/index.html`;
    assert.ok(existsSync(new URL(file, out)), `${file} was not exported`);
    const page = html(file);
    const url = `https://devalparikh.me/writing/${slug}/`;
    const canonicals = [...page.matchAll(/<link[^>]+rel="canonical"[^>]*>/g)].map((match) => match[0]);
    assert.equal(canonicals.length, 1, `${slug}: expected one canonical, found ${canonicals.length}`);
    assert.match(canonicals[0], new RegExp(`href="${url}"`));
    assert.match(page, new RegExp(`<meta property="og:url" content="${url}"`));
    // Not a redirect: the article itself is here.
    assert.doesNotMatch(page, /http-equiv="refresh"/);
    assert.match(page, /class="blog-article-title"/);
  }
});

test("article pages link in-site and never to the old /blog paths", () => {
  for (const { slug } of posts) {
    const page = html(`writing/${slug}/index.html`);
    assert.doesNotMatch(page, /href="\/blog\//, `${slug} links to /blog/`);
  }
});

test("the speculative decoding post renders its own figures", () => {
  const page = html("writing/speculative-decoding/index.html");
  for (const marker of ["sdv-mask", "sdv-grid", "sdv-kv-row", "sdv-lane", "sdv-bars", "sdv-sampling"]) {
    assert.match(page, new RegExp(`class="[^"]*${marker}`), `missing ${marker}`);
  }
  assert.match(page, /Big model reads/);
});

test("the Jev demos fall back to the live post instead of calling /api", () => {
  const page = html("writing/building-with-jev/index.html");
  assert.match(page, /https:\/\/deval-blog\.vercel\.app\/blog\/tech\/building-with-jev\/#demo-clipboard/);
});

test("the shelf links every cover to its in-site post", () => {
  const page = html("writing/index.html");
  assert.match(page, /<link rel="canonical" href="https:\/\/devalparikh\.me\/writing\/"/);
  assert.match(page, /<meta property="og:url" content="https:\/\/devalparikh\.me\/writing\/"/);
  for (const { slug } of posts) assert.match(page, new RegExp(`href="/writing/${slug}/"`));
  assert.match(page, /rolodex\.dev/);
});


test("every exported canonical has exactly one matching og:url", () => {
  const files = readdirSync(out, { recursive: true }).filter((file) => file.endsWith(".html")).sort();
  assert.ok(files.length > 0, "expected exported HTML pages");
  for (const file of files) {
    const page = html(file);
    const canonicals = [...page.matchAll(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"[^>]*>/g)].map((match) => match[1]);
    const urls = [...page.matchAll(/<meta[^>]+property="og:url"[^>]+content="([^"]+)"[^>]*>/g)].map((match) => match[1]);
    console.log(`${file} | ${canonicals.join(", ") || "(none)"} | ${urls.join(", ") || "(none)"}`);
    if (canonicals.length) {
      assert.equal(canonicals.length, 1, `${file}: expected one canonical`);
      assert.deepEqual(urls, canonicals, `${file}: og:url must equal canonical`);
    }
  }
});
