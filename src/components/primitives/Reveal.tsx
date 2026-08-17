"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import clsx from "clsx";

const STEP_MS = 70;

interface RevealProps {
  children: ReactNode;
  /** Position in the stagger — each step delays the entrance by 70ms. */
  index?: number;
  /** Wait for the element to scroll into view instead of animating on load. */
  onScroll?: boolean;
  as?: ElementType;
  className?: string;
}

/**
 * The site-wide entrance animation. Content above the fold animates on first
 * paint straight from the server-rendered attribute — no JS required — while
 * `onScroll` sections wait for an IntersectionObserver.
 */
export function Reveal({
  children,
  index = 0,
  onScroll = false,
  as: Tag = "div",
  className,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(!onScroll);

  useEffect(() => {
    if (!onScroll || revealed) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRevealed(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [onScroll, revealed]);

  return (
    <Tag
      ref={ref}
      className={clsx("reveal", className)}
      data-reveal={revealed ? "in" : "pending"}
      style={{ "--reveal-delay": `${index * STEP_MS}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
