import { readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import yaml from "js-yaml";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@blog/components/mdx";
import { postComponents } from "@/components/writing/posts";
import snapshot from "@/content/blog/snapshot.json";
import { localPosts } from "@/content/posts";
import { shelf, type ShelfBook } from "@/content/writing";
import { countWords } from "./word-count";

/**
 * Build-time access to the posts: the imported deval-blog snapshot
 * (src/content/blog) and the few this site maintains itself
 * (src/content/posts). Only Server Components call this - the static export
 * reads the MDX once, while rendering.
 */

export const SITE_ORIGIN = "https://devalparikh.me";

export interface PostMeta {
  slug: string;
  title: string;
  summary: string;
  /** ISO date or date-time, as written in the frontmatter. */
  date: string;
  year: number;
  author: string;
  tags: string[];
  /** Frontmatter cover image, already moved under /img/writing/. */
  image?: string;
  hideCoverImage: boolean;
  /** Prose words, counted at build time. */
  words: number;
}

export interface ShelfPost extends PostMeta {
  book: ShelfBook;
}

interface Frontmatter {
  title?: string;
  summary?: string;
  date?: string;
  author?: string;
  tags?: string[];
  image?: string;
  hideCoverImage?: boolean;
  kind?: string;
  // `canonicalUrl` is deliberately not read: these pages always canonicalise
  // to themselves on devalparikh.me (the importer also strips it).
}

const importedDir = path.join(process.cwd(), "src/content/blog");
const localDir = path.join(process.cwd(), "src/content/posts");
const localSlugs = new Set(localPosts.map((post) => post.slug));

export const postSlugs: string[] = [...snapshot.posts.map((post) => post.slug), ...localSlugs];

const readSource = cache((slug: string) =>
  readFileSync(path.join(localSlugs.has(slug) ? localDir : importedDir, `${slug}.mdx`), "utf8"),
);

function parseFrontmatter(source: string): Frontmatter {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  return (match ? yaml.load(match[1], { schema: yaml.JSON_SCHEMA }) : {}) as Frontmatter;
}

/** Same fallback the blog uses when a post names no author. */
const DEFAULT_AUTHOR = "Deval, with AI-assisted editing";

export const getPostMeta = cache((slug: string): PostMeta => {
  const source = readSource(slug);
  const data = parseFrontmatter(source);
  if (!data.title || !data.summary || !data.date) throw new Error(`${slug}.mdx is missing title, summary or date.`);
  return {
    slug,
    title: data.title,
    summary: data.summary,
    date: data.date,
    year: postInstant(data.date).getFullYear(),
    author: data.author ?? DEFAULT_AUTHOR,
    tags: data.tags ?? [],
    image: data.image,
    hideCoverImage: data.hideCoverImage ?? false,
    words: countWords(source),
  };
});

/** Every book on the shelf, newest first, joined with its cover design. */
export function getShelfPosts(): ShelfPost[] {
  return shelf
    .map((book) => ({ ...getPostMeta(book.slug), book }))
    .sort((a, b) => postInstant(b.date).getTime() - postInstant(a.date).getTime());
}

export function postUrl(slug: string) {
  return `${SITE_ORIGIN}/writing/${slug}/`;
}

export const renderPost = cache(async (slug: string) => {
  const { content } = await compileMDX({
    source: readSource(slug),
    // A local post renders only this repo's components, so a re-sync that
    // drops a vendored module can never break it.
    components: localSlugs.has(slug) ? postComponents : mdxComponents,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        // Both palettes are emitted as CSS variables; article.css picks one
        // per site theme so code stays legible on parchment and on inkember.
        rehypePlugins: [[rehypePrettyCode, { theme: { light: "one-light", dark: "one-dark-pro" }, keepBackground: false }]],
      },
    },
  });
  return content;
});

/** A bare `2026-09-02` means that day where it was written, not UTC midnight. */
export function postInstant(date: string) {
  return new Date(/^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T12:00:00-04:00` : date);
}

export function formatPostDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" }).format(postInstant(date));
}
