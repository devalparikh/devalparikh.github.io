/**
 * Posts this site maintains itself, rather than importing from deval-blog.
 *
 * Each one is `<slug>.mdx` in this directory. `npm run sync:blog` never
 * imports a slug that has a file here, so a re-sync cannot overwrite it
 * (LOCAL_POSTS_DIR in scripts/lib/blog-import.mjs). The shelf metadata below
 * mirrors the frontmatter; `test:writing` checks that they agree.
 *
 * Their figures are this repo's own components, registered in
 * `components/writing/posts/index.ts`, never the vendored deval-blog ones.
 */

export interface LocalPost {
  slug: string;
  title: string;
  summary: string;
  date: string;
}

export const localPosts: LocalPost[] = [
  {
    slug: "speculative-decoding",
    title: "Speculative decoding",
    summary:
      "A small model guesses the next few tokens. The big model checks every guess in one forward pass, keeps the ones it agrees with, and adds one token of its own.",
    date: "2026-08-21T11:13:34-04:00",
  },
];
