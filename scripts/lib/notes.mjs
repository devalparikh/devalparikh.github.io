import path from "node:path";
import { createHash } from "node:crypto";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import GithubSlugger, { slug } from "github-slugger";
import { visit } from "unist-util-visit";

export function isNotePath(file) {
  const parts = file.split("/");
  return parts[0] === "knowledge" && /\.md$/i.test(file) &&
    !parts.some((part) => part.startsWith(".") || /^(templates?|private|drafts?)$/i.test(part)) &&
    !/^(readme|agents|claude)\.md$/i.test(parts.at(-1));
}

const yes = (value) => value === true || /^(true|yes)$/i.test(String(value));
const no = (value) => value === false || /^(false|no)$/i.test(String(value));
const normalize = (value) => value.replace(/\.md$/i, "").toLowerCase();
const textOf = (node) => node.value ?? node.children?.map(textOf).join("") ?? "";

function dateOf(value) {
  const text = value instanceof Date ? value.toISOString() : String(value ?? "");
  return /^\d{4}-\d{2}-\d{2}/.test(text) && !Number.isNaN(Date.parse(text)) ? text.slice(0, 10) : null;
}

export const assetUrl = (file) => `/img/notes/${createHash("sha256").update(file).digest("hex").slice(0, 20)}${path.posix.extname(file).toLowerCase()}`;

