import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

interface SmartLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Picks the right element for a destination: client-side `Link` for in-site
 * routes, a plain anchor for `mailto:` and the like, and a new tab for
 * anything off-site.
 */
export function SmartLink({ href, children, className, onClick }: SmartLinkProps) {
  if (href.startsWith("/")) {
    return (
      <Link href={href as Route} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }

  const opensNewTab = href.startsWith("http");

  return (
    <a
      href={href}
      className={className}
      onClick={onClick}
      target={opensNewTab ? "_blank" : undefined}
      rel={opensNewTab ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}
