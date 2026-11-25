import type { DataFlow } from "./data-flow-types";
import { jevStep, type Trace } from "./trace";

// Synthetic native TypeSafe payloads, with application steps shown between calls.
// These are teaching examples, not recorded requests from the linked creators.

// ============================================================
// Needle: github.com/Shubhamsaboo/awesome-llm-apps, advanced_llm_apps/needle
// server/search.mjs (backend) + extension/content.js (page collection, highlighting)
// ============================================================

// Sentence text, keyed s0, s1, ... within each block (Intl.Segmenter would produce
// these at runtime). Block IDs are b0, b1, ... in collection order.
const b0Sentences: Record<string, string> = {
  s0: "Cancellation costs $20.",
  s1: "Medical cancellations receive a full refund.",
};
const b1Sentences: Record<string, string> = {
  s0: "Update your email in Account settings.",
  s1: "A confirmation link is sent to the new address.",
};
const b0Text = `${b0Sentences.s0} ${b0Sentences.s1}`;
const b1Text = `${b1Sentences.s0} ${b1Sentences.s1}`;

// Where each sentence sits inside its own block. Jev never receives these; the
// extension keeps them locally to resolve a chosen sentence back to an exact range.
function sentenceOffsets(blockText: string, sentences: Record<string, string>) {
  const offsets: Record<string, { start: number; end: number }> = {};
  let cursor = 0;
  for (const [id, text] of Object.entries(sentences)) {
    const start = blockText.indexOf(text, cursor);
    offsets[id] = { start, end: start + text.length };
    cursor = start + text.length;
  }
  return offsets;
}
const b0Offsets = sentenceOffsets(b0Text, b0Sentences);
const b1Offsets = sentenceOffsets(b1Text, b1Sentences);

const needleInput = {
  search: "Can I get my money back?",
  blocks: [
    { id: "b0", tag: "p", text: b0Text, sentences: b0Sentences, offsets: b0Offsets },
    { id: "b1", tag: "p", text: b1Text, sentences: b1Sentences, offsets: b1Offsets },
  ],
};

const needleState = {
  search: needleInput.search,
  passages: [
    { id: "b0", text: b0Text },
    { id: "b1", text: b1Text },
  ],
};

const needleQuestions = {
  b0: { type: "noul", instructions: "Evaluate ONLY passage b0. Is this passage directly useful to someone looking for the meaning expressed by `search`?" },
  focus_b0: { type: "choice", instructions: "For passage b0, select the single sentence that most directly answers or supports `search`.", criteria: b0Sentences },
  b1: { type: "noul", instructions: "Evaluate ONLY passage b1. Is this passage directly useful to someone looking for the meaning expressed by `search`?" },
  focus_b1: { type: "choice", instructions: "For passage b1, select the single sentence that most directly answers or supports `search`.", criteria: b1Sentences },
};

const needleAnswers = {
  b0: { type: "noul", noul: 0.96 },
  focus_b0: { type: "choice", choice: "s1", probabilities: { s0: 0.08, s1: 0.92 }, confidence: 0.6 },
  b1: { type: "noul", noul: 0.02 },
  focus_b1: { type: "choice", choice: "s1", probabilities: { s0: 0.4, s1: 0.6 }, confidence: 0.03 },
};

const NEEDLE_THRESHOLD = 0.58;
const needleFocusB0 = needleAnswers.focus_b0.choice;
const needleOutput = {
  threshold: NEEDLE_THRESHOLD,
  kept: [{ id: "b0", noul: needleAnswers.b0.noul, focus: needleFocusB0 }],
  discarded: [{ id: "b1", noul: needleAnswers.b1.noul, ignoredFocus: needleAnswers.focus_b1.choice }],
  highlights: [{
    id: "b0",
    sentence: needleFocusB0,
    start: b0Offsets[needleFocusB0].start,
    end: b0Offsets[needleFocusB0].end,
    text: b0Sentences[needleFocusB0],
  }],
  nextJevRequest: null,
};

