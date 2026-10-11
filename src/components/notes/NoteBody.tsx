"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { playInterfaceSound } from "@/lib/interface-sound";

export function NoteBody({ html }: { html: string }) {
  const router = useRouter();
  // The imported HTML is sanitized at build time. Internal wiki links should
  // use the same persistent Notes layout as explorer and breadcrumb links.
  return <article className="note-prose" dangerouslySetInnerHTML={{ __html: html }} onClick={(event) => {
    if (event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
    if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || !url.pathname.startsWith("/notes/") || url.pathname === location.pathname) return;
    event.preventDefault();
    playInterfaceSound("tap");
    router.push(`${url.pathname}${url.search}${url.hash}` as Route);
  }} />;
}
