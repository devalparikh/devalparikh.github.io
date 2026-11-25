"use client";

import { useState, type ReactNode } from "react";
import { sampleResult, type DemoKind, type DemoProvider, type DemoResult } from "@blog/lib/jev-demo";
import snapshot from "@/content/blog/snapshot.json";

/**
 * Static stand-in for deval-blog's `useLiveDemo`.
 *
 * Upstream, the Jev demos ask `/api/jev-demo` for live inference. A static
 * export has no server, so this keeps the hand-authored samples working and
 * points the "Try live inference" panel at the same demo on the live blog.
 * The return shape matches upstream exactly; `scripts/sync-blog.mjs` swaps
 * this module in wherever the vendored demos import the original.
 */
type View = { mode: "sample" | "live" | "cached"; result: DemoResult };

export const LIVE_DEMO_POST = "building-with-jev";

export function liveDemoHref(kind: DemoKind) {
  return `${snapshot.origin}/blog/tech/${LIVE_DEMO_POST}/#demo-${kind}`;
}

export function useLiveDemo(kind: DemoKind, initialOption: string) {
  const [option, setOption] = useState(initialOption);
  const [provider, setProvider] = useState<DemoProvider>("vercel");
  const [view, setView] = useState<View | null>(() => ({ mode: "sample", result: sampleResult(kind, initialOption) }));

  const message: ReactNode = (
    <>
      Live inference needs a server, so it runs on the original post.{" "}
      <a href={liveDemoHref(kind)} target="_blank" rel="noopener noreferrer">
        Try it live on deval-blog ↗
      </a>
    </>
  );

  function choose(value: string) {
    setOption(value);
    setView({ mode: "sample", result: sampleResult(kind, value) });
  }

  function chooseProvider(value: DemoProvider) {
    setProvider(value);
    setView({ mode: "sample", result: sampleResult(kind, option) });
  }

  function sample() {
    setView({ mode: "sample", result: sampleResult(kind, option) });
  }

  return {
    option,
    choose,
    provider,
    chooseProvider,
    view,
    busy: false,
    available: false,
    message,
    sample,
    run: async () => {},
  };
}
