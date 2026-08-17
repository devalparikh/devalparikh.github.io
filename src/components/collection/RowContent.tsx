import type { Entry } from "@/content/types";
import { EntryMark } from "./EntryMark";

export type RowAffordance = "detail" | "external" | "internal" | null;

const AFFORDANCE_GLYPH: Record<Exclude<RowAffordance, null>, string> = {
  detail: "›",
  external: "↗",
  internal: "→",
};

/**
 * The inside of a row. Shared by the collection list and the home page's
 * previews so both stay identical as the row design changes.
 */
export function RowContent({
  entry,
  affordance,
}: {
  entry: Entry;
  affordance: RowAffordance;
}) {
  const note = entry.subtitle ?? entry.summary;

  return (
    <>
      <span className="row-caret" aria-hidden="true">
        ›
      </span>

      <span className="row-body">
        {entry.mark && (
          <EntryMark mark={entry.mark} label={entry.title} className="row-mark" />
        )}

        <span className="min-w-0 flex-1">
          <span className="row-title">{entry.title}</span>
          {entry.badge && <span className="row-badge">{entry.badge}</span>}
          {affordance && (
            <span className="row-arrow" aria-hidden="true">
              {AFFORDANCE_GLYPH[affordance]}
            </span>
          )}
          {note && <span className="row-subtitle">{note}</span>}
        </span>
      </span>

      <span className="row-meta">{entry.meta}</span>
    </>
  );
}
