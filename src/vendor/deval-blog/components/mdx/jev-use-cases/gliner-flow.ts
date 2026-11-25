import type { DataFlow } from "./data-flow-types";
import { jevStep, type Trace } from "./trace";

// A short article in the style of William Lyon's fictional business-news corpus (kgx/data/documents.py).
// Each candidate fact is phrased so it lands in a different assertion status.
export const GLINER_SENTENCES = [
  "Northwind Logistics bought a 19.9% stake in Meridian Rail Group last week.",
  "Northwind has also agreed to buy Cascade Freight, a deal that closes only if regulators approve it.",
  "Reports said Northwind would sell its Canadian brokerage; the company denied them.",
  "Northwind expects to open a Chicago terminal in 2027.",
];
export const GLINER_DOCUMENT = GLINER_SENTENCES.join(" ");

const spans = (text: string) => [...GLINER_DOCUMENT.matchAll(new RegExp(text, "g"))].map(match => ({ text, start: match.index, end: match.index + text.length }));
export const GLINER_ENTITIES = [
  { id: "northwind", name: "Northwind Logistics", label: "company", mentions: spans("Northwind") },
  { id: "meridian", name: "Meridian Rail Group", label: "company", mentions: spans("Meridian Rail Group") },
  { id: "cascade", name: "Cascade Freight", label: "company", mentions: spans("Cascade Freight") },
  { id: "brokerage", name: "Canadian brokerage", label: "business unit", mentions: spans("Canadian brokerage") },
  { id: "chicago", name: "Chicago", label: "location", mentions: spans("Chicago") },
];
const name = (id: string) => GLINER_ENTITIES.find(entity => entity.id === id)!.name;

/** GLiNER2.5's draft edges: pattern matches between two spans, with no idea whether the text asserts them. */
export const GLINER_CANDIDATES = [
  { tag: "e0", head: "northwind", relation: "INVESTED_IN", tail: "meridian", sentence: 0 },
  { tag: "e1", head: "northwind", relation: "ACQUIRES", tail: "cascade", sentence: 1 },
  { tag: "e2", head: "northwind", relation: "SELLS", tail: "brokerage", sentence: 2 },
  { tag: "e3", head: "northwind", relation: "OPERATES_IN", tail: "chicago", sentence: 3 },
];
const claim = (c: (typeof GLINER_CANDIDATES)[number]) => `“${name(c.head)}” ${c.relation} “${name(c.tail)}”`;

// ASSERTION_LEVELS in kgx/typesafe.py, verbatim.
const ASSERTION_LEVELS = {
  asserted: "The text states this relationship as a present or past fact. It holds, or it held.",
  hypothetical: "The text raises this relationship only as a possibility, a condition, a proposal awaiting approval, or something that would happen if something else did. It is not claimed to have happened.",
  negated: "The text denies this relationship, or states that it will not happen, is not planned, or is not expected.",
  forward_looking: "The text projects, forecasts or guides that this relationship will hold in the future. It has not happened yet, but it is not merely conditional.",
};

// edge_questions() in kgx/typesafe.py: the claim is named in the instructions, because the state is the whole document.
const GLINER_QUESTIONS = Object.fromEntries(GLINER_CANDIDATES.flatMap(c => [
  [`${c.tag}_supported`, {
    type: "noul",
    instructions: `Does the document say anything that bears on this claim: ${claim(c)}? Answer yes if the document discusses this relationship at all, in any modality: asserted, denied, proposed or merely possible. Answer no if the document does not connect these two things.`,
    criteria: { true: "The document addresses this relationship between these two specific things.", false: "The document does not connect these two things, or one of them does not appear in it." },
  }],
  [`${c.tag}_status`, { type: "choice", instructions: `How does the document present this claim: ${claim(c)}? Judge only how it is presented, not whether it is plausible.`, criteria: ASSERTION_LEVELS }],
]));

const status = (choice: keyof typeof ASSERTION_LEVELS, top: number, rest: [number, number, number], confidence: number) => {
  const others = (Object.keys(ASSERTION_LEVELS) as (keyof typeof ASSERTION_LEVELS)[]).filter(key => key !== choice);
  return { type: "choice", choice, probabilities: { [choice]: top, ...Object.fromEntries(others.map((key, i) => [key, rest[i]])) }, confidence };
};
const GLINER_ANSWERS = {
  e0_supported: { type: "noul", noul: 0.98 },
  e0_status: status("asserted", 0.95, [0.02, 0.01, 0.02], 0.86),
  e1_supported: { type: "noul", noul: 0.97 },
  e1_status: status("hypothetical", 0.86, [0.03, 0.01, 0.1], 0.71),
  e2_supported: { type: "noul", noul: 0.94 },
  e2_status: status("negated", 0.91, [0.04, 0.04, 0.01], 0.78),
  e3_supported: { type: "noul", noul: 0.96 },
  e3_status: status("forward_looking", 0.9, [0.02, 0.07, 0.01], 0.77),
} as Record<string, { type: string; noul?: number; choice?: string }>;

/** EdgeJudgment.keep in kgx/typesafe.py: the document must discuss the claim, and assert it. */
export const GLINER_JUDGMENTS = GLINER_CANDIDATES.map(c => {
  const supported = GLINER_ANSWERS[`${c.tag}_supported`].noul!;
  const assertion = GLINER_ANSWERS[`${c.tag}_status`].choice!;
  return { ...c, headName: name(c.head), tailName: name(c.tail), supported, assertion, fact: supported >= 0.5 && assertion === "asserted" };
});

