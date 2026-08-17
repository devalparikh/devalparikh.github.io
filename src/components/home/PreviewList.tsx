"use client";

import Link from "next/link";
import type { Route } from "next";
import { Reveal } from "@/components/primitives/Reveal";
import type { Collection } from "@/content/types";
import { playInterfaceSound } from "@/lib/interface-sound";
import { hasDetail, isExternal } from "@/components/collection/entry-helpers";

interface PreviewListProps {
  collection: Collection;
  href: Route;
  limit?: number;
  index?: number;
}

/**
 * A short excerpt of a collection for the home page. Rows that have a detail
 * view deep-link into the collection page's drawer via the URL fragment;
 * everything else links straight to the source.
 */
export function PreviewList({ collection, href, limit = 3, index = 0 }: PreviewListProps) {
  const entries = collection.entries.slice(0, limit);

  return (
    <Reveal onScroll index={index} as="section" className="mt-16">
      <div className="mb-4 flex items-baseline justify-between gap-6">
        <h2 className="display text-xl sm:text-2xl">{collection.title}</h2>
        <Link
          href={href}
          onClick={() => playInterfaceSound("tap")}
          className="shrink-0 text-xs text-neutral-content transition-colors duration-150 hover:text-primary"
        >
          All {collection.entries.length} <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="row-list">
        {entries.map((entry) => {
          const deepLink = hasDetail(entry);
          const target = deepLink ? `${href}#${entry.id}` : entry.href;
          if (!target) return null;

          const external = !deepLink && isExternal(target);
          const body = (
            <>
              <span className="row-caret" aria-hidden="true">
                ›
              </span>
              <span className="min-w-0">
                <span className="row-title">{entry.title}</span>
                {entry.badge && <span className="row-badge">{entry.badge}</span>}
                <span className="row-arrow" aria-hidden="true">
                  {external ? "↗" : "›"}
                </span>
                {(entry.subtitle ?? entry.summary) && (
                  <span className="row-subtitle">{entry.subtitle ?? entry.summary}</span>
                )}
              </span>
              <span className="row-meta">{entry.meta}</span>
            </>
          );

          return external ? (
            <a
              key={entry.id}
              href={target}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playInterfaceSound("tap")}
              className="row"
            >
              {body}
            </a>
          ) : (
            <Link
              key={entry.id}
              href={target as Route}
              onClick={() => playInterfaceSound("tap")}
              className="row"
            >
              {body}
            </Link>
          );
        })}
      </div>
    </Reveal>
  );
}
