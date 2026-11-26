# Root cause: why the first rewrite didn't land

Written before round 2, to drive it. Inputs: Deval's chat with Steve (Nov 25, 10:39 to
11:14 PM ET), his round-1 review (Nov 26, 9:18 AM), his skills in `~/src/skills`, his ViT
post in deval-blog, and his Obsidian vault (`devalparikh/Wiki`).

## What he is asking for

- Explain it the way he came to understand it in the chat. His 11:14 repeat-back is the
  explanation he wants, cleaned up lightly: "I found the way I said it up there clearer to me."
- Answer his questions in the order he asked them.
- Visuals at the level of his ViT post. The old cover back.
- No AI smells. He named three: slogan-like fragments ("Three positions, three predictions"),
  a caption that packs two ideas into one vague sentence, and a period where a comma belongs
  ("Out of 100 runs of slot 3.").

## How he learned it

The chat, in order. Each row is a question the post has to answer, in this order.

| # | His question | What clicked |
|---|---|---|
| 1 | Is the big model a special, different kind of model? | No. It's the normal LLM, with no retraining and no special prompt. Any decoder already predicts the next token at every position in one pass; usually only the last prediction is used. |
| 2 | "Is it that the big model doesn't decode token by token and can decode all the guessed tokens in parallel and compare? How would that even work in 1 pass?" | Yes. Steve's four numbered steps, then the worked example: "The cat sat" + draft "on the mat ." → the big model says "on", "the", then "floor" instead of "mat" → keep "on the floor", 3 tokens from 1 pass. It's cheap because each pass is dominated by moving the weights, so extra positions are nearly free. |
| 3 | "Is that the big model's decode step? How do you tell it to stop, how does it even know there's a difference?" | It's **prefill** over the prompt plus the draft, not decode. The model never knows. Ordinary serving-loop code compares predictions with guesses and stops at the first mismatch. ("The model does one dumb thing… a few lines of plain comparison code do the checking.") |
| 4 | "Remind me how prefill works?" | Four steps: vectors in; each layer updates all tokens at once with the causal mask; every position predicts; each layer saves K/V. Then decode: one token per pass. |
| 5 | "Wdym position 5?" | A vague label lost him. The concrete token fixed it: "the" sees only "The cat sat on the", so its prediction is what the model would say if the text stopped there. |
| 6 | "In regular prefill is the in-between prediction just discarded? Unless it's the last token… then decode on loop?" | Yes. He checked it twice ("Is that right?"). Restating and getting a yes is how he locks a step in. |
| 7 | "How does the KV cache at each layer get filled… with the cat example?" | Prefill writes K/V for The, cat, sat in every layer; decode appends one token; speculative decoding appends the whole draft in one pass and cuts back to "The cat sat on the" when "mat" loses to "floor". |
| 8 | "Processing a token only updates that token's entry… later tokens can't modify prior entries?" | Yes, plus one precision: in layer N, the K/V come from that token's own incoming vector, which already took in earlier tokens through the layers below. Entries never change. |
| 9 | "What's the root cause of it doing it this way? What's the intuition?" | Causal training: predict the next token from only the past. So the mask, so each token's meaning is fixed once written, "like writing in pen". Cache, parallel prefill and safe truncation all follow. Contrast: BERT can revise but can't cache like this. |
| 10 | "How does it handle a word whose meaning changes because of a later word?" | The first answer (bank/river, "before and after") confused him. What landed: "I saw her duck" read left to right, and the notebook you can't erase. Then his sharper restatement (word 2's KV never changes) and the honest answer: the corrected meaning lives in the later token's entry, and later steps read both. |
| 11 | His repeat-back (11:14) | Prefill fills every layer's cache in parallel, layer by layer; each token sees itself and earlier tokens and writes only its own entry; each token also predicts the next token; middle predictions are discarded; speculative decoding uses them and the runtime compares them with the draft. Plus: "tokens closer to the end have more context, compounding through layers". Two corrections: the prediction comes only after the last layer, and each layer derives its K/V from the vectors the layer below produced. |

### Patterns in what worked

- **One running example with real tokens.** "The cat sat" / "on the mat ." / "floor" carried
  every answer. Abstract labels ("position 5", "before and after") were where he got lost.
- **Numbered steps, one idea each.** Every explanation that landed was a short numbered list.
- **Answer the exact question, then one precision.** "Yes, that's right. One small precision:…"
- **Name who acts.** The model predicts. Plain code outside the model compares.
- **He learns by restating.** His restatements are the best wording, and the post should use them.
- **One everyday image tied to the mechanism.** Writing in pen; a notebook you can't erase.

