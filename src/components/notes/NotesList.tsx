"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo } from "react";
import { useNotesBrowse } from "@/lib/use-notes-browse";
import { updateNotesBrowse, updateNotesGraph, saveNotesScroll } from "@/lib/notes-browse";
import type { NoteSummary } from "@/lib/notes";
import { notesContent as copy } from "@/content/notes";
import { playInterfaceSound } from "@/lib/interface-sound";
import { NoteIcon } from "./NoteIcons";
import { NoteGraph } from "./NoteGraph";
import { NotesViewSwitch } from "./NotesViewSwitch";

function filterNotes(notes: NoteSummary[], query: string, topic: string) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return notes.filter((note) => (!topic || note.category === topic) && words.every((word) =>
    `${note.title} ${note.folders.join(" ")} ${note.tags.join(" ")} ${note.search}`.toLowerCase().includes(word)));
}

function useFilteredNotes(notes: NoteSummary[], query: string, topic: string) {
  return useMemo(() => filterNotes(notes, query, topic), [notes, query, topic]);
}

export function NotesList({ notes }: { notes: NoteSummary[] }) {
  const { query, topic, view, graph } = useNotesBrowse();
  const topics = [...new Set(notes.map((note) => note.category))].sort();
  const visible = useFilteredNotes(notes, query, topic);

  return <section className="notes-browser" aria-label={copy.browseLabel}>
    <div className="notes-toolbar">
      <label className="notes-filter"><NoteIcon kind="search" /><span className="sr-only">{copy.searchLabel}</span>
        <input type="search" value={query} onChange={(event) => updateNotesBrowse({ query: event.target.value })} placeholder={copy.search} />
      </label>
      <label className="notes-topic"><span className="sr-only">{copy.topicLabel}</span>
        <select value={topic} onChange={(event) => updateNotesBrowse({ topic: event.target.value })}>
          <option value="">{copy.allTopics}</option>
          {topics.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <NotesViewSwitch view={view} onSelect={(mode) => {
        saveNotesScroll(view, window.scrollY);
        updateNotesBrowse({ view: mode });
        playInterfaceSound("toggle");
      }} />
    </div>
    <div className="notes-column-labels"><span>{view === "list" ? copy.titleColumn : copy.graph}</span><span aria-live="polite">{visible.length} {visible.length === 1 ? "note" : "notes"}</span></div>
    <div key={view} className="notes-view-panel">
      {view === "graph" && visible.length > 0 ? <NoteGraph notes={visible} view={graph} onViewChange={updateNotesGraph} /> : <ul className="notes-rows">
        {visible.map((note) => <li key={note.id}>
          <Link href={`/notes/${note.id}/` as Route} className="notes-row" onClick={() => playInterfaceSound("tap")}>
            <NoteIcon /><span className="notes-title">{note.title}</span>
            <span className="notes-row-topic">{note.category}</span><span className="notes-row-arrow" aria-hidden="true">↗</span>
          </Link>
        </li>)}
      </ul>}
    </div>
    {!visible.length && <p className="notes-empty">{notes.length ? copy.noResults : copy.empty}</p>}
    {(query || topic) && <button type="button" className="notes-clear" onClick={() => { updateNotesBrowse({ query: "", topic: "" }); }}>{copy.clear}</button>}
  </section>;
}
