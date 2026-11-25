"use client";

import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useDiagramVisibility } from "@blog/components/diagram-lab/useDiagramMotion";
import styles from "./SpeculativeDecodingVisuals.module.css";

type RoundPhase = "guess" | "check" | "decide" | "fix" | "keep";
type TokenState = "draft" | "checking" | "accepted" | "rejected" | "corrected" | "committed";

const ROUND_PHASES: Array<{
  id: RoundPhase;
  label: string;
  description: string;
}> = [
  {
    id: "guess",
    label: "Guess",
    description: "The small model guesses four tokens: The cat sat down.",
  },
  {
    id: "check",
    label: "Check",
    description: "The large model checks all four positions in one pass.",
  },
  {
    id: "decide",
    label: "Decide",
    description: "The first three guesses pass. The fourth guess fails.",
  },
  {
    id: "fix",
    label: "Fix",
    description: "The large model replaces down with nearby.",
  },
  {
    id: "keep",
    label: "Keep",
    description: "The round returns four tokens after one large-model check.",
  },
];

const DRAFT_TOKENS = ["The", "cat", "sat", "down"] as const;
const FINAL_TOKENS = ["The", "cat", "sat", "nearby"] as const;

function phaseIndex(phase: RoundPhase) {
  return ROUND_PHASES.findIndex((item) => item.id === phase);
}

function tokenState(index: number, phase: RoundPhase): TokenState {
  if (phase === "guess") return "draft";
  if (phase === "check") return "checking";
  if (phase === "decide") return index === 3 ? "rejected" : "accepted";
  if (phase === "fix") return index === 3 ? "corrected" : "accepted";
  return index === 3 ? "corrected" : "committed";
}

function SvgToken({
  x,
  y,
  word,
  state,
  order,
}: {
  x: number;
  y: number;
  word: string;
  state: TokenState;
  order: number;
}) {
  return (
    <g
      className={styles.svgToken}
      data-state={state}
      style={{ "--token-order": order } as CSSProperties}
      transform={`translate(${x} ${y})`}
    >
      <rect width="104" height="58" rx="13" />
      <text x="52" y="35" textAnchor="middle">{word}</text>
      <path d="M14 48 H90" pathLength="1" />
    </g>
  );
}

export function TechnicalTerm({
  children,
  definition,
}: {
  children: ReactNode;
  definition: string;
}) {
  const tooltipId = useId();

  return (
    <span className={styles.term} tabIndex={0} aria-describedby={tooltipId} title={definition}>
      <span className={styles.termLabel}>{children}</span>
      <span id={tooltipId} role="tooltip" className={styles.termTooltip}>
        {definition}
      </span>
    </span>
  );
}

function ComparisonSvg({ active }: { active: boolean }) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <svg
      className={styles.comparisonSvg}
      viewBox="0 0 760 430"
      role="img"
      aria-labelledby={`${titleId} ${descriptionId}`}
      data-active={active ? "true" : "false"}
    >
      <title id={titleId}>Normal decoding compared with speculative decoding</title>
      <desc id={descriptionId}>
        Normal decoding uses four serial large-model passes to produce four tokens. Speculative decoding uses a small model to guess four tokens, then checks those positions together in one large-model pass.
      </desc>

      <text className={styles.svgSectionLabel} x="30" y="34">Normal decoding</text>
      <text className={styles.svgSectionNote} x="730" y="34" textAnchor="end">4 large-model passes</text>

      {["The", "cat", "sat", "nearby"].map((word, index) => {
        const x = 30 + index * 181;
        return (
          <g
            key={word}
            className={styles.serialPass}
            style={{ "--pass-order": index } as CSSProperties}
            transform={`translate(${x} 62)`}
          >
            <rect className={styles.modelBox} width="148" height="64" rx="14" />
            <text className={styles.modelName} x="74" y="29" textAnchor="middle">large model</text>
            <text className={styles.modelResult} x="74" y="49" textAnchor="middle">{`writes "${word}"`}</text>
            {index < 3 ? <path className={styles.serialLink} d="M148 32 H181" /> : null}
          </g>
        );
      })}

      <path className={styles.rowRule} d="M30 180 H730" />

      <text className={styles.svgSectionLabel} x="30" y="230">Speculative decoding</text>
      <text className={styles.svgSectionNote} x="730" y="230" textAnchor="end">1 large-model pass</text>

      <g className={styles.draftModel} transform="translate(30 258)">
        <rect className={styles.modelBox} width="132" height="64" rx="14" />
        <text className={styles.modelName} x="66" y="29" textAnchor="middle">small model</text>
        <text className={styles.modelResult} x="66" y="49" textAnchor="middle">guesses ahead</text>
      </g>

      <path className={styles.draftLink} d="M162 290 H194" />

      {DRAFT_TOKENS.map((word, index) => (
        <g
          key={word}
          className={styles.draftGuess}
          style={{ "--pass-order": index } as CSSProperties}
          transform={`translate(${194 + index * 134} 258)`}
        >
          <rect width="112" height="64" rx="14" />
          <text x="56" y="38" textAnchor="middle">{word}</text>
        </g>
      ))}

      <g className={styles.verifyBand}>
        <rect x="194" y="348" width="514" height="52" rx="14" />
        <text x="451" y="380" textAnchor="middle">large model checks all four positions together</text>
        <path className={styles.verifySweep} d="M212 392 V356" />
      </g>
    </svg>
  );
}

