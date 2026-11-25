import type { DataFlow } from "./data-flow-types";
import { jevStep, type Trace } from "./trace";

// Mirrors browser-use/jev-ultrafast: snapshot.js → model.action_space() → model.choose().
// The page and answers are invented; the payload shape, keys, and ID scheme follow the source.

export type Rect = { x: number; y: number; w: number; h: number };
export type SnapshotAction = {
  id: string;
  node?: number;
  kind: "fill" | "click" | "select" | "wait";
  role?: string;
  label: string;
  value?: string;
  current_value?: string;
  rect?: Rect;
};
export type Observation = { url: string; title: string; text: string; viewport: { w: number; h: number }; actions: SnapshotAction[] };
type ModelElement = { role?: string; value?: string; index: string; label: string; operations: string[]; options?: { index: string; label: string; value?: string }[] };
type Operation = "CLICK" | "TYPE_TEXT" | "SELECT";

const GOAL = "Find flights from Zurich to London";
const URL = "https://flights.example/search";
const VIEWPORT = { w: 652, h: 290 };
// Abbreviated here; the full rule text is NEXT_ACTION and TARGET in jev_ultrafast/questions.py.
const NEXT_ACTION = "Advance the user's entire goal from the CURRENT page using one operation. … A typed query still needs its matching autocomplete suggestion selected. …";
const TARGET = "Choose the best observed target if the next operation is the one specified in this question. … Choose only an offered element index.";
const OPERATION_LABELS: Record<Operation, string> = {
  CLICK: "Click an element, button, menu option, autocomplete suggestion, or calendar day.",
  TYPE_TEXT: "Enter or replace text in an editable field. A small LLM will supply the value from the goal.",
  SELECT: "Select an observed dropdown value.",
};
const KIND_TO_OPERATION = { click: "CLICK", fill: "TYPE_TEXT", select: "SELECT" } as const;

type Field = { node: number; role: string; label: string; value?: string; rect: Rect };
// snapshot.js emits a fill and an "Open …" click for editable fields, one select action per
// unselected option, and numbers actions e1, e2, … in DOM order for the executor.
function snapshot(fields: (Field & { options?: { label: string; value: string }[]; current?: string })[], text: string): Observation {
  const actions: SnapshotAction[] = [];
  for (const { options, current, ...field } of fields) {
    if (options) {
      for (const option of options) actions.push({ ...field, id: "", kind: "select", value: option.value, current_value: current, label: `${field.label} → ${option.label}` });
    } else if (field.role === "textbox") {
      actions.push({ ...field, id: "", kind: "fill", value: field.value ?? "" });
      actions.push({ ...field, id: "", kind: "click", value: field.value ?? "", label: `Open ${field.label}` });
    } else {
      actions.push({ ...field, id: "", kind: "click", value: "" });
    }
  }
  actions.forEach((action, i) => { action.id = `e${i + 1}`; });
  actions.push({ id: "wait", kind: "wait", label: "Wait for the page to update" });
  return { url: URL, title: "Flight search", text, viewport: VIEWPORT, actions };
}

const from = { node: 11, role: "textbox", label: "Where from?", rect: { x: 24, y: 92, w: 240, h: 40 } };
const to = { node: 12, role: "textbox", label: "Where to?", value: "", rect: { x: 282, y: 92, w: 190, h: 40 } };
const departure = { node: 13, role: "button", label: "Departure", rect: { x: 490, y: 92, w: 150, h: 40 } };
const cabin = { node: 14, role: "combobox", label: "Cabin", rect: { x: 282, y: 206, w: 150, h: 36 }, current: "Economy", options: [{ label: "Premium economy", value: "premium" }, { label: "Business", value: "business" }] };
const search = { node: 15, role: "button", label: "Search", rect: { x: 490, y: 206, w: 150, h: 36 } };
const signIn = { node: 16, role: "link", label: "Sign in to save trips", rect: { x: 24, y: 258, w: 154, h: 20 } };

export const OBSERVATIONS = {
  empty: snapshot([{ ...from, value: "" }, to, departure, cabin, search, signIn], "Flight search\nWhere from?\nWhere to?\nDeparture\nCabin\nEconomy\nSearch\nSign in to save trips"),
  suggestions: snapshot([
    { ...from, value: "Zurich" },
    { node: 17, role: "option", label: "Zürich, Switzerland (ZRH)", rect: { x: 24, y: 136, w: 240, h: 30 } },
    { node: 18, role: "option", label: "Zurich, all airports", rect: { x: 24, y: 166, w: 240, h: 30 } },
    to, departure, cabin, search, signIn,
  ], "Flight search\nWhere from?\nZürich, Switzerland (ZRH)\nZurich, all airports\nWhere to?\nDeparture\nCabin\nEconomy\nSearch\nSign in to save trips"),
};