## Why the first rewrite didn't land

1. **The outline wasn't his path.** Round 1 was a reference explainer: models → decode →
   mask → check → KV → sampling → bandwidth. The round-1b patch dropped his repeat-back into that
   outline instead of rebuilding around his questions. Question 3 ("is that the decode step? how
   does it know to stop?") was never posed, so its answer read as an aside.
2. **What clicked was missing.** No "I saw her duck", no notebook, no "meaning moves forward to
   later tokens", no BERT contrast, nothing on question 10. The "model doesn't know; code
   compares" answer was one sentence.
3. **AI smells in figure text.** Slogan fragments: "Three positions, three predictions.",
   "Seven positions, seven predictions in one pass.", "Same three tokens, on one shared clock.",
   "3 tokens from one big pass" as a tagline. Captions that pack two ideas: "Every position
   predicts the next token, but each sees only itself and earlier tokens…". Punctuation:
   "Out of 100 runs of slot 3. The draft's guess…".
4. **Visuals below the ViT bar.** They were HTML chip grids with small mono text, and the phone
   view reflowed the desktop grid instead of using its own composition. That caused the 320px wraps:
   "floor" and the Keep button in the centerpiece, and "floor" dropping to a new row in the KV
   figure. There was no lit active part, no routes or packets showing what moves, and the step
   text sometimes repeated the caption.
5. **The cover was redrawn unasked.** He prefers the old one.

## What his skills and preferences say

From `skills/article-writing` (SKILL.md and `references/deval-blog.md`) and
`skills/article-visuals`, with the dated feedback they record:

- Start from the reader's question and answer it early. Carry one concrete input through to a
  result.
- Anticipate the learner's follow-up questions (Nov 12): what the numbers are, where they come
  from, what is compared, what is kept.
- Plain, explicit, consistently structured (Nov 13, ViT review): name who acts, use plain
  verbs, answer shape questions, give parallel items one structure, fix every instance of a
  note.
- Build understanding before connecting concepts (Nov 19): define related terms separately,
  then connect them. Use concrete referents. Keep causal explanations as connected prose.
- Wording: short connected sentences, no em dashes inside sentences, no "it's X, not Y", no
  paired catchphrases. "A punctuation scan alone cannot fix a polished sentence that does not
  make the idea clearer."
- Visuals: one question per figure, a concrete example, the mechanism moving, the consequence
  visible without the caption. Hold the first frame until the figure is in view (Nov 13). Quiet
  connectors, rounded bends, attached to edges. The ViT figures are the current reference.
- Shared output rule: no meta labels, filler captions or self-referential tags.

## Notes style from his Obsidian vault

The vault is `devalparikh/Wiki`. Its root is `knowledge/`, which holds `.obsidian/`, wikilinks and
`.canvas` files. The public part is also synced into this site as `/notes`. Read-only; the
patterns are paraphrased here and nothing from the notes goes into the post.

- One-line definition, then an arrow flow, then a tiny example. His `head` note defines the
  term in one lowercase line, shows `shared representation -> head -> output`, then a
  three-branch ASCII tree.
- `X = Y` lines for related terms side by side (token embedding = one vector per token; text
  embedding = one vector per text).
- Vertical `↓` chains for a pipeline, one step per line (his LLM pretraining note).
- `(note: …)` asides that correct a likely misread. His durable-execution note says it isn't
  really restarting from the checkpoint; it replays with cached results.
- Sections named by job: features, limitation, retrying (when / what / how), "X vs Y".
- Issue → solution bullets (his consistent-hashing note).
- Terse lowercase bullets, concrete examples in parentheses.
- His local-LLM note already has the line this post must unpack: the draft generates N
  tokens and the big model verifies them in one pass. That's exactly the step he didn't
  understand.

## What this changes in round 2

- **Order.** The sections follow questions 1 to 11. His repeat-back is the prefill section, with
  the two corrections folded in.
- **Content added from the chat:** the decode-vs-prefill question, "the model never knows; code
  compares", the KV cache walk-through, "entries never change", causal training and writing in
  pen, "I saw her duck", the notebook, and meaning moving forward through later tokens and
  layers.
- **Language:** one idea per sentence. No slogan fragments in prose, labels or captions. Captions
  only say how to read the drawing and where it comes from.
- **Visuals:** rebuilt on the ViT pattern. SVG drawings with separate wide and phone layouts, a
  lit active part, routes and packets, numbered steps with one narration line each, and short
  muted captions. Fixed-width phone layouts so nothing wraps at 320px.
- **Cover:** the origin/main cover, unchanged.
