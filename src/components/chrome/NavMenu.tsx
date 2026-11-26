"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { NavItem } from "@/content/nav";
import { playInterfaceSound } from "@/lib/interface-sound";
import { placeMenu } from "@/lib/menu-placement";

interface NavMenuProps {
  items: NavItem[];
  activeHref?: string;
  /** Registers the trigger with the nav's gliding indicator. */
  triggerRef?: (node: HTMLElement | null) => void;
  onHover: (href: string | null) => void;
}

export const NAV_MENU_ID = "nav-overflow";

/** Matches `top: calc(100% + 0.6rem)` on `.nav-menu`, below the trigger's wrapper. */
const MENU_GAP_REM = 0.6;

const px = (value: string) => Number.parseFloat(value) || 0;

/**
 * Keeps the open menu inside the viewport. The gutters come from the menu's
 * own `scroll-margin`, which is where the CSS resolves them against the
 * safe-area insets. Written straight to the element: it has to measure its
 * natural size first, which a React style prop would already have changed.
 */
function positionMenu(menu: HTMLElement, wrapper: HTMLElement) {
  menu.style.removeProperty("width");
  menu.style.removeProperty("max-height");

  const styles = getComputedStyle(menu);
  const box = wrapper.getBoundingClientRect();
  const viewport = window.visualViewport;
  const rem = px(getComputedStyle(document.documentElement).fontSize) || 16;
  const placement = placeMenu({
    trigger: box,
    menuWidth: menu.offsetWidth,
    menuHeight: menu.scrollHeight,
    viewport: { width: viewport?.width ?? window.innerWidth, height: viewport?.height ?? window.innerHeight },
    gutter: {
      top: px(styles.scrollMarginTop),
      right: px(styles.scrollMarginRight),
      bottom: px(styles.scrollMarginBottom),
      left: px(styles.scrollMarginLeft),
    },
    gap: MENU_GAP_REM * rem,
  });

  menu.dataset.side = placement.side;
  menu.dataset.align = placement.align;
  menu.style.left = `${placement.left - box.left}px`;
  menu.style.right = "auto";
  menu.style.width = `${placement.width}px`;
  menu.style.maxHeight = `${placement.maxHeight}px`;
  menu.style.transformOrigin = `${placement.originX}px ${placement.side === "top" ? "100%" : "0"}`;
}

/** Holds the nav items that do not fit on screen. */
export function NavMenu({ items, activeHref, triggerRef, onHover }: NavMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const holdsActive = items.some((item) => item.href === activeHref);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Placed before paint on every open, and again whenever the viewport changes
  // underneath it (rotation, browser chrome, pinch zoom) while it is open.
  useLayoutEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    const wrapper = wrapperRef.current;
    if (!menu || !wrapper) return;

    const place = () => positionMenu(menu, wrapper);
    place();

    const viewport = window.visualViewport;
    window.addEventListener("resize", place);
    viewport?.addEventListener("resize", place);
    return () => {
      window.removeEventListener("resize", place);
      viewport?.removeEventListener("resize", place);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={(node) => {
          buttonRef.current = node;
          triggerRef?.(node);
        }}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={NAV_MENU_ID}
        aria-current={holdsActive ? "page" : undefined}
        onMouseEnter={() => onHover(NAV_MENU_ID)}
        onFocus={() => onHover(NAV_MENU_ID)}
        onBlur={() => onHover(null)}
        onClick={() => {
          setOpen((value) => !value);
          playInterfaceSound("toggle");
        }}
        className="pill-link flex items-center gap-1 py-2 pl-3 pr-2.5"
      >
        More
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={clsx(
            "size-3 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open && "rotate-180",
          )}
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>

      <div
        ref={menuRef}
        id={NAV_MENU_ID}
        role="menu"
        aria-label="More pages"
        data-open={open}
        className="nav-menu"
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={(item.destination ?? item.href) as typeof item.href}
            target={item.newTab ? "_blank" : undefined}
            rel={item.newTab ? "noopener noreferrer" : undefined}
            prefetch={item.newTab ? false : item.prefetch}
            role="menuitem"
            tabIndex={open ? undefined : -1}
            aria-current={activeHref === item.href ? "page" : undefined}
            onClick={() => {
              setOpen(false);
              playInterfaceSound("tap");
            }}
            className="nav-menu-item"
          >
            {item.label}
            {activeHref === item.href && (
              <span aria-hidden="true" className="size-1 shrink-0 rounded-full bg-primary" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
