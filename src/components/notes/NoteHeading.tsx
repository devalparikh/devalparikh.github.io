"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { notesContent } from "@/content/notes";
import { playInterfaceSound } from "@/lib/interface-sound";

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

const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

function MotionText({ text }: { text: string }) {
  return <>
    <span className="sr-only select-none">{text}</span>
    <span aria-hidden="true">{text.split(/(\s+)/).map((word, wordIndex) => /\s/.test(word) ? word :
      <span className="note-motion-word" key={wordIndex}>{Array.from(segmenter.segment(word), ({ segment }, index) =>
        <span className="note-motion-letter" key={index}>{segment}</span>)}</span>)}</span>
  </>;
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
      part.dataset.pathPart === "title" || Number(part.dataset.pathPart) >= shared
        ? Array.from(part.querySelectorAll<HTMLElement>(".note-motion-letter")) : []);
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;

    const easing = getComputedStyle(root.current).getPropertyValue("--ease-out-quint").trim();
    // A short wave, capped so long paths never make the reader wait.
    const stagger = Math.min(12, 180 / Math.max(1, letters.length - 1));
    const animations = letters.map((letter, index) => letter.animate([
      { opacity: 0, filter: "blur(3px)", transform: "translateY(.18em)" },
      { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
    ], { duration: 320, delay: index * stagger, easing, fill: "backwards" }));
    const cancel = () => animations.forEach((animation) => animation.cancel());
    preference.addEventListener("change", cancel);
    return () => { cancel(); preference.removeEventListener("change", cancel); };
  }, [id, title, folders, previousRef]);

  return <div ref={root} className="note-heading">
    {folders && <nav className="note-breadcrumb" aria-label="Breadcrumb">
      <Link href="/notes" onClick={() => playInterfaceSound("tap")}>{notesContent.title}</Link>
      {folders.map((folder, index) => <span className="note-path-part" key={folders.slice(0, index + 1).join("/")}>
        <span className="note-path-separator" aria-hidden="true">/</span>
        <span data-path-part={index}><MotionText text={folder} /></span>
      </span>)}
    </nav>}
    <h1 data-path-part="title"><MotionText text={title} /></h1>
  </div>;
}
