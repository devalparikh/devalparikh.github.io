import { CLIPBOARD_TEXT } from "@blog/lib/jev-demo";
import type { DataFlow } from "./data-flow-types";
import { jevStep, type Trace } from "./trace";

// Mirrors nomanjack/smart-paste (core.js, worker.js): choose a passage, choose its start/end
// tokens, then verify. The real extension batches every focused form field (1 to 8) into each
// of these three requests; this example follows one field, Company, for readability.

const FIELD = "Company";
const passage = "Maya Chen works at Northstar Labs.";
const passages = [
  { id: "passage_1", start: 0, end: passage.length, text: passage },
  { id: "passage_2", start: passage.length + 1, end: CLIPBOARD_TEXT.length, text: "Contact Maya at maya@example.com." },
];
const tokens = Object.fromEntries(passage.split(" ").map((word, i) => [`token_${i}`, word.replace(/\.$/, "")]));
const tokenOffsets = Object.fromEntries([...passage.matchAll(/\S+/g)].map((match, i) => [`token_${i}`, { start: match.index, end: match.index + tokens[`token_${i}`].length }]));
// The real extension describes each word option with roughly 30 characters of surrounding text,
// so repeated words stay distinguishable. state.tokens itself stays plain words; a test joins them.
const contextFor = (id: string) => {
  const { start, end } = tokenOffsets[id];
  return CLIPBOARD_TEXT.slice(Math.max(0, start - 30), Math.min(CLIPBOARD_TEXT.length, end + 30));
};
const tokenCriteria = {
  ...Object.fromEntries(Object.keys(tokens).map(id => [id, `${id}: ${tokens[id]} (context: ${contextFor(id)})`])),
  none: "No supported value",
};
const choiceAnswer = (choice: string, options: Record<string, string>) => ({ type: "choice", choice, probabilities: Object.fromEntries(Object.keys(options).map(key => [key, Number(key === choice)])), confidence: 1 });
const passageOptions = {
  ...Object.fromEntries(passages.map(p => [p.id, `${FIELD}: ${p.text}`])),
  none: "No suitable passage",
};
const candidate = { start: 19, end: 33, value: CLIPBOARD_TEXT.slice(19, 33) };

export const CLIPBOARD_FLOW: DataFlow = {
  input: { clipboard: CLIPBOARD_TEXT, destinationField: { label: FIELD, source: "Focused form field metadata" } },
  state: { field: FIELD, passages },
  questions: { passage: { type: "choice", instructions: "Which passage supports `field`? Choose none if unsupported.", criteria: passageOptions } },
  answers: { passage: choiceAnswer("passage_1", passageOptions) },
  output: { selectedPassageId: "passage_1", selectedPassage: passages[0], next: "build token candidates for request 2" },
  nextCalls: [
    {
      input: { selectedPassage: passages[0], localTokenOffsets: tokenOffsets },
      state: { field: FIELD, passageId: "passage_1", passage, tokens },
      questions: {
        start: { type: "choice", instructions: "Which token starts the value in `passage`? Choose none if unsupported.", criteria: tokenCriteria },
        end: { type: "choice", instructions: "Which token ends the value in `passage`? Choose none if unsupported.", criteria: tokenCriteria },
      },
      answers: { start: choiceAnswer("token_4", tokenCriteria), end: choiceAnswer("token_5", tokenCriteria) },
      output: { ...candidate, next: "verify the candidate before preview" },
    },
    {
      input: candidate,
      state: { field: FIELD, source: passage, candidate },
      questions: { valid: { type: "noul", instructions: "Is `candidate.value` the complete, correct value for `field`, explicitly supported by `source`?" } },
      answers: { valid: { type: "noul", noul: 0.98 } },
      output: { preview: candidate.value, sourceRange: [candidate.start, candidate.end], awaitingUserConfirmation: true, nextJevCall: null },
    },
  ],
};

