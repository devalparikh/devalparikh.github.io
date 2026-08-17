#!/usr/bin/env node
/**
 * Photo build step.
 *
 * Full-resolution originals live in `photos/` and are never deployed — they
 * total well over a hundred megabytes. This script derives web-sized WebP files
 * into `public/img/photography/`, pulls the EXIF each shot was taken with, and
 * writes a manifest the photography page imports.
 *
 * Both the derivatives and the manifest are generated artifacts: run
 * `npm run photos` after adding or removing a source image.
 */

import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import exifr from "exifr";
import sharp from "sharp";

const ROOT = path.join(import.meta.dirname, "..");
const SOURCE_DIR = path.join(ROOT, "photos");
const OUTPUT_DIR = path.join(ROOT, "public", "img", "photography");
const MANIFEST = path.join(ROOT, "src", "content", "photos.generated.json");

const SOURCE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".heic", ".tif", ".tiff"]);
const MAX_EDGE = 2200;
const QUALITY = 78;
const PLACEHOLDER_WIDTH = 16;

const EXIF_FIELDS = [
  "Make",
  "Model",
  "LensModel",
  "FocalLength",
  "FNumber",
  "ExposureTime",
  "ISO",
  "DateTimeOriginal",
];

function slugify(name) {
  return name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleize(name) {
  return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

function formatShutter(exposureTime) {
  if (!exposureTime) return undefined;
  return exposureTime < 1
    ? `1/${Math.round(1 / exposureTime)}s`
    : `${Number(exposureTime.toFixed(1))}s`;
}

function readCamera(exif) {
  const make = (exif.Make ?? "").trim();
  const model = (exif.Model ?? "").trim();
  if (!make && !model) return undefined;
  return model.startsWith(make) ? model : `${make} ${model}`.trim();
}

async function readExif(file) {
  try {
    const exif = await exifr.parse(file, { pick: EXIF_FIELDS });
    if (!exif) return null;

    const taken = exif.DateTimeOriginal ? new Date(exif.DateTimeOriginal) : null;

    const meta = {
      camera: readCamera(exif),
      lens: exif.LensModel?.trim() || undefined,
      focalLength: exif.FocalLength ? `${Math.round(exif.FocalLength)}mm` : undefined,
      aperture: exif.FNumber ? `f/${exif.FNumber}` : undefined,
      shutter: formatShutter(exif.ExposureTime),
      iso: exif.ISO ? `ISO ${exif.ISO}` : undefined,
      takenAt: taken && !Number.isNaN(taken.getTime()) ? taken.toISOString() : undefined,
    };

    const defined = Object.entries(meta).filter(([, value]) => value !== undefined);
    return defined.length > 0 ? Object.fromEntries(defined) : null;
  } catch {
    // A photo without readable EXIF still belongs in the gallery.
    return null;
  }
}

async function buildPhoto(fileName) {
  const source = path.join(SOURCE_DIR, fileName);
  const slug = slugify(fileName);
  const buffer = await readFile(source);

  const image = sharp(buffer, { failOn: "none" }).rotate();

  const resized = image.resize({
    width: MAX_EDGE,
    height: MAX_EDGE,
    fit: "inside",
    withoutEnlargement: true,
  });

  const output = await resized.clone().webp({ quality: QUALITY }).toBuffer({ resolveWithObject: true });
  await writeFile(path.join(OUTPUT_DIR, `${slug}.webp`), output.data);

  const placeholder = await resized
    .clone()
    .resize({ width: PLACEHOLDER_WIDTH })
    .webp({ quality: 40 })
    .toBuffer();

  return {
    id: slug,
    src: `/img/photography/${slug}.webp`,
    alt: titleize(fileName),
    width: output.info.width,
    height: output.info.height,
    aspectRatio: Number((output.info.width / output.info.height).toFixed(4)),
    placeholder: `data:image/webp;base64,${placeholder.toString("base64")}`,
    sourceBytes: buffer.byteLength,
    outputBytes: output.data.byteLength,
    checksum: createHash("sha1").update(buffer).digest("hex").slice(0, 12),
    exif: await readExif(source),
    // Landscape shots earn a wider slot in the gallery grid.
    orientation: output.info.width >= output.info.height ? "landscape" : "portrait",
  };
}

async function main() {
  let files = [];
  try {
    files = await readdir(SOURCE_DIR);
  } catch {
    console.warn(`[photos] no source directory at ${path.relative(ROOT, SOURCE_DIR)} — skipping.`);
  }

  const sources = files
    .filter((file) => SOURCE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(OUTPUT_DIR, { recursive: true });

  const photos = [];
  const failures = [];

  for (const file of sources) {
    try {
      photos.push(await buildPhoto(file));
    } catch (error) {
      failures.push({ file, reason: error.message });
    }
  }

  // A file literally named `hero` leads the page; everything else follows.
  const hero = photos.find((photo) => photo.id === "hero") ?? null;
  const gallery = photos.filter((photo) => photo !== hero);

  await writeFile(
    MANIFEST,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), hero, gallery }, null, 2)}\n`,
  );

  const sourceBytes = photos.reduce((total, photo) => total + photo.sourceBytes, 0);
  const outputBytes = photos.reduce((total, photo) => total + photo.outputBytes, 0);
  const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)}MB`;

  console.log(
    `[photos] ${photos.length} image${photos.length === 1 ? "" : "s"}: ${mb(sourceBytes)} → ${mb(outputBytes)}`,
  );

  for (const failure of failures) {
    console.warn(`[photos] skipped ${failure.file}: ${failure.reason}`);
  }
}

await main();
