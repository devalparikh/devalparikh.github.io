import type { Metadata } from "next";
import { NotesList } from "@/components/notes/NotesList";
import { NotesExplorer } from "@/components/notes/NotesExplorer";
import { notesContent } from "@/content/notes";
import { noteSummaries, noteLinks } from "@/lib/notes";

export const metadata: Metadata = { title: notesContent.title, description: notesContent.description };

export default function NotesPage() {
  return <div className="notes-layout notes-index-layout">
    <NotesExplorer notes={noteLinks} />
    <div className="notes-main">
      <h1 className="sr-only">{notesContent.title}</h1>
      <NotesList notes={noteSummaries} />
    </div>
  </div>;
}
