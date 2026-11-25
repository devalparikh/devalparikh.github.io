import type { ProjectId } from "./project-demos";
import { ZILLOW_ARGUMENTS, ZILLOW_COUNTS, ZILLOW_PHRASES, ZILLOW_QUERY, ZILLOW_ROUTING, ZILLOW_TOOL_RESULT, ZILLOW_WORKLOAD } from "./zillow-model";

import type { DataFlow } from "./data-flow-types";
export type { DataFlow } from "./data-flow-types";
import { CLIPBOARD_FLOW } from "./clipboard-flow";

import { PASSAGE_FLOWS } from "./passage-flows";
import { DECISION_FLOWS } from "./decision-flows";
import { BROWSER_FLOW } from "./browser-flow";
import { GRAPH_FLOW } from "./graph-flow";
import { jevStep, type Trace } from "./trace";

// FindSFSymbols (github.com/tornikegomareli/FindSFSymbols): retrieval shortlists 48 of 3,832
// symbols with an on-device NLEmbedding word-embedding scan; only the Jev step is optional and
// needs an API key. Icon keywords and categories below are invented catalog stand-ins.
const SYMBOLS_QUERY = "things you can wear";
const SYMBOLS_ICONS = {
  s0: { name: "tshirt", keywords: ["shirt", "clothing", "wear", "apparel"], categories: ["objects & tools"] },
  s1: { name: "shoeprints", keywords: ["shoe", "footprint", "walking", "feet"], categories: ["objects & tools"] },
  s2: { name: "cloud rain", keywords: ["rain", "weather", "cloud", "precipitation"], categories: ["weather"] },
};
const SYMBOLS_STATE = { query: SYMBOLS_QUERY, icons: SYMBOLS_ICONS };
const SYMBOLS_QUESTIONS = Object.fromEntries(Object.keys(SYMBOLS_ICONS).map(key => [key, {
  type: "noul",
  instructions: `A person searches an icon library with the text in \`query\`. Is the icon described at \`icons.${key}\` a good result for that search?`,
  criteria: { true: "The icon shows the thing, action, or idea that the search text describes.", false: "The icon shows something else, or it only shares a word with the search text." },
}]));
const SYMBOLS_ANSWERS = { s0: { type: "noul", noul: 0.97 }, s1: { type: "noul", noul: 0.91 }, s2: { type: "noul", noul: 0.03 } };


// Hand-authored native TypeSafe examples, not recorded creator traces.
export const DATA_FLOWS: Record<ProjectId, DataFlow> = {
  ...PASSAGE_FLOWS,
  ...DECISION_FLOWS,
  symbols: {
    input: {
      query: SYMBOLS_QUERY,
      index: "3,832 SF Symbols (bundled catalog)",
      retrieval: "On-device NLEmbedding.wordEmbedding (English), brute-force scan, limit 48",
      displayThreshold: 0.4,
      jevRankThreshold: 0.5,
    },
    state: SYMBOLS_STATE,
    questions: SYMBOLS_QUESTIONS,
    answers: SYMBOLS_ANSWERS,
    output: {
      ranked: [{ id: "s0", name: "tshirt", relevance: 0.97 }, { id: "s1", name: "shoeprints", relevance: 0.91 }],
      droppedBelowThreshold: [{ id: "s2", name: "cloud rain", relevance: 0.03 }],
      nextJevCall: null,
    },
  },
  zillow: {
    input: { query: ZILLOW_QUERY, phrases: ZILLOW_PHRASES },
    state: ZILLOW_ROUTING.state,
    questions: ZILLOW_ROUTING.questions,
    answers: ZILLOW_ROUTING.answers,
    output: { toolCalls: ZILLOW_ARGUMENTS.calls, forJev: ZILLOW_ARGUMENTS.forJev, toolResult: ZILLOW_TOOL_RESULT },
  },
  clipboard: CLIPBOARD_FLOW,
  browser: BROWSER_FLOW,
  graph: GRAPH_FLOW,
};

