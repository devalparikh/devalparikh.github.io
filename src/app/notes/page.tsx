import type { Metadata } from "next";
import { NoteHeading } from "@/components/notes/NoteHeading";
import { NotesList } from "@/components/notes/NotesList";
import { NotesExplorer } from "@/components/notes/NotesExplorer";
import { notesContent } from "@/content/notes";
import { noteSummaries, noteLinks } from "@/lib/notes";

export const metadata: Metadata = { title: notesContent.title, description: notesContent.description };

export default function NotesPage() {
  return <div className="notes-layout notes-index-layout">
    <NotesExplorer notes={noteLinks} />
    <div className="notes-main">
      <header className="notes-header"><NoteHeading id="/notes" title={notesContent.title} /><p>{notesContent.description}</p></header>
      <NotesList notes={noteSummaries} />
    </div>
  </div>;
}
