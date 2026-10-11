"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useRef } from "react";
import type { NoteLink } from "@/lib/notes";
import { notesContent } from "@/content/notes";
import { playInterfaceSound } from "@/lib/interface-sound";
import { NoteIcon } from "./NoteIcons";
import { NotesDisclosure } from "./NotesDisclosure";

type Folder = { name: string; path: string; folders: Folder[]; notes: NoteLink[]; count: number };
function makeTree(notes: NoteLink[]) {
  const root: Folder = { name: "", path: "", folders: [], notes: [], count: notes.length };
  for (const note of notes) {
    let branch = root;
    note.folders.forEach((name, i) => {
      const path = note.id.split("/").slice(0, i + 1).join("/");
      let folder = branch.folders.find((item) => item.path === path);
      if (!folder) { folder = { name, path, folders: [], notes: [], count: 0 }; branch.folders.push(folder); }
      folder.count++;
      branch = folder;
    });
    branch.notes.push(note);
  }
  return root;
}
function Branch({ folder, current }: { folder: Folder; current?: string }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const active = !!current?.startsWith(`${folder.path}/`);
  useEffect(() => { if (active && ref.current) ref.current.open = true; }, [active, current]);
  return <details className="explorer-folder" ref={ref} open={active || undefined}>
    <summary><NoteIcon kind="chevron" className="folder-caret" /><NoteIcon kind="folder" /><span>{folder.name}</span><small>{folder.count}</small></summary>
    <div className="explorer-children"><Children folder={folder} current={current} /></div>
  </details>;
}
function Children({ folder, current }: { folder: Folder; current?: string }) {
  return <>
    {folder.folders.sort((a, b) => a.name.localeCompare(b.name)).map((item) => <Branch key={item.path} folder={item} current={current} />)}
    {folder.notes.sort((a, b) => a.title.localeCompare(b.title)).map((note) => <Link key={note.id}
      href={`/notes/${note.id}/` as Route} className="explorer-note" title={note.title}
      aria-current={note.id === current ? "page" : undefined} onClick={() => playInterfaceSound("tap")}>
      <NoteIcon /><span>{note.title}</span>
    </Link>)}
  </>;
}
export function NotesExplorer({ notes, current }: { notes: NoteLink[]; current?: string }) {
  return <aside className="notes-explorer">
    <NotesDisclosure title={notesContent.explorer}>
      <nav className="explorer-content" aria-label={notesContent.explorer} onClick={(event) => {
        if ((event.target as Element).closest("a") && !window.matchMedia("(min-width: 1100px)").matches) {
          const details = event.currentTarget.closest("details");
          if (details) details.open = false;
        }
      }}>
        <Link href="/notes" className="explorer-all" aria-current={!current ? "page" : undefined}>
          <NoteIcon kind="list" /><span>{notesContent.allNotes}</span><small>{notes.length}</small>
        </Link>
        <Children folder={makeTree(notes)} current={current} />
      </nav>
    </NotesDisclosure>
  </aside>;
}
