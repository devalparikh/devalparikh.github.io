import type { SVGProps } from "react";

export function NoteIcon({ kind = "file", ...props }: SVGProps<SVGSVGElement> & { kind?: "file" | "folder" | "chevron" | "graph" | "list" | "search" }) {
  const paths = {
    file: "M9 3H5v14h10V9L9 3Zm0 0v6h6M7 12h6M7 14h4",
    folder: "M2 5h6l2 2h8v10H2V5Z",
    chevron: "m8 5 5 5-5 5",
    graph: "m5 5 10 2-5 9L5 5Zm0 0 5 11M5 3v4M3 5h4m8 0v4m-2-2h4m-7 7v4m-2-2h4",
    list: "M6 5h11M6 10h11M6 15h11M2 5h1M2 10h1M2 15h1",
    search: "m13 13 4 4M15 9A6 6 0 1 1 3 9a6 6 0 0 1 12 0Z",
  };
  return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[kind]} /></svg>;
}