export const NEEDLE_TRACE: Trace = {
  steps: [
    {
      actor: "system", by: "Extension",
      title: "Collect the page's text",
      say: "The extension gathers the readable text into blocks, so each one can be judged on its own.",
      show: 'b0  "Cancellation costs $20. Medical…"\nb1  "Update your email in Account…"',
      why: "It reads paragraphs, list items, code blocks, quotes, headings, table cells, and captions. A block under 12 characters or over 2,200 is skipped, and collection stops at 160 blocks or 60,000 characters total, so one long page cannot turn into an unbounded search.",
      payloads: [{ label: "collected blocks (stays in your code)", value: needleInput.blocks.map(b => ({ id: b.id, text: b.text })) }],
    },
    {
      actor: "system", by: "Extension",
      title: "Split blocks into sentences",
      say: "Each block is split into sentences, so a match can point at one sentence.",
      show: 'b0: s0 "Cancellation costs $20." (0-23)\n    s1 "Medical cancellations…" (24-68)',
      why: "The split uses Intl.Segmenter, a browser API for locating sentence boundaries. The extension saves each sentence's start and end position inside its own block; those offsets never leave the browser.",
      payloads: [{ label: "sentence offsets (stays in your code)", value: { b0: b0Offsets, b1: b1Offsets } }],
    },
    {
      actor: "code",
      title: "Build one search request",
      say: "Every block goes into one request. Each block gets a relevance question, and blocks with several sentences also get a question about their best sentence.",
      show: "state: { search, passages: [b0, b1] }\nb0, focus_b0, b1, focus_b1",
      why: "A block with only one sentence gets no focus question; it defaults to s0. Asking every block's relevance and every eligible block's sentence choice together needs one round trip no matter how many blocks the page produced.",
    },
    jevStep({
      title: "Judge every block and pick its sentence",
      say: "Jev scores each block against the search and picks each block's best sentence at the same time, before anyone knows which blocks will matter.",
      show: 'b0        0.96\nfocus_b0  s1 (0.92)\nb1        0.02\nfocus_b1  s1 (0.60)',
      why: "The sentence guess runs even for a block that ends up irrelevant, so no second request is needed if a low-scoring block turns out to matter.",
      state: needleState, questions: needleQuestions, answers: needleAnswers,
    }),
    {
      actor: "code",
      title: "Keep the strong matches",
      say: "Code keeps blocks scoring at least 0.58. Sentence picks for the other blocks are discarded.",
      show: `keep     b0 (0.96, at least ${NEEDLE_THRESHOLD})\ndiscard  b1 (0.02) and its sentence pick`,
      why: "0.58 is this article's illustrative policy, not a published Needle value. Blocks that clear it are sorted highest first before anything is shown.",
      payloads: [{ label: "output", value: needleOutput }],
    },
    {
      actor: "system", by: "Browser",
      title: "Highlight the matching sentence",
      say: "The browser highlights the original sentence inside each kept block.",
      show: 'focus_b0 s1 → 24-68\n"Medical cancellations receive a full refund."',
      why: "Highlighting uses the CSS Custom Highlight API against the offsets saved in the earlier splitting step, so it needs no DOM changes and no further Jev call.",
      payloads: [{ label: "highlights", value: needleOutput.highlights }],
    },
  ],
  outcome: "One request covers the whole page. A new search or a changed page runs everything again.",
  note: "Invented page text and probabilities. Block and sentence limits, the ID scheme, and the request shape follow Shubham Saboo's awesome-llm-apps needle example (extension/content.js, server/search.mjs). Needle sends this to Vercel AI Gateway's /v1/evaluate endpoint with model typesafe-ai/jev, whose yes/no type is named boolean and returns probability; this article shows the native TypeSafe noul form.",
};

export const PASSAGE_FLOWS = {
  needle: {
    input: needleInput,
    state: needleState,
    questions: needleQuestions,
    answers: needleAnswers,
    output: needleOutput,
  },
} satisfies Record<"needle", DataFlow>;
