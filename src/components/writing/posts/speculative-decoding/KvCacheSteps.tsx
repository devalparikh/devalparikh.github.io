import { PROMPT, SCENARIOS, verify } from "./model";
import "./figures.css";

type CellState = "kept" | "new" | "draft" | "cut" | "next";

interface Row {
  title: string;
  note: string;
  cells: { token: string; state: CellState }[];
  after?: string;
}

const scenario = SCENARIOS[0];
const round = verify(scenario);
const prompt = PROMPT.map((token) => ({ token, state: "kept" as CellState }));

const ROWS: Row[] = [
  {
    title: "Prefill “The cat sat”",
    note: "one pass, 3 entries",
    cells: PROMPT.map((token) => ({ token, state: "new" })),
  },
  {
    title: "Normal decode step",
    note: "one pass, 1 entry",
    cells: [...prompt, { token: round.kept[0], state: "new" }],
  },
  {
    title: "Speculative pass",
    note: `one pass, ${scenario.draft.length} entries`,
    cells: [...prompt, ...scenario.draft.map((token) => ({ token, state: "draft" as CellState }))],
  },
  {
    title: "After the check",
    note: "truncate, then append",
    cells: [
      ...prompt,
      ...scenario.draft.map((token, index) => ({ token, state: (index < round.accepted ? "kept" : "cut") as CellState })),
      { token: round.kept[round.kept.length - 1], state: "next" },
    ],
    after: "K/V written by the next pass",
  },
];

/**
 * The KV cache through one round of the example. Each cell is one token's
 * entry, which exists once per layer (the thin lines). Entries are only ever
 * appended or cut from the end; nothing already written changes.
 */
export function KvCacheSteps() {
  return (
    <figure className="not-prose sdv-figure" aria-describedby="sdv-kv-caption">
      <div className="sdv-stage">
        {ROWS.map((row) => (
          <div key={row.title} className="sdv-kv-row">
            <p className="sdv-kv-label">
              {row.title}
              <span>{row.note}</span>
            </p>
            <div className="sdv-kv-cells">
              {row.cells.map((cell, index) => (
                <span key={index} className="sdv-kv-cell" data-state={cell.state}>
                  {cell.token}
                  <span className="sr-only">
                    {cell.state === "new" || cell.state === "draft" ? " (written in this pass)" : cell.state === "cut" ? " (cut)" : cell.state === "next" ? " (appended, not cached yet)" : ""}
                  </span>
                </span>
              ))}
              {row.after && <span className="sdv-kv-note">{row.after}</span>}
            </div>
          </div>
        ))}
        <div className="sdv-legend" aria-hidden="true">
          <span><i data-kv="new" /> written by this pass</span>
          <span><i data-kv="draft" /> written for a guess</span>
          <span><i data-kv="cut" /> cut</span>
        </div>
      </div>
      <figcaption id="sdv-kv-caption">
        The KV cache for the example. Each cell is one token&apos;s entry; the thin lines stand for its copy in every
        layer. Rows 2 and 3 are alternatives: a normal step adds one entry, a speculative pass adds the whole draft.
        In the first round, rows 1 and 3 can be a single pass over <i>The cat sat on the mat .</i>
      </figcaption>
    </figure>
  );
}
