import type { ReactNode } from "react";
import { Inter_Tight } from "next/font/google";
import clsx from "clsx";
import { Footer } from "@/components/chrome/Footer";
import { NavBar } from "@/components/chrome/NavBar";
import "@/app/photography/studio.css";

/**
 * Stand-in for Helvetica where the system has none (Android, Linux). Apple
 * devices resolve the real face first in `--font-grotesk`, so this file is
 * never requested there - hence no preload.
 */
const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-inter-tight",
});

/**
 * The photography page's frame. It takes the place of `PageFrame` because the
 * page is set apart from the career pages: a Helvetica grotesk throughout, a
 * full-bleed hero, a wider column, and the nav bar's floating variant.
 */
export function StudioFrame({ hero, children }: { hero: ReactNode; children: ReactNode }) {
  return (
    <div className={clsx("studio", interTight.variable)}>
      <NavBar floating />
      {hero}
      <main id="main" className="studio-main">
        {children}
      </main>
      <Footer />
    </div>
  );
}
