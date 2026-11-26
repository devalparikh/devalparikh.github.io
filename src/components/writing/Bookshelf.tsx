"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { FilterTabs } from "@/components/collection/FilterTabs";
import { RowActions, RowLead } from "@/components/collection/RowContent";
import { Reveal } from "@/components/primitives/Reveal";
import { ALL_FILTER, filterEntries, type Entry, type Filter } from "@/content/types";
import { bookGeometry } from "@/lib/book-geometry";
import { playInterfaceSound } from "@/lib/interface-sound";
import { getPreviewMotionServerSnapshot, getPreviewMotionSnapshot, subscribeToPreviewMotion } from "@/lib/shelf-motion";
import type { PreviewSource } from "@/lib/shelf-preview";
import { formatWordCount } from "@/lib/word-count";
import { BookCover, type CoverPost } from "./BookCover";
import { FloorLamp, OliveTree, ShelfDecor, type ShelfDecorKind } from "./ShelfDecor";
import { ShelfPreviewCard, usePreviewLayout } from "./ShelfPreviewCard";
import { ShelfStage, useShelfRows } from "./ShelfStage";
import "./bookshelf.css";

export interface ShelfItem extends CoverPost {
  title: string;
  summary: string;
  dateTime: string;
  dateLabel: string;
  categories: string[];
}

interface BookshelfProps {
  books: ShelfItem[];
  filters: Filter[];
  elsewhere: Entry[];
  elsewhereTitle: string;
}

/** A hover has to settle this long before the loop starts - passing over a book does nothing. */
const HOVER_INTENT_MS = 320;

const href = (slug: string) => `/writing/${slug}/` as Route;

/**
 * Styled objects between the books, keyed by how many books precede them, so
 * the shelves read as a furnished room whatever the filter leaves standing.
 */
const DECOR_AFTER: Record<number, ShelfDecorKind[]> = { 2: ["vase"], 5: ["stack"] };
const DECOR_END: ShelfDecorKind[] = ["bonsai", "print"];

function DecorSlot({ kind }: { kind: ShelfDecorKind }) {
  return (
    <li className="shelf-slot shelf-decor" data-kind={kind} aria-hidden="true">
      <ShelfDecor kind={kind} />
    </li>
  );
}

/**
 * The writing shelf. Covers open their article on click. Hovering one with a
 * mouse (or focusing it from the keyboard) lifts it and, after a short
 * settle, plays its motif as a muted loop; a tap on a touch screen does the
 * same and a second tap opens it. Motion is skipped entirely under reduced
 * motion or Save-Data - the still cover is always the poster.
 *
 * The book's detail shows in the caption under the shelf when that is on
 * screen; when it is not, the same detail rises in a card from the bottom
 * edge (ShelfPreviewCard.tsx). With nothing selected the shelf carries no
 * text at all - it speaks for itself.
 */
