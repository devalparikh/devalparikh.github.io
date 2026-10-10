import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageFrame } from "@/components/chrome/PageFrame";
import { PageHeader } from "@/components/primitives/PageHeader";
import { notes, formatNoteDate } from "@/lib/notes";

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

  return (
    <PageFrame>
      <Link href="/notes" className="mb-7 inline-block text-sm text-neutral-content hover:text-primary">← All notes</Link>
      <PageHeader kicker={note.category} title={note.title} />
      {note.updated && <p className="mt-4 text-xs text-neutral-content">Updated <time dateTime={note.updated}>{formatNoteDate(note.updated)}</time></p>}
      {!!note.tags.length && <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-content">{note.tags.map((tag) => <span key={tag}>#{tag}</span>)}</p>}
      {/* HTML is parsed and sanitized at build time by scripts/lib/notes.mjs. */}
      <article className="note-prose mt-9" dangerouslySetInnerHTML={{ __html: note.html }} />
      {!!backlinks.length && <aside className="mt-12 border-t border-[var(--rule)] pt-6" aria-label="Notes linking here">
        <h2 className="font-display text-xl">Notes linking here</h2>
        <ul className="mt-4 space-y-2 text-sm">{backlinks.map((item) => <li key={item.id}><Link href={`/notes/${item.id}/` as Route} className="underline underline-offset-4 hover:text-primary">{item.title}</Link></li>)}</ul>
      </aside>}
    </PageFrame>
  );
}
