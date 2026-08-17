"use client";

import type { Entry } from "@/content/types";
import { playInterfaceSound } from "@/lib/interface-sound";
import { hasDetail, isExternal } from "./entry-helpers";

interface EntryRowProps {
  entry: Entry;
  selected: boolean;
  onOpen: (entry: Entry, trigger: HTMLElement) => void;
}

function RowBody({ entry, affordance }: { entry: Entry; affordance: string | null }) {
  const note = entry.subtitle ?? entry.summary;

  return (
    <>
      <span className="row-caret" aria-hidden="true">
        ›
      </span>

      <span className="min-w-0">
        <span className="row-title">{entry.title}</span>
        {entry.badge && <span className="row-badge">{entry.badge}</span>}
        {affordance && (
          <span className="row-arrow" aria-hidden="true">
            {affordance}
          </span>
        )}
        {note && <span className="row-subtitle">{note}</span>}
      </span>

      <span className="row-meta">{entry.meta}</span>
    </>
  );
}

export function EntryRow({ entry, selected, onOpen }: EntryRowProps) {
  if (hasDetail(entry)) {
    return (
      <button
        type="button"
        className="row"
        aria-current={selected}
        aria-haspopup="dialog"
        onClick={(event) => {
          playInterfaceSound("tap");
          onOpen(entry, event.currentTarget);
        }}
      >
        <RowBody entry={entry} affordance="›" />
      </button>
    );
  }

  if (entry.href) {
    const external = isExternal(entry.href);

    return (
      <a
        href={entry.href}
        className="row"
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        onClick={() => playInterfaceSound("tap")}
      >
        <RowBody entry={entry} affordance={external ? "↗" : "→"} />
        {external && <span className="sr-only"> Opens in a new tab</span>}
      </a>
    );
  }

  return (
    <div className="row cursor-default">
      <RowBody entry={entry} affordance={null} />
    </div>
  );
}
