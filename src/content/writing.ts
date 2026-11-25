import snapshot from "./blog/snapshot.json";
import { ALL_FILTER, type Collection, type Entry, type Filter } from "./types";

/**
 * /writing is the canonical home for the posts imported from deval-blog
 * (`src/content/blog`, refreshed with `npm run sync:blog`). Each one sits on
 * the shelf as a code-built cover; a few pieces published elsewhere stay as
 * outbound links in a small group below it.
 */

/**
 * The cover palette. Each name resolves to a `--cover-<name>` token in
 * globals.css. `paper` and `ink` are the site's own parchment and ink; the
 * rest are saturated riso-style colours, warmed to sit beside them.
 */
export const coverInks = [
  "paper",
  "ink",
  "ember",
  "violet",
  "teal",
  "rose",
  "lime",
  "fern",
  "cobalt",
  "saffron",
  "oxblood",
  "clay",
] as const;
export type CoverInk = (typeof coverInks)[number];

export interface CoverDesign {
  /** Uppercase headline, broken into lines by hand. */
  title: string[];
  /** Italic line under the headline. */
  subtitle: string;
  /** Flat background colour. */
  ground: CoverInk;
  /** The illustration's inks: the main one (also the headline) and an accent. */
  inks: [CoverInk, CoverInk];
  /** Small type (subtitle, corners, footer): whichever of paper or ink reads on the ground. */
  text: "paper" | "ink";
  /** Where the headline sits - the posters alternate top-left and bottom-left. */
  headline: "top" | "bottom";
  /** Tiny corner label, top right. */
  label: string;
}

export interface ShelfBook {
  /** deval-blog MDX filename, and the /writing/<slug>/ URL. */
  slug: string;
  /** Filter keys - must match a `Filter.id` below. */
  categories: string[];
  cover: CoverDesign;
}

const filters: Filter[] = [
  ALL_FILTER,
  { id: "ai", label: "AI / ML" },
  { id: "fullstack", label: "Full Stack" },
  { id: "systems", label: "Systems" },
];

export const shelf: ShelfBook[] = [
  {
    slug: "building-with-jev",
    categories: ["ai", "fullstack", "systems"],
    cover: {
      title: ["Building", "with Jev"],
      subtitle: "Use cases and implementation architectures",
      ground: "cobalt",
      text: "paper",
      inks: ["paper", "lime"],
      headline: "bottom",
      label: "Field guide",
    },
  },
  {
    slug: "transformer-basics-prefill-and-decode",
    categories: ["ai"],
    cover: {
      title: ["Transformer", "basics"],
      subtitle: "Prefill, decode, and the KV cache",
      ground: "teal",
      text: "paper",
      inks: ["paper", "saffron"],
      headline: "top",
      label: "Primer",
    },
  },
  {
    slug: "jev-and-system-one-models",
    categories: ["ai"],
    cover: {
      title: ["System", "one"],
      subtitle: "Jev and fast judgment inside software",
      ground: "lime",
      text: "ink",
      inks: ["cobalt", "ink"],
      headline: "bottom",
      label: "Models",
    },
  },
  {
    slug: "multi-agent-systems-scale-thought-in-parallel",
    categories: ["ai", "systems"],
    cover: {
      title: ["Multi-", "agent"],
      subtitle: "Systems scale thought in parallel",
      ground: "violet",
      text: "paper",
      inks: ["lime", "paper"],
      headline: "bottom",
      label: "Agents",
    },
  },
  {
    slug: "durable-execution-vs-atomic-execution",
    categories: ["systems"],
    cover: {
      title: ["Durable", "/ atomic"],
      subtitle: "What survives a crash, and what commits at once",
      ground: "rose",
      text: "ink",
      inks: ["oxblood", "ink"],
      headline: "top",
      label: "Systems",
    },
  },
  {
    slug: "speculative-decoding",
    categories: ["ai"],
    cover: {
      title: ["Speculative", "decoding"],
      subtitle: "Draft ahead, verify together",
      ground: "fern",
      text: "paper",
      inks: ["saffron", "paper"],
      headline: "top",
      label: "Inference",
    },
  },
  {
    slug: "compound-engineering",
    categories: ["ai", "fullstack"],
    cover: {
      title: ["Compound", "engineering"],
      subtitle: "My self-improving remote agent setup",
      ground: "ember",
      text: "paper",
      inks: ["paper", "ink"],
      headline: "bottom",
      label: "Practice",
    },
  },
  {
    slug: "vision-action-transformers-vla-wam",
    categories: ["ai"],
    cover: {
      title: ["Vision", "action"],
      subtitle: "VATs, VLAs, and world-action models",
      ground: "saffron",
      text: "ink",
      inks: ["ink", "clay"],
      headline: "bottom",
      label: "Robotics",
    },
  },
];

/** Pieces published elsewhere. They stay outbound links. */
export const elsewhere: Entry[] = [
  {
    id: "graphrag-architecture",
    title: "Building a 6x Faster GraphRAG: Typed Graphs, FAISS, and Two-Phase Retrieval",
    badge: "Rolodex",
    summary:
      "A custom GraphRAG system optimized for structured data like GitHub repos, achieving ~6x faster indexing with typed entity schemas and two-phase retrieval.",
    categories: ["ai"],
    href: "https://rolodex.dev/blog/custom-graphrag-architecture",
  },
  {
    id: "visualizing-backpropagation",
    title: "Visualizing Backpropagation in Neural Network Training at Any Scale",
    badge: "Towards Data Science",
    summary: "Using HiPlot to generate parallel coordinate plots to visualize deep learning model training.",
    categories: ["ai"],
    href: "https://towardsdatascience.com/visualizing-backpropagation-in-neural-network-training-2647f5977fdb",
  },
  {
    id: "realtime-nlp-chat",
    title: "Building a Real Time Chat Application with NLP Capabilities",
    badge: "Towards Data Science",
    summary:
      "A chat app with sentiment analysis and tone detection using TensorFlow JS Deep Learning API, IBM Cloud, Node.JS, Web Sockets, and React.",
    categories: ["fullstack", "ai"],
    href: "https://towardsdatascience.com/building-a-real-time-chat-application-with-nlp-super-powers-ce800e19cb2b",
  },
];

const postsBySlug = new Map(snapshot.posts.map((post) => [post.slug, post]));

/** Shelf books newest first, as plain rows - for the home page and site search. */
const bookEntries: Entry[] = shelf
  .map((book) => {
    const post = postsBySlug.get(book.slug);
    if (!post) throw new Error(`Shelf book "${book.slug}" is not in the deval-blog snapshot. Run npm run sync:blog -- --add tech/${book.slug}.`);
    return { book, post };
  })
  .sort((a, b) => b.post.date.localeCompare(a.post.date))
  .map(({ book, post }) => ({
    id: book.slug,
    title: post.title,
    summary: post.summary,
    categories: book.categories,
    href: `/writing/${book.slug}/`,
  }));

export const writing: Collection = {
  id: "writing",
  title: "Writing",
  description: "Explainers on models, agents, and the systems around them.",
  filters,
  entries: [...bookEntries, ...elsewhere],
};

export const elsewhereTitle = "Published elsewhere";
