"use client";

import type { Entry } from "@/content/types";
import { playInterfaceSound } from "@/lib/interface-sound";
import { RowActions, RowLead } from "./RowContent";
import { hasDetail, isExternal } from "./entry-helpers";

interface EntryRowProps {
  entry: Entry;
  selected: boolean;
  onOpen: (entry: Entry, trigger: HTMLElement) => void;
}

/**
 * The row is a container, not a control: its trigger stretches an overlay
 * across the whole row for the click target, which leaves the action links
 * free to sit on top as real links.
 */
export function EntryRow({ entry, selected, onOpen }: EntryRowProps) {
  const external = entry.href ? isExternal(entry.href) : false;

  return (
    <div className="row" data-selected={selected || undefined}>
      {hasDetail(entry) ? (
        <button
          type="button"
          className="row-trigger"
          aria-haspopup="dialog"
          aria-current={selected || undefined}
          onClick={(event) => {
            playInterfaceSound("tap");
            onOpen(entry, event.currentTarget);
          }}
        >
          <RowLead entry={entry} affordance="detail" />
        </button>
      ) : entry.href ? (
        <a
          href={entry.href}
          className="row-trigger"
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          onClick={() => playInterfaceSound("tap")}
        >
          <RowLead entry={entry} affordance={external ? "external" : "internal"} />
          {external && <span className="sr-only"> Opens in a new tab</span>}
        </a>
      ) : (
        <span className="row-trigger row-trigger-static">
          <RowLead entry={entry} affordance={null} />
        </span>
      )}

      <RowActions entry={entry} />
    </div>
  );
}
