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
import {
  getPreviewMotionServerSnapshot,
  getPreviewMotionSnapshot,
  getShelfViewServerSnapshot,
  getShelfViewSnapshot,
  setShelfView,
  shelfViews,
  subscribeToPreviewMotion,
  subscribeToShelfView,
  type ShelfView,
} from "@/lib/shelf-view";
import { formatWordCount } from "@/lib/word-count";
import { BookCover, type CoverPost } from "./BookCover";
import { FloorLamp, OliveTree, ShelfDecor, type ShelfDecorKind } from "./ShelfDecor";
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
 */
export function Bookshelf({ books, filters, elsewhere, elsewhereTitle }: BookshelfProps) {
  const [filterId, setFilterId] = useState(ALL_FILTER.id);
  const view = useSyncExternalStore(subscribeToShelfView, getShelfViewSnapshot, getShelfViewServerSnapshot);
  const motion = useSyncExternalStore(subscribeToPreviewMotion, getPreviewMotionSnapshot, getPreviewMotionServerSnapshot);

  /** The book being looked at: hovered, focused or tapped. Drives the caption. */
  const [active, setActive] = useState<string | null>(null);
  /** The book whose loop is playing - `active` once hover intent settles. */
  const [playing, setPlaying] = useState<string | null>(null);
  /** A touch tap selected this book; the next tap on it opens it. */
  const [armed, setArmed] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const lastPointer = useRef<string>("mouse");

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const visible = books.filter((book) => filterId === ALL_FILTER.id || book.categories.includes(filterId));
  const external = filterEntries(elsewhere, filterId);
  const shown = books.find((book) => book.slug === active) ?? null;

  function look(slug: string, delay = HOVER_INTENT_MS) {
    window.clearTimeout(timer.current);
    setActive(slug);
    if (!motion) return;
    timer.current = window.setTimeout(() => setPlaying(slug), delay);
  }

  function leave(slug: string) {
    window.clearTimeout(timer.current);
    setPlaying((current) => (current === slug ? null : current));
  }

  function chooseView(next: ShelfView) {
    if (next === view) return;
    setShelfView(next);
    playInterfaceSound("toggle");
  }

  return (
    <>
      <Reveal index={2} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs filters={filters} active={filterId} onSelect={setFilterId} label="Filter writing" />
        <div className="shelf-views" role="group" aria-label="Shelf view">
          {shelfViews.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={view === option.id}
              onClick={() => chooseView(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal index={3} className="mt-5">
        <section className="shelf" data-view={view} aria-label="Bookshelf">
          <div className="shelf-room">
            <OliveTree />
            <FloorLamp />
            <div className="shelf-case">
              <div className="shelf-case-inner">
                {visible.length === 0 ? (
                  <p className="shelf-empty">No books on this shelf yet.</p>
                ) : (
                  <ul className="shelf-books">
                    {visible.map((book, index) => {
                      const geometry = bookGeometry(book.words);
                      const style = {
                        "--thick": `${geometry.thickness}px`,
                        "--scale": geometry.scale,
                        "--spine": `${geometry.spine}px`,
                        "--g": `var(--cover-${book.cover.ground})`,
                        "--k1": `var(--cover-${book.cover.inks[0]})`,
                        "--t": `var(--cover-${book.cover.text})`,
                      } as CSSProperties;
                      const isActive = active === book.slug;
                      return [
                        <li key={book.slug} className="shelf-slot" style={style}>
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
                              if (event.pointerType === "mouse") look(book.slug);
                            }}
                            onPointerLeave={(event) => {
                              if (event.pointerType !== "mouse") return;
                              leave(book.slug);
                              setActive((current) => (current === book.slug ? null : current));
                            }}
                            onFocus={(event) => {
                              // Keyboard focus previews like a hover; a tap's focus is handled on click.
                              if (event.currentTarget.matches(":focus-visible")) look(book.slug);
                            }}
                            onBlur={() => {
                              leave(book.slug);
                              setArmed((current) => (current === book.slug ? null : current));
                            }}
                            onClick={(event) => {
                              if (lastPointer.current === "touch" && armed !== book.slug) {
                                // First tap previews and shows the caption; the second opens.
                                event.preventDefault();
                                setArmed(book.slug);
                                look(book.slug, 0);
                                playInterfaceSound("toggle");
                                return;
                              }
                              playInterfaceSound("tap");
                            }}
                          >
                            <span className="book-object">
                              <span className="book-front">
                                <BookCover post={book} playing={playing === book.slug && view !== "spines"} />
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

          <div className="shelf-caption" data-visible={Boolean(shown)}>
            {shown ? (
              <>
                <div className="shelf-caption-thumb" aria-hidden="true">
                  <BookCover post={shown} playing={view === "spines" && playing === shown.slug} />
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
            ) : (
              <p className="shelf-caption-hint">
                {visible.length} {visible.length === 1 ? "book" : "books"}. Hover or tap a cover to preview it.
              </p>
            )}
          </div>
        </section>
      </Reveal>

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