/** Port of model.action_space(): one model-facing index per DOM node, per observation. */
export function actionSpace(actions: SnapshotAction[]) {
  const elements: ModelElement[] = [];
  const indices = new Map<number, string>();
  const targets: Partial<Record<Operation, Record<string, SnapshotAction>>> = {};
  const controls: Record<string, SnapshotAction> = {};
  for (const action of actions) {
    if (action.kind === "wait") { controls[action.id.toUpperCase()] = action; continue; }
    const node = action.node!;
    if (!indices.has(node)) {
      const index = String(elements.length + 1);
      indices.set(node, index);
      const element: ModelElement = { role: action.role, value: action.value, index, label: action.label.split(" → ")[0], operations: [] };
      if (action.kind === "select") { element.value = action.current_value ?? ""; element.options = []; }
      elements.push(element);
    }
    const index = indices.get(node)!;
    const operation = KIND_TO_OPERATION[action.kind];
    const element = elements[Number(index) - 1];
    if (!element.operations.includes(operation)) element.operations.push(operation);
    let target = index;
    if (action.kind === "select") {
      target = `${index}:${element.options!.length + 1}`;
      element.options!.push({ index: target, label: action.label, value: action.value });
    }
    (targets[operation] ??= {})[target] = action;
  }
  return { elements, targets, controls, indexByNode: Object.fromEntries(indices) as Record<number, string> };
}

/** Port of model.choose()'s request body: one operation Choice plus one target Choice per operation. */
export function chooseRequest(observation: Observation, recentActions: object[]) {
  const { elements, targets, controls } = actionSpace(observation.actions);
  const operations: Record<string, string> = Object.fromEntries((Object.keys(targets) as Operation[]).map(key => [key, OPERATION_LABELS[key]]));
  for (const [key, control] of Object.entries(controls)) operations[key] = control.label;
  Object.assign(operations, { DONE: "Every requirement is visibly satisfied.", BLOCKED: "No supported operation can progress." });
  const questions: Record<string, { type: "choice"; criteria: Record<string, unknown>; instructions: object }> = {
    operation: { type: "choice", criteria: operations, instructions: { goal: GOAL, rules: NEXT_ACTION } },
  };
  for (const [operation, candidates] of Object.entries(targets)) {
    questions[`${operation.toLowerCase()}_target`] = {
      type: "choice",
      criteria: Object.fromEntries(Object.entries(candidates).map(([index, a]) => [index, { element: `[${index}] ${a.label}`, current_value: a.current_value ?? a.value ?? "", role: a.role }])),
      instructions: { goal: GOAL, operation, rules: [NEXT_ACTION, TARGET] },
    };
  }
  return {
    state: { page: { url: observation.url, title: observation.title, text: observation.text }, elements, recent_actions: recentActions },
    questions,
    targets,
  };
}

type Distribution = Record<string, number>;
const answer = (choice: string, probabilities: Distribution, confidence: number) => ({ type: "choice" as const, choice, probabilities, confidence });

/** Mirrors choose()/validate_choice(): only the target head named by the operation is used. */
export function resolveDecision(request: ReturnType<typeof chooseRequest>, answers: Record<string, ReturnType<typeof answer>>) {
  const operation = answers.operation.choice as Operation;
  const head = `${operation.toLowerCase()}_target`;
  const target = answers[head].choice;
  const action = request.targets[operation]![target];
  return { operation, head, target, actionId: action.id, node: action.node!, ignoredHeads: Object.keys(request.questions).filter(key => key !== "operation" && key !== head) };
}

const request1 = chooseRequest(OBSERVATIONS.empty, []);
export const STEP_1 = {
  request: request1,
  answers: {
    operation: answer("TYPE_TEXT", { TYPE_TEXT: 0.91, CLICK: 0.06, SELECT: 0.01, WAIT: 0.01, DONE: 0, BLOCKED: 0.01 }, 0.78),
    type_text_target: answer("1", { 1: 0.95, 2: 0.05 }, 0.71),
    click_target: answer("1", { 1: 0.62, 2: 0.08, 3: 0.12, 5: 0.17, 6: 0.01 }, 0.21),
    select_target: answer("4:1", { "4:1": 0.55, "4:2": 0.45 }, 0.01),
  },
};
export const DECISION_1 = resolveDecision(STEP_1.request, STEP_1.answers);
const typedAction = OBSERVATIONS.empty.actions.find(a => a.id === DECISION_1.actionId)!;
// field_text() in model.py: a JSON-mode chat completion to an OpenAI-compatible model, never to Jev.
const TEXT_VALUE = "Return a JSON object with exactly one key, text: the exact string to enter in the selected field. … If a required value is missing, return {\"text\": null}.";
const fieldContext = { goal: GOAL, field: { label: typedAction.label, role: typedAction.role, value: typedAction.value }, page: { title: OBSERVATIONS.empty.title, text: OBSERVATIONS.empty.text }, recent_actions: [] };
export const TEXT_HELPER = {
  request: {
    model: "deepseek-chat",
    response_format: { type: "json_object" },
    messages: [{ role: "system", content: TEXT_VALUE }, { role: "user", content: fieldContext }],
  },
  response: { text: "Zurich" },
};
const history1 = { action: typedAction.label, kind: typedAction.kind, text: TEXT_HELPER.response.text, page_changed: true };

