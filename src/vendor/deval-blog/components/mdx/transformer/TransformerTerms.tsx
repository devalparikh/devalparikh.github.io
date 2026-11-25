import { ArticleTerm } from "../ArticleTerm";

const TERMS = {
  hidden: {
    label: "hidden states", title: "Hidden state",
    definition: "A token position's current vector inside the model.",
    detail: "Each layer updates the representations it receives. A layer's output contains one vector per token position. The next layer takes those vectors as input. Final hidden states are the sequence after the last layer; selecting its last position gives one vector.",
    source: "https://huggingface.co/docs/transformers/main/en/main_classes/output",
  },
  logits: {
    label: "logits", title: "Logits",
    definition: "Raw scores for possible next tokens, before conversion into probabilities.",
    detail: "The language-model head projects a hidden-state vector to vocabulary scores. Softmax turns scores into a probability distribution. Decoding can take the highest-probability token or sample from the distribution, often after adjustments such as temperature.",
    source: "https://huggingface.co/docs/transformers/main/en/main_classes/text_generation",
  },
  mlp: {
    label: "MLP", title: "Feed-forward network (MLP)",
    definition: "The part of a Transformer block that transforms each position's features after attention mixes information across positions.",
    detail: "MLP stands for multilayer perceptron. Within one Transformer block, the same feed-forward weights are applied to every position separately. Common variants expand the vector into a larger intermediate space, apply nonlinear operations, then project back to the model's width.",
    source: "https://arxiv.org/html/1706.03762v7",
  },
  cache: {
    label: "KV cache", title: "KV cache",
    definition: "The keys and values saved for processed token positions at each attention layer.",
    detail: "Each sequence has a logical history at every layer. New queries can use old keys and values, while each processed new token contributes its own K/V. A normal cache does not store all old queries or every hidden state. Servers may reuse compatible prefix blocks across requests.",
    source: "https://huggingface.co/docs/transformers/v5.15.1/cache_explanation",
  },
} as const;

export function TransformerTerm({ name }: { name: keyof typeof TERMS }) {
  const term = TERMS[name];
  return <ArticleTerm term={term.title} label={term.label} definition={term.definition}>
    <p>{term.detail}</p>
    <p><a href={term.source}>Read the reference</a></p>
  </ArticleTerm>;
}
