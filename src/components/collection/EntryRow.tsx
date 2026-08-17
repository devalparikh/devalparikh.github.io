"use client";

import type { Entry } from "@/content/types";
import { playInterfaceSound } from "@/lib/interface-sound";
import { RowContent } from "./RowContent";
import { hasDetail, isExternal } from "./entry-helpers";

interface EntryRowProps {
  entry: Entry;
  selected: boolean;
  onOpen: (entry: Entry, trigger: HTMLElement) => void;
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
        <RowContent entry={entry} affordance="detail" />
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
        <RowContent entry={entry} affordance={external ? "external" : "internal"} />
        {external && <span className="sr-only"> Opens in a new tab</span>}
      </a>
    );
  }

  return (
    <div className="row cursor-default">
      <RowContent entry={entry} affordance={null} />
    </div>
  );
}
