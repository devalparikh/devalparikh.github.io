import type { Metadata } from "next";
import { PageFrame } from "@/components/chrome/PageFrame";
import { PageHeader } from "@/components/primitives/PageHeader";
import { NotesList } from "@/components/notes/NotesList";
import { notesContent } from "@/content/notes";
import { noteSummaries } from "@/lib/notes";

export const metadata: Metadata = { title: notesContent.title, description: notesContent.description };

export default function NotesPage() {
  return (
    <PageFrame>
      <PageHeader title={notesContent.title} description={notesContent.description} />
      <NotesList notes={noteSummaries} />
    </PageFrame>
  );
}
