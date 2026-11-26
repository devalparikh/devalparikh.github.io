"use client";

import Link from "next/link";
import type { Route } from "next";
import { useLayoutEffect, useState, type Ref, type RefObject } from "react";
import { Portal } from "@/components/primitives/Portal";
import { interTight } from "@/lib/fonts";
import { playInterfaceSound } from "@/lib/interface-sound";
import {
  choosePreviewLayout,
  INLINE_LAYOUT,
  sameLayout,
  type PreviewLayout,
  type PreviewSource,
} from "@/lib/shelf-preview";
import { formatWordCount } from "@/lib/word-count";
import { BookCover, type CoverPost } from "./BookCover";

export interface PreviewBook extends CoverPost {
  title: string;
  summary: string;
  dateTime: string;
  dateLabel: string;
}

const px = (value: string) => Number.parseFloat(value) || 0;

function box(element: Element) {
  const rect = element.getBoundingClientRect();
  return { top: rect.top, bottom: rect.bottom };
}

/**
 * Reads everything the layout depends on. Both card variants are measured as
 * rendered for this book, then the variant React set is put back before
 * anything paints.
 */
function measurePreview(
  slug: string,
  source: PreviewSource,
  list: HTMLElement | null,
  caption: HTMLElement | null,
  card: HTMLElement | null,
): PreviewLayout | null {
  const book = list?.querySelector(`.shelf-slot[data-slug="${CSS.escape(slug)}"] .book`);
  if (!caption || !card || !book) return null;

  const variant = card.dataset.variant ?? "card";
  card.dataset.variant = "card";
  const cardHeight = card.offsetHeight;
  card.dataset.variant = "compact";
  const compactHeight = card.offsetHeight;
  card.dataset.variant = variant;

  const viewport = window.visualViewport;
  const chrome = document.querySelector(".nav-shell");
  const obstructedTop = Math.max(0, chrome ? chrome.getBoundingClientRect().bottom : 0);
  card.style.setProperty("--shelf-card-top", `${obstructedTop}px`);

  return choosePreviewLayout({
    viewport: { top: viewport?.offsetTop ?? 0, height: viewport?.height ?? window.innerHeight },
    obstructedTop,
    caption: box(caption),
    book: box(book),
    cardHeight,
    compactHeight,
    // The card's offset from the bottom edge, safe area included.
    margin: px(getComputedStyle(card).scrollMarginBottom),
    source,
  });
}

/**
 * Decides, before paint, whether the book being looked at is described by the
 * caption under the shelf or by the overlay card (lib/shelf-preview.ts), and
 * keeps deciding while the page scrolls or the viewport changes under it.
 *
 * The caption keeps its full size even while the card stands in for it, so
 * the measurement never feeds back into itself.
 */
export function usePreviewLayout(
  slug: string | null,
  source: PreviewSource | null,
  refs: {
    list: RefObject<HTMLElement | null>;
    caption: RefObject<HTMLElement | null>;
    card: RefObject<HTMLElement | null>;
  },
): PreviewLayout {
  const [layout, setLayout] = useState<PreviewLayout>(INLINE_LAYOUT);
  const { list, caption, card } = refs;

  useLayoutEffect(() => {
    if (!slug || !source) return;

    const measure = (initial: boolean) => {
      const next = measurePreview(slug, source, list.current, caption.current, card.current);
      if (!next) return;
      setLayout((current) => (sameLayout(current, next) ? current : next));

      if (initial && next.scrollBy > 0) {
        const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollBy({ top: next.scrollBy, behavior: still ? "auto" : "smooth" });
      }
    };

    measure(true);

    let frame = 0;
    const schedule = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          measure(false);
        });
      }
    };
    const viewport = window.visualViewport;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    viewport?.addEventListener("resize", schedule);
    viewport?.addEventListener("scroll", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      viewport?.removeEventListener("resize", schedule);
      viewport?.removeEventListener("scroll", schedule);
    };
  }, [slug, source, list, caption, card]);

  return layout;
}

interface ShelfPreviewCardProps {
  book: PreviewBook;
  href: Route;
  open: boolean;
  layout: PreviewLayout;
  /** Tapped or focused: offer Read and Close. A mouse hover is a passive caption. */
  interactive: boolean;
  onClose: () => void;
  cardRef: Ref<HTMLDivElement>;
}

/**
 * The shelf's caption, lifted onto the screen when the real one is out of
 * view: a small card that rises from the bottom edge (or, on short screens,
 * a one-line bar). Rendered through a Portal so no transformed ancestor can
 * capture its fixed position. It stays mounted, hidden, so it can be measured
 * and can animate out holding the last book it showed.
 */
export function ShelfPreviewCard({ book, href, open, layout, interactive, onClose, cardRef }: ShelfPreviewCardProps) {
  return (
    <Portal>
      <div
        ref={cardRef}
        className={`shelf-card ${interTight.variable}`}
        data-open={open}
        data-variant={layout.mode === "compact" ? "compact" : "card"}
        data-dock={layout.dock}
        data-interactive={interactive}
        role="group"
        aria-label={`Preview: ${book.title}`}
        inert={!open}
      >
        <span className="shelf-card-lip" aria-hidden="true" />
        <div className="shelf-card-thumb" aria-hidden="true">
          <BookCover post={book} />
        </div>
        <div className="shelf-card-body">
          <p className="shelf-caption-meta">
            <time dateTime={book.dateTime}>{book.dateLabel}</time> · {formatWordCount(book.words)}
          </p>
          <p className="shelf-card-title">{book.title}</p>
          <p className="shelf-card-summary">{book.summary}</p>
        </div>
        {interactive && (
          <>
            <Link href={href} className="shelf-card-open" onClick={() => playInterfaceSound("tap")}>
              <span>
                Read<span className="shelf-card-open-long"> the article</span>
              </span>
              <span aria-hidden="true" className="shelf-card-arrow">
                →
              </span>
            </Link>
            <button type="button" className="shelf-card-close" aria-label="Close preview" onClick={onClose}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <path d="m4.5 4.5 7 7m0-7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </Portal>
  );
}
