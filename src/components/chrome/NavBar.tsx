"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { isNavItemActive, navItems } from "@/content/nav";
import { site } from "@/content/site";
import { playInterfaceSound } from "@/lib/interface-sound";
import { useGlidingIndicator } from "@/lib/use-gliding-indicator";
import { useOverflowNav } from "@/lib/use-overflow-nav";
import { NavMenu, NAV_MENU_ID } from "./NavMenu";
import { SoundToggle } from "./SoundToggle";
import { ThemeToggle } from "./ThemeToggle";

const LINK_CLASS = "pill-link px-3 py-2";

/**
 * A single horizontal bar at every breakpoint. It sits wherever the page puts
 * it - directly under the hero on the home page, at the top elsewhere - sticks
 * as the page scrolls, and fades its chrome in once content passes beneath it.
 *
 * Items that do not fit collapse into a "More" menu rather than scrolling off
 * the edge, so nothing is ever hidden without an affordance.
 */
export function NavBar() {
  const pathname = usePathname();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const { containerRef, measureRef, visibleCount } = useOverflowNav(navItems.length);
  const visibleItems = navItems.slice(0, visibleCount);
  const overflowItems = navItems.slice(visibleCount);

  const activeHref = navItems.find((item) => isNavItemActive(pathname, item.href))?.href;
  const activeInOverflow = overflowItems.some((item) => item.href === activeHref);
  // When the current page has been collapsed away, the pill rests on the menu.
  const indicatorTarget = hovered ?? (activeInOverflow ? NAV_MENU_ID : activeHref);

  const { trackRef, indicatorRef, registerItem } = useGlidingIndicator(indicatorTarget);

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
              ref={containerRef}
              aria-label="Primary"
              className="relative min-w-0 flex-1"
              onMouseLeave={() => setHovered(null)}
            >
              <div ref={trackRef} className="relative flex items-center gap-0.5">
                <span ref={indicatorRef} aria-hidden="true" className="pill-indicator" />

                {visibleItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    ref={registerItem(item.href)}
                    aria-current={activeHref === item.href ? "page" : undefined}
                    onMouseEnter={() => setHovered(item.href)}
                    onFocus={() => setHovered(item.href)}
                    onBlur={() => setHovered(null)}
                    onClick={() => playInterfaceSound("tap")}
                    className={LINK_CLASS}
                  >
                    {item.label}
                  </Link>
                ))}

                {overflowItems.length > 0 && (
                  <NavMenu
                    items={overflowItems}
                    activeHref={activeHref}
                    triggerRef={registerItem(NAV_MENU_ID)}
                    onHover={setHovered}
                  />
                )}
              </div>

              {/* Off-screen copy of the full bar, used only for measurement. */}
              <div aria-hidden="true" className="nav-measure-clip">
                <div ref={measureRef} className="nav-measure">
                  {navItems.map((item) => (
                    <span key={item.href} className={LINK_CLASS}>
                      {item.label}
                    </span>
                  ))}
                  <span className="pill-link py-2 pl-3 pr-2.5">More&nbsp;&nbsp;</span>
                </div>
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
