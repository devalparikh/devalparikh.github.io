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
}

export type NoteSummary = Pick<Note, "id" | "title" | "category" | "tags" | "updated" | "search">;
export const notes: Note[] = snapshot.notes;
export const noteSummaries: NoteSummary[] = notes.map(({ id, title, category, tags, updated, search }) => ({ id, title, category, tags, updated, search }));

export function formatNoteDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(date));
}
