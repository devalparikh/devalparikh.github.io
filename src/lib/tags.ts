/**
 * Stack chips are ordered at render time so every entry reads the same way:
 * what the work *is*, where it runs, what it is written in, what it is built
 * with, and finally what it plugs into.
 *
 * Entries declare tags in whatever order reads best; ordering happens here.
 */

const TIER_ORDER = ["concept", "cloud", "language", "framework", "service"] as const;

export type TagTier = (typeof TIER_ORDER)[number];

/**
 * Anything unlisted falls through to `service`, which is the open-ended tier —
 * product names are endless, whereas the four tiers below are enumerable.
 */
const TIERS: Record<Exclude<TagTier, "service">, ReadonlySet<string>> = {
  // Architecture and technique — the substance of the work.
  concept: new Set([
    "ai/ml",
    "authentication",
    "cryptography",
    "distributed database design",
    "distributed microservices",
    "distributed systems",
    "embeddings",
    "graphrag",
    "machine learning",
    "microservices",
    "multi-threading",
    "neural networks",
    "nlp",
    "rag",
    "rest apis",
    "web sockets",
  ]),

  // Cloud platforms and their first-party platform services.
  cloud: new Set([
    "amazon web services",
    "aws",
    "azure",
    "azure resource manager",
    "gcp",
    "google cloud",
    "google cloud platform",
    "google ml api",
    "ibm cloud",
  ]),

  language: new Set([
    "c",
    "c#",
    "c++",
    "css",
    "go",
    "groovy",
    "html",
    "java",
    "javascript",
    "kotlin",
    "objective-c",
    "php",
    "python",
    "r",
    "ruby",
    "rust",
    "scala",
    "shell",
    "sql",
    "swift",
    "typescript",
  ]),

  // Frameworks and libraries written against a language.
  framework: new Set([
    ".net",
    "angular",
    "darkflow cnn",
    "django",
    "excalidraw",
    "express",
    "faiss",
    "fastapi",
    "flask",
    "mermaid",
    "networkx",
    "next.js",
    "node.js",
    "pytorch",
    "radix ui",
    "react",
    "react flow",
    "redux",
    "spring",
    "tailwind css",
    "tensorflow",
    "tensorflow js deep learning api",
    "three.js",
    "vue",
  ]),
};

export function tagTier(tag: string): TagTier {
  const key = tag.trim().toLowerCase();

  for (const tier of TIER_ORDER) {
    if (tier === "service") break;
    if (TIERS[tier].has(key)) return tier;
  }

  return "service";
}

/**
 * A stable partition rather than a sort, so the order an entry declares still
 * decides how tags read within a tier.
 */
export function orderTags(tags: string[]): string[] {
  const buckets = new Map<TagTier, string[]>(TIER_ORDER.map((tier) => [tier, []]));

  for (const tag of tags) {
    buckets.get(tagTier(tag))!.push(tag);
  }

  return TIER_ORDER.flatMap((tier) => buckets.get(tier)!);
}
