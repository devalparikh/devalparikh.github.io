"use client";

import { useLayoutEffect, useRef } from "react";
import { animateLetters } from "@/lib/letter-reveal";

const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

/** Keep words together visually and expose the unsplit text to screen readers. */
export function SplitLetters({ text }: { text: string }) {
  return <>
    <span className="sr-only select-none">{text}</span>
    <span aria-hidden="true">{text.split(/(\s+)/).map((word, wordIndex) => /\s/.test(word) ? word :
      <span className="letter-reveal-word" key={wordIndex}>{Array.from(segmenter.segment(word), ({ segment }, index) =>
        <span className="letter-reveal-letter" key={index}>{segment}</span>)}</span>)}</span>
  </>;
}

export function LetterReveal({ text, delay = 0 }: { text: string; delay?: number }) {
  const root = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!root.current) return;
    return animateLetters(Array.from(root.current.querySelectorAll<HTMLElement>(".letter-reveal-letter")), delay);
  }, [text, delay]);

  return <span ref={root}><SplitLetters text={text} /></span>;
}
