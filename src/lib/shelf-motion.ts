"use client";

/**
 * The bookshelf's motion gate, read through useSyncExternalStore like the
 * theme and sound preferences.
 */

interface NetworkInformationLike extends EventTarget {
  saveData?: boolean;
}

const MOTION_QUERIES = ["(prefers-reduced-motion: reduce)", "(prefers-reduced-data: reduce)"];

function connection(): NetworkInformationLike | undefined {
  return (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
}

/** Hover loops play only when the visitor allows motion and is not saving data. */
export function subscribeToPreviewMotion(onChange: () => void) {
  const queries = MOTION_QUERIES.map((query) => window.matchMedia(query));
  queries.forEach((query) => query.addEventListener("change", onChange));
  connection()?.addEventListener("change", onChange);
  return () => {
    queries.forEach((query) => query.removeEventListener("change", onChange));
    connection()?.removeEventListener("change", onChange);
  };
}

export function getPreviewMotionSnapshot(): boolean {
  if (MOTION_QUERIES.some((query) => window.matchMedia(query).matches)) return false;
  return connection()?.saveData !== true;
}

/** No motion until the client has checked - the server never animates. */
export const getPreviewMotionServerSnapshot = () => false;
