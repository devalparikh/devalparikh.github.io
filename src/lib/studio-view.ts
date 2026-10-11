/**
 * The photography page's Preview window has two views. The hero's pills and a
 * URL fragment can both pick one, so the hand-off is a window event plus the
 * fragment rather than shared React state between distant components.
 */
export type StudioView = "preview" | "grid";

const EVENT = "studio:view";

export function requestStudioView(view: StudioView) {
  window.dispatchEvent(new CustomEvent<StudioView>(EVENT, { detail: view }));
}

export function onStudioViewRequest(listener: (view: StudioView) => void) {
  const handler = (event: Event) => listener((event as CustomEvent<StudioView>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

/** `#grid` and `#preview` deep-link straight into a view. */
export function viewFromHash(hash: string): StudioView | null {
  if (hash === "#grid") return "grid";
  if (hash === "#preview") return "preview";
  return null;
}

/** The fragment as an external store, for `useSyncExternalStore`. */
export function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

export function readHashView(): StudioView | null {
  return viewFromHash(window.location.hash);
}
