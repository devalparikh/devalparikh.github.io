"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/primitives/Reveal";
import { ALL_FILTER, filterEntries, type Collection, type Entry } from "@/content/types";
import { EntryDrawer } from "./EntryDrawer";
import { EntryRow } from "./EntryRow";
import { FilterTabs } from "./FilterTabs";

/**
 * Renders a collection as a filterable row list with a detail drawer.
 *
 * Filtering is local state so it is instant. The open entry is mirrored into
 * the URL fragment instead, which makes detail views linkable and gives the
 * browser's back button something to close.
 */
export function CollectionView({ collection }: { collection: Collection }) {
  const [filterId, setFilterId] = useState(ALL_FILTER.id);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const entryById = useCallback(
    (id: string) => collection.entries.find((entry) => entry.id === id) ?? null,
    [collection.entries],
  );

  useEffect(() => {
    const syncFromHash = () => {
      const id = window.location.hash.slice(1);
      setSelectedId(id && entryById(id) ? id : null);
    };

    syncFromHash();
    window.addEventListener("popstate", syncFromHash);
    window.addEventListener("hashchange", syncFromHash);
    return () => {
      window.removeEventListener("popstate", syncFromHash);
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, [entryById]);

  function open(entry: Entry, trigger: HTMLElement) {
    triggerRef.current = trigger;
    setSelectedId(entry.id);
    window.history.pushState(null, "", `#${entry.id}`);
  }

  const close = useCallback(() => {
    setSelectedId(null);
    window.history.pushState(null, "", window.location.pathname);
    triggerRef.current?.focus({ preventScroll: true });
    triggerRef.current = null;
  }, []);

  const visible = filterEntries(collection.entries, filterId);
  const selected = selectedId ? entryById(selectedId) : null;

  return (
    <>
      {collection.filters.length > 1 && (
        <Reveal index={2} className="mt-8">
          <FilterTabs
            filters={collection.filters}
            active={filterId}
            onSelect={setFilterId}
            label={`Filter ${collection.title.toLowerCase()}`}
          />
        </Reveal>
      )}

      <Reveal index={3} className="mt-5">
        <p className="mb-2 text-right font-mono text-[0.65rem] tabular-nums text-neutral-content" aria-live="polite">
          {visible.length} {visible.length === 1 ? "entry" : "entries"}
        </p>

        {visible.length === 0 ? (
          <p className="border-y border-[var(--rule)] py-16 text-center text-sm text-neutral-content">
            Nothing here yet.
          </p>
        ) : (
          <div className="row-list">
            {visible.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                selected={selected?.id === entry.id}
                onOpen={open}
              />
            ))}
          </div>
        )}
      </Reveal>

      {selected && <EntryDrawer entry={selected} onClose={close} />}
    </>
  );
}
