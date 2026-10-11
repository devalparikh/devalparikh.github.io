"use client";

import { useEffect, useState } from "react";
import type { Note } from "@/lib/notes";
import { notesContent } from "@/content/notes";
import { NotesDisclosure } from "./NotesDisclosure";

export function NoteToc({ headings }: { headings: Note["toc"] }) {
  const [active, setActive] = useState(headings[0]?.id ?? "");
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let id = headings[0]?.id ?? "";
      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element && element.getBoundingClientRect().top <= 130) id = heading.id;
      }
      setActive(id);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, [headings]);
  if (!headings.length) return null;
  const minDepth = Math.min(...headings.map((heading) => heading.depth));
  return <NotesDisclosure title={notesContent.contents} className="note-toc">
    <nav aria-label={notesContent.contents}>
      {headings.map((heading) => <a key={heading.id} href={`#${heading.id}`}
        aria-current={active === heading.id ? "location" : undefined}
        onClick={(event) => {
          if (!window.matchMedia("(min-width: 1100px)").matches) {
            const details = event.currentTarget.closest("details");
            if (details) details.open = false;
          }
        }}
        style={{ paddingLeft: `${0.75 + Math.min(heading.depth - minDepth, 3) * 0.65}rem` }}>
        {heading.text}
      </a>)}
    </nav>
  </NotesDisclosure>;
}
