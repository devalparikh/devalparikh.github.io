"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { NavItem } from "@/content/nav";
import { playInterfaceSound } from "@/lib/interface-sound";

interface NavMenuProps {
  items: NavItem[];
  activeHref?: string;
  /** Registers the trigger with the nav's gliding indicator. */
  triggerRef?: (node: HTMLElement | null) => void;
  onHover: (href: string | null) => void;
}

export const NAV_MENU_ID = "nav-overflow";

/** Holds the nav items that do not fit on screen. */
export function NavMenu({ items, activeHref, triggerRef, onHover }: NavMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
        id={NAV_MENU_ID}
        role="menu"
        aria-label="More pages"
        data-open={open}
        className="nav-menu"
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
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
              <span aria-hidden="true" className="size-1 rounded-full bg-primary" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
