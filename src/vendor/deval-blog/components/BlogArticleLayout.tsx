"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@blog/hooks/usePrefersReducedMotion";
import { ContentsLinks, type HeadingItem } from "./blog/ContentsLinks";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function BlogArticleLayout({ children }: { children: ReactNode }) {
  const proseRef = useRef<HTMLDivElement>(null);
  const desktopNavRef = useRef<HTMLElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const initialHashRef = useRef({ hash: "", restored: true });
  const mobileContentsId = useId();
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const root = proseRef.current;
    if (!root) return;

    let hash = window.location.hash.slice(1);
    try { hash = decodeURIComponent(hash); } catch { /* Invalid fragments are ignored. */ }
    initialHashRef.current = { hash, restored: !hash };
    let nodes: HTMLHeadingElement[] = [];
    let headingsSignature = "";
    let frame = 0;
    let headingUpdateQueued = false;
    let disposed = false;
    const updateActiveHeading = () => {
      frame = 0;
      // Keep the preceding heading active throughout long sections, in both
      // scroll directions, even when no heading is inside the viewport.
      const offset = Number.parseFloat(window.getComputedStyle(nodes[0] ?? root).scrollMarginTop) || 120;
      let active = nodes[0];
      for (const node of nodes) {
        if (node.getBoundingClientRect().top > offset + 1) break;
        active = node;
      }
      if (root.getBoundingClientRect().bottom <= window.innerHeight && nodes.length) {
        active = nodes[nodes.length - 1];
      }
      setActiveId(active?.id ?? "");
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveHeading);
    };
    const refreshHeadings = () => {
      nodes = Array.from(root.querySelectorAll<HTMLHeadingElement>("h2, h3"))
        .filter((node) => !node.closest(".not-prose"));
      const usedIds = new Set(Array.from(root.querySelectorAll("[id]"), (node) => node.id));
      const items = nodes.map((node) => {
        if (!node.id) {
          const base = slugify(node.textContent ?? "section") || "section";
          let id = base;
          let suffix = 2;
          while (usedIds.has(id)) id = `${base}-${suffix++}`;
          node.id = id;
          usedIds.add(id);
        }
        return {
          id: node.id,
          text: node.textContent ?? "Section",
          level: Number(node.tagName.slice(1)),
        };
      });
      const signature = JSON.stringify(items);
      if (signature !== headingsSignature) {
        headingsSignature = signature;
        setHeadings(items);
      }
      updateActiveHeading();
    };
    const scheduleHeadings = () => {
      if (headingUpdateQueued) return;
      headingUpdateQueued = true;
      // Background tabs can suspend animation frames. Contents must still be
      // available immediately after hydration or a streamed MDX update.
      queueMicrotask(() => {
        headingUpdateQueued = false;
        if (!disposed) refreshHeadings();
      });
    };
    scheduleHeadings();
    const mutations = new window.MutationObserver((records) => {
      if (records.some((record) => {
        const target = record.target instanceof HTMLElement ? record.target : record.target.parentElement;
        return !target?.closest(".not-prose");
      })) scheduleHeadings();
    });
    mutations.observe(root, { childList: true, subtree: true, characterData: true });
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleUpdate);
    observer?.observe(root);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
      observer?.disconnect();
      mutations.disconnect();
    };
  }, [children]);

  useEffect(() => {
    const request = initialHashRef.current;
    if (request.restored || !headings.some((heading) => heading.id === request.hash)) return;
    let cancelled = false;
    // Restore after the contents have committed: the mobile bar adds height
    // above the article and must exist before measuring the target position.
    queueMicrotask(() => {
      if (cancelled || initialHashRef.current !== request || request.restored) return;
      const target = document.getElementById(request.hash);
      if (!target || !proseRef.current?.contains(target)) return;
      request.restored = true;
      target.scrollIntoView({ block: "start", behavior: "instant" });
      setActiveId(request.hash);
    });
    return () => { cancelled = true; };
  }, [headings]);

  useEffect(() => {
    const nav = desktopNavRef.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!nav || !active || nav.clientHeight === 0) return;
    const navBounds = nav.getBoundingClientRect();
    const activeBounds = active.getBoundingClientRect();
    if (activeBounds.top < navBounds.top || activeBounds.bottom > navBounds.bottom) {
      nav.scrollTo({
        top: nav.scrollTop + activeBounds.top - navBounds.top - (nav.clientHeight - activeBounds.height) / 2,
        behavior: reducedMotion ? "instant" : "smooth",
      });
    }
  }, [activeId, reducedMotion]);

  const currentHeading = headings.find((item) => item.id === activeId) ?? headings[0];

  return (
    <div className="blog-shell">
      {headings.length > 0 ? (
        <>
          <aside className="blog-toc-rail">
            <nav ref={desktopNavRef} className="blog-toc blog-toc-desktop" aria-label="Table of contents">
              <ContentsLinks headings={headings} activeId={activeId} />
            </nav>
          </aside>
          <div
            className="blog-toc blog-toc-mobile"
            onKeyDown={(event) => {
              if (event.key === "Escape" && mobileOpen) {
                setMobileOpen(false);
                mobileToggleRef.current?.focus();
              }
            }}
          >
            <button
              ref={mobileToggleRef}
              type="button"
              aria-label={mobileOpen ? "Close table of contents" : `Table of contents: ${currentHeading?.text ?? "Contents"}`}
              aria-expanded={mobileOpen}
              aria-controls={mobileContentsId}
              onClick={() => setMobileOpen((open) => !open)}
            >
              <span hidden={mobileOpen}>{currentHeading?.text}</span>
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            <nav id={mobileContentsId} hidden={!mobileOpen} aria-label="Table of contents">
              <ContentsLinks
                headings={headings}
                activeId={activeId}
                onNavigate={() => {
                  setMobileOpen(false);
                  mobileToggleRef.current?.focus({ preventScroll: true });
                }}
              />
            </nav>
          </div>
        </>
      ) : null}
      <div className="blog-reading-column">
        <div ref={proseRef} data-blog-prose className="prose blog-prose max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
}
