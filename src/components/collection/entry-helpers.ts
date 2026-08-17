import type { Entry } from "@/content/types";

/**
 * A row opens the drawer when there is more to say than the row already shows.
 * Entries without extra detail - a published article, say - link straight out.
 */
export function hasDetail(entry: Entry): boolean {
  return Boolean(
    entry.sections?.length || entry.highlights?.length || entry.tags?.length,
  );
}

export function isExternal(href: string): boolean {
  return href.startsWith("http");
}
