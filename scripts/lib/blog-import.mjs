/**
 * Imports a pinned snapshot of selected deval-blog posts into this site.
 *
 * The blog is the authoring home; this repo is the canonical published home.
 * A snapshot is: the posts' MDX, the public assets they reference, and the
 * MDX components they render (plus everything those import), copied from one
 * deval-blog commit. Nothing here runs in CI - `npm run sync:blog` drives it
 * from a machine that can already read the blog repository.
 *
 * Every transformation is mechanical so a later sync reproduces it exactly:
 *  - `@/x` imports in vendored code become `@blog/x` (src/vendor/deval-blog).
 *  - Modules listed in OVERRIDES are not copied; imports of them point at a
 *    local replacement instead (the live Jev demo calls /api, which a static
 *    export cannot serve).
 *  - Asset paths (/blog/<dir>/<file>, /images/<dir>/<file>) move under
 *    /img/writing/<dir>/<file>.
 *  - Links to imported posts become /writing/<slug>/; any other root-relative
 *    link points at the live blog.
 *  - `canonicalUrl` frontmatter is dropped: these pages always canonicalise to
 *    themselves.
 */
import { createHash } from "node:crypto";
import { existsSync, statSync } from "node:fs";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";

export const BLOG_REPO = "devalparikh/deval-blog";
export const BLOG_ORIGIN = "https://deval-blog.vercel.app";

/** Upstream module (blog-relative, no extension) -> local replacement. */
export const OVERRIDES = {
  "src/components/mdx/jev-use-cases/useLiveDemo": "@/components/writing/blog-overrides/useLiveDemo",
};

/** Upstream modules the overrides import, so the closure still carries them. */
const OVERRIDE_DEPENDENCIES = ["src/lib/jev-demo.ts"];

/** The reading shell and its stylesheet are vendored alongside the figures. */
const SHELL_FILES = ["src/components/BlogArticleLayout.tsx", "src/components/blog/article-toc.css"];

const MEDIA = /\.(?:png|jpe?g|gif|webp|avif|svg|mp4|webm|mov|json)$/i;
const SOURCE_EXTENSIONS = ["", ".ts", ".tsx", ".js", ".mjs", ".css", "/index.ts", "/index.tsx"];

/* ------------------------------------------------------------------ MDX -- */

/** Splits frontmatter from body without parsing it, so the text round-trips. */
export function splitFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  return match ? { frontmatter: match[1], body: source.slice(match[0].length) } : { frontmatter: "", body: source };
}

/** Removes fenced code and inline code so their contents are never mistaken for markup. */
export function maskCode(body) {
  return body
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, (block) => block.replace(/[^\n]/g, " "))
    .replace(/`[^`\n]+`/g, (code) => " ".repeat(code.length));
}

/** JSX component names an MDX body renders, in first-use order. */
export function findUsedComponents(mdx) {
  const { body } = splitFrontmatter(mdx);
  const names = new Set();
  for (const match of maskCode(body).matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)) names.add(match[1]);
  return [...names];
}

/** Drops one top-level frontmatter key (and any indented continuation lines). */
export function dropFrontmatterKey(source, key) {
  const { frontmatter, body } = splitFrontmatter(source);
  if (!frontmatter) return source;
  const lines = frontmatter.split("\n");
  const kept = [];
  for (let index = 0; index < lines.length; index++) {
    if (new RegExp(`^${key}\\s*:`).test(lines[index])) {
      while (index + 1 < lines.length && /^\s+\S/.test(lines[index + 1])) index++;
      continue;
    }
    kept.push(lines[index]);
  }
  return `---\n${kept.join("\n")}\n---\n${body}`;
}

/** Reads a scalar frontmatter value - enough for `image` and `hideCoverImage`. */
export function frontmatterValue(source, key) {
  const { frontmatter } = splitFrontmatter(source);
  const match = new RegExp(`^${key}\\s*:\\s*(.+)$`, "m").exec(frontmatter);
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : undefined;
}

export function setFrontmatterValue(source, key, value) {
  const { frontmatter, body } = splitFrontmatter(source);
  const line = `${key}: ${JSON.stringify(value)}`;
  const pattern = new RegExp(`^${key}\\s*:.*$`, "m");
  const next = pattern.test(frontmatter) ? frontmatter.replace(pattern, line) : `${frontmatter}\n${line}`;
  return `---\n${next}\n---\n${body}`;
}

/* ---------------------------------------------------------------- links -- */

/** Maps an upstream public asset path to where this site serves it. */
export function assetTarget(assetPath) {
  const match = /^\/(?:blog|images)\/(.+)$/.exec(assetPath);
  return match ? `/img/writing/${match[1]}` : null;
}

/**
 * Rewrites quoted or parenthesised asset paths and returns the upstream paths
 * found, so the caller can copy them.
 */
export function rewriteAssets(text) {
  const assets = new Set();
  const next = text.replace(/(["'(`])(\/(?:blog|images)\/[A-Za-z0-9_./-]+)(?=["')`?#])/g, (whole, quote, assetPath) => {
    if (!MEDIA.test(assetPath)) return whole;
    assets.add(assetPath);
    return `${quote}${assetTarget(assetPath)}`;
  });
  return { text: next, assets: [...assets] };
}

