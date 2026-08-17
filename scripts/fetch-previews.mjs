#!/usr/bin/env node
/**
 * Share-image fetcher.
 *
 * Projects that ship their own screenshot set `image` in the content module.
 * For the rest, this fetches the linked site's Open Graph image once, stores a
 * web-sized copy under `public/img/previews/`, and records it in a manifest the
 * drawer reads.
 *
 * Results are committed so builds stay reproducible and do not depend on those
 * sites being up. Pass `--refresh` to re-fetch everything.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(import.meta.dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "public", "img", "previews");
const MANIFEST = path.join(ROOT, "src", "content", "previews.generated.json");
const PROJECTS = path.join(ROOT, "src", "content", "projects.ts");

const MAX_WIDTH = 1200;
const TIMEOUT_MS = 15_000;
const USER_AGENT = "devalparikh.me preview fetcher";

const META_PATTERNS = [
  /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
  /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
];

/**
 * Reads the entries straight out of the content module. Parsing TypeScript
 * with a regex is normally a bad idea, but it keeps this script free of a
 * build step and the shape it depends on is small and stable.
 */
async function readProjects() {
  const source = await readFile(PROJECTS, "utf8");
  const body = source.slice(source.indexOf("entries: ["));

  return [...body.matchAll(/\{\s*id: "([^"]+)"[\s\S]*?\n {4}\}/g)].map(([block, id]) => ({
    id,
    href: block.match(/href: "([^"]+)"/)?.[1],
    hasImage: /\n\s+image: "/.test(block),
  }));
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": USER_AGENT },
      redirect: "follow",
    });
  } finally {
    clearTimeout(timer);
  }
}

async function findShareImage(pageUrl) {
  const response = await fetchWithTimeout(pageUrl);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

  const html = await response.text();
  for (const pattern of META_PATTERNS) {
    const match = html.match(pattern);
    if (match) return new URL(match[1], response.url).href;
  }

  throw new Error("no og:image or twitter:image");
}

async function buildPreview(id, href) {
  const imageUrl = await findShareImage(href);
  const response = await fetchWithTimeout(imageUrl);
  if (!response.ok) throw new Error(`image ${response.status}`);

  const source = Buffer.from(await response.arrayBuffer());
  const output = await sharp(source)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true });

  await writeFile(path.join(OUTPUT_DIR, `${id}.webp`), output.data);

  return {
    src: `/img/previews/${id}.webp`,
    width: output.info.width,
    height: output.info.height,
    source: imageUrl,
    fetchedAt: new Date().toISOString(),
  };
}

async function main() {
  const refresh = process.argv.includes("--refresh");
  await mkdir(OUTPUT_DIR, { recursive: true });

  let existing = {};
  try {
    existing = JSON.parse(await readFile(MANIFEST, "utf8"));
  } catch {
    // First run.
  }

  const projects = await readProjects();
  const wanted = projects.filter((project) => project.href && !project.hasImage);
  const manifest = {};

  for (const project of wanted) {
    if (!refresh && existing[project.id]) {
      manifest[project.id] = existing[project.id];
      console.log(`[previews] ${project.id}: cached`);
      continue;
    }

    try {
      manifest[project.id] = await buildPreview(project.id, project.href);
      const kb = (manifest[project.id].width * 0) || 0; // width recorded below
      void kb;
      console.log(
        `[previews] ${project.id}: ${manifest[project.id].source} → ${manifest[project.id].width}x${manifest[project.id].height}`,
      );
    } catch (error) {
      // A site being down must never fail the build; the drawer just shows no
      // media for that project.
      console.warn(`[previews] ${project.id}: skipped (${error.message})`);
      if (existing[project.id]) manifest[project.id] = existing[project.id];
    }
  }

  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`[previews] ${Object.keys(manifest).length} preview(s) available`);
}

await main();
