import { ArticleTerm } from "../ArticleTerm";

const TERMS = {
  prefill: {
    name: "Prefill",
    definition: "The model's initial pass over the prompt, before it starts generating an answer.",
    detail: "This pass also produces the scores used to choose the first output token. Later decode steps can reuse the prompt's cached attention information.",
    url: "https://huggingface.co/docs/transformers/main/cache_explanation",
  },
  cache: {
    name: "KV cache",
    definition: "Stored keys and values from attention layers, reused when processing later tokens.",
    detail: "Think of it as intermediate model calculations kept in memory. It saves recalculating earlier tokens. The newest token still goes through the model and reads from that history.",
    url: "https://huggingface.co/docs/transformers/main/cache_explanation",
  },
  logits: {
    name: "Logits",
    definition: "Raw model scores before they are converted into probabilities.",
    detail: "A language-model head produces a score for each vocabulary token. Direct label scoring selects the scores for allowed answers, such as A, B, and C. Softmax converts those selected scores into numbers that sum to one. This normalization alone does not prove calibration.",
    url: "https://docs.vllm.ai/en/latest/serving/online_serving/generative_scoring/",
  },
  head: {
    name: "Language-model head",
    definition: "The output layer that converts a Transformer's internal representation into vocabulary scores.",
    detail: "The Transformer produces a hidden-state vector. The head projects that vector to one score per vocabulary token. You can use those scores to choose the next text token or to compare a small set of answer labels.",
    url: "https://huggingface.co/docs/transformers/model_doc/qwen2",
  },
  rlcd: {
    name: "RLCD",
    definition: "Reinforcement Learning for Calibrated Decisions: training aimed at useful decisions and reliable probabilities.",
    detail: "A probability of 80% should correspond to events that happen about 80% of the time across many comparable cases. That objective needs training and evaluation; formatting an answer as a probability does not achieve it by itself. TypeSafe has not published Jev's full reward and update recipe.",
    url: "https://docs.typesafe.ai/introduction/machine-learning-primer",
  },
} as const;

export function JevTerm({ name, children }: { name: keyof typeof TERMS; children?: string }) {
  const entry = TERMS[name];
  return <ArticleTerm term={entry.name} label={children ?? entry.name} definition={entry.definition}>
    <p>{entry.detail}</p>
    <p><a href={entry.url}>Read the reference</a></p>
  </ArticleTerm>;
}