/** Resolves one root-relative upstream href for this site. */
export function rewriteHref(href, slugs, origin = BLOG_ORIGIN) {
  const match = /^(\/[^?#]*)([?#].*)?$/.exec(href);
  if (!match || href.startsWith("//") || href.startsWith("/img/writing/")) return href;
  const [, pathname, rest = ""] = match;
  const post = /^\/blog\/[a-z-]+\/([a-z0-9-]+)\/?$/.exec(pathname);
  if (post && slugs.has(post[1])) {
    const suffix = rest.startsWith("?") ? rest.replace(/^\?[^#]*/, "") : rest;
    return `/writing/${post[1]}/${suffix}`;
  }
  return `${origin}${pathname}${rest}`;
}

/** Rewrites Markdown link targets and `href` attributes that are root-relative. */
export function rewriteLinks(text, slugs, origin = BLOG_ORIGIN) {
  return text
    .replace(/(\]\()(\/[^)\s]*)(\))/g, (_, open, href, close) => `${open}${rewriteHref(href, slugs, origin)}${close}`)
    .replace(/(href=\{?["'])(\/[^"'\s]*)(["'])/g, (_, open, href, close) => `${open}${rewriteHref(href, slugs, origin)}${close}`);
}

/* -------------------------------------------------------------- modules -- */

const IMPORT_PATTERN = /((?:import|export)\s[^'";]*?from\s*|import\s*\(\s*|import\s+)(['"])([^'"]+)\2/g;

export function listImports(source) {
  return [...source.matchAll(IMPORT_PATTERN)].map((match) => match[3]);
}

/** Resolves an import to a blog-relative file path, or null for packages. */
export function resolveImport(blogRoot, fromFile, specifier) {
  let base;
  if (specifier.startsWith("@/")) base = path.join("src", specifier.slice(2));
  else if (specifier.startsWith(".")) base = path.join(path.dirname(fromFile), specifier);
  else return null;
  base = path.normalize(base);
  const override = Object.keys(OVERRIDES).find((key) => path.normalize(key) === base.replace(/\.(tsx?|mjs|js)$/, ""));
  if (override) return { override };
  for (const extension of SOURCE_EXTENSIONS) {
    const candidate = base + extension;
    const absolute = path.join(blogRoot, candidate);
    if (existsSync(absolute) && statSync(absolute).isFile()) return { file: candidate };
  }
  throw new Error(`Cannot resolve "${specifier}" imported by ${fromFile}`);
}

/** Maps component names to the module that exports them, via the blog's MDX index. */
export function parseComponentIndex(indexSource) {
  const map = new Map();
  for (const match of indexSource.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/g)) {
    for (const name of match[1].split(",").map((part) => part.trim()).filter(Boolean)) {
      map.set(name.split(/\s+as\s+/).pop(), { name: name.split(/\s+as\s+/)[0], specifier: match[2] });
    }
  }
  return map;
}

/** Every file reachable from the seeds, plus the override modules hit on the way. */
export async function importClosure(blogRoot, seeds) {
  const files = new Set();
  const overrides = new Set();
  const packages = new Set();
  const queue = [...seeds];
  while (queue.length) {
    const file = queue.pop();
    if (files.has(file)) continue;
    files.add(file);
    if (file.endsWith(".css")) continue;
    const source = await readFile(path.join(blogRoot, file), "utf8");
    for (const specifier of listImports(source)) {
      const resolved = resolveImport(blogRoot, file, specifier);
      if (!resolved) packages.add(specifier.split("/").slice(0, specifier.startsWith("@") ? 2 : 1).join("/"));
      else if (resolved.override) overrides.add(resolved.override);
      else queue.push(resolved.file);
    }
  }
  return { files: [...files].sort(), overrides: [...overrides].sort(), packages: [...packages].sort() };
}

/** Rewrites a vendored module's imports for its new home. */
export function rewriteImports(blogRoot, file, source) {
  return source.replace(IMPORT_PATTERN, (whole, lead, quote, specifier) => {
    const resolved = resolveImport(blogRoot, file, specifier);
    if (resolved?.override) return `${lead}${quote}${OVERRIDES[resolved.override]}${quote}`;
    if (specifier.startsWith("@/")) return `${lead}${quote}@blog/${specifier.slice(2)}${quote}`;
    return whole;
  });
}

/* --------------------------------------------------------------- import -- */

const sha256 = (text) => createHash("sha256").update(text).digest("hex");

/**
 * Writes the snapshot into `siteRoot`. `posts` is [{ slug, category }]; the
 * MDX filename must equal the slug, which is also the public URL.
 */
export async function importSnapshot({ blogRoot, siteRoot, posts, commit, committedAt, reencodeImage }) {
  const slugs = new Set(posts.map((post) => post.slug));
  const index = parseComponentIndex(await readFile(path.join(blogRoot, "src/components/mdx/index.ts"), "utf8"));
  const contentDir = path.join(siteRoot, "src/content/blog");
  const vendorDir = path.join(siteRoot, "src/vendor/deval-blog");
  const assetDir = path.join(siteRoot, "public/img/writing");

  const used = new Map();
  const assets = new Set();
  const records = [];
  const mdxOut = new Map();
  const coverJobs = [];

  for (const post of posts) {
    const relative = `content/posts/${post.category}/${post.slug}.mdx`;
    const absolute = path.join(blogRoot, relative);
    if (!existsSync(absolute)) throw new Error(`deval-blog has no ${relative}. The filename must match the slug "${post.slug}".`);
    let source = dropFrontmatterKey(await readFile(absolute, "utf8"), "canonicalUrl");

    // A hidden cover is never shown; skip copying it rather than ship dead weight.
    const hide = frontmatterValue(source, "hideCoverImage") === "true";
    if (hide && frontmatterValue(source, "image")) source = dropFrontmatterKey(source, "image");
    const cover = frontmatterValue(source, "image");
    if (cover && reencodeImage && /\.(png|jpe?g)$/i.test(cover)) {
      source = setFrontmatterValue(source, "image", `${assetTarget(cover).replace(/\.\w+$/, ".webp")}`);
      coverJobs.push([path.join(blogRoot, "public", cover), path.join(siteRoot, "public", assetTarget(cover).replace(/\.\w+$/, ".webp"))]);
    }

    const rewritten = rewriteAssets(source);
    rewritten.assets.forEach((asset) => assets.add(asset));
    source = rewriteLinks(rewritten.text, slugs);

    for (const name of findUsedComponents(source)) {
      const entry = index.get(name);
      if (!entry) throw new Error(`${post.slug} uses <${name}>, which deval-blog's MDX index does not export.`);
      used.set(name, entry);
    }
    mdxOut.set(post.slug, source);
    const meta = yaml.load(splitFrontmatter(source).frontmatter, { schema: yaml.JSON_SCHEMA }) ?? {};
    if (!meta.title || !meta.summary || !meta.date) throw new Error(`${relative} needs title, summary and date frontmatter.`);
    records.push({
      slug: post.slug,
      category: post.category,
      title: meta.title,
      summary: meta.summary,
      date: String(meta.date),
      source: relative,
      sha256: sha256(source),
    });
  }

  const seeds = new Set([...SHELL_FILES, ...OVERRIDE_DEPENDENCIES]);
  for (const { specifier } of used.values()) {
    const resolved = resolveImport(blogRoot, "src/components/mdx/index.ts", specifier);
    if (resolved?.file) seeds.add(resolved.file);
  }
  const closure = await importClosure(blogRoot, [...seeds]);
  const allowedPackages = new Set(["react", "react-dom", "next"]);
  const unexpected = closure.packages.filter((name) => !allowedPackages.has(name));
  if (unexpected.length) throw new Error(`Vendored components need packages this site lacks: ${unexpected.join(", ")}`);

  // The content and vendor directories are fully generated; start clean so
  // deleted upstream files disappear too.
  await rm(contentDir, { recursive: true, force: true });
  await rm(vendorDir, { recursive: true, force: true });
  await rm(assetDir, { recursive: true, force: true });
  await mkdir(contentDir, { recursive: true });

  for (const [slug, source] of mdxOut) await writeFile(path.join(contentDir, `${slug}.mdx`), source);

  for (const file of closure.files) {
    const target = path.join(vendorDir, file.replace(/^src\//, ""));
    await mkdir(path.dirname(target), { recursive: true });
    let source = await readFile(path.join(blogRoot, file), "utf8");
    if (!file.endsWith(".css")) source = rewriteImports(blogRoot, file, source);
    const rewritten = rewriteAssets(source);
    rewritten.assets.forEach((asset) => assets.add(asset));
    await writeFile(target, rewriteLinks(rewritten.text, slugs));
  }

  // Only the components these posts render, under the names MDX uses.
  const grouped = new Map();
  for (const [alias, { name, specifier }] of [...used].sort(([a], [b]) => a.localeCompare(b))) {
    if (!grouped.has(specifier)) grouped.set(specifier, []);
    grouped.get(specifier).push(name === alias ? name : `${name} as ${alias}`);
  }
  const indexSource = [
    `// Generated by scripts/sync-blog.mjs from ${BLOG_REPO}@${commit}. Do not edit.`,
    ...[...grouped].map(([specifier, names]) => `import { ${names.join(", ")} } from "${specifier}";`),
    "",
    `export const mdxComponents = {\n${[...used.keys()].sort().map((name) => `  ${name},`).join("\n")}\n};`,
    "",
  ].join("\n");
  await mkdir(path.join(vendorDir, "components/mdx"), { recursive: true });
  await writeFile(path.join(vendorDir, "components/mdx/index.ts"), indexSource);

  for (const asset of [...assets].sort()) {
    const from = path.join(blogRoot, "public", asset);
    if (!existsSync(from)) throw new Error(`Missing asset in deval-blog: public${asset}`);
    const to = path.join(siteRoot, "public", assetTarget(asset));
    await mkdir(path.dirname(to), { recursive: true });
    await copyFile(from, to);
  }

  for (const [from, to] of coverJobs) {
    await mkdir(path.dirname(to), { recursive: true });
    await reencodeImage(from, to);
  }

  const manifest = {
    $comment: "Written by `npm run sync:blog`. The posts below are a pinned snapshot of deval-blog; edit them there and re-sync.",
    repository: BLOG_REPO,
    commit,
    committedAt,
    origin: BLOG_ORIGIN,
    posts: records,
    components: [...used.keys()].sort(),
    vendored: [...closure.files.map((file) => file.replace(/^src\//, "")), "components/mdx/index.ts"].sort(),
    overrides: Object.fromEntries(closure.overrides.map((key) => [key, OVERRIDES[key]])),
    assets: [...[...assets].map((asset) => assetTarget(asset)), ...coverJobs.map(([, to]) => to.slice(to.indexOf("/img/writing/")))].sort(),
  };
  await writeFile(path.join(contentDir, "snapshot.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}