export function SerialVsSpeculative() {
  const figureRef = useRef<HTMLElement>(null);
  const active = useDiagramVisibility(figureRef);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <figure
      ref={figureRef}
      className={`not-prose ${styles.figure}`}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <header className={styles.figureHeader}>
        <h3 id={titleId}>Four waits become one check</h3>
        <p id={descriptionId}>
          The small model does extra cheap work so the large model can check several positions together.
        </p>
      </header>
      <div className={styles.svgFrame}>
        <ComparisonSvg active={active} />
      </div>
      <figcaption>
        The small model still guesses one token at a time. The saving comes from using fewer serial passes through the large model.
      </figcaption>
    </figure>
  );
}

function RoundSvg({ phase }: { phase: RoundPhase }) {
  const titleId = useId();
  const descriptionId = useId();
  const currentIndex = phaseIndex(phase);
  const showResult = currentIndex >= phaseIndex("fix");

  return (
    <svg
      className={styles.roundSvg}
      viewBox="0 0 760 410"
      role="img"
      aria-labelledby={`${titleId} ${descriptionId}`}
      data-phase={phase}
    >
      <title id={titleId}>One speculative decoding round</title>
      <desc id={descriptionId}>{ROUND_PHASES[currentIndex].description}</desc>

      <g className={styles.roundModel} transform="translate(30 82)">
        <rect width="132" height="72" rx="16" />
        <text x="66" y="31" textAnchor="middle">small model</text>
        <text x="66" y="53" textAnchor="middle">guesses</text>
      </g>

      <path className={styles.roundFlowLine} d="M162 118 H205" />

      {DRAFT_TOKENS.map((word, index) => (
        <SvgToken
          key={word}
          x={205 + index * 126}
          y={89}
          word={phase === "fix" || phase === "keep" ? FINAL_TOKENS[index] : word}
          state={tokenState(index, phase)}
          order={index}
        />
      ))}

      <g className={styles.targetCheck} data-active={currentIndex >= 1 ? "true" : "false"}>
        <rect x="205" y="190" width="482" height="78" rx="18" />
        <text x="446" y="220" textAnchor="middle">large model</text>
        <text x="446" y="244" textAnchor="middle">
          {phase === "check" ? "checks all four positions now" : "keeps the accepted prefix"}
        </text>
        <path className={styles.checkSweep} d="M228 256 V202" />
      </g>

      <path
        className={styles.resultFlow}
        d="M446 268 V314"
        data-visible={showResult ? "true" : "false"}
      />

      <g className={styles.finalSentence} data-visible={showResult ? "true" : "false"}>
        <text x="30" y="355">Round output</text>
        <text x="162" y="355">The cat sat nearby</text>
        <text x="162" y="381">4 tokens from 1 large-model check</text>
      </g>
    </svg>
  );
}

