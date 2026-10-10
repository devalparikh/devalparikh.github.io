"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import type { NoteSummary } from "@/lib/notes";
import { notesContent } from "@/content/notes";
import { playInterfaceSound } from "@/lib/interface-sound";

export function NotesList({ notes }: { notes: NoteSummary[] }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("");
  const topics = [...new Set(notes.map((note) => note.category))].sort();
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const visible = notes.filter((note) => (!topic || note.category === topic) && words.every((word) =>
    `${note.title} ${note.category} ${note.tags.join(" ")} ${note.search}`.toLowerCase().includes(word)));

  return (
    <section className="mt-9" aria-label="Browse notes">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">Search notes</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notes…" className="w-full rounded-lg border border-[var(--rule)] bg-base-100 px-3 py-2.5 text-sm" />
        </label>
        <label>
          <span className="sr-only">Filter by topic</span>
          <select value={topic} onChange={(event) => { setTopic(event.target.value); playInterfaceSound("tap"); }}
            className="w-full rounded-lg border border-[var(--rule)] bg-base-100 px-3 py-2.5 text-sm sm:w-48">
            <option value="">All topics</option>
            {topics.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>
      <p className="my-4 text-right font-mono text-[0.65rem] text-neutral-content" aria-live="polite">
        {visible.length} {visible.length === 1 ? "note" : "notes"}
      </p>
      <ul className="row-list">
        {visible.map((note) => (
          <li key={note.id} className="notes-row">
            <Link href={`/notes/${note.id}/` as Route} className="notes-title"
              onClick={() => playInterfaceSound("tap")}>{note.title}</Link>
            {note.updated && <time dateTime={note.updated} className="notes-date">{new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(note.updated))}</time>}
            <div className="notes-topics">
              <button type="button" onClick={() => setTopic(note.category)}>{note.category}</button>
              {note.tags.map((tag) => <button type="button" key={tag} onClick={() => setQuery(tag)}>#{tag}</button>)}
            </div>
          </li>
        ))}
      </ul>
      {!visible.length && <p className="border-b border-[var(--rule)] py-16 text-center text-sm text-neutral-content">
        {notes.length ? notesContent.noResults : notesContent.empty}
      </p>}
      {(query || topic) && <button type="button" className="mt-4 text-sm underline underline-offset-4"
        onClick={() => { setQuery(""); setTopic(""); }}>Clear filters</button>}
    </section>
  );
}
