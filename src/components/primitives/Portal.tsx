"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

const noopSubscribe = () => () => {};

/**
 * Renders overlays at the document root so they escape the page's stacking
 * contexts — the sticky nav bar would otherwise paint over them.
 *
 * The store returns `false` on the server and `true` on the client, which
 * defers the portal until `document` exists without reaching for an effect.
 */
export function Portal({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  if (!mounted) return null;
  return createPortal(children, document.body);
}
