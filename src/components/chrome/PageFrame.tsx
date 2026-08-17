import type { ReactNode } from "react";
import { NavBar } from "./NavBar";
import { Footer } from "./Footer";

interface PageFrameProps {
  children: ReactNode;
  /**
   * Rendered above the nav bar. The home page uses it so the bar starts below
   * the hero and slides up into place as the page scrolls; every other page
   * omits it and the bar sits at the top from the start.
   */
  hero?: ReactNode;
}

export function PageFrame({ children, hero }: PageFrameProps) {
  return (
    <>
      {hero}
      <NavBar />
      <main id="main" className="mx-auto max-w-3xl px-5 pt-10 sm:px-6 sm:pt-14">
        {children}
      </main>
      <Footer />
    </>
  );
}