export async function buildNotes(files, assets = []) {
  const notes = files.filter((file) => isNotePath(file.path)).flatMap((file) => {
    // Parse every candidate before filtering. Invalid YAML must fail the sync.
    const { data, content } = matter(file.content.replace(/%%[\s\S]*?%%/g, ""));
    if (yes(data.private) || yes(data.draft) || no(data.publish) || no(data.published) ||
      /^(private|draft)$/i.test(String(data.status ?? "")) || !content.trim()) return [];
    const relative = file.path.slice("knowledge/".length).replace(/\.md$/i, "");
    const id = relative.split("/").map((part) => slug(part).replace(/-+/g, "-")).join("/");
    if (id.split("/").some((part) => !part)) throw new Error(`Empty note slug: ${file.path}`);
    const tree = unified().use(remarkParse).use(remarkGfm).parse(content);
    const heading = tree.children.find((node) => node.type === "heading" && node.depth === 1);
    // Obsidian uses filenames as titles. A note's first H1 may be a section
    // such as "Background" or an embedded note, rather than its page title.
    const title = String(data.title || path.posix.basename(relative));
    // The page header already displays the title.
    if (heading && textOf(heading).toLowerCase() === title.toLowerCase()) tree.children.splice(tree.children.indexOf(heading), 1);
    const tags = Array.isArray(data.tags) ? data.tags : typeof data.tags === "string" ? data.tags.split(/[,\s]+/) : [];
    const aliases = Array.isArray(data.aliases) ? data.aliases : typeof data.aliases === "string" ? [data.aliases] : [];
    return [{ id, title, path: file.path, relative, aliases, tree,
      category: relative.includes("/") ? relative.split("/")[0] : "general",
      tags: [...new Set(tags.map((tag) => String(tag).replace(/^#/, "")))],
      updated: dateOf(data.updated ?? data.modified ?? data.date ?? data.created),
    }];
  });
  if (new Set(notes.map((note) => note.id)).size !== notes.length) throw new Error("Duplicate note slugs. Rename the conflicting notes.");

  function resolve(target, current) {
    const key = normalize(target.replace(/^\/?knowledge\//i, ""));
    if (!key) return current;
    const relative = normalize(path.posix.join(path.posix.dirname(current.relative), key));
    const exact = notes.find((note) => normalize(note.relative) === relative) ?? notes.find((note) => normalize(note.relative) === key);
    if (exact) return exact;
    const matches = notes.filter((note) => normalize(note.relative).endsWith(`/${key}`) ||
      normalize(note.title) === key || note.aliases.some((alias) => normalize(String(alias)) === key));
    return matches.length === 1 ? matches[0] : null;
  }

  return Promise.all(notes.map(async (note) => {
    const outgoing = new Set();
    const attachments = new Set();
    function imageFor(target) {
      const key = target.replace(/^\/?knowledge\//i, "").toLowerCase();
      const relative = path.posix.join(path.posix.dirname(note.relative), key);
      const matches = assets.filter((file) => file.toLowerCase() === `knowledge/${relative}` || file.toLowerCase() === `knowledge/${key}`);
      const candidates = matches.length ? matches : assets.filter((file) => file.toLowerCase().endsWith(`/${key}`));
      if (candidates.length !== 1) return null;
      attachments.add(candidates[0]);
      return assetUrl(candidates[0]);
    }
    function hrefFor(target) {
      const [name, heading] = target.split("#", 2);
      const linked = resolve(name, note);
      if (!linked) return null;
      if (linked.id !== note.id) outgoing.add(linked.id);
      return `/notes/${linked.id}/${heading ? `#${slug(heading)}` : ""}`;
    }
    // Replace text nodes only. Code examples containing [[brackets]] stay intact.
    visit(note.tree, "text", (node, index, parent) => {
      if (!parent || parent.type === "link") return;
      const pattern = /!?\[\[([^\]]+)\]\]/g;
      const replacements = [];
      let end = 0;
      for (const match of node.value.matchAll(pattern)) {
        if (match.index > end) replacements.push({ type: "text", value: node.value.slice(end, match.index) });
        const [target, alias] = match[1].split("|", 2);
        const label = alias || target.split("#").filter(Boolean).at(-1) || target;
        const url = hrefFor(target);
        const image = match[0].startsWith("!") ? imageFor(target) : null;
        replacements.push(image ? { type: "image", url: image, alt: label } : url ? { type: "link", url, children: [{ type: "text", value: label }] } : { type: "text", value: label });
        end = match.index + match[0].length;
      }
      if (!end) return;
      if (end < node.value.length) replacements.push({ type: "text", value: node.value.slice(end) });
      parent.children.splice(index, 1, ...replacements);
      return index + replacements.length;
    });
    visit(note.tree, "link", (node) => {
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/|\/notes\/)/i.test(node.url)) return;
      let target;
      try { target = decodeURIComponent(node.url); } catch { target = node.url; }
      const url = hrefFor(target);
      if (url) node.url = url;
      else { node.type = "text"; node.value = textOf(node); delete node.children; delete node.url; }
    });
    visit(note.tree, "image", (node) => {
      if (/^(https?:\/\/|\/img\/notes\/)/i.test(node.url)) return;
      let target;
      try { target = decodeURIComponent(node.url); } catch { target = node.url; }
      const url = imageFor(target);
      if (url) node.url = url;
      else { node.type = "text"; node.value = node.alt ?? ""; delete node.url; }
    });
    visit(note.tree, "blockquote", (node) => {
      const first = node.children[0]?.children?.[0];
      if (first?.type === "text") first.value = first.value.replace(/^\[!(\w+)\][+-]?\s*/i, (_, kind) => `${kind}: `);
    });
    const plain = note.tree.children.map(textOf).join(" ").replace(/\s+/g, " ").trim();
    const headings = new GithubSlugger();
    const processor = unified().use(remarkRehype).use(rehypeSanitize).use(() => (tree) => {
      visit(tree, "element", (node) => {
        if (/^h[1-6]$/.test(node.tagName)) node.properties.id = headings.slug(textOf(node));
        if (node.tagName === "a" && /^https?:\/\//i.test(String(node.properties.href))) {
          node.properties.target = "_blank";
          node.properties.rel = ["noopener", "noreferrer"];
        }
      });
    }).use(rehypeStringify);
    const html = processor.stringify(await processor.run(note.tree));
    return { id: note.id, title: note.title, category: note.category, tags: note.tags,
      updated: note.updated, excerpt: plain.slice(0, 170), search: plain.toLowerCase(), html,
      outgoing: [...outgoing], attachments: [...attachments],
    };
  })).then((result) => result.sort((a, b) => (b.updated ?? "").localeCompare(a.updated ?? "") || a.title.localeCompare(b.title)));
}