// Every judged edge is written with its judgment as properties, so the gate becomes a query filter.
const GRAPH_WRITES = GLINER_JUDGMENTS.map(j => ({ from: j.head, type: j.relation, to: j.tail, props: { assertion: j.assertion, supported: j.supported, source: "doc-17", sentence: j.sentence } }));
export const GLINER_QUERIES = {
  facts: { cypher: "MATCH (a)-[r]->(b) WHERE r.assertion = 'asserted' AND r.supported >= 0.8 RETURN a, r, b", returns: GLINER_JUDGMENTS.filter(j => j.assertion === "asserted" && j.supported >= 0.8).map(claimText) },
  pending: { cypher: "MATCH (a)-[r]->(b) WHERE r.assertion IN ['hypothetical', 'forward_looking'] RETURN a, r, b", returns: GLINER_JUDGMENTS.filter(j => ["hypothetical", "forward_looking"].includes(j.assertion)).map(claimText) },
};
function claimText(j: (typeof GLINER_JUDGMENTS)[number]) { return `${j.headName} ${j.relation} ${j.tailName}`; }

export const GLINER_FLOW: DataFlow = {
  input: { id: "doc-17", text: GLINER_DOCUMENT, schema: { entities: ["company", "business unit", "location"], relations: ["INVESTED_IN", "ACQUIRES", "SELLS", "OPERATES_IN"] } },
  state: { document: GLINER_DOCUMENT },
  questions: GLINER_QUESTIONS,
  answers: GLINER_ANSWERS,
  output: { judgments: GLINER_JUDGMENTS, graphWrites: GRAPH_WRITES, queries: GLINER_QUERIES },
};

export const GLINER_TRACE: Trace = {
  steps: [
    {
      actor: "model", by: "GLiNER2.5 · not Jev",
      title: "Draft candidate facts",
      say: "A small extraction model reads the article quickly and proposes every fact it can see: who is related to whom, and how. It matches patterns, so it cannot tell a completed deal from a rumor.",
      show: GLINER_CANDIDATES.map(c => `${c.tag}  ${name(c.head)} ${c.relation} ${name(c.tail)}`).join("\n"),
      why: "GLiNER2.5 (fastino/gliner2.5-base-v1) extracts entities and relations in one pass from a schema of labels. In Lyon's test it proposed 170 edges; its own confidence scores could not separate the good ones from the bad.",
      payloads: [{ label: "entities with source offsets (stays in your code)", value: GLINER_ENTITIES }, { label: "candidate edges", value: GLINER_CANDIDATES }],
    },
    jevStep({
      title: "Ask how the article presents each fact",
      say: "Jev reads the whole article and answers two questions per candidate: does the article discuss it at all, and does it state it as done, possible, denied, or planned?",
      show: GLINER_CANDIDATES.map(c => `${c.tag}_status  ${GLINER_ANSWERS[`${c.tag}_status`].choice}`).join("\n"),
      why: "The whole document is the shared state, so the denial in the second half of sentence three counts against the sale in the first half. Lyon batches up to 12 edges (24 questions) per request per document, and caches answers on disk so a rerun costs nothing. A plain yes/no on \"is this a fact?\" missed some denials in his tests; the four-way Choice caught all of them.",
      state: { document: GLINER_DOCUMENT }, questions: GLINER_QUESTIONS, answers: GLINER_ANSWERS,
    }),
    {
      actor: "code",
      title: "Label every edge",
      say: "Code keeps all four candidates but labels each with its status. Only the stake in Meridian is a fact; the others are a pending deal, a denied rumor, and a plan.",
      show: GLINER_JUDGMENTS.map(j => `${j.tag}  ${j.relation.padEnd(11)} ${j.assertion}${j.fact ? "  (fact)" : ""}`).join("\n"),
      why: "An edge counts as a fact when supported ≥ 0.5 and the status is asserted. Nothing is thrown away: a denied sale is still useful to know about.",
      payloads: [{ label: "judgments", value: GLINER_JUDGMENTS }],
    },
    {
      actor: "system", by: "Neo4j",
      title: "Store the edges with their status",
      say: "Every edge goes into the graph with the judgment attached. The status becomes something you can query.",
      show: "MERGE (h)-[r:ACQUIRES]->(t)\nSET r += { assertion: \"hypothetical\", supported: 0.97 }",
      why: "Lyon's loader batches writes with UNWIND … MERGE and SET r += row.props, keyed on a canonical entity ID so reruns do not duplicate nodes.",
      payloads: [{ label: "graph writes", value: GRAPH_WRITES }],
    },
    {
      actor: "code",
      title: "Ask the graph for facts only",
      say: "A question like “what does Northwind own?” now filters on the status. Deals still in progress stay one query away.",
      show: `facts:   ${GLINER_QUERIES.facts.returns.join(", ")}\npending: ${GLINER_QUERIES.pending.returns.join("; ")}`,
      payloads: [{ label: "queries", value: GLINER_QUERIES }],
    },
  ],
  outcome: "Without the judge, this article would put four facts in the graph and three would be wrong. In Lyon's test, the same gate raised precision from 0.279 to 0.404 without losing a single correct fact.",
  note: "The article is written for this example in the style of Lyon's fictional corpus. Question wording, the four statuses, the keep rule, and the query pattern follow kgx/typesafe.py and notebook 10 in johnymontana/extraction-knowledge-graph-experiments.",
};
