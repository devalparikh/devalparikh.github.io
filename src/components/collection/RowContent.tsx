import type { Entry } from "@/content/types";
import { linkKindIcons } from "@/components/primitives/icons";
import { EntryMark } from "./EntryMark";

export type RowAffordance = "detail" | "external" | "internal" | null;

const AFFORDANCE_GLYPH: Record<Exclude<RowAffordance, null>, string> = {
  detail: "›",
  external: "↗",
  internal: "→",
};

/**
 * The inside of a row's clickable area: caret, logo, title and description.
 * Action links live outside it in `RowActions` - nesting anchors inside the
 * row's button or link would be invalid markup and would swallow their clicks.
 */
export function RowLead({
  entry,
  affordance,
}: {
  entry: Entry;
  affordance: RowAffordance;
}) {
  // Experience rows carry a role and a one-line description; projects and
  // writing only have the description, so the two collapse to one line there.
  const role = entry.subtitle;
  const note = entry.summary && entry.summary !== role ? entry.summary : undefined;

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
          {role && <span className="row-subtitle">{role}</span>}
          {note && <span className="row-note">{note}</span>}
        </span>
      </span>
    </>
  );
}

/**
 * The trailing column: the date, plus a direct link out for each typed link on
 * the entry. These sit above the row's click overlay so they stay clickable.
 */
export function RowActions({ entry }: { entry: Entry }) {
  const actions = entry.links?.filter((link) => link.kind) ?? [];

  return (
    <span className="row-actions">
      {/* Always rendered: the empty slot keeps the icons aligned across rows. */}
      <span className="row-meta">{entry.meta}</span>

      {actions.length > 0 && (
        <span className="row-links">
          {actions.map((link) => {
            const Icon = linkKindIcons[link.kind!];
            if (!Icon) return null;

            return (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                title={link.label}
                aria-label={`${entry.title}: ${link.label}`}
                className="row-link"
                onClick={(event) => event.stopPropagation()}
              >
                <Icon />
              </a>
            );
          })}
        </span>
      )}
    </span>
  );
}
