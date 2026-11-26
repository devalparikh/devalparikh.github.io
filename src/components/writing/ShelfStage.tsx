"use client";

import { useEffect, useState, type CSSProperties, type RefObject } from "react";

/**
 * The inside of the bookcase as real geometry.
 *
 * The case front is the screen plane (z = 0) and the case is --depth deep, so
 * the back panel sits at z = -depth. One perspective, set on the case, is
 * shared by everything inside it: the back panel, both side walls, the
 * ceiling, every shelf (top, lip and underside) and every book and object,
 * which stand at their own depth on those shelves. Because all of it is
 * projected from the same eye, a book's foot meets the shelf where the shelf
 * actually is at that depth, upper shelves show their undersides and lower
 * ones their tops, and the side walls recede the way a cabinet's do.
 *
 * Rows and the positions of what stands on them come from the flex layout,
 * so they are measured after it lays out.
 * Until then (and without JS) the flat planks in bookshelf.css stand in.
 */

export interface ShelfItem {
  top: number;
  /** Horizontal centre in the list's coordinates. */
  cx: number;
  /** "book", or the object's kind - picks the footprint in bookshelf.css. */
  kind: string;
  slug?: string;
  /** The slot's own size variables (--thick). */
  vars: Record<string, string>;
}

export interface ShelfRows {
  /** Top of each row, in the list's own coordinates. */
  tops: number[];
  rowHeight: number;
  width: number;
  height: number;
  items: ShelfItem[];
}

const SIZE_VARS = ["--thick"];

function slotVars(slot: HTMLElement) {
  const vars: Record<string, string> = {};
  for (const name of SIZE_VARS) {
    const value = slot.style.getPropertyValue(name);
    if (value) vars[name] = value;
  }
  return vars;
}

export function useShelfRows(listRef: RefObject<HTMLUListElement | null>, layoutKey: string): ShelfRows | null {
  const [rows, setRows] = useState<ShelfRows | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      // Hidden slots (phones drop two objects) take no place in the rows.
      const slots = Array.from(list.querySelectorAll<HTMLElement>(":scope > .shelf-slot")).filter((slot) => slot.offsetParent !== null);
      if (!slots.length) {
        setRows(null);
        return;
      }
      const tops = [...new Set(slots.map((slot) => slot.offsetTop))].sort((a, b) => a - b);
      const items = slots.map((slot) => ({
        top: slot.offsetTop,
        cx: slot.offsetLeft + slot.offsetWidth / 2,
        kind: slot.dataset.kind ?? "book",
        slug: slot.dataset.slug,
        vars: slotVars(slot),
      }));
      const next: ShelfRows = { tops, rowHeight: slots[0].offsetHeight, width: list.clientWidth, height: list.clientHeight, items };
      const signature = (rows: ShelfRows) => JSON.stringify([rows.width, rows.height, rows.rowHeight, rows.tops, rows.items]);
      setRows((current) => (current && signature(current) === signature(next) ? current : next));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    schedule();
    const observer = new ResizeObserver(schedule);
    observer.observe(list);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [listRef, layoutKey]);

  return rows;
}

export function ShelfStage({ rows, active }: { rows: ShelfRows; active: string | null }) {
  return (
    <li className="shelf-stage" aria-hidden="true">
      <span className="stage-back">
        {rows.tops.map((top, index) => (
          // The bay between one shelf and the next, as lit on the back panel.
          <span key={top} className="stage-bay" data-first={index === 0} style={{ top, height: rows.rowHeight } as CSSProperties} />
        ))}
      </span>
      <span className="stage-wall stage-wall-left" />
      <span className="stage-wall stage-wall-right" />
      <span className="stage-ceiling">
        <span className="stage-strip" />
      </span>
      {rows.tops.map((top, index) => {
        const bottom = top + rows.rowHeight;
        const last = index === rows.tops.length - 1;
        return (
          <span key={top} className="stage-shelf" style={{ "--shelf-y": `${bottom}px` } as CSSProperties}>
            <span className="stage-shelf-top">
              {/* Contact shadows are painted into the shelf's own surface
                  rather than laid on it as planes of their own: separate
                  planes meeting a book's foot get mis-sorted and draw over
                  the cover. Here they simply are the shelf. */}
              {rows.items
                .filter((item) => item.top === top)
                .map((item) => (
                  <span
                    key={item.slug ?? item.kind}
                    className="stage-foot"
                    data-kind={item.kind}
                    data-active={item.slug !== undefined && item.slug === active}
                    style={{ ...item.vars, left: item.cx } as CSSProperties}
                  />
                ))}
            </span>
            <span className="stage-shelf-lip" />
            {!last && (
              <span className="stage-shelf-under">
                <span className="stage-strip" />
              </span>
            )}
          </span>
        );
      })}
    </li>
  );
}