export function Bookshelf({ books, filters, elsewhere, elsewhereTitle }: BookshelfProps) {
  const [filterId, setFilterId] = useState(ALL_FILTER.id);
  const motion = useSyncExternalStore(subscribeToPreviewMotion, getPreviewMotionSnapshot, getPreviewMotionServerSnapshot);

  /** The book being looked at: hovered, focused or tapped. Drives the caption. */
  const [active, setActive] = useState<string | null>(null);
  /** The book whose loop is playing - `active` once hover intent settles. */
  const [playing, setPlaying] = useState<string | null>(null);
  /** A touch tap selected this book; the next tap on it opens it. */
  const [armed, setArmed] = useState<string | null>(null);
  /** What made `active` active - decides whether the preview card is interactive. */
  const [source, setSource] = useState<PreviewSource | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const listRef = useRef<HTMLUListElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const lastPointer = useRef<string>("mouse");
  /** Set while focus is handed back to a book, so that focus is not a new preview. */
  const restoringFocus = useRef(false);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const visible = books.filter((book) => filterId === ALL_FILTER.id || book.categories.includes(filterId));
  const external = filterEntries(elsewhere, filterId);
  const shown = books.find((book) => book.slug === active) ?? null;
  const rows = useShelfRows(listRef, visible.map((book) => book.slug).join());

  // The card stays mounted with the last book it showed, so it can be
  // measured before it opens and can animate out without emptying.
  const [cardBook, setCardBook] = useState(books[0] ?? null);
  const [cardSource, setCardSource] = useState<PreviewSource>("hover");
  if (shown && shown !== cardBook) setCardBook(shown);
  if (source && source !== cardSource) setCardSource(source);

  const layout = usePreviewLayout(shown?.slug ?? null, source, { list: listRef, caption: captionRef, card: cardRef });
  const overlay = shown !== null && layout.mode !== "inline";

  function look(slug: string, from: PreviewSource, delay = HOVER_INTENT_MS) {
    window.clearTimeout(timer.current);
    setActive(slug);
    setSource(from);
    if (!motion) return;
    timer.current = window.setTimeout(() => setPlaying(slug), delay);
  }

  function leave(slug: string) {
    window.clearTimeout(timer.current);
    setPlaying((current) => (current === slug ? null : current));
  }

  /** Puts the shelf back at rest; focus inside the card goes back to its book. */
  function dismiss() {
    const slug = active;
    window.clearTimeout(timer.current);
    setActive(null);
    setPlaying(null);
    setArmed(null);
    setSource(null);
    if (slug && cardRef.current?.contains(document.activeElement)) {
      const book = listRef.current?.querySelector<HTMLElement>(`.shelf-slot[data-slug="${CSS.escape(slug)}"] .book`);
      restoringFocus.current = true;
      book?.focus();
      restoringFocus.current = false;
    }
  }

  // Escape closes the preview from anywhere; a tap or click away from the
  // books and the card closes a tapped or focused one. (A mouse hover closes
  // itself when the pointer leaves.) `click`, not `pointerdown`, so scrolling
  // the page past a selected book does not lose it.
  const dismissRef = useRef(dismiss);
  useEffect(() => {
    dismissRef.current = dismiss;
  });
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissRef.current();
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (source === "hover" || target?.closest(".book") || cardRef.current?.contains(target)) return;
      if (captionRef.current?.contains(target)) return;
      dismissRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClick);
    };
  }, [active, source]);

  /** Focus moving into the caption or the card is still looking at the book. */
  const staysWithPreview = (next: EventTarget | null) =>
    next instanceof Node && Boolean(cardRef.current?.contains(next) || captionRef.current?.contains(next));

  return (
    <>
      <Reveal index={2} className="mt-8">
        <FilterTabs
          filters={filters}
          active={filterId}
          onSelect={(id) => {
            setFilterId(id);
            dismiss();
          }}
          label="Filter writing"
        />
      </Reveal>

      <Reveal index={3} className="mt-5">
        <section className="shelf" aria-label="Bookshelf">
          <div className="shelf-room">
            <OliveTree />
            <FloorLamp />
            <div className="shelf-case">
              <div className="shelf-case-inner">
                {visible.length === 0 ? (
                  <p className="shelf-empty">No books on this shelf yet.</p>
                ) : (
                  <ul ref={listRef} className="shelf-books" data-stage={rows ? "3d" : "flat"}>
                    {rows && <ShelfStage rows={rows} active={active} />}
                    {visible.map((book, index) => {
                      const geometry = bookGeometry(book.words);
                      const style = {
                        "--thick": `${geometry.thickness}px`,
                        "--g": `var(--cover-${book.cover.ground})`,
                        "--k1": `var(--cover-${book.cover.inks[0]})`,
                        "--t": `var(--cover-${book.cover.text})`,
                      } as CSSProperties;
                      const isActive = active === book.slug;
                      return [
                        <li key={book.slug} className="shelf-slot" data-slug={book.slug} style={style}>
                          <Link
                            href={href(book.slug)}
                            className="book"
                            data-active={isActive}
                            data-armed={armed === book.slug}
                            aria-label={`${book.title}. ${formatWordCount(book.words)}, ${book.dateLabel}.`}
                            onPointerDown={(event) => {
                              lastPointer.current = event.pointerType;
                            }}
                            onPointerEnter={(event) => {
                              if (event.pointerType === "mouse") look(book.slug, "hover");
                            }}
                            onPointerLeave={(event) => {
                              if (event.pointerType !== "mouse") return;
                              leave(book.slug);
                              setActive((current) => (current === book.slug ? null : current));
                            }}
                            onFocus={(event) => {
                              // Keyboard focus previews like a hover; a tap's focus is handled on click.
                              if (restoringFocus.current) return;
                              if (event.currentTarget.matches(":focus-visible")) look(book.slug, "focus");
                            }}
                            onBlur={(event) => {
                              const next = event.relatedTarget;
                              if (staysWithPreview(next)) return;
                              // Tabbing off the shelf altogether takes a keyboard preview with it.
                              const toBook = next instanceof Element && Boolean(next.closest(".book"));
                              if (source === "focus" && active === book.slug && !toBook) {
                                dismiss();
                                return;
                              }
                              leave(book.slug);
                              setArmed((current) => (current === book.slug ? null : current));
                            }}
                            onClick={(event) => {
                              if (lastPointer.current === "touch" && armed !== book.slug) {
                                // First tap previews and shows the caption; the second opens.
                                event.preventDefault();
                                setArmed(book.slug);
                                look(book.slug, "tap", 0);
                                playInterfaceSound("toggle");
                                return;
                              }
                              playInterfaceSound("tap");
                            }}
                          >
                            <span className="book-object">
                              <span className="book-front">
                                <BookCover post={book} playing={playing === book.slug} />
                              </span>
                              <span className="book-spine" aria-hidden="true">
                                <span className="book-spine-issue">{String(book.issue).padStart(2, "0")}</span>
                                <span className="book-spine-title">{book.cover.title.join(" ")}</span>
                                <span className="book-spine-mark">DP</span>
                              </span>
                            </span>
                          </Link>
                        </li>,
                        ...(DECOR_AFTER[index + 1] ?? []).map((kind) => <DecorSlot key={kind} kind={kind} />),
                      ];
                    })}
                    {DECOR_END.map((kind) => (
                      <DecorSlot key={kind} kind={kind} />
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="room-floor" aria-hidden="true">
              <div className="room-rug" />
            </div>
          </div>

          {/* Holds its full size while the card stands in for it, so deciding
              between the two never moves the page. */}
          <div ref={captionRef} className="shelf-caption" data-visible={Boolean(shown)} data-covered={overlay} aria-hidden={overlay || undefined}>
            {shown && (
              <>
                <div className="shelf-caption-thumb" aria-hidden="true">
                  <BookCover post={shown} />
                </div>
                <div className="min-w-0">
                  <p className="shelf-caption-meta">
                    <time dateTime={shown.dateTime}>{shown.dateLabel}</time> · {formatWordCount(shown.words)}
                  </p>
                  <p className="shelf-caption-title">{shown.title}</p>
                  <p className="shelf-caption-summary">{shown.summary}</p>
                  {armed === shown.slug && (
                    <Link href={href(shown.slug)} className="shelf-caption-open" onClick={() => playInterfaceSound("tap")}>
                      Read the article <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </Reveal>

      {cardBook && (
        <ShelfPreviewCard
          book={cardBook}
          href={href(cardBook.slug)}
          open={overlay}
          layout={layout}
          interactive={cardSource !== "hover"}
          onClose={dismiss}
          cardRef={cardRef}
        />
      )}

      {external.length > 0 && (
        <Reveal onScroll className="mt-14">
          <section aria-labelledby="writing-elsewhere">
          <h2 id="writing-elsewhere" className="kicker">
            {elsewhereTitle}
          </h2>
          <div className="row-list mt-3" data-collection="writing">
            {external.map((entry) => (
              <div key={entry.id} className="row">
                <a
                  href={entry.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playInterfaceSound("tap")}
                  className="row-trigger"
                >
                  <RowLead entry={entry} affordance="external" />
                </a>
                <RowActions entry={entry} />
              </div>
            ))}
          </div>
          </section>
        </Reveal>
      )}
    </>
  );
}
