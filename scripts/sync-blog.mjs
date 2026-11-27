#!/usr/bin/env node
/**
 * Refreshes the writing snapshot from deval-blog and opens a pull request.
 *
 *   npm run sync:blog                       # latest deval-blog main -> PR
 *   npm run sync:blog -- --ref <sha|branch> # a specific commit
 *   npm run sync:blog -- --source ../deval-blog
 *   npm run sync:blog -- --add tech/<slug>  # import another post
 *   npm run sync:blog -- --no-pr            # update the working tree only
 *   npm run sync:blog -- --force            # re-import the same commit
 *
 * Posts with their own MDX in src/content/posts/ are maintained here and are
 * never imported; see LOCAL_POSTS_DIR in lib/blog-import.mjs.
 *
 * It runs on a machine that can already read deval-blog with git (your own
 * credentials) and that has `gh` signed in. CI never runs it and holds no
 * token for the blog: GitHub Pages keeps building only from this repository.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BLOG_REPO, importSnapshot, LOCAL_POSTS_DIR, localPostSlugs } from "./lib/blog-import.mjs";

const siteRoot = fileURLToPath(new URL("../", import.meta.url));
const manifestPath = path.join(siteRoot, "src/content/blog/snapshot.json");

function parseArgs(argv) {
  const options = { ref: "main", source: null, add: [], pr: true, force: false };
  for (let index = 0; index < argv.length; index++) {
    const flag = argv[index];
    if (flag === "--ref") options.ref = argv[++index];
    else if (flag === "--source") options.source = path.resolve(argv[++index]);
    else if (flag === "--add") options.add.push(argv[++index]);
    else if (flag === "--no-pr") options.pr = false;
    else if (flag === "--force") options.force = true;
    else throw new Error(`Unknown option ${flag}`);
  }
  return options;
}

const run = (command, args, cwd = siteRoot) =>
  execFileSync(command, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }).trim();
const runLoud = (command, args, cwd = siteRoot) => execFileSync(command, args, { cwd, stdio: "inherit" });

/** Checks the requested commit out into a throwaway directory. */
async function checkout({ ref, source }) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "deval-blog-"));
  const remote = source ?? process.env.BLOG_REMOTE ?? `https://github.com/${BLOG_REPO}.git`;
  run("git", ["init", "--quiet", dir]);
  run("git", ["fetch", "--quiet", "--depth", "1", remote, ref], dir);
  run("git", ["-c", "advice.detachedHead=false", "checkout", "--quiet", "FETCH_HEAD"], dir);
  return {
    dir,
    commit: run("git", ["rev-parse", "HEAD"], dir),
    committedAt: run("git", ["log", "-1", "--format=%cI"], dir),
  };
}

async function reencodeImage(from, to) {
  const { default: sharp } = await import("sharp");
  await sharp(from).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(to);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const previous = existsSync(manifestPath) ? JSON.parse(await readFile(manifestPath, "utf8")) : null;
  const local = new Set(localPostSlugs(siteRoot));
  const posts = (previous?.posts ?? [])
    .filter(({ slug }) => !local.has(slug))
    .map(({ slug, category }) => ({ slug, category }));
  for (const spec of options.add) {
    const [category, slug] = spec.split("/");
    if (!category || !slug) throw new Error(`--add expects <category>/<slug>, got "${spec}"`);
    if (local.has(slug)) throw new Error(`${slug} is maintained in ${LOCAL_POSTS_DIR}/, not imported.`);
    if (!posts.some((post) => post.slug === slug)) posts.push({ slug, category });
  }
  if (!posts.length) throw new Error("No posts to import. Pass --add <category>/<slug>.");

  if (options.pr && run("git", ["status", "--porcelain"])) {
    throw new Error("The working tree has uncommitted changes. Commit or set them aside, or pass --no-pr.");
  }

  const blog = await checkout(options);
  try {
    if (previous?.commit === blog.commit && !options.add.length && !options.force) {
      console.log(`Writing snapshot is already at ${BLOG_REPO}@${blog.commit.slice(0, 7)}.`);
      return;
    }
    const branch = `blog-sync/${blog.commit.slice(0, 7)}`;
    if (options.pr) {
      run("git", ["fetch", "--quiet", "origin", "main"]);
      run("git", ["switch", "--quiet", "-c", branch, "origin/main"]);
    }

    const manifest = await importSnapshot({ blogRoot: blog.dir, siteRoot, posts, ...blog, reencodeImage });
    console.log(`Imported ${manifest.posts.length} posts and ${manifest.vendored.length} modules from ${BLOG_REPO}@${blog.commit.slice(0, 7)}.`);
    if (!options.pr) return;

    runLoud("npm", ["run", "test:writing"]);
    runLoud("npm", ["run", "typecheck"]);
    runLoud("npm", ["run", "lint"]);

    run("git", ["add", "--all", "src/content/blog", "src/vendor/deval-blog", "public/img/writing"]);
    const changed = run("git", ["diff", "--cached", "--name-only"]);
    if (!changed) {
      console.log("Nothing changed in the imported files.");
      return;
    }
    const range = previous?.commit ? `${previous.commit.slice(0, 7)}...${blog.commit.slice(0, 7)}` : blog.commit.slice(0, 7);
    const title = `Sync writing snapshot to deval-blog@${blog.commit.slice(0, 7)}`;
    run("git", ["commit", "--quiet", "-m", title]);
    run("git", ["push", "--quiet", "-u", "origin", branch]);
    const body = [
      `Refreshes the pinned writing snapshot from [${BLOG_REPO}@${blog.commit.slice(0, 7)}](https://github.com/${BLOG_REPO}/commit/${blog.commit}) (committed ${blog.committedAt}).`,
      "",
      previous?.commit ? `Upstream changes: https://github.com/${BLOG_REPO}/compare/${range}` : "First snapshot.",
      "",
      "Changed files:",
      "",
      ...changed.split("\n").map((file) => `- \`${file}\``),
    ].join("\n");
    runLoud("gh", ["pr", "create", "--base", "main", "--head", branch, "--title", title, "--body", body]);
  } finally {
    await rm(blog.dir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
