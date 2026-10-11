"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useLayoutEffect, useRef } from "react";
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
  return <details className="explorer-folder" data-folder={folder.path} ref={ref} open={active || undefined}>
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
  const contentRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const nav = contentRef.current;
    if (!nav) return;
    let restoring = true;
    let saved: { folders?: string[]; scroll?: number } = {};
    try { saved = JSON.parse(sessionStorage.getItem("notes-explorer-v1") ?? "{}") ?? {}; } catch { /* Optional session memory. */ }
    const folders = nav.querySelectorAll<HTMLDetailsElement>("details[data-folder]");
    folders.forEach((folder) => {
      const path = folder.dataset.folder!;
      if (Array.isArray(saved.folders) && saved.folders.includes(path) || current?.startsWith(`${path}/`)) folder.open = true;
    });
    const remember = () => {
      if (restoring) return;
      try {
        sessionStorage.setItem("notes-explorer-v1", JSON.stringify({
          folders: Array.from(folders).filter((folder) => folder.open).map((folder) => folder.dataset.folder),
          scroll: nav.scrollTop,
        }));
      } catch { /* The explorer also works without browser storage. */ }
    };
    const frame = requestAnimationFrame(() => {
      nav.scrollTo({ top: typeof saved.scroll === "number" ? saved.scroll : 0, behavior: "instant" });
      const active = nav.querySelector<HTMLElement>('.explorer-note[aria-current="page"]');
      if (active && nav.clientHeight) {
        const item = active.getBoundingClientRect(), bounds = nav.getBoundingClientRect();
        if (item.top < bounds.top) nav.scrollTop += item.top - bounds.top - 8;
        else if (item.bottom > bounds.bottom) nav.scrollTop += item.bottom - bounds.bottom + 8;
      }
      restoring = false;
      remember();
    });
    nav.addEventListener("scroll", remember, { passive: true });
    nav.addEventListener("toggle", remember, true);
    return () => {
      cancelAnimationFrame(frame);
      nav.removeEventListener("scroll", remember);
      nav.removeEventListener("toggle", remember, true);
    };
  }, [current]);
  return <aside className="notes-explorer">
    <NotesDisclosure title={notesContent.explorer}>
      <nav ref={contentRef} className="explorer-content" aria-label={notesContent.explorer} onClick={(event) => {
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
