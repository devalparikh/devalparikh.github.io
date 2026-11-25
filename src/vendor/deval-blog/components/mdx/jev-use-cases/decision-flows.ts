import type { DataFlow } from "./data-flow-types";
import { GLINER_FLOW } from "./gliner-flow";
import { jevStep, type Trace } from "./trace";
import { CLIPPING_FLOW } from "./clipping-flow";

// Routing/Magic Compose is real and public: github.com/SawyerHood/sawyer-plugins,
// plugins/magic-compose (lib/router.ts, README.md). The draft, projects, models, and machine
// stats below are invented; the question set and the speculative fan-out follow that source.

const ROUTING_DRAFT = "Fix the dark mode flicker in the iOS app settings screen";
const ROUTING_GENERAL_RULES = "Prefer Opus for production bug fixes. Route anything touching the iOS app to a Mac.";

const ROUTING_PROJECTS: Record<string, string> = {
  "mobile-app": 'Repository github.com/deval/mobile-app. Folder ~/code/mobile-app on MacBook. Recent work here: "Fix dark mode toggle animation", "Update settings screen layout".',
  blog: 'Repository github.com/deval/deval-blog. Folder ~/code/deval-blog on Linux server. Recent work here: "Add habit tracker grid".',
  "No project": "No repository. For general questions, research, writing, or tasks that do not belong to any listed project.",
};

const ROUTING_MODELS: Record<string, string> = {
  "Opus (Anthropic)": "Use for production bug fixes and anything touching UI code across platforms. (Anthropic's most capable coding model.)",
  "Sonnet (Anthropic)": "Use for everyday edits and smaller fixes. (Anthropic's fast, balanced coding model.)",
};

const ROUTING_REASONING_BY_MODEL: Record<string, Record<string, string>> = {
  "Opus (Anthropic)": {
    low: "Quick, mechanical, or clearly specified work",
    medium: "Some ambiguity or a few steps, but still scoped",
    high: "Ambiguous, multi-step, architectural, or high-stakes work",
  },
  "Sonnet (Anthropic)": {
    none: "Trivial, no reasoning needed",
    low: "Quick, mechanical, or clearly specified work",
    medium: "Some ambiguity or a few steps, but still scoped",
  },
};

const ROUTING_MACHINES: Record<string, string> = {
  MacBook: "macOS (Apple Silicon), a Mac, able to build iOS and macOS apps with Xcode. CPU load is low (7% of 16 cores). memory is mostly free (41% of 32 GB used). disk has plenty of space (512 GB free). idle, no agent threads running now. the environments available here are Worktree, Project checkout.",
  "Linux server": "Linux (x86-64). CPU load is moderate (52% of 32 cores). memory is moderately used (68% of 64 GB used). disk is getting low (18 GB free). busy, 3 agent threads running now. this is the main BB server machine.",
};

const ROUTING_ENVIRONMENTS: Record<string, string> = {
  Worktree: "A fresh, isolated copy of the repository on its own branch. Best for code changes, so they cannot disturb other work in progress.",
  "Project checkout": "The project's main folder, shared with every other thread working there. Best for questions, reading code, and running things; risky for larger changes.",
};

const ROUTING_INSTRUCTIONS = {
  project: "Pick the project this task belongs in. Match what the task talks about to a project's name, repository, folder, and recent work. Follow the user's routing rules when they apply.",
  model: "Pick the AI coding model best suited to carry out this task. Use each model's description and the user's routing rules. Prefer cheaper, faster models for simple tasks and the strongest models for hard or open-ended ones.",
  reasoning: "Pick how much reasoning effort the model should spend on this task. Quick, mechanical, or clearly specified tasks need little. Ambiguous, multi-step, architectural, or high-stakes tasks need more. Follow the user's routing rules when they apply.",
  machine: "Pick the machine this task should run on. First satisfy what the task needs from the operating system (for example iOS or macOS work needs a Mac). Among machines that qualify, prefer one that is idle with low CPU load, free memory, and free disk. Follow the user's routing rules when they apply.",
  environment: "Pick the kind of workspace this task should run in. Only the environments the chosen machine can create are listed. Follow the user's routing rules when they apply.",
};

const ROUTING_INPUT = { draft: ROUTING_DRAFT, generalInstructions: ROUTING_GENERAL_RULES };

const ROUTING_STATE = { task: ROUTING_DRAFT, routing_rules_from_the_user: ROUTING_GENERAL_RULES };

const ROUTING_QUESTIONS = {
  project: { type: "choice", instructions: ROUTING_INSTRUCTIONS.project, criteria: ROUTING_PROJECTS },
  model: { type: "choice", instructions: ROUTING_INSTRUCTIONS.model, criteria: ROUTING_MODELS },
  "reasoning:0": { type: "choice", instructions: `${ROUTING_INSTRUCTIONS.reasoning}\n\nThe task will run on the model Opus (Anthropic).`, criteria: ROUTING_REASONING_BY_MODEL["Opus (Anthropic)"] },
  "reasoning:1": { type: "choice", instructions: `${ROUTING_INSTRUCTIONS.reasoning}\n\nThe task will run on the model Sonnet (Anthropic).`, criteria: ROUTING_REASONING_BY_MODEL["Sonnet (Anthropic)"] },
  "machine:0": { type: "choice", instructions: ROUTING_INSTRUCTIONS.machine, criteria: ROUTING_MACHINES },
  "environment:0": { type: "choice", instructions: `${ROUTING_INSTRUCTIONS.environment}\n\nThe task will run on the machine MacBook: ${ROUTING_MACHINES.MacBook}`, criteria: ROUTING_ENVIRONMENTS },
};

