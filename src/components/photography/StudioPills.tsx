"use client";

import { playInterfaceSound } from "@/lib/interface-sound";
import { requestStudioView, type StudioView } from "@/lib/studio-view";

const PILLS: { label: string; href: string; view?: StudioView }[] = [
  { label: "Preview", href: "#preview", view: "preview" },
  { label: "Grid", href: "#grid", view: "grid" },
  { label: "Gear", href: "#gear" },
];

/**
 * Outlined capsules that fill with ink on hover. The fragment does the
 * scrolling; the event switches the Preview window's view, which a fragment
 * alone would not do when it is already the current one.
 */
export function StudioPills() {
  return (
    <ul className="studio-pills">
      {PILLS.map((pill) => (
        <li key={pill.label}>
          <a
            href={pill.href}
            className="studio-pill"
            onClick={() => {
              playInterfaceSound("tap");
              if (pill.view) requestStudioView(pill.view);
            }}
          >
            <span>{pill.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
