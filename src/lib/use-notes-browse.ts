"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { getNotesBrowseSnapshot, getNotesBrowseServerSnapshot, subscribeNotesBrowse, getNotesScroll, saveNotesScroll } from "./notes-browse";

const subscribeHydration = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function useNotesBrowse() {
  const controls = useSyncExternalStore(subscribeNotesBrowse, getNotesBrowseSnapshot, getNotesBrowseServerSnapshot);
  const ready = useSyncExternalStore(subscribeHydration, clientReady, serverReady);
  const view = controls.view;
  useLayoutEffect(() => {
    if (!ready) return;
    let restoring = true, leaving = false, frame = 0;
    const y = getNotesScroll(view);
    // Wait for the restored panel to exist and Next's navigation scroll to run.
    // Instant restoration avoids smooth-scrolling through a long list on Back.
    frame = requestAnimationFrame(() => {
      window.scrollTo({ top: y, behavior: "instant" });
      frame = requestAnimationFrame(() => { restoring = false; });
    });
    const remember = () => {
      if (!restoring && !leaving && /^\/notes\/?$/.test(location.pathname)) saveNotesScroll(view, window.scrollY);
    };
    const navigate = (event: MouseEvent) => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element).closest("a[href]");
      if (!link || link.getAttribute("target") === "_blank") return;
      const target = new URL(link.getAttribute("href")!, location.href);
      if (target.origin !== location.origin) return;
      if (target.pathname.replace(/\/$/, "") === location.pathname.replace(/\/$/, "")) return;
      remember();
      leaving = true;
    };
    const resume = () => { leaving = false; };
    window.addEventListener("scroll", remember, { passive: true });
    window.addEventListener("pagehide", remember);
    window.addEventListener("pageshow", resume);
    document.addEventListener("click", navigate);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", remember);
      window.removeEventListener("pagehide", remember);
      window.removeEventListener("pageshow", resume);
      document.removeEventListener("click", navigate);
    };
  }, [view, ready]);
  return controls;
}
