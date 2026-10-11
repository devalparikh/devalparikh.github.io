"use client";

import { useState } from "react";
import { useGlidingIndicator } from "@/lib/use-gliding-indicator";
import type { NotesView } from "@/lib/notes-browse";
import { notesContent as copy } from "@/content/notes";
import { NoteIcon } from "./NoteIcons";

export function NotesViewSwitch({ view, onSelect }: { view: NotesView; onSelect: (view: NotesView) => void }) {
  const [hovered, setHovered] = useState<string | undefined>();
  const { trackRef, indicatorRef, registerItem } = useGlidingIndicator(hovered ?? view);
  return <div ref={trackRef} className="notes-view-switch" aria-label={copy.browseLabel} onMouseLeave={() => setHovered(undefined)}>
    <span ref={indicatorRef} aria-hidden="true" className="pill-indicator" />
    {(["list", "graph"] as const).map((mode) => <button type="button" key={mode} ref={registerItem(mode)} aria-pressed={view === mode}
      aria-label={mode === "list" ? copy.listView : copy.graphView}
      onMouseEnter={() => setHovered(mode)} onFocus={() => setHovered(mode)} onBlur={() => setHovered(undefined)}
      onClick={() => onSelect(mode)}>
      <NoteIcon kind={mode} /><span>{mode === "list" ? copy.listView : copy.graphView}</span>
    </button>)}
  </div>;
}
