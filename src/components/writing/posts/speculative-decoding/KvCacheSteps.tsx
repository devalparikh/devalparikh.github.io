"use client";

import { memo } from "react";
import { PROMPT, SCENARIOS, verify } from "./model";
import { buildSteps, phases } from "./scene";
import { SceneFigure, type SceneProps } from "./SceneFigure";
import { Box, Mark, Txt, tone } from "./svg";

const scenario = SCENARIOS[0];
const round = verify(scenario);
const q = (token: string) => `“${token}”`;
const fix = round.kept[round.kept.length - 1];

const STEPS = buildSteps([
  {
    id: "pass1",
    label: "First pass",
    span: 3.4,
    text: `Normal decoding runs prefill over ${q(PROMPT.join(" "))} and writes three entries in every layer. Speculative decoding runs the same pass with the four guesses added, so it writes seven.`,
  },
  {
    id: "check",
    label: "Check",
    span: 3.2,
    text: `Normal decoding needs a second pass to write the entries for ${q("on")}. On the speculative side, the serving code compares predictions with guesses: ${q("on")} and ${q("the")} match, and ${q("mat")} does not.`,
  },
  {
    id: "cut",
    label: "Truncate",
    span: 3.2,
    text: `Normal decoding's third pass writes the entries for ${q("the")}. The speculative side cuts the entries for ${q("mat")} and ${q(".")}. The entries before them never saw those two tokens, so they stay valid.`,
  },
  {
    id: "same",
    label: "Same cache",
    span: 3.4,
    text: `Both caches now hold ${q("The cat sat on the")}, and both texts end in ${q(fix)}. Its entries are written by the next pass, the one that reads it. Normal decoding used three big-model passes; speculative decoding used one.`,
  },
]);

interface Layout {
  col: (index: number) => number;
  w: number;
  lanes: [number, number];
  labelX: number;
  layerLabelX: number;
  counterX: number;
  layerNames: string[];
  small: boolean;
}

const WIDE: Layout = {
  col: (index) => 124 + index * 56,
  w: 48,
  lanes: [40, 168],
  labelX: 14,
  layerLabelX: 116,
  counterX: 646,
  layerNames: ["layer 1", "layer 2", "last layer"],
  small: false,
};

const NARROW: Layout = {
  col: (index) => 52 + index * 43,
  w: 37,
  lanes: [36, 168],
  labelX: 8,
  layerLabelX: 46,
  counterX: 352,
  layerNames: ["L1", "L2", "last"],
  small: true,
};

type Entry = { token: string; kind: "text" | "draft" | "pending"; written: number; opacity: number; mark?: "match" | "miss" | "skip" };