const request2 = chooseRequest(OBSERVATIONS.suggestions, [history1]);
export const STEP_2 = {
  request: request2,
  answers: {
    operation: answer("CLICK", { TYPE_TEXT: 0.07, CLICK: 0.9, SELECT: 0.01, WAIT: 0.02, DONE: 0, BLOCKED: 0 }, 0.74),
    type_text_target: answer("4", { 1: 0.03, 4: 0.97 }, 0.85),
    click_target: answer("2", { 1: 0.02, 2: 0.88, 3: 0.07, 4: 0.01, 5: 0.01, 7: 0.01, 8: 0 }, 0.66),
    select_target: answer("6:1", { "6:1": 0.5, "6:2": 0.5 }, 0),
  },
};
export const DECISION_2 = resolveDecision(STEP_2.request, STEP_2.answers);
const indexMoves = (node: number) => ({ node, before: actionSpace(OBSERVATIONS.empty.actions).indexByNode[node], after: actionSpace(OBSERVATIONS.suggestions.actions).indexByNode[node] });

const snapshotData = (observation: Observation) => ({ url: observation.url, title: observation.title, viewport: observation.viewport, actions: observation.actions });
const localMap = (observation: Observation) => {
  const { targets } = actionSpace(observation.actions);
  return Object.fromEntries(Object.entries(targets).map(([operation, byIndex]) => [operation, Object.fromEntries(Object.entries(byIndex!).map(([index, action]) => [index, action.id]))]));
};
const decision = (d: typeof DECISION_1) => ({ operation: d.operation, usedHead: d.head, target: d.target, executorAction: d.actionId, node: d.node, ignoredHeads: d.ignoredHeads });

// Call data for the tests: each Jev request with the input it was built from and what code did next.
export const BROWSER_FLOW: DataFlow = {
  input: snapshotData(OBSERVATIONS.empty),
  state: request1.state,
  questions: request1.questions,
  answers: STEP_1.answers,
  output: { decision: decision(DECISION_1), textHelper: TEXT_HELPER, executed: { action: DECISION_1.actionId, kind: "fill", text: TEXT_HELPER.response.text }, historyEntry: history1 },
  nextCalls: [{
    input: snapshotData(OBSERVATIONS.suggestions),
    state: request2.state,
    questions: request2.questions,
    answers: STEP_2.answers,
    output: { decision: decision(DECISION_2), indexChanges: [indexMoves(11), indexMoves(12), indexMoves(15)], executed: { action: DECISION_2.actionId, kind: "click" } },
  }],
};

