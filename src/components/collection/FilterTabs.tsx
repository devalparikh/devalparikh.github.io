"use client";

import { useState } from "react";
import { playInterfaceSound } from "@/lib/interface-sound";
import { useGlidingIndicator } from "@/lib/use-gliding-indicator";
import type { Filter } from "@/content/types";

interface FilterTabsProps {
  filters: Filter[];
  active: string;
  onSelect: (id: string) => void;
  label: string;
}

/**
 * Filtering is pure client state - nothing navigates, so switching tabs is
 * instant.
 */
export function FilterTabs({ filters, active, onSelect, label }: FilterTabsProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const { trackRef, indicatorRef, registerItem } = useGlidingIndicator(hovered ?? active);

  return (
    <div
      role="tablist"
      aria-label={label}
      onMouseLeave={() => setHovered(null)}
      className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div ref={trackRef} className="relative flex min-w-max items-center gap-0.5">
        <span ref={indicatorRef} aria-hidden="true" className="pill-indicator" />

        {filters.map((filter) => (
          <button
            key={filter.id}
            ref={registerItem(filter.id)}
            type="button"
            role="tab"
            aria-selected={active === filter.id}
            onMouseEnter={() => setHovered(filter.id)}
            onFocus={() => setHovered(filter.id)}
            onBlur={() => setHovered(null)}
            onClick={() => {
              if (filter.id === active) return;
              onSelect(filter.id);
              playInterfaceSound("tap");
            }}
            className="pill-link px-3 py-1.5"
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
