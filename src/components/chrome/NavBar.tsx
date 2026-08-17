"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { isNavItemActive, navItems } from "@/content/nav";
import { site } from "@/content/site";
import { playInterfaceSound } from "@/lib/interface-sound";
import { useGlidingIndicator } from "@/lib/use-gliding-indicator";
import { SoundToggle } from "./SoundToggle";
import { ThemeToggle } from "./ThemeToggle";

/**
 * A single horizontal bar at every breakpoint. It sits wherever the page puts
 * it — directly under the hero on the home page, at the top elsewhere — sticks
 * as the page scrolls, and fades its chrome in once content passes beneath it.
 */
export function NavBar() {
  const pathname = usePathname();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const activeHref = navItems.find((item) => isNavItemActive(pathname, item.href))?.href;
  const { trackRef, indicatorRef, registerItem, scrollItemIntoView } =
    useGlidingIndicator(hovered ?? activeHref);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Keep the current page visible when the bar overflows on small screens.
  useEffect(() => {
    if (activeHref) scrollItemIntoView(activeHref);
  }, [activeHref, scrollItemIntoView]);

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />

      <div className="nav-shell" data-stuck={stuck}>
        <div className="nav-bar">
          <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-5 sm:px-6">
            {/* The name is already the hero on the home page, so the mark only
                appears once the bar has taken over the top of the screen. */}
            <Link
              href="/"
              onClick={() => playInterfaceSound("tap")}
              tabIndex={stuck ? undefined : -1}
              aria-hidden={!stuck}
              className={clsx(
                "hidden shrink-0 font-display text-base tracking-tight sm:block",
                "transition-[opacity,transform,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-primary",
                stuck ? "opacity-100" : "pointer-events-none -translate-x-1 opacity-0",
              )}
            >
              {site.shortName}
            </Link>

            <nav
              aria-label="Primary"
              className="-mx-1 min-w-0 flex-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onMouseLeave={() => setHovered(null)}
            >
              <div ref={trackRef} className="relative flex min-w-max items-center gap-0.5">
                <span ref={indicatorRef} aria-hidden="true" className="pill-indicator" />

                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    ref={registerItem(item.href)}
                    aria-current={activeHref === item.href ? "page" : undefined}
                    onMouseEnter={() => setHovered(item.href)}
                    onFocus={() => setHovered(item.href)}
                    onBlur={() => setHovered(null)}
                    onClick={() => playInterfaceSound("tap")}
                    className="pill-link px-3 py-2"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="flex shrink-0 items-center gap-0.5 border-l border-[var(--rule)] pl-2">
              <SoundToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
