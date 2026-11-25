import { Inter_Tight } from "next/font/google";

/**
 * Stand-in for Helvetica where the system has none (Android, Linux). Apple
 * devices resolve the real face first in `--font-grotesk`, so this file is
 * never requested there - hence no preload. Studio Deval and the writing
 * covers share it.
 */
export const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-inter-tight",
});
