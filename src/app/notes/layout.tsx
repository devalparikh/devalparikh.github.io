import type { ReactNode } from "react";
import { PageFrame } from "@/components/chrome/PageFrame";
import { NoteMotionProvider } from "@/components/notes/NoteHeading";

export default function NotesLayout({ children }: { children: ReactNode }) {
  // Keep the primary navigation mounted while moving through the vault.
  return <NoteMotionProvider><PageFrame wide>{children}</PageFrame></NoteMotionProvider>;
}