const Scene = memo(function KvScene({ t, compact }: SceneProps) {
  const L = compact ? NARROW : WIDE;
  const p = phases(STEPS, t);
  const pass1 = p.done("pass1", 0.05, 0.75);
  const pass2 = p.done("check", 0.05, 0.7);
  const pass3 = p.done("cut", 0.05, 0.7);
  const cut = p.done("cut", 0.2, 0.7);
  const marks = p.done("check", 0.2, 0.7);
  const same = p.done("same", 0, 0.4);

  // Normal decoding: one entry per pass; the newest token waits for the next pass.
  const normal: Entry[] = [
    ...PROMPT.map((token) => ({ token, kind: "text" as const, written: pass1, opacity: 1 })),
    { token: "on", kind: pass2 > 0 ? "text" : "pending", written: pass2, opacity: pass1 >= 1 ? 1 : 0 },
    { token: "the", kind: pass3 > 0 ? "text" : "pending", written: pass3, opacity: pass2 >= 1 ? 1 : 0 },
    { token: fix, kind: "pending", written: 0, opacity: pass3 >= 1 ? 1 : 0 },
  ];
  const normalPasses = 1 + (p.reached("check") ? 1 : 0) + (p.reached("cut") ? 1 : 0);

  // Speculative decoding: the whole draft is written in the same pass.
  const spec: Entry[] = [
    ...PROMPT.map((token) => ({ token, kind: "text" as const, written: pass1, opacity: 1 })),
    ...scenario.draft.map((token, index) => ({
      token,
      kind: "draft" as const,
      written: pass1,
      opacity: index >= round.accepted ? 1 - cut : 1,
      mark: (index < round.accepted ? "match" : index === round.accepted ? "miss" : "skip") as Entry["mark"],
    })),
  ];
  const fixEntry: Entry = { token: fix, kind: "pending", written: 0, opacity: same };

  const lane = (entries: Entry[], y: number, title: string, passes: number, extra?: { entry: Entry; index: number }) => (
    <g>
      <Txt x={L.labelX} y={y - 16} size={compact ? 10.5 : 11} anchor="start" bold>
        {title}
      </Txt>
      <Txt x={L.counterX} y={y - 16} size={compact ? 10 : 10.5} anchor="end" muted>
        {`big-model passes: ${passes}`}
      </Txt>
      {L.layerNames.map((name, layer) => (
        <Txt key={name} x={L.layerLabelX} y={y + 34 + layer * 12} size={compact ? 8.5 : 9} anchor="end" muted>
          {name}
        </Txt>
      ))}
      {[...entries, ...(extra ? [extra.entry] : [])].map((entry, i) => {
        const index = extra && i === entries.length ? extra.index : i;
        const x = L.col(index);
        const pending = entry.kind === "pending";
        return (
          <g key={`${entry.token}-${i}`} opacity={entry.opacity}>
            <Box
              x={x}
              y={y}
              w={L.w}
              h={22}
              tone={entry.kind === "draft" ? "draft" : pending ? "target" : "ink"}
              look={pending ? "line" : "soft"}
              dashed={pending}
              label={entry.token}
              labelSize={compact ? 11 : 12}
              strike={entry.mark === "miss" && cut > 0}
            />
            {[0, 1, 2].map((layer) => (
              <g key={layer} className={tone("target")}>
                <rect x={x} y={y + 29 + layer * 12} width={L.w} height={9} rx={2} className={pending ? "sdv-box-ghost" : "sdv-fill-hidden"} />
                {!pending ? (
                  <rect
                    x={x}
                    y={y + 29 + layer * 12}
                    width={L.w}
                    height={9}
                    rx={2}
                    className="sdv-fill-tone"
                    opacity={Math.max(0, Math.min(1, entry.written * 3 - layer)) * 0.85}
                  />
                ) : null}
              </g>
            ))}
            {entry.mark ? (
              <g opacity={marks}>
                <Mark x={x + L.w / 2} y={y - 6} kind={entry.mark} size={4.5} />
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );

  return (
    <>
      {lane(normal, L.lanes[0], "normal decoding", normalPasses)}
      {lane(spec, L.lanes[1], "speculative decoding", 1, { entry: fixEntry, index: round.accepted + PROMPT.length })}
      <Txt x={L.col(round.accepted + PROMPT.length) + L.w / 2} y={L.lanes[1] + 74} size={compact ? 9 : 9.5} muted opacity={same}>
        {compact ? "K/V next pass" : "K/V on the next pass"}
      </Txt>
      <Txt x={L.col(5) + L.w / 2} y={L.lanes[0] + 74} size={compact ? 9 : 9.5} muted opacity={p.reached("cut") ? pass3 : 0}>
        {compact ? "K/V next pass" : "K/V on the next pass"}
      </Txt>
    </>
  );
});

/**
 * The KV cache for the example, on one clock: normal decoding writes one
 * entry per pass; speculative decoding writes the whole draft in one pass,
 * then cuts it back after the check. Each entry exists once per layer.
 */
export function KvCacheSteps() {
  return (
    <SceneFigure
      steps={STEPS}
      stillStep="same"
      durationMs={13000}
      scene={Scene}
      wide={{ w: 660, h: 260 }}
      narrow={{ w: 360, h: 260 }}
      label={`The KV cache for ${PROMPT.join(" ")} plus the draft on the mat period. Normal decoding writes one token's entries per pass and takes three passes. Speculative decoding writes all seven tokens' entries in one pass, then cuts mat and the period. Both caches end with The cat sat on the, and floor waits for the next pass.`}
      caption={
        <>
          Each column is one token&apos;s entry. The three bars under it are its K and V in three of the layers; a
          real model has dozens. A dashed token has been chosen, but its entries come from the next pass.
        </>
      }
    />
  );
}
