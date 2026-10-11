import snapshot from "@/content/notes.generated.json";

export interface Note {
  id: string;
  title: string;
  category: string;
  tags: string[];
  updated: string | null;
  excerpt: string;
  search: string;
  html: string;
  outgoing: string[];
  folders: string[];
  toc: { id: string; text: string; depth: number }[];
}

export type NoteSummary = Pick<Note, "id" | "title" | "category" | "tags" | "updated" | "search" | "folders" | "outgoing">;
export type NoteLink = Pick<Note, "id" | "title" | "folders" | "outgoing">;
export const notes: Note[] = snapshot.notes;
export const noteSummaries: NoteSummary[] = notes.map(({ id, title, category, tags, updated, search, folders, outgoing }) => ({ id, title, category, tags, updated, search, folders, outgoing }));
export const noteLinks: NoteLink[] = notes.map(({ id, title, folders, outgoing }) => ({ id, title, folders, outgoing }));

export function formatNoteDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(date));
}
