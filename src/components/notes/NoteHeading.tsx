"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { notesContent } from "@/content/notes";
import { playInterfaceSound } from "@/lib/interface-sound";
import { animateLetters } from "@/lib/letter-reveal";
import { SplitLetters } from "@/components/primitives/LetterReveal";

type PreviousHeading = { id: string; folders: string[] } | null;
const MotionContext = createContext<RefObject<PreviousHeading> | null>(null);

export function NoteMotionProvider({ children }: { children: ReactNode }) {
  const previousRef = useRef<PreviousHeading>(null);
  const pathname = usePathname();
  useLayoutEffect(() => {
    // The index has no visible heading, but returning there resets the path.
    if (/^\/notes\/?$/.test(pathname)) previousRef.current = null;
  }, [pathname]);
  return <MotionContext value={previousRef}>{children}</MotionContext>;
}

/** The layout remembers the previous path, even when a note page remounts. */
export function NoteHeading({ id, title, folders }: { id: string; title: string; folders?: string[] }) {
  const previousRef = useContext(MotionContext);
  const transitionFrom = useRef<PreviousHeading>(null);
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!previousRef || !root.current) return;
    // Preserve this transition's origin when React replays the effect in
    // development. Cleanup cancels its animations, so setup must restart them.
    if (previousRef.current?.id !== id) {
      transitionFrom.current = previousRef.current;
      previousRef.current = { id, folders: folders ?? [] };
    }
    const before = transitionFrom.current;

    let shared = 0;
    while (folders && shared < folders.length && before?.folders[shared] === folders[shared]) shared++;
    const segments = root.current.querySelectorAll<HTMLElement>("[data-path-part]");
    const letters = Array.from(segments).flatMap((part) =>
      Number(part.dataset.pathPart) >= shared
        ? Array.from(part.querySelectorAll<HTMLElement>(".letter-reveal-letter")) : []);
    return animateLetters(letters);
  }, [id, folders, previousRef]);

  return <div ref={root} className="note-heading">
    {folders && <nav className="note-breadcrumb" aria-label="Breadcrumb">
      <Link href="/notes" prefetch={false} onClick={() => playInterfaceSound("tap")}>{notesContent.title}</Link>
      {folders.map((folder, index) => <span className="note-path-part" key={folders.slice(0, index + 1).join("/")}>
        <span className="note-path-separator" aria-hidden="true">/</span>
        <span data-path-part={index}><SplitLetters text={folder} /></span>
      </span>)}
    </nav>}
    <h1>{title}</h1>
  </div>;
}
