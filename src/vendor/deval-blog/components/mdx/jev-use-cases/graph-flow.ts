import type { DataFlow } from "./data-flow-types";
import type { Trace } from "./trace";

// An invented engineering graph. The request shape, question wording, beam settings, and path
// scoring follow jexp/neo4jev (src/neo4jev/navigator.py); the real demo runs on Neo4j's public Companies KG.
export const GRAPH_GOAL = "Find a person who can fix the payment timeouts in this incident.";
export const GRAPH_SETTINGS = { top_k: 2, cutoff: 0.05, beam_width: 4, max_depth: 4, max_calls: 24, goal_threshold: 0.5 };

type Node = { label: string; properties: Record<string, string> };
export const GRAPH_NODES: Record<string, Node> = {
  inc4121: { label: "Incident", properties: { name: "INC-4121", title: "Checkout payments time out", status: "open" } },
  checkout: { label: "Service", properties: { name: "checkout-api" } },
  inc3877: { label: "Incident", properties: { name: "INC-3877", title: "Card payments time out after gateway deploy", status: "resolved", resolution: "Rolled back the payments-gateway connection pool change" } },
  ana: { label: "Person", properties: { name: "Ana Ruiz", role: "Support engineer" } },
  thread: { label: "Document", properties: { name: "#payments-alerts thread" } },
  webplat: { label: "Team", properties: { name: "Web Platform", on_call: "Ben Ito" } },
  gateway: { label: "Service", properties: { name: "payments-gateway" } },
  priya: { label: "Person", properties: { name: "Priya Shah", role: "Payments engineer" } },
};
export const GRAPH_EDGES = [
  { from: "inc4121", type: "AFFECTS", to: "checkout" },
  { from: "inc4121", type: "SIMILAR_TO", to: "inc3877", props: { score: "0.83" } },
  { from: "inc4121", type: "REPORTED_BY", to: "ana" },
  { from: "inc4121", type: "MENTIONED_IN", to: "thread" },
  { from: "checkout", type: "OWNED_BY", to: "webplat" },
  { from: "checkout", type: "DEPENDS_ON", to: "gateway" },
  { from: "inc3877", type: "RESOLVED_BY", to: "priya" },
  { from: "inc3877", type: "AFFECTS", to: "gateway" },
];
export const nodeName = (id: string) => GRAPH_NODES[id].properties.name;

/** The Choice options at one node: synthetic keys e0, e1, … per hop, never the relationship type. */
function candidates(nodeId: string) {
  return GRAPH_EDGES.filter(edge => edge.from === nodeId).map((edge, i) => ({ key: `e${i}`, ...edge }));
}

// One system_one request per node: a Noul for "is this node already the goal" and a Choice over its edges.
function hopRequest(nodeId: string, path: string[], hop: number) {
  const options = candidates(nodeId);
  return {
    nodeId,
    options,
    state: {
      current_node: { element_id: nodeId, label: GRAPH_NODES[nodeId].label, properties: GRAPH_NODES[nodeId].properties },
      path_so_far: path.map(nodeName),
      hop_index: hop,
      goal: { mode: "free_text", description: GRAPH_GOAL },
    },
    questions: {
      ...(options.length ? { next_edge: {
        type: "choice",
        instructions: `Choose the single outgoing relationship that best advances the navigation goal. The options are the relationships leaving the current node. Goal: ${GRAPH_GOAL}`,
        criteria: Object.fromEntries(options.map(o => [o.key, { relationship_type: o.type, target_label: GRAPH_NODES[o.to].label, target_properties: GRAPH_NODES[o.to].properties }])),
      } } : {}),
      goal_reached: {
        type: "noul",
        instructions: "Has the navigation goal already been reached at the current node, before following any further relationship?",
        criteria: { true: "The current node satisfies the goal description.", false: "The current node does not satisfy the goal description." },
      },
    },
  };
}
const choice = (winner: string, probabilities: Record<string, number>, confidence: number) => ({ type: "choice", choice: winner, probabilities, confidence });
const noul = (p: number) => ({ type: "noul", noul: p });

