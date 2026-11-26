"use client";

import type { ReactNode } from "react";
import { ArticleTerm, type RelatedPost } from "@blog/components/mdx/ArticleTerm";
import { Box, tone, Txt } from "./svg";
import "./figures.css";

/**
 * Hover-preview terms for the speculative decoding post, built on the same
 * ArticleTerm card the ViT and Transformer posts use: a short definition, an
 * optional small drawing, and at most one related post.
 */

const BASICS = "/writing/transformer-basics-prefill-and-decode/";
const VIT = "https://deval-blog.vercel.app/blog/tech/vision-transformers-astra";

const W = 240;
const H = 84;

function Art({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="sdv-svg sdv-term-art" role="img" aria-label={label}>
      {children}
    </svg>
  );
}

const TOKENS = ["The", "cat", "sat"];

function PrefillPreview() {
  return (
    <Art label="Three tokens read in one pass">
      <Box x={8} y={10} w={224} h={64} r={6} tone="target" look="lit" />
      {TOKENS.map((token, i) => (
        <Box key={token} x={24 + i * 70} y={28} w={58} h={28} tone="ink" label={token} labelSize={12} />
      ))}
    </Art>
  );
}

function DecodePreview() {
  return (
    <Art label="One new token per pass">
      {TOKENS.map((token, i) => (
        <Box key={token} x={10 + i * 56} y={28} w={48} h={28} tone="ink" look="line" label={token} labelSize={11} />
      ))}
      <Box x={176} y={20} w={56} h={44} r={6} tone="target" look="lit" />
      <Box x={180} y={28} w={48} h={28} tone="draft" label="on" labelSize={12} />
    </Art>
  );
}

function CachePreview() {
  return (
    <Art label="One entry per token, in every layer">
      {TOKENS.map((token, i) => (
        <g key={token}>
          <Txt x={44 + i * 76} y={14} size={11}>{token}</Txt>
          {[0, 1, 2].map((layer) => (
            <g key={layer} className={tone("target")}>
              <rect x={12 + i * 76} y={26 + layer * 18} width={64} height={13} rx={2} className="sdv-fill-tone" opacity={0.85} />
            </g>
          ))}
        </g>
      ))}
    </Art>
  );
}

function MaskPreview() {
  return (
    <Art label="Each token sees itself and earlier tokens">
      {TOKENS.map((row, r) => (
        <g key={row}>
          <Txt x={86} y={20 + r * 22} size={11} anchor="end" muted>{row}</Txt>
          {TOKENS.map((_, c) => (
            <g key={c} className={tone("target")}>
              <rect x={94 + c * 22} y={10 + r * 22} width={19} height={19} rx={3} className={c <= r ? (c === r ? "sdv-fill-tone" : "sdv-fill-soft") : "sdv-fill-hidden"} />
            </g>
          ))}
        </g>
      ))}
    </Art>
  );
}

interface Entry {
  term: string;
  definition: string;
  related?: RelatedPost;
  preview?: () => ReactNode;
}

const TERMS = {
  draft: {
    term: "Draft model",
    definition: "A much smaller model that guesses the next few tokens. It uses the same tokenizer as the big model, because guesses are checked token by token.",
  },
  target: {
    term: "Target model",
    definition: "The big LLM whose output you want. Speculative decoding runs it unchanged: same weights, same prompt.",
  },
  prefill: {
    term: "Prefill",
    definition: "Reading a whole input in one forward pass. All the tokens go through each layer together, and each one writes its own K and V.",
    related: { href: `${BASICS}#prefill-process-the-prompt`, title: "Transformer basics: prefill" },
    preview: PrefillPreview,
  },
  decode: {
    term: "Decode",
    definition: "Writing one new token per forward pass. Each pass reads the token chosen last time and attends over the KV cache.",
    related: { href: `${BASICS}#decode-process-the-selected-token`, title: "Transformer basics: decode" },
    preview: DecodePreview,
  },
  cache: {
    term: "KV cache",
    definition: "The keys and values each attention layer saves for every token it has processed. Later tokens read them instead of recomputing them.",
    related: { href: `${BASICS}#whose-cache-is-it`, title: "Transformer basics: whose cache is it?" },
    preview: CachePreview,
  },
  mask: {
    term: "Causal mask",
    definition: "Stops each position from attending to later positions. A token sees only itself and the tokens before it.",
    preview: MaskPreview,
  },
  projection: {
    term: "Output projection",
    definition: "The last step of the model. It turns a token's final vector into a score for every token in the vocabulary.",
    related: { href: `${BASICS}#hidden-states-build-from-one-layer-to-the-next`, title: "Transformer basics: hidden states" },
  },
  teacher: {
    term: "Teacher forcing",
    definition: "Training on a real sentence by feeding it in whole and scoring the next-token prediction at every position at once.",
  },
  bidirectional: {
    term: "Bidirectional model",
    definition: "A model whose tokens see later tokens as well as earlier ones, like BERT or a Vision Transformer's encoder. It can revise an earlier word, but it can't reuse a KV cache this way.",
    related: { href: VIT, title: "How Vision Transformers are trained and used" },
  },
  bandwidth: {
    term: "Memory-bandwidth bound",
    definition: "When a step's time is set by moving data from memory rather than by the math. A one-token decode step is like this.",
  },
  acceptance: {
    term: "Acceptance rate",
    definition: "The share of draft guesses the big model agrees with. It depends on how close the two models are and on the text.",
  },
} satisfies Record<string, Entry>;

export type TermName = keyof typeof TERMS;

/** A highlighted term with its hover card. */
export function SdTerm({ name, children }: { name: TermName; children?: string }) {
  const entry: Entry = TERMS[name];
  const Preview = entry.preview;
  return (
    <ArticleTerm
      term={entry.term}
      label={children ?? entry.term}
      definition={entry.definition}
      related={entry.related}
      preview={Preview ? <Preview /> : undefined}
    />
  );
}
