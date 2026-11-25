export type DemoKind = "clipboard" | "graph";
export type DemoProvider = "vercel" | "openrouter";
export type DemoAvailability = Record<DemoProvider, { available: boolean; message: string }>;
export type DemoTrace = { state: unknown; questions: unknown; answers: unknown };
export type DemoResult = { value: string; steps: string[]; selected: string[]; trace?: DemoTrace[] };
export const PROMO_CUTOFF = Date.parse("2026-09-25T00:00:00Z");
export const CLIPBOARD_TEXT = "Maya Chen works at Northstar Labs. Contact Maya at maya@example.com.";
export const PASTE_SPANS = ["Maya Chen", "Northstar Labs", "maya@example.com"];
export const DEMO_OPTIONS = {
  clipboard: { name: "Name", company: "Company", email: "Email", phone: "Phone" },
  graph: { recycling: "Find a battery recycler", lender: "Find a lender" },
} as const;
export const GRAPH: Record<string, { label: string; description: string; edges: Record<string, string> }> = {
  volt: { label: "Volt Motors", description: "Electric vehicle manufacturer", edges: { cell: "buys batteries from", bank: "borrows from" } },
  cell: { label: "CellWorks", description: "Battery manufacturer", edges: { loop: "recycles used batteries with" } },
  bank: { label: "Civic Bank", description: "Business lender", edges: {} },
  loop: { label: "ReLoop", description: "Battery recycling company", edges: {} },
};

export function isDemoOption(kind: unknown, option: unknown): kind is DemoKind {
  return typeof kind === "string" && Object.hasOwn(DEMO_OPTIONS, kind) &&
    typeof option === "string" && Object.hasOwn(DEMO_OPTIONS[kind as DemoKind], option);
}

// Hand-authored teaching examples. Never labeled as a cached/model response.
export function sampleResult(kind: DemoKind, option: string): DemoResult {
  if (kind === "clipboard") {
    const index = ["name", "company", "email"].indexOf(option);
    const span = PASTE_SPANS[index];
    return span
      ? { value: span, selected: [span], steps: ["Choose the matching source span.", "Verify that it answers the field.", "Copy the original text into the preview."] }
      : { value: "No supported value", selected: [], steps: ["The source has no phone number.", "Leave the field empty."] };
  }
  const selected = option === "lender" ? ["volt", "bank"] : ["volt", "cell", "loop"];
  return {
    value: GRAPH[selected.at(-1)!].label,
    selected,
    steps: [...selected.slice(0, -1).map((id, i) => `${GRAPH[id].label} → ${GRAPH[selected[i + 1]].label}`), "Check the destination against the goal before accepting it."],
  };
}

export function isDemoResult(value: unknown): value is DemoResult {
  if (!value || typeof value !== "object") return false;
  const v = value as DemoResult;
  if (v.trace !== undefined && (!Array.isArray(v.trace) || v.trace.length > 3 || JSON.stringify(v.trace).length > 30_000 ||
    !v.trace.every(item => item && typeof item === "object" && "state" in item && "questions" in item && "answers" in item))) return false;
  return typeof v.value === "string" && v.value.length < 300 &&
    Array.isArray(v.steps) && v.steps.length <= 10 && v.steps.every(s => typeof s === "string" && s.length < 300) &&
    Array.isArray(v.selected) && v.selected.length <= 4 && v.selected.every(s => typeof s === "string" && s.length < 100);
}
