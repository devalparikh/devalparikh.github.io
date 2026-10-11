import type { GraphView } from "./note-graph";

export type NotesView = "list" | "graph";
export interface NotesBrowseControls {
  view: NotesView;
  query: string;
  topic: string;
  graph: GraphView;
}
interface NotesBrowseState {
  controls: NotesBrowseControls;
  scroll: Record<NotesView, number>;
}
const KEY = "notes-browse-v1";
const DEFAULT: NotesBrowseState = {
  controls: { view: "list", query: "", topic: "", graph: { x: 0, y: 0, scale: 1 } },
  scroll: { list: 0, graph: 0 },
};
const finite = (value: unknown, fallback: number) => typeof value === "number" && Number.isFinite(value) ? value : fallback;

export function parseNotesBrowseState(raw: string | null): NotesBrowseState {
  try {
    const value = JSON.parse(raw ?? "null");
    if (!value || typeof value !== "object") return DEFAULT;
    const controls = value.controls ?? {}, graph = controls.graph ?? {};
    return {
      controls: {
        view: controls.view === "graph" ? "graph" : "list",
        query: typeof controls.query === "string" ? controls.query.slice(0, 500) : "",
        topic: typeof controls.topic === "string" ? controls.topic.slice(0, 200) : "",
        graph: { x: finite(graph.x, 0), y: finite(graph.y, 0), scale: Math.max(0.5, Math.min(4, finite(graph.scale, 1))) },
      },
      scroll: { list: Math.max(0, finite(value.scroll?.list, 0)), graph: Math.max(0, finite(value.scroll?.graph, 0)) },
    };
  } catch { return DEFAULT; }
}

let state: NotesBrowseState | undefined;
const listeners = new Set<() => void>();
function read() {
  if (typeof window === "undefined") return DEFAULT;
  if (!state) {
    try { state = parseNotesBrowseState(sessionStorage.getItem(KEY)); }
    catch { state = DEFAULT; }
  }
  return state;
}
function persist(next: NotesBrowseState) {
  state = next;
  try { sessionStorage.setItem(KEY, JSON.stringify(next)); } catch { /* Browsing still works when storage is disabled. */ }
}
export const getNotesBrowseSnapshot = () => read().controls;
export const getNotesBrowseServerSnapshot = () => DEFAULT.controls;
export function subscribeNotesBrowse(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function updateNotesBrowse(patch: Partial<NotesBrowseControls>) {
  const previous = read();
  persist({ ...previous, controls: { ...previous.controls, ...patch } });
  listeners.forEach((listener) => listener());
}
export function updateNotesGraph(update: (previous: GraphView) => GraphView) {
  updateNotesBrowse({ graph: update(read().controls.graph) });
}
export const getNotesScroll = (view: NotesView) => read().scroll[view];
export function saveNotesScroll(view: NotesView, y: number) {
  const previous = read();
  if (previous.scroll[view] === y) return;
  // Scroll updates don't re-render the graph or refilter the note list.
  persist({ ...previous, scroll: { ...previous.scroll, [view]: y } });
}
