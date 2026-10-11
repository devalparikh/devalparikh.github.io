"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import type { NoteSummary } from "@/lib/notes";
import { notesContent as copy } from "@/content/notes";
import { playInterfaceSound } from "@/lib/interface-sound";
import { NoteIcon } from "./NoteIcons";
import { NoteGraph } from "./NoteGraph";

export function NotesList({ notes }: { notes: NoteSummary[] }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("");
  const [view, setView] = useState("list");
  const topics = [...new Set(notes.map((note) => note.category))].sort();
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const visible = notes.filter((note) => (!topic || note.category === topic) && words.every((word) =>
    `${note.title} ${note.folders.join(" ")} ${note.tags.join(" ")} ${note.search}`.toLowerCase().includes(word)));

  return <section className="notes-browser" aria-label={copy.browseLabel}>
    <div className="notes-toolbar">
      <label className="notes-filter"><NoteIcon kind="search" /><span className="sr-only">{copy.searchLabel}</span>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.search} />
      </label>
      <label className="notes-topic"><span className="sr-only">{copy.topicLabel}</span>
        <select value={topic} onChange={(event) => setTopic(event.target.value)}>
          <option value="">{copy.allTopics}</option>
          {topics.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <div className="notes-view-switch" aria-label={copy.browseLabel}>
        {(["list", "graph"] as const).map((mode) => <button type="button" key={mode} aria-pressed={view === mode}
          aria-label={mode === "list" ? copy.listView : copy.graphView}
          onClick={() => { setView(mode); playInterfaceSound("toggle"); }}>
          <NoteIcon kind={mode} /><span>{mode === "list" ? copy.listView : copy.graphView}</span>
        </button>)}
      </div>
    </div>
    <div className="notes-column-labels"><span>{view === "list" ? copy.titleColumn : copy.graph}</span><span aria-live="polite">{visible.length} {visible.length === 1 ? "note" : "notes"}</span></div>
    {view === "graph" && visible.length > 0 ? <NoteGraph notes={visible} /> : <ul className="notes-rows">
      {visible.map((note) => <li key={note.id}>
        <Link href={`/notes/${note.id}/` as Route} className="notes-row" onClick={() => playInterfaceSound("tap")}>
          <NoteIcon /><span className="notes-title">{note.title}</span>
          <span className="notes-row-topic">{note.category}</span><span className="notes-row-arrow" aria-hidden="true">↗</span>
        </Link>
      </li>)}
    </ul>}
    {!visible.length && <p className="notes-empty">{notes.length ? copy.noResults : copy.empty}</p>}
    {(query || topic) && <button type="button" className="notes-clear" onClick={() => { setQuery(""); setTopic(""); }}>{copy.clear}</button>}
  </section>;
}
