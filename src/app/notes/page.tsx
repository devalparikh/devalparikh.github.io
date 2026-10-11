import type { Metadata } from "next";
import { PageFrame } from "@/components/chrome/PageFrame";
import { NotesList } from "@/components/notes/NotesList";
import { NotesExplorer } from "@/components/notes/NotesExplorer";
import { notesContent } from "@/content/notes";
import { noteSummaries, noteLinks } from "@/lib/notes";

export const metadata: Metadata = { title: notesContent.title, description: notesContent.description };

export default function NotesPage() {
  return <PageFrame wide>
    <div className="notes-layout notes-index-layout">
      <NotesExplorer notes={noteLinks} />
      <div className="notes-main">
        <header className="notes-header"><h1>{notesContent.title}</h1><p>{notesContent.description}</p></header>
        <NotesList notes={noteSummaries} />
      </div>
    </div>
  </PageFrame>;
}