const ROUTING_ANSWERS = {
  project: { type: "choice", choice: "mobile-app", probabilities: { "mobile-app": 0.94, blog: 0.03, "No project": 0.03 }, confidence: 0.9 },
  model: { type: "choice", choice: "Opus (Anthropic)", probabilities: { "Opus (Anthropic)": 0.81, "Sonnet (Anthropic)": 0.19 }, confidence: 0.72 },
  "reasoning:0": { type: "choice", choice: "medium", probabilities: { low: 0.15, medium: 0.71, high: 0.14 }, confidence: 0.68 },
  "reasoning:1": { type: "choice", choice: "low", probabilities: { none: 0.2, low: 0.55, medium: 0.25 }, confidence: 0.5 },
  "machine:0": { type: "choice", choice: "MacBook", probabilities: { MacBook: 0.93, "Linux server": 0.07 }, confidence: 0.88 },
  "environment:0": { type: "choice", choice: "Worktree", probabilities: { Worktree: 0.85, "Project checkout": 0.15 }, confidence: 0.77 },
};

const ROUTING_KEPT = { project: "mobile-app", model: "Opus (Anthropic)", reasoning: "medium", machine: "MacBook", environment: "Worktree" };

const ROUTING_OUTPUT = {
  kept: ROUTING_KEPT,
  discardedQuestionKeys: ["reasoning:1"],
  pickers: ROUTING_KEPT,
  sendHeld: false,
  dispatch: { model: "Opus (Anthropic)", machine: "MacBook", environment: "Worktree", task: ROUTING_DRAFT },
};

// Invented inputs and answers in the native TypeSafe wire shape.
// Stable IDs make each join, rejected candidate, and downstream action inspectable.
export const DECISION_FLOWS: Record<"gliner" | "routing" | "clipping", DataFlow> = {
  gliner: GLINER_FLOW,
  routing: {
    input: ROUTING_INPUT,
    state: ROUTING_STATE,
    questions: ROUTING_QUESTIONS,
    answers: ROUTING_ANSWERS,
    output: ROUTING_OUTPUT,
  },
  clipping: CLIPPING_FLOW,
};

export const ROUTING_TRACE: Trace = {
  steps: [
    {
      actor: "code",
      title: "Remove options that cannot work",
      say: "Code drops machines that lack the project, an allowed workspace, or the model's provider. Jev only sees choices that could actually run.",
      show: "mobile-app: MacBook, Linux server\nboth run Opus and Sonnet",
      why: "This checks hard facts (holds the project, offers an allowed environment, runs the chosen provider) rather than judgment. A machine that fails any of those is never offered, and a question left with only one surviving candidate is skipped entirely.",
      payloads: [{ label: "candidates (stays in your code)", value: { projects: ROUTING_PROJECTS, models: ROUTING_MODELS, machines: ROUTING_MACHINES } }],
    },
    jevStep({
      title: "Ask every routing question at once",
      say: "While the person types, one request asks for the project, the model, the effort for each model, the machine, and the workspace.",
      show: "project        mobile-app (0.94)\nmodel          Opus (Anthropic) (0.81)\nreasoning:0    medium (0.71)\nreasoning:1    low (0.55)\nmachine:0      MacBook (0.93)\nenvironment:0  Worktree (0.85)",
      why: "Reasoning is asked once per model in the rotation before Jev knows which model will win, since the sensible effort levels depend on the model; machine and environment are asked once per distinct group of machines, since several projects can share the same hardware. Jev is weak at arithmetic, so load, memory, and disk are spelled out in words like \"CPU load is low\" with the numbers alongside. A decision like this normally takes one request and 200 to 350 milliseconds.",
      state: ROUTING_STATE, questions: ROUTING_QUESTIONS, answers: ROUTING_ANSWERS,
    }),
    {
      actor: "code",
      title: "Keep the answers that apply",
      say: "Effort was asked for every model before the model was known. Code keeps the effort for the chosen model and drops the rest.",
      show: "kept: mobile-app, Opus, medium, MacBook, Worktree\ndiscarded: reasoning:1 (Sonnet, low)",
      why: "Every dimension resolves the same way: an answer only counts if it belongs to the branch Jev actually chose elsewhere. A dimension with a single candidate was never sent to Jev and is simply filled in as that only option.",
      payloads: [{ label: "kept vs discarded", value: { kept: ROUTING_OUTPUT.kept, discarded: ROUTING_OUTPUT.discardedQuestionKeys } }],
    },
    {
      actor: "system", by: "Person",
      title: "Update the pickers and hold send",
      say: "The composer's pickers move to Jev's answers, and send stays disabled until they match the current draft. The person can change any picker.",
      show: "project    mobile-app\nmodel      Opus, medium effort\nmachine    MacBook\nworkspace  Worktree",
      why: "This is the one step a person can interrupt; every other step runs on its own as the draft changes.",
      payloads: [{ label: "pickers", value: ROUTING_OUTPUT.pickers }],
    },
    {
      actor: "model", by: "Opus · not Jev",
      title: "Run the thread",
      say: "The chosen coding model starts work on the chosen machine, in a fresh worktree.",
      show: "Opus (Anthropic) on the MacBook, in a new worktree",
      why: "Jev only chose the route; it never reads or writes the code itself.",
      payloads: [{ label: "dispatch", value: ROUTING_OUTPUT.dispatch }],
    },
  ],
  repeat: "While typing continues, the decision is asked again: at most one request in flight and at most one every 600 ms, or only after a pause in typing if the person prefers.",
  outcome: "The thread starts on Opus, on the MacBook, in a fresh worktree. Editing the draft starts a new decision.",
  note: "The draft, projects, models, and machine stats are invented; the question set, the once-per-model and once-per-machine-group grouping, and the speculative fan-out follow Magic Compose's router.ts and README at github.com/SawyerHood/sawyer-plugins, plugins/magic-compose.",
};