export const CLIPBOARD_TRACE: Trace = {
  steps: [
    {
      actor: "code",
      title: "Split the clipboard into passages",
      say: "Code breaks the copied text into short passages and remembers where each one starts and ends in the original.",
      show: passages.map(p => `${p.id}: "${p.text}" (${p.start} to ${p.end})`).join("\n"),
      why: "The extension refuses clipboards longer than 12,000 characters. Each passage keeps its start and end offsets so the value can later be copied from the original string.",
      payloads: [{ label: "passages (stay in your code)", value: passages }],
    },
    jevStep({
      title: "Pick the passage that holds the value",
      say: "Jev picks which passage contains a value for the focused field, or answers none.",
      show: "passage  passage_1 (1.00)",
      why: "The real extension asks this same question for every focused field in the form, up to eight, plus one shared readiness check on the clipboard as a whole, all inside this one request. That keeps a paste to at most three Jev requests no matter how many fields are open. A passage only wins if it has a probability of at least 0.65 and beats the runner-up by at least 0.15; short of that, the field is left without a passage and the next two requests never run for it.",
      state: CLIPBOARD_FLOW.state, questions: CLIPBOARD_FLOW.questions, answers: CLIPBOARD_FLOW.answers,
    }),
    {
      actor: "code",
      title: "Split the passage into words",
      say: "Code splits the chosen passage into numbered words, so the next question can point at exact words.",
      show: "token_0  Maya    token_3  at\ntoken_1  Chen    token_4  Northstar\ntoken_2  works   token_5  Labs",
      why: "The real tokenizer uses the word boundaries from Intl.Segmenter and keeps at most 250 words per passage; this passage is short enough to keep every word.",
      payloads: [{ label: "tokens and their offsets (stay in your code)", value: { tokens, tokenOffsets } }],
    },
    jevStep({
      title: "Mark the first and last word",
      say: "A second request picks the first and last word of the value.",
      show: "start  token_4 Northstar (1.00)\nend    token_5 Labs (1.00)",
      why: "Each word is described with about 30 characters of surrounding text on either side, so two copies of the same word stay distinguishable. This same request batches a start and end question for every field that survived the passage stage. A pick counts only with a probability of at least 0.6 and a 0.15 margin over the runner-up.",
      state: CLIPBOARD_FLOW.nextCalls![0].state, questions: CLIPBOARD_FLOW.nextCalls![0].questions, answers: CLIPBOARD_FLOW.nextCalls![0].answers,
    }),
    {
      actor: "code",
      title: "Copy the exact text",
      say: "Code turns those two words back into character positions and copies the value straight from the clipboard. No model retypes it.",
      show: 'characters 19 to 33 → "Northstar Labs"',
      payloads: [{ label: "candidate (stays in your code)", value: candidate }],
    },
    jevStep({
      title: "Check the value",
      say: "A third request asks whether this exact text is the complete value for the field and is supported by the source.",
      show: "valid  0.98",
      why: "Verification has to clear 0.85. Email, URL, and phone fields also get a plain regex check alongside this question. A rejected or low-scoring field stays empty; nothing invents a replacement value.",
      state: CLIPBOARD_FLOW.nextCalls![1].state, questions: CLIPBOARD_FLOW.nextCalls![1].questions, answers: CLIPBOARD_FLOW.nextCalls![1].answers,
    }),
    {
      actor: "code",
      title: "Show a preview",
      say: "If the check passes, the value appears as a preview. The person decides whether to paste it.",
      show: 'preview: "Northstar Labs"',
      payloads: [{ label: "output", value: CLIPBOARD_FLOW.nextCalls![1].output }],
    },
  ],
  outcome: "The paste ends with the value waiting for approval. Focusing another field or copying new text starts again. The real extension resolves every field in the form within the same three requests.",
  note: "The copied text and probabilities are invented. The three stages, the question wording, and the thresholds (0.65 and 0.6 with a 0.15 margin, then 0.85) follow smart-paste's core.js and worker.js.",
};
