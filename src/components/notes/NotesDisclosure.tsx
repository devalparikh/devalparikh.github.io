"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { NoteIcon } from "./NoteIcons";

export function NotesDisclosure({ title, className = "", children }: { title: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1100px)");
    const sync = () => { if (ref.current) ref.current.open = media.matches; };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return <details className={`notes-disclosure ${className}`} ref={ref}>
    <summary>{title}<NoteIcon kind="chevron" /></summary>
    {children}
  </details>;
}
