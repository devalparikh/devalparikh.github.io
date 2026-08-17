/**
 * One shape backs every collection on the site — experience, projects and
 * writing all render through the same row list and detail panel, so they share
 * a single entry type rather than three near-identical ones.
 */

export interface EntrySection {
  heading: string;
  body?: string;
  bullets?: string[];
}

export interface EntryLink {
  label: string;
  href: string;
}

/**
 * The small square shown at the start of a row. Prefer `src` — a square logo
 * asset. Wide wordmarks are unreadable at this size, so those companies fall
 * back to initials on their brand colour.
 */
export interface EntryMark {
  src?: string;
  monogram?: string;
  color?: string;
}

export interface Entry {
  /** Stable slug — also the deep-link fragment for the detail panel. */
  id: string;
  title: string;
  /** Role, publication, or one-line descriptor shown under the title. */
  subtitle?: string;
  /** Small pill next to the title — e.g. where an article was published. */
  badge?: string;
  /** Company or product logo shown at the start of the row. */
  mark?: EntryMark;
  /** Right-aligned monospace column: a date range or a year. */
  meta?: string;
  /** Single-line note rendered under the row. */
  summary?: string;
  /** Filter keys — must match a `Filter.id` on the owning collection. */
  categories: string[];
  /** Display-only chips in the detail panel. */
  tags?: string[];
  /** Primary destination when the row itself is a link. */
  href?: string;
  /** Extra links surfaced inside the detail panel. */
  links?: EntryLink[];
  image?: string;
  sections?: EntrySection[];
  highlights?: string[];
}

export interface Filter {
  id: string;
  label: string;
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  filters: Filter[];
  entries: Entry[];
}

export const ALL_FILTER: Filter = { id: "all", label: "All" };

export function filterEntries(entries: Entry[], filterId: string): Entry[] {
  if (filterId === ALL_FILTER.id) return entries;
  return entries.filter((entry) => entry.categories.includes(filterId));
}