export const BROWSER_TRACE: Trace = {
  steps: [
    {
      actor: "system", by: "Browser",
      title: "Snapshot the page",
      say: "Turn the live page into a list of everything the agent could do right now. Each possible action gets a private handle (e1, e2, …) that only the executor uses.",
      show: 'e1  type into "Where from?"\ne2  click "Open Where from?"\n…   e9  click "Sign in to save trips"',
      why: "An editable field produces two actions: type into it, or click to open it. A dropdown produces one action per option. The script also keeps a stable identity for each DOM node, which the executor later uses to check that nothing moved.",
      payloads: [{ label: "snapshot (stays in your code)", value: snapshotData(OBSERVATIONS.empty) }],
    },
    {
      actor: "code",
      title: "Number the elements for the model",
      say: "Give Jev a short numbered menu, one number per control. The executor's handles and screen positions stay behind in your code.",
      show: "Jev sees         executor keeps\n[1] Where from?  e1 type, e2 click\n[4] Cabin        e6, e7 (one per option)\n[5] Search       e8 click",
      why: "This is action_space() in model.py. It also builds a local lookup from each operation and number back to the executor's action, which step 4 uses.",
      payloads: [{ label: "local lookup: operation → number → executor action", value: localMap(OBSERVATIONS.empty) }],
    },
    jevStep({
      title: "Choose an operation and a target",
      say: "Ask what to do next and where to do it, in a single request. Jev only picks from the menu; it never writes anything.",
      show: "operation         TYPE_TEXT (0.91)\ntype_text_target  1 (0.95)\nclick_target      1 (unused)\nselect_target     4:1 (unused)",
      why: "The request carries four Choices: the operation, plus one target question per operation (type_text_target, click_target, select_target). Asking every target question up front means one round trip per step instead of two. Question keys never reach the model, so each target option describes itself: \"[1] Where from?\". The rules text is abbreviated here; it is NEXT_ACTION and TARGET in questions.py.",
      state: request1.state, questions: request1.questions, answers: STEP_1.answers,
    }),
    {
      actor: "code",
      title: "Validate and resolve the target",
      say: "Accept the answer only if it is well formed, then translate Jev's number back into the executor's handle. Answers for the operations that were not chosen are thrown away.",
      show: "type_text_target 1 → action e1\nclick_target, select_target: discarded",
      why: "An answer is accepted only if the winner is an offered key, the probabilities cover exactly the offered keys and sum to 1, and the winner has the highest probability. Otherwise nothing runs.",
      payloads: [{ label: "decision", value: decision(DECISION_1) }],
    },
    {
      actor: "model", by: "Chat model · not Jev",
      title: "Write the text to type",
      say: "Typing needs actual words, and Jev does not write. A small, separate chat model reads the goal and the chosen field and returns only the text to type.",
      show: 'input   goal, field "Where from?", page text\noutput  { "text": "Zurich" }',
      why: "The model receives the goal, the chosen field, and the page text, and must return exactly one JSON key, text. The project calls any OpenAI-compatible model here: DeepSeek by default, and Mercury in the recorded run. Anything other than a single non-empty text string is rejected and nothing is typed. CLICK and SELECT skip this step.",
      payloads: [{ label: "chat request", value: TEXT_HELPER.request }, { label: "chat response", value: TEXT_HELPER.response }],
    },
    {
      actor: "system", by: "Browser",
      title: "Type into the field",
      why: "Right before input, the executor re-checks the page fingerprint and hit-tests the saved box. If anything moved, it throws the decision away and observes again.",
      say: "Make sure the page has not shifted since the snapshot, then type. The step is logged so the next decision knows what already happened.",
      show: `history += { action: "Where from?", kind: "fill", text: "Zurich", page_changed: true }`,
      payloads: [{ label: "history entry, sent as recent_actions next time", value: history1 }],
    },
    {
      actor: "system", by: "Browser",
      title: "Snapshot again",
      say: "Every action changes the page, so look again. Here an autocomplete list appears and pushes the numbers down: Where to? moves from 2 to 4.",
      show: "[2] Zürich, Switzerland (ZRH)  new\n[4] Where to?   was [2], same node 12",
      why: "A number only means something inside the snapshot that produced it. The executor refuses to act on a decision made against an older page and observes again instead.",
      payloads: [{ label: "index changes", value: [indexMoves(11), indexMoves(12), indexMoves(15)] }, { label: "snapshot (stays in your code)", value: snapshotData(OBSERVATIONS.suggestions) }],
    },
    jevStep({
      title: "Choose again",
      say: "Same question, new menu. Jev picks the Zurich airport suggestion, because a typed city still has to be confirmed from the list.",
      show: "operation     CLICK (0.90)\nclick_target  2 (0.88)",
      why: "The rules ask for this explicitly: a typed query still needs its matching autocomplete suggestion selected.",
      state: request2.state, questions: request2.questions, answers: STEP_2.answers,
    }),
    {
      actor: "code",
      title: "Resolve and click",
      say: "Clicking needs no words, so the chat model sits this one out. The number maps back to the suggestion, and the executor clicks it.",
      show: `click_target 2 → ${DECISION_2.actionId} (node ${DECISION_2.node})`,
      payloads: [{ label: "decision", value: decision(DECISION_2) }],
    },
  ],
  repeat: "Repeat from step 1 with a fresh snapshot: fill Where to?, pick the date, click Search. Stop when Jev answers DONE and a fresh page confirms it, when it answers BLOCKED, after three steps that leave the page unchanged, or at 60 actions.",
  outcome: "The creator's recorded Zürich to London run took 17 Jev requests and 2 chat-model calls, with a median Jev latency of 178 ms.",
  note: "Invented page and probabilities. Payload keys, numbering, and validation follow browser-use/jev-ultrafast (snapshot.js, model.py). Rule text is abbreviated.",
};
