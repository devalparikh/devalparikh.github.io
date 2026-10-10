import { readFile, writeFile, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildNotes, isNotePath, assetUrl } from "./lib/notes.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "src/content/notes.generated.json");
const imageDir = path.join(root, "public/img/notes");
const repository = "devalparikh/Wiki";
const vault = process.env.WIKI_VAULT_PATH;
const token = process.env.WIKI_READ_TOKEN;

async function github(endpoint) {
  const response = await fetch(`https://api.github.com/repos/${repository}/${endpoint}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Wiki sync failed (${response.status}). Check WIKI_READ_TOKEN and its Contents read permission.`);
  return response.json();
}

async function walk(dir, prefix = "knowledge") {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.isSymbolicLink()) continue;
    const name = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) files.push(...await walk(path.join(dir, entry.name), name));
    else if (entry.isFile()) files.push({ path: name });
  }
  return files;
}

async function sync() {
  if (!vault && !token) {
    if (process.env.CI) throw new Error("Set the WIKI_READ_TOKEN Actions secret before deploying. Refusing to publish a stale vault snapshot.");
    await readFile(output);
    console.log("Notes: using the checked-in snapshot. Set WIKI_VAULT_PATH or WIKI_READ_TOKEN to refresh.");
    return;
  }
  let files, revision, read;
  if (vault) {
    files = await walk(path.join(vault, "knowledge"));
    revision = "local";
    read = (file) => readFile(path.join(vault, file.path));
  } else {
    const tree = await github("git/trees/main?recursive=1");
    if (tree.truncated) throw new Error("Wiki tree is truncated; refusing an incomplete sync.");
    files = tree.tree.filter((file) => file.type === "blob" && file.mode !== "120000");
    revision = tree.sha;
    // Read immutable blobs from this tree, even if another push lands mid-build.
    read = async (file) => {
      const blob = await github(`git/blobs/${file.sha}`);
      if (blob.encoding !== "base64") throw new Error(`Unsupported blob encoding: ${file.path}`);
      return Buffer.from(blob.content, "base64");
    };
  }
  const candidates = files.filter((file) => isNotePath(file.path));
  const sources = [];
  for (let index = 0; index < candidates.length; index += 6) {
    sources.push(...await Promise.all(candidates.slice(index, index + 6).map(async (file) => ({ path: file.path, content: (await read(file)).toString("utf8") }))));
  }
  const images = files.filter((file) => file.path.startsWith("knowledge/") && /\.(png|jpe?g|gif|webp|avif)$/i.test(file.path));
  const notes = await buildNotes(sources, images.map((file) => file.path));
  const required = new Set(notes.flatMap((note) => note.attachments));
  // Fetch every required image before replacing the previous snapshot.
  const downloads = await Promise.all(images.filter((file) => required.has(file.path)).map(async (file) => ({ name: path.basename(assetUrl(file.path)), data: await read(file) })));
  await mkdir(imageDir, { recursive: true });
  const keep = new Set(downloads.map((file) => file.name));
  for (const file of downloads) await writeFile(path.join(imageDir, file.name), file.data);
  for (const name of await readdir(imageDir)) if (!keep.has(name)) await rm(path.join(imageDir, name));
  await writeFile(output, JSON.stringify({ repository, revision, notes }, null, 2) + "\n");
  console.log(`Notes: synced ${notes.length} notes and ${downloads.length} images from ${repository}.`);
}

sync().catch((error) => { console.error(error.message); process.exitCode = 1; });