export const HOP_1 = { ...hopRequest("inc4121", ["inc4121"], 0), answers: {
  next_edge: choice("e0", { e0: 0.46, e1: 0.41, e2: 0.08, e3: 0.05 }, 0.34), goal_reached: noul(0.02),
} };
export const HOP_2 = [
  { ...hopRequest("checkout", ["inc4121", "checkout"], 1), answers: { next_edge: choice("e1", { e0: 0.38, e1: 0.62 }, 0.2), goal_reached: noul(0.03) } },
  { ...hopRequest("inc3877", ["inc4121", "inc3877"], 1), answers: { next_edge: choice("e0", { e0: 0.86, e1: 0.14 }, 0.52), goal_reached: noul(0.06) } },
];
const HOP_3_NODES = { priya: 0.93, gateway: 0.08, webplat: 0.31 } as Record<string, number>;

/** _select_branches(): rank by probability, keep those at or above the cutoff, at most top_k. */
function selectBranches(request: { options: ReturnType<typeof candidates>; answers: { next_edge: { probabilities: Record<string, number> } } }) {
  return request.options
    .map(o => ({ to: o.to, type: o.type, p: request.answers.next_edge.probabilities[o.key] }))
    .sort((a, b) => b.p - a.p)
    .filter((o, i) => i < GRAPH_SETTINGS.top_k && o.p >= GRAPH_SETTINGS.cutoff);
}
const round = (n: number) => Math.round(n * 1000) / 1000;
export const BEAM_1 = selectBranches(HOP_1).map(b => ({ path: ["inc4121", b.to], via: [b.type], score: round(Math.log(b.p)) }));
export const BEAM_2 = HOP_2.flatMap(request => {
  const parent = BEAM_1.find(b => b.path.at(-1) === request.nodeId)!;
  return selectBranches(request).map(b => ({ path: [...parent.path, b.to], via: [...parent.via, b.type], score: round(parent.score + Math.log(b.p)) }));
}).sort((a, b) => b.score - a.score).slice(0, GRAPH_SETTINGS.beam_width);
export const HOP_3 = BEAM_2.map(branch => ({ node: branch.path.at(-1)!, goal_reached: HOP_3_NODES[branch.path.at(-1)!] ?? 0.05 }));
export const GRAPH_RESULT = (() => {
  const winner = BEAM_2.find(branch => HOP_3.find(h => h.node === branch.path.at(-1))!.goal_reached >= GRAPH_SETTINGS.goal_threshold)!;
  return {
    terminated: "GOAL_REACHED",
    path: winner.path.map(nodeName),
    relationships: winner.via,
    pathScore: winner.score,
    evidence: GRAPH_NODES.inc3877.properties.resolution,
    calls: 1 + HOP_2.length + HOP_3.length,
  };
})();
/** What a hand-written pattern (incident → service → owning team → on-call) returns for the same incident. */
export const FIXED_QUERY = {
  cypher: "MATCH (:Incident {name: 'INC-4121'})-[:AFFECTS]->(:Service)-[:OWNED_BY]->(t:Team) RETURN t.on_call",
  returns: `${GRAPH_NODES.webplat.properties.on_call} (${nodeName("webplat")})`,
};

const pathText = (path: string[], via: string[]) => path.map((id, i) => i ? `-${via[i - 1]}-> ${nodeName(id)}` : nodeName(id)).join(" ");
const hopPayloads = (request: ReturnType<typeof hopRequest> & { answers: unknown }, at: string) => [
  { label: `${at} · request.state`, value: request.state },
  { label: `${at} · request.questions`, value: request.questions },
  { label: `${at} · response.answers`, value: request.answers },
];

export const GRAPH_FLOW: DataFlow = {
  input: { start: nodeName("inc4121"), goal: GRAPH_GOAL, settings: GRAPH_SETTINGS },
  state: HOP_1.state,
  questions: HOP_1.questions,
  answers: HOP_1.answers,
  output: { beam: BEAM_1 },
  nextCalls: HOP_2.map(request => ({ state: request.state, questions: request.questions, answers: request.answers })),
};

