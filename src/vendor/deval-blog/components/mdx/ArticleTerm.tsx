"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import styles from "./ArticleTerm.module.css";

/** One related post, shown as the term's only link. */
export interface RelatedPost {
  href: string;
  title: string;
}

interface TermContent {
  term: string;
  definition: string;
  preview?: ReactNode;
  related?: RelatedPost;
}

const HOVER_OPEN_MS = 120;
const HOVER_CLOSE_MS = 160;
const CARD_WIDTH = 300;
const CARD_GAP = 8;
const EDGE = 16;

function TermBody({
  definition,
  preview,
  related,
  linkTabIndex,
  definitionId,
}: TermContent & {
  linkTabIndex?: number;
  definitionId?: string;
}) {
  return (
    <>
      <p id={definitionId} className={styles.definition}>
        {definition}
      </p>
      {preview ? (
        <div className={styles.preview} aria-hidden="true">
          {preview}
        </div>
      ) : null}
      {related ? (
        <p className={styles.related}>
          <span>Related post</span>
          <a href={related.href} tabIndex={linkTabIndex}>
            {related.title}
          </a>
        </p>
      ) : null}
    </>
  );
}

function TermDialog({
  content,
  children,
  onClose,
}: {
  content: TermContent;
  children?: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current!;
    if (!dialog.open) dialog.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-definition`}
      onClose={onClose}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const { left, right, top, bottom } = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < left ||
          event.clientX > right ||
          event.clientY < top ||
          event.clientY > bottom
        )
          ref.current?.close();
      }}
    >
      <div className={styles.dialogHeader}>
        <h2 id={`${id}-title`}>{content.term}</h2>
        <button
          type="button"
          onClick={() => ref.current?.close()}
          aria-label={`Close ${content.term} explanation`}
        >
          Close
        </button>
      </div>
      <TermBody {...content} definitionId={`${id}-definition`} />
      {children ? (
        <details className={styles.details}>
          <summary>A little deeper</summary>
          <div>{children}</div>
        </details>
      ) : null}
    </dialog>
  );
}

/**
 * Places the card under the term, or above it when there is no room below,
 * kept inside the viewport. Coordinates are in the page, so the card scrolls
 * with the text it describes.
 */
function cardPosition(anchor: DOMRect, cardHeight: number, width: number) {
  const left = Math.min(Math.max(anchor.left, EDGE), window.innerWidth - EDGE - width);
  const below = anchor.bottom + CARD_GAP + cardHeight <= window.innerHeight - EDGE;
  const top = below ? anchor.bottom + CARD_GAP : anchor.top - CARD_GAP - cardHeight;
  return { left: left + window.scrollX, top: Math.max(top, EDGE) + window.scrollY, width };
}

function TermCard({
  anchor,
  content,
  onEnter,
  onLeave,
}: {
  anchor: HTMLElement;
  content: TermContent;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Measured placement is written straight to the element, like the contents
  // highlight, so showing the card costs one render.
  useLayoutEffect(() => {
    const card = ref.current;
    if (!card) return;
    const place = () => {
      const width = Math.min(CARD_WIDTH, window.innerWidth - EDGE * 2);
      // Width determines text wrapping and SVG height. Measure only after it is set.
      card.style.width = `${width}px`;
      const { left, top } = cardPosition(anchor.getBoundingClientRect(), card.offsetHeight, width);
      Object.assign(card.style, { left: `${left}px`, top: `${top}px` });
      card.dataset.placed = "true";
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [anchor]);
  // Pointer readers get the same content from the dialog; the card is a preview.
  return (
    <div
      ref={ref}
      className={styles.card}
      aria-hidden="true"
      data-placed="false"
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      <p className={styles.cardTitle}>{content.term}</p>
      <TermBody {...content} linkTabIndex={-1} />
    </div>
  );
}

/**
 * A highlighted technical term. A mouse pointer resting on it shows a short
 * card; keyboard focus shows the same card. Clicking, tapping, or pressing
 * Enter opens the full explanation, which is a bottom sheet on phones, so no
 * part depends on hover.
 */
export function ArticleTerm({
  term,
  definition,
  children,
  label = term,
  preview,
  related,
}: {
  term: string;
  definition: string;
  children?: ReactNode;
  label?: string;
  preview?: ReactNode;
  related?: RelatedPost;
}) {
  const [open, setOpen] = useState(false);
  const [cardAnchor, setCardAnchor] = useState<HTMLElement | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const timer = useRef(0);
  const content = { term, definition, preview, related };

  const schedule = useCallback((show: boolean, delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCardAnchor(show ? trigger.current : null), delay);
  }, []);
  const hideNow = useCallback(() => {
    window.clearTimeout(timer.current);
    setCardAnchor(null);
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (!cardAnchor) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") hideNow();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cardAnchor, hideNow]);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  return (
    <span className={styles.term}>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="dialog"
        aria-label={`${label}: read explanation`}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") schedule(true, HOVER_OPEN_MS);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") schedule(false, HOVER_CLOSE_MS);
        }}
        onFocus={(event) => {
          if (event.currentTarget.matches(":focus-visible")) schedule(true, 0);
        }}
        onBlur={hideNow}
        onClick={() => {
          hideNow();
          setOpen(true);
        }}
      >
        {label}
      </button>
      {cardAnchor && !open
        ? createPortal(
            <TermCard
              anchor={cardAnchor}
              content={content}
              onEnter={() => window.clearTimeout(timer.current)}
              onLeave={() => schedule(false, HOVER_CLOSE_MS)}
            />,
            document.body,
          )
        : null}
      {open &&
        createPortal(
          <TermDialog content={content} onClose={close}>
            {children}
          </TermDialog>,
          document.body,
        )}
    </span>
  );
}

export function ArticleDetails({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className={styles.details}>
      <summary>{summary}</summary>
      <div>{children}</div>
    </details>
  );
}
