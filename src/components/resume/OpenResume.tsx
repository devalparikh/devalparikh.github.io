"use client";

import { useEffect, useRef } from "react";
import { site } from "@/content/site";
import { ExternalIcon } from "@/components/primitives/ExternalIcon";

/** Direct visits have no user gesture, so keep a link for popup blockers. */
export function OpenResume() {
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    window.open(site.resume, "_blank", "noopener,noreferrer");
  }, []);

  return (
    <p className="mt-7 text-sm text-neutral-content">
      <a href={site.resume} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-primary">
        Open resume PDF <ExternalIcon />
      </a>
      <span className="mt-3 block">If a new tab did not open, use the link above.</span>
    </p>
  );
}