export const GRAPH_TRACE: Trace = {
  steps: [
    {
      actor: "system", by: "Neo4j",
      title: "Read the incident's neighborhood",
      say: "Start at the open incident and read every relationship leading out of it: the service it hit, a similar past incident, who reported it, and where it was discussed.",
      show: candidates("inc4121").map(o => `${o.key}  ${o.type.padEnd(12)} ${nodeName(o.to)}`).join("\n"),
      why: "A parameterized Cypher read returns real edges only, capped at 10 per relationship type and 60 in total, so a busy node cannot flood the Choice. Each option gets a synthetic key, e0, e1, …, because two edges of the same type would collide if keyed by type.",
      payloads: [{ label: "candidate edges (stays in your code)", value: candidates("inc4121") }],
    },
    {
      actor: "jev",
      title: "Ask: is this the answer, and where next?",
      say: "One request asks whether the incident itself satisfies the goal, and which edge looks most useful. The service and the similar past incident come out close.",
      show: `goal_reached  ${HOP_1.answers.goal_reached.noul}\nnext_edge     e0 AFFECTS (0.46)\n              e1 SIMILAR_TO (0.41)\n              e2, e3 below 0.1`,
      why: "Both questions ride in one call, so each node costs one round trip. The goal is plain words; nothing in the code knows that incidents, services, or people matter.",
      payloads: hopPayloads(HOP_1, "INC-4121"),
    },
    {
      actor: "code",
      title: "Keep the two best leads",
      say: "Instead of betting on the top edge alone, code keeps the best two and follows both. The reporter and the chat thread are dropped.",
      show: BEAM_1.map(b => `${pathText(b.path, b.via)}   log p ${b.score}`).join("\n"),
      why: `This is a beam search: top_k ${GRAPH_SETTINGS.top_k} edges per node with a ${GRAPH_SETTINGS.cutoff} probability cutoff, and at most ${GRAPH_SETTINGS.beam_width} paths alive at once. Visited nodes are never revisited.`,
      payloads: [{ label: "beam", value: BEAM_1 }],
    },
    {
      actor: "jev",
      title: "Judge both leads at once",
      say: "Each lead gets its own request, sent in parallel. From the past incident, the clear next step is the person who resolved it; from checkout-api, the gateway it depends on.",
      show: "at checkout-api  DEPENDS_ON 0.62, OWNED_BY 0.38\nat INC-3877      RESOLVED_BY 0.86, AFFECTS 0.14",
      why: "Branches are independent, so neo4jev sends their requests concurrently. Each request carries only that node's own edges.",
      payloads: [...hopPayloads(HOP_2[0], "checkout-api"), ...hopPayloads(HOP_2[1], "INC-3877")],
    },
    {
      actor: "code",
      title: "Rank the paths",
      say: "Each path's score adds up the log probabilities of its choices. The route through the past incident now leads.",
      show: BEAM_2.map(b => `${b.score.toFixed(2).padStart(5)}  ${pathText(b.path, b.via)}`).join("\n"),
      why: "Summing log probabilities is the same as multiplying the probabilities, without underflow on long paths. The score ranks paths; it is not a calibrated probability that a path is right.",
      payloads: [{ label: "beam", value: BEAM_2 }],
    },
    {
      actor: "jev",
      title: "Check whether any new node is the answer",
      say: "At each new node, the goal question runs again. Priya Shah, who resolved the same kind of timeout last month, passes; the others do not.",
      show: [...new Map(HOP_3.map(h => [h.node, h])).values()].map(h => `${nodeName(h.node).padEnd(17)} goal_reached ${h.goal_reached}`).join("\n"),
      payloads: [{ label: "goal checks", value: HOP_3 }],
    },
    {
      actor: "code",
      title: "Return the path and its evidence",
      say: "The answer comes back with the route that justifies it, including the past fix: the connection pool rollback on payments-gateway.",
      show: `${pathText(["inc4121", "inc3877", "priya"], ["SIMILAR_TO", "RESOLVED_BY"])}\n${GRAPH_RESULT.calls} of ${GRAPH_SETTINGS.max_calls} calls used`,
      payloads: [{ label: "result", value: GRAPH_RESULT }],
    },
  ],
  outcome: `The obvious fixed query, from the incident to its service's owning team, returns ${FIXED_QUERY.returns}: the team that owns checkout, not the one whose gateway change caused the timeouts. The walk found Priya because it could read what the past incident was about.`,
  note: "Invented graph and probabilities. Question keys and wording, per-hop edge keys, the beam settings, and log-probability path scores follow jexp/neo4jev.",
};
