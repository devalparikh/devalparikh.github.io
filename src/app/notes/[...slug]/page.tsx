import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageFrame } from "@/components/chrome/PageFrame";
import { NotesExplorer } from "@/components/notes/NotesExplorer";
import { NoteToc } from "@/components/notes/NoteToc";
import { NoteGraph } from "@/components/notes/NoteGraph";
import { notesContent } from "@/content/notes";
import { notes, noteLinks, formatNoteDate } from "@/lib/notes";

export const dynamicParams = false;
export function generateStaticParams() {
  // Next's static exporter requires one parameter even when every note was
  // removed. This sentinel calls notFound(), allowing an empty index to deploy.
  return notes.length ? notes.map((note) => ({ slug: note.id.split("/") })) : [{ slug: ["_empty"] }];
}
type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = notes.find((item) => item.id === slug.join("/"));
  return note ? { title: note.title, description: note.excerpt } : {};
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  const note = notes.find((item) => item.id === slug.join("/"));
  if (!note) notFound();
  const backlinks = notes.filter((item) => item.outgoing.includes(note.id));

  return <PageFrame wide>
    <div className="notes-layout note-layout">
      <NotesExplorer notes={noteLinks} current={note.id} />
      <header className="note-header">
        <nav className="note-breadcrumb" aria-label="Breadcrumb">
          <Link href="/notes">{notesContent.title}</Link>
          {note.folders.map((folder, index) => <span key={index}><span aria-hidden="true">/</span> {folder}</span>)}
        </nav>
        <h1>{note.title}</h1>
        <div className="note-properties">
          {note.updated && <span>Updated <time dateTime={note.updated}>{formatNoteDate(note.updated)}</time></span>}
          {note.tags.map((tag) => <span key={tag}>#{tag}</span>)}
        </div>
      </header>
      <div className="note-rail">
        <aside className="note-outline"><NoteToc headings={note.toc} /></aside>
        <aside className="note-connections"><NoteGraph notes={noteLinks} current={note.id} compact /></aside>
      </div>
      <div className="notes-main note-body">
        {/* HTML and heading IDs come from the same sanitized build-time tree. */}
        <article className="note-prose" dangerouslySetInnerHTML={{ __html: note.html }} />
        {!!backlinks.length && <aside className="note-backlinks" aria-label={notesContent.backlinks}>
          <h2>{notesContent.backlinks}<span>{backlinks.length}</span></h2>
          <ul>{backlinks.map((item) => <li key={item.id}><Link href={`/notes/${item.id}/` as Route}>{item.title}<span aria-hidden="true">↗</span></Link></li>)}</ul>
        </aside>}
      </div>
    </div>
  </PageFrame>;
}