export const SYMBOLS_TRACE: Trace = {
  steps: [
    {
      actor: "code",
      title: "Wait for a pause in typing",
      say: "Each keystroke cancels the search in progress and waits briefly, so work is spent only on the latest query.",
      show: `query: "${SYMBOLS_QUERY}"`,
      why: "Both the local scan below and the optional Jev step are cancelled and restarted on each keystroke, and the search runs on a short delay after typing stops rather than on every letter.",
    },
    {
      actor: "model", by: "NLEmbedding · not Jev",
      title: "Shortlist icons on the device",
      say: "Word embeddings compare the search with every icon's name and keywords. This runs locally and keeps the 48 closest icons.",
      show: "3,832 symbols compared\n48 kept (limit is fixed in code)",
      why: "This uses Apple's NaturalLanguage framework, NLEmbedding.wordEmbedding for English, in a brute-force scan across the whole catalog. Because it runs entirely on device, it works with no API key configured; the next step, not this one, is what an API key unlocks.",
    },
    {
      actor: "code",
      title: "Show the shortlist right away",
      say: "The closest local matches appear immediately. Without a Jev key, this is the final result.",
      show: "24 of 48 shown (score ≥ 0.4)",
      why: "This first ranking comes only from the embedding scan; it can put an icon that merely shares a word with the search ahead of a better one. Three of the 48 kept icons carry through to the next step for illustration.",
    },
    jevStep({
      title: "Judge each shortlisted icon",
      say: "One request asks, separately for each icon, whether it is a good result for this search. An icon that only shares a word with the query should score low.",
      show: "s0  tshirt      0.97\ns1  shoeprints  0.91\ns2  cloud rain  0.03",
      why: "Each of the three icons gets its own independent question naming that icon's position in the shortlist, s0 first, s1 second, and so on, since the question key itself never reaches the model.",
      state: SYMBOLS_STATE, questions: SYMBOLS_QUESTIONS, answers: SYMBOLS_ANSWERS,
    }),
    {
      actor: "code",
      title: "Re-rank by Jev's scores",
      say: "Jev's probability replaces the embedding score. Icons below 0.5 disappear and the rest are re-sorted.",
      show: "kept: tshirt (0.97), shoeprints (0.91)\ndropped: cloud rain (0.03), below 0.5",
      why: "Jev's score for an icon replaces its embedding score outright rather than blending with it, and the list is re-sorted and re-filtered, this time at 0.5 instead of 0.4. Nothing here is cached, so typing the same search again reruns both the scan and the judgment.",
    },
  ],
  repeat: "Typing again starts over from step 1.",
  outcome: "The final list is ordered by Jev, but only from the 48 icons the local search found. An icon the shortlist missed cannot come back.",
  note: "Catalog size (3,832), the shortlist limit (48), the display and rank thresholds (0.4 and 0.5), and the on-device embedding retrieval follow FindSFSymbols. Icon keywords and categories are invented catalog stand-ins.",
};

const count = (n: number) => n.toLocaleString("en-US");
export const ZILLOW_TRACE: Trace = {
  steps: [
    {
      actor: "model", by: "Span extractor · not Jev",
      title: "Split the query into requirements",
      say: "An extractor marks the words behind each requirement. Nothing is interpreted yet; later steps work from the person's own wording.",
      show: ZILLOW_PHRASES.map(p => `${p.id.padEnd(9)} "${p.text}"`).join("\n"),
      why: "Code checks that each marked span really appears in the query. Keeping whole phrases matters: \"not close to a freeway\" loses its meaning if \"not\" is split off.",
      payloads: [{ label: "phrases (stays in your code)", value: ZILLOW_PHRASES }],
    },
    jevStep({
      title: "Route each requirement to a tool or to Jev",
      say: "One request asks, for every requirement, which available tool can check it exactly. Anything no tool can check is marked custom and left for Jev to judge per listing.",
      show: "bedrooms   bedrooms (listing field)\nbudget     price (listing field)\narea       area (geo tool)\nfreeway    road_distance (geo tool)\nmodern     custom (Jev judges)\nrenovated  custom (Jev judges)",
      why: "Jev sees only the phrases and a description of the tools. It picks routes; it never writes a number, a SQL query, or a tool call. Language models are weak at exact numeric comparison, which is why price and bedrooms belong in a database filter.",
      state: ZILLOW_ROUTING.state, questions: ZILLOW_ROUTING.questions, answers: ZILLOW_ROUTING.answers,
    }),
    {
      actor: "code",
      title: "Build the tool calls",
      say: "With each route known, code turns the phrase into that tool's arguments. The area and the freeway distance come from product settings, never from the word “near”.",
      show: "listings  beds >= 4\nlistings  price < 1,200,000\ngeo       within_area arlington-approved\ngeo       min_distance_to_road freeway >= 500 m",
      why: "Only routes on a fixed list of real tools can produce a call. A requirement routed to clarify, or one whose setting is missing, stops here and asks the person instead of guessing.",
      payloads: [{ label: "tool calls (stays in your code)", value: ZILLOW_ARGUMENTS.calls }, { label: "left for Jev", value: ZILLOW_ARGUMENTS.forJev }],
    },
    {
      actor: "system", by: "Search + geo tools",
      title: "Run the exact filters",
      say: `The database and geo tools check four of the six requirements exactly. Only ${ZILLOW_WORKLOAD.survivors} of ${count(ZILLOW_WORKLOAD.corpus)} listings survive to need a judgment.`,
      show: `${count(ZILLOW_WORKLOAD.corpus)} listings → ${ZILLOW_WORKLOAD.survivors}`,
      why: "Freeway distance is a good example of why tools go first: listing descriptions rarely mention the freeway, but road geometry answers the question for every listing.",
      payloads: [{ label: "tool result", value: ZILLOW_TOOL_RESULT }],
    },
  ],
  repeat: `The batches above ask Jev the two remaining questions for all ${ZILLOW_WORKLOAD.survivors} listings: ${count(ZILLOW_COUNTS.semanticQuestions)} yes/no questions in ${ZILLOW_COUNTS.semanticRequests} requests.`,
  outcome: `Listings that pass both judgments are merged, ranked, and shown with the text that supports them. In total this search makes ${ZILLOW_COUNTS.totalScaledRequests} Jev requests.`,
  note: "No public source exists for Justine Moore's demo. This tools-first design, its routes, and its numbers are the article's own illustration.",
};
