import type { Route } from "next";

export interface NavItem {
  href: Route;
  label: string;
}

export const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
  { href: "/writing", label: "Writing" },
  { href: "/photography", label: "Photography" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

export function isNavItemActive(pathname: string, href: string) {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (href === "/") return path === "/";
  return path === href || path.startsWith(`${href}/`);
}
