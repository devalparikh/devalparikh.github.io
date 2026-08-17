"use client";

import { useEffect, useRef } from "react";
import { ExternalIcon } from "@/components/primitives/ExternalIcon";
import { linkKindIcons } from "@/components/primitives/icons";
import { Portal } from "@/components/primitives/Portal";
import type { Entry } from "@/content/types";
import { EntryMark } from "./EntryMark";
import { EntryMedia } from "./EntryMedia";
import { getPreview } from "@/lib/previews";
import { groupTags } from "@/lib/tags";
import { isExternal } from "./entry-helpers";

interface EntryDrawerProps {
  entry: Entry;
  onClose: () => void;
}

/** Detail view for a row: a drawer over the page, full screen on phones. */
export function EntryDrawer({ entry, onClose }: EntryDrawerProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      // Keep focus inside the drawer while it is open.
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  // An entry's own screenshot wins; otherwise fall back to the linked site's
  // share image, captured at build time.
  const preview = entry.image ? null : getPreview(entry.id);
  const media = entry.image ?? preview?.src;

  return (
    <Portal>
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />

      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-heading"
        className="drawer"
      >
        <div className="px-6 pb-16 pt-5 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="-ml-1 inline-flex items-center gap-1.5 rounded px-1 py-1 text-xs text-neutral-content transition-colors duration-150 hover:text-primary"
          >
            <span aria-hidden="true">←</span> Close
          </button>

          <header className="mt-7">
            {entry.mark && (
              <EntryMark mark={entry.mark} label={entry.title} className="mb-3 size-8 rounded-md" />
            )}
            {entry.meta && <p className="kicker">{entry.meta}</p>}
            <h2
              id="drawer-heading"
              ref={headingRef}
              tabIndex={-1}
              className="display mt-2 text-2xl outline-none sm:text-3xl"
            >
              {entry.title}
            </h2>
            {entry.subtitle && <p className="kicker panel-role">{entry.subtitle}</p>}
          </header>

          {media && (
            <div className="mt-6">
              <EntryMedia
                src={media}
                alt={`${entry.title} preview`}
                width={preview?.width}
                height={preview?.height}
              />
            </div>
          )}

          {entry.highlights?.length ? (
            <ul className="mt-7 space-y-3">
              {entry.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="grid grid-cols-[0.6rem_minmax(0,1fr)] gap-3 text-sm leading-relaxed text-neutral-content"
                >
                  <span aria-hidden="true" className="mt-2 size-1 rounded-full bg-primary" />
                  {highlight}
                </li>
              ))}
            </ul>
          ) : null}

          {entry.sections?.map((section) => (
            <section key={section.heading} className="mt-8">
              <h3 className="panel-section-heading">
                {section.heading}
              </h3>
              {section.body && (
                <p className="mt-2.5 text-sm leading-relaxed text-neutral-content">
                  {section.body}
                </p>
              )}
              {section.bullets?.length ? (
                <ul className="mt-2.5 space-y-2">
                  {section.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="grid grid-cols-[0.6rem_minmax(0,1fr)] gap-3 text-sm leading-relaxed text-neutral-content"
                    >
                      <span aria-hidden="true" className="mt-2 size-1 rounded-full bg-primary" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          {entry.tags?.length ? (
            <section className="mt-8">
              <h3 className="panel-section-heading">
                Stack
              </h3>
              <div className="mt-3 space-y-1.5">
                {groupTags(entry.tags).map((group) => (
                  <ul key={group.tier} className="flex flex-wrap gap-1.5">
                    {group.tags.map((tag) => (
                      <li key={tag} className="panel-tag">
                        {tag}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </section>
          ) : null}

          {entry.links?.length ? (
            <nav className="mt-9 flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--rule)] pt-5">
              {entry.links.map((link) => {
                const Icon = link.kind ? linkKindIcons[link.kind] : undefined;

                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target={isExternal(link.href) ? "_blank" : undefined}
                    rel={isExternal(link.href) ? "noopener noreferrer" : undefined}
                    className="group inline-flex items-center gap-1.5 text-sm text-base-content transition-colors duration-150 hover:text-primary"
                  >
                    {Icon && <Icon className="size-[15px] text-neutral-content transition-colors duration-150 group-hover:text-primary" />}
                    <span className="underline decoration-[color-mix(in_oklab,currentColor_28%,transparent)] underline-offset-4 transition-[text-decoration-color] duration-150 group-hover:decoration-current">
                      {link.label}
                    </span>
                    {/* The kind icon already marks the destination; the arrow is
                        only needed when there is no icon. */}
                    {!Icon && isExternal(link.href) && <ExternalIcon />}
                  </a>
                );
              })}
            </nav>
          ) : null}
        </div>
      </div>
    </Portal>
  );
}
