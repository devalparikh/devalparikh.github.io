"use client";

/**
 * The bookshelf's view mode and motion gate, read through
 * useSyncExternalStore like the theme and sound preferences.
 */

export const shelfViews = [
  { id: "same", label: "Same size" },
  { id: "scaled", label: "Scaled to length" },
  { id: "thickness", label: "Thickness" },
  { id: "spines", label: "Shelf" },
] as const;
export type ShelfView = (typeof shelfViews)[number]["id"];

export const DEFAULT_SHELF_VIEW: ShelfView = "thickness";

const STORAGE_KEY = "deval-shelf-view";
const CHANGE_EVENT = "deval:shelf-view-change";

export function isShelfView(value: unknown): value is ShelfView {
  return shelfViews.some((view) => view.id === value);
}

export function subscribeToShelfView(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Used only when storage is unavailable, so a choice still holds until reload. */
let memory: ShelfView | null = null;

export function getShelfViewSnapshot(): ShelfView {
  if (memory) return memory;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isShelfView(stored) ? stored : DEFAULT_SHELF_VIEW;
  } catch {
    return DEFAULT_SHELF_VIEW;
  }
}

export const getShelfViewServerSnapshot = (): ShelfView => DEFAULT_SHELF_VIEW;

export function setShelfView(next: ShelfView) {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    memory = next;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/* ------------------------------------------------------- motion gate -- */

interface NetworkInformationLike extends EventTarget {
  saveData?: boolean;
}

const MOTION_QUERIES = ["(prefers-reduced-motion: reduce)", "(prefers-reduced-data: reduce)"];

function connection(): NetworkInformationLike | undefined {
  return (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
}

/** Hover loops play only when the visitor allows motion and is not saving data. */
export function subscribeToPreviewMotion(onChange: () => void) {
  const queries = MOTION_QUERIES.map((query) => window.matchMedia(query));
  queries.forEach((query) => query.addEventListener("change", onChange));
  connection()?.addEventListener("change", onChange);
  return () => {
    queries.forEach((query) => query.removeEventListener("change", onChange));
    connection()?.removeEventListener("change", onChange);
  };
}

export function getPreviewMotionSnapshot(): boolean {
  if (MOTION_QUERIES.some((query) => window.matchMedia(query).matches)) return false;
  return connection()?.saveData !== true;
}

/** No motion until the client has checked - the server never animates. */
export const getPreviewMotionServerSnapshot = () => false;
