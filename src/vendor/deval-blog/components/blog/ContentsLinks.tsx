"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";

export type HeadingItem = {
  id: string;
  text: string;
  level: number;
};

/**
 * Sizes and positions the contents highlight from the active link's box. Only
 * DOM styles are written, so scroll-spy updates never re-render the list. The
 * first placement, and any placement while the list is hidden (the mobile
 * disclosure), skips the transition so the highlight appears on the active row
 * instead of gliding in from the top.
 */
function useActiveHighlight(
  listRef: RefObject<HTMLDivElement | null>,
  highlightRef: RefObject<HTMLSpanElement | null>,
  activeId: string,
  headings: HeadingItem[],
) {
  useLayoutEffect(() => {
    const list = listRef.current;
    const highlight = highlightRef.current;
    if (!list || !highlight) return;
    let frame = 0;
    let disposed = false;

    const place = () => {
      const active = list.querySelector<HTMLElement>('[aria-current="location"]');
      if (!active || !active.offsetWidth) {
        // Hidden or no active section: drop the transition so the next
        // placement lands in place.
        delete highlight.dataset.ready;
        highlight.dataset.visible = "false";
        return;
      }
      highlight.style.width = `${active.offsetWidth}px`;
      highlight.style.height = `${active.offsetHeight}px`;
      highlight.style.transform = `translate3d(${active.offsetLeft}px, ${active.offsetTop}px, 0)`;
      highlight.dataset.visible = "true";
      if (!highlight.dataset.ready) {
        window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(() => {
          if (!disposed) highlight.dataset.ready = "true";
        });
      }
    };

    place();
    // Rows reflow when the rail resizes or the page font finishes loading, and
    // the mobile list changes from display:none to measurable when opened.
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    observer?.observe(list);
    document.fonts?.ready.then(() => { if (!disposed) place(); }).catch(() => undefined);
    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [listRef, highlightRef, activeId, headings]);
}

export function ContentsLinks({
  headings,
  activeId,
  onNavigate,
}: {
  headings: HeadingItem[];
  activeId: string;
  onNavigate?: () => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  useActiveHighlight(listRef, highlightRef, activeId, headings);

  return (
    <div ref={listRef} className="blog-toc-list">
      <span ref={highlightRef} className="blog-toc-highlight" aria-hidden="true" />
      <ul>
        {headings.map((item) => (
          <li key={item.id} data-level={item.level}>
            <a
              href={`#${item.id}`}
              aria-current={activeId === item.id ? "location" : undefined}
              onClick={onNavigate}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