export function SpeculativeRoundExplorer() {
  const [phase, setPhase] = useState<RoundPhase>("guess");
  const titleId = useId();
  const descriptionId = useId();
  const index = phaseIndex(phase);
  const current = ROUND_PHASES[index];

  return (
    <figure
      className={`not-prose ${styles.figure} ${styles.roundFigure}`}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <header className={styles.figureHeader}>
        <h3 id={titleId}>The first bad guess gets replaced</h3>
        <p id={descriptionId}>Tap each verb. The sentence changes as the round moves.</p>
      </header>

      <nav className={styles.phaseControls} aria-label="Speculative decoding round">
        {ROUND_PHASES.map((item, itemIndex) => (
          <button
            key={item.id}
            type="button"
            aria-current={phase === item.id ? "step" : undefined}
            data-complete={itemIndex < index ? "true" : "false"}
            onClick={() => setPhase(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className={styles.svgFrame}>
        <RoundSvg phase={phase} />
      </div>

      <div className={styles.roundReadout}>
        <p role="status" aria-live="polite" aria-atomic="true">{current.description}</p>
        <div className={styles.roundButtons}>
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setPhase(ROUND_PHASES[index - 1].id)}
          >
            Back
          </button>
          <button
            type="button"
            disabled={index === ROUND_PHASES.length - 1}
            onClick={() => setPhase(ROUND_PHASES[index + 1].id)}
          >
            Next
          </button>
        </div>
      </div>

      <figcaption>
        Checking stops at the first failed guess. Any later guesses would depend on text the large model did not accept, so the system throws them away.
      </figcaption>
    </figure>
  );
}

type Segment = {
  token: string;
  start: number;
  width: number;
  tone: "strong" | "medium" | "light" | "missing";
};

const TARGET_SEGMENTS: Segment[] = [
  { token: "cat 50%", start: 0, width: 50, tone: "strong" },
  { token: "dog 30%", start: 50, width: 30, tone: "medium" },
  { token: "owl 20%", start: 80, width: 20, tone: "light" },
];

const KEPT_SEGMENTS: Segment[] = [
  { token: "cat 50%", start: 0, width: 50, tone: "strong" },
  { token: "10%", start: 50, width: 10, tone: "medium" },
  { token: "owl 20%", start: 80, width: 20, tone: "light" },
];

function ProbabilitySegments({ segments, y }: { segments: Segment[]; y: number }) {
  return (
    <>
      {segments.map((segment) => {
        const x = 174 + segment.start * 5.2;
        const width = segment.width * 5.2;
        return (
          <g key={`${segment.token}-${y}`} className={styles.probabilitySegment} data-tone={segment.tone}>
            <rect x={x} y={y} width={width} height="48" />
            {width >= 50 ? (
              <text x={x + width / 2} y={y + 30} textAnchor="middle">{segment.token}</text>
            ) : null}
          </g>
        );
      })}
    </>
  );
}

export function ExactnessVisual() {
  const figureRef = useRef<HTMLElement>(null);
  const active = useDiagramVisibility(figureRef);
  const titleId = useId();
  const descriptionId = useId();
  const svgTitleId = useId();
  const svgDescriptionId = useId();

  return (
    <figure
      ref={figureRef}
      className={`not-prose ${styles.figure} ${styles.exactFigure}`}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <header className={styles.figureHeader}>
        <h3 id={titleId}>The check leaves a hole. Repair fills it.</h3>
        <p id={descriptionId}>
          The small model offered too few dog points. The repair supplies the missing 20.
        </p>
      </header>

      <div className={styles.svgFrame}>
        <svg
          className={styles.exactSvg}
          viewBox="0 0 760 410"
          role="img"
          aria-labelledby={`${svgTitleId} ${svgDescriptionId}`}
          data-active={active ? "true" : "false"}
        >
          <title id={svgTitleId}>The check leaves a gap and the repair fills it</title>
          <desc id={svgDescriptionId}>
            The large model gives cat 50 percent, dog 30 percent, and owl 20 percent. The check keeps 50 percent cat, 10 percent dog, and 20 percent owl from the small model. That leaves a 20 percent gap. The repair fills it with dog, which restores the large model&apos;s original chances.
          </desc>

          <text className={styles.barLabel} x="30" y="66">Target</text>
          <ProbabilitySegments segments={TARGET_SEGMENTS} y={34} />

          <text className={styles.barLabel} x="30" y="164">Kept</text>
          <ProbabilitySegments segments={KEPT_SEGMENTS} y={132} />
          <rect className={styles.probabilityGap} x="486" y="132" width="104" height="48" />

          <text className={styles.barLabel} x="30" y="262">Repair</text>
          <g className={styles.repairSegment}>
            <rect x="486" y="230" width="104" height="48" />
            <text x="538" y="260" textAnchor="middle">dog 20%</text>
          </g>

          <path className={styles.additionLine} d="M174 306 H694" />
          <text className={styles.barLabel} x="30" y="370">Final</text>
          <g className={styles.finalProbability}>
            <ProbabilitySegments segments={TARGET_SEGMENTS} y={338} />
          </g>
        </svg>
      </div>

      <figcaption>
        The real system uses decimal probabilities. The 100 points make the same math easier to see.
      </figcaption>
    </figure>
  );
}

export function ShortProof() {
  return (
    <details className={`not-prose ${styles.proof}`}>
      <summary>Show the short proof</summary>
      <div>
        <p>
          {"Call the large model's probability"} <code>p</code> {"and the small model's probability"} <code>q</code>.
          A guessed token is kept with chance <code>min(1, p/q)</code>.
        </p>
        <pre><code>{`kept probability = q * min(1, p/q)\n                 = min(q, p)`}</code></pre>
        <p>The repair samples only from the part the small model missed:</p>
        <pre><code>{`missing probability = max(0, p - q)`}</code></pre>
        <p>Put the kept part and the missing part together, and the result is <code>p</code>.</p>
      </div>
    </details>
  );
}

const GLOSSARY = [
  ["Token", "A small piece of text. It can be a whole word, part of a word, or punctuation."],
  ["Draft model", "The small, fast model that guesses a few tokens ahead."],
  ["Target model", "The large model whose output probabilities must be preserved."],
  ["Prefix", "The accepted text from the start of the proposed sequence."],
  ["Latency", "How long you wait for the model to produce output."],
  ["Throughput", "How much total output a system produces across all requests."],
] as const;

export function SpeculativeGlossary() {
  return (
    <dl className={`not-prose ${styles.glossary}`}>
      {GLOSSARY.map(([term, definition]) => (
        <div key={term}>
          <dt>{term}</dt>
          <dd>{definition}</dd>
        </div>
      ))}
    </dl>
  );
}
