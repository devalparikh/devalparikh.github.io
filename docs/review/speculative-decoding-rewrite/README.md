# Speculative decoding rewrite: review screenshots

Screenshots of the rewritten post at `/writing/speculative-decoding/`, taken in headless Chrome (device scale 2, WebP) from the production build (`npm run build`, `./out`). The "before" shots come from `origin/gh-pages` at `a4238a10`, the deployed build of `origin/main` `5c757271`. Figures are shown as final stills with `prefers-reduced-motion: reduce`, except the motion frames.

- [Post, scrolled section by section](#post-390x844)
- [Each visual at 320, 390 and 1440, light and dark](#visuals)
- [Interaction states](#interaction-states)
- [Motion](#motion)
- [Cover on the shelf](#cover-on-the-shelf)
- [Before: the old post and visuals](#before-origin-main)
- [Final post text](#final-post-text)

## Post, 390x844

One viewport per screen, starting at each `##` heading. The sampling disclosure is closed, as a reader first sees it.

**after-post-390-01.webp** — Opening

<img src="after-post-390-01.webp" alt="New post, 390x844: Opening" width="390">

**after-post-390-02.webp** — The two models

<img src="after-post-390-02.webp" alt="New post, 390x844: The two models" width="390">

**after-post-390-03.webp** — Prefill, step by step

<img src="after-post-390-03.webp" alt="New post, 390x844: Prefill, step by step" width="390">

**after-post-390-04.webp** — Prefill, step by step (cont.)

<img src="after-post-390-04.webp" alt="New post, 390x844: Prefill, step by step (cont.)" width="390">

**after-post-390-05.webp** — Prefill, step by step (cont.)

<img src="after-post-390-05.webp" alt="New post, 390x844: Prefill, step by step (cont.)" width="390">

**after-post-390-06.webp** — Decode: one pass per token

<img src="after-post-390-06.webp" alt="New post, 390x844: Decode: one pass per token" width="390">

**after-post-390-07.webp** — Speculative decoding: prefill over the draft

<img src="after-post-390-07.webp" alt="New post, 390x844: Speculative decoding: prefill over the draft" width="390">

**after-post-390-08.webp** — Speculative decoding: prefill over the draft (cont.)

<img src="after-post-390-08.webp" alt="New post, 390x844: Speculative decoding: prefill over the draft (cont.)" width="390">

**after-post-390-09.webp** — Checking the guesses

<img src="after-post-390-09.webp" alt="New post, 390x844: Checking the guesses" width="390">

**after-post-390-10.webp** — Checking the guesses (cont.)

<img src="after-post-390-10.webp" alt="New post, 390x844: Checking the guesses (cont.)" width="390">

**after-post-390-11.webp** — Checking the guesses (cont.)

<img src="after-post-390-11.webp" alt="New post, 390x844: Checking the guesses (cont.)" width="390">

**after-post-390-12.webp** — The KV cache through one round

<img src="after-post-390-12.webp" alt="New post, 390x844: The KV cache through one round" width="390">

**after-post-390-13.webp** — The KV cache through one round (cont.)

<img src="after-post-390-13.webp" alt="New post, 390x844: The KV cache through one round (cont.)" width="390">

**after-post-390-14.webp** — Why checking 5 tokens costs about one pass

<img src="after-post-390-14.webp" alt="New post, 390x844: Why checking 5 tokens costs about one pass" width="390">

**after-post-390-15.webp** — Why checking 5 tokens costs about one pass (cont.)

<img src="after-post-390-15.webp" alt="New post, 390x844: Why checking 5 tokens costs about one pass (cont.)" width="390">

**after-post-390-16.webp** — Why checking 5 tokens costs about one pass (cont.)

<img src="after-post-390-16.webp" alt="New post, 390x844: Why checking 5 tokens costs about one pass (cont.)" width="390">

**after-post-390-17.webp** — How much faster

<img src="after-post-390-17.webp" alt="New post, 390x844: How much faster" width="390">

**after-post-390-18.webp** — How much faster (cont.)

<img src="after-post-390-18.webp" alt="New post, 390x844: How much faster (cont.)" width="390">

**after-post-390-19.webp** — When it doesn't help

<img src="after-post-390-19.webp" alt="New post, 390x844: When it doesn't help" width="390">

**after-post-390-20.webp** — Other ways to get the guesses

<img src="after-post-390-20.webp" alt="New post, 390x844: Other ways to get the guesses" width="390">

**after-post-390-21.webp** — Sources

<img src="after-post-390-21.webp" alt="New post, 390x844: Sources" width="390">

## Visuals

### Causal mask, regular prefill

| | light | dark |
|---|---|---|
| 320 | <img src="after-fig-prefill-mask-320-light.webp" alt="prefill-mask, 320x568, light, final still" width="260"> | <img src="after-fig-prefill-mask-320-dark.webp" alt="prefill-mask, 320x568, dark, final still" width="260"> |
| 390 | <img src="after-fig-prefill-mask-390-light.webp" alt="prefill-mask, 390x844, light, final still" width="260"> | <img src="after-fig-prefill-mask-390-dark.webp" alt="prefill-mask, 390x844, dark, final still" width="260"> |
| 1440 | <img src="after-fig-prefill-mask-1440-light.webp" alt="prefill-mask, 1440x900, light, final still" width="260"> | <img src="after-fig-prefill-mask-1440-dark.webp" alt="prefill-mask, 1440x900, dark, final still" width="260"> |

### Causal mask, prefill over the draft

| | light | dark |
|---|---|---|
| 320 | <img src="after-fig-draft-mask-320-light.webp" alt="draft-mask, 320x568, light, final still" width="260"> | <img src="after-fig-draft-mask-320-dark.webp" alt="draft-mask, 320x568, dark, final still" width="260"> |
| 390 | <img src="after-fig-draft-mask-390-light.webp" alt="draft-mask, 390x844, light, final still" width="260"> | <img src="after-fig-draft-mask-390-dark.webp" alt="draft-mask, 390x844, dark, final still" width="260"> |
| 1440 | <img src="after-fig-draft-mask-1440-light.webp" alt="draft-mask, 1440x900, light, final still" width="260"> | <img src="after-fig-draft-mask-1440-dark.webp" alt="draft-mask, 1440x900, dark, final still" width="260"> |

### Centerpiece: one round, The cat sat + on the mat .

| | light | dark |
|---|---|---|
| 320 | <img src="after-fig-one-pass-check-320-light.webp" alt="one-pass-check, 320x568, light, final still" width="260"> | <img src="after-fig-one-pass-check-320-dark.webp" alt="one-pass-check, 320x568, dark, final still" width="260"> |
| 390 | <img src="after-fig-one-pass-check-390-light.webp" alt="one-pass-check, 390x844, light, final still" width="260"> | <img src="after-fig-one-pass-check-390-dark.webp" alt="one-pass-check, 390x844, dark, final still" width="260"> |
| 1440 | <img src="after-fig-one-pass-check-1440-light.webp" alt="one-pass-check, 1440x900, light, final still" width="260"> | <img src="after-fig-one-pass-check-1440-dark.webp" alt="one-pass-check, 1440x900, dark, final still" width="260"> |

### Sampling rule (inside the disclosure)

| | light | dark |
|---|---|---|
| 320 | <img src="after-fig-sampling-rule-320-light.webp" alt="sampling-rule, 320x568, light, final still" width="260"> | <img src="after-fig-sampling-rule-320-dark.webp" alt="sampling-rule, 320x568, dark, final still" width="260"> |
| 390 | <img src="after-fig-sampling-rule-390-light.webp" alt="sampling-rule, 390x844, light, final still" width="260"> | <img src="after-fig-sampling-rule-390-dark.webp" alt="sampling-rule, 390x844, dark, final still" width="260"> |
| 1440 | <img src="after-fig-sampling-rule-1440-light.webp" alt="sampling-rule, 1440x900, light, final still" width="260"> | <img src="after-fig-sampling-rule-1440-dark.webp" alt="sampling-rule, 1440x900, dark, final still" width="260"> |

### KV cache through one round

| | light | dark |
|---|---|---|
| 320 | <img src="after-fig-kv-cache-320-light.webp" alt="kv-cache, 320x568, light, final still" width="260"> | <img src="after-fig-kv-cache-320-dark.webp" alt="kv-cache, 320x568, dark, final still" width="260"> |
| 390 | <img src="after-fig-kv-cache-390-light.webp" alt="kv-cache, 390x844, light, final still" width="260"> | <img src="after-fig-kv-cache-390-dark.webp" alt="kv-cache, 390x844, dark, final still" width="260"> |
| 1440 | <img src="after-fig-kv-cache-1440-light.webp" alt="kv-cache, 1440x900, light, final still" width="260"> | <img src="after-fig-kv-cache-1440-dark.webp" alt="kv-cache, 1440x900, dark, final still" width="260"> |

### Where the time goes

| | light | dark |
|---|---|---|
| 320 | <img src="after-fig-pass-timeline-320-light.webp" alt="pass-timeline, 320x568, light, final still" width="260"> | <img src="after-fig-pass-timeline-320-dark.webp" alt="pass-timeline, 320x568, dark, final still" width="260"> |
| 390 | <img src="after-fig-pass-timeline-390-light.webp" alt="pass-timeline, 390x844, light, final still" width="260"> | <img src="after-fig-pass-timeline-390-dark.webp" alt="pass-timeline, 390x844, dark, final still" width="260"> |
| 1440 | <img src="after-fig-pass-timeline-1440-light.webp" alt="pass-timeline, 1440x900, light, final still" width="260"> | <img src="after-fig-pass-timeline-1440-dark.webp" alt="pass-timeline, 1440x900, dark, final still" width="260"> |

### Speedup calculator

| | light | dark |
|---|---|---|
| 320 | <img src="after-fig-speedup-320-light.webp" alt="speedup, 320x568, light, final still" width="260"> | <img src="after-fig-speedup-320-dark.webp" alt="speedup, 320x568, dark, final still" width="260"> |
| 390 | <img src="after-fig-speedup-390-light.webp" alt="speedup, 390x844, light, final still" width="260"> | <img src="after-fig-speedup-390-dark.webp" alt="speedup, 390x844, dark, final still" width="260"> |
| 1440 | <img src="after-fig-speedup-1440-light.webp" alt="speedup, 1440x900, light, final still" width="260"> | <img src="after-fig-speedup-1440-dark.webp" alt="speedup, 1440x900, dark, final still" width="260"> |

## Interaction states

Centerpiece steps, as selected with the step buttons (390 and 1440):

| step | 390 | 1440 |
|---|---|---|
| 1. Draft | <img src="after-state-one-pass-step1-390.webp" alt="Centerpiece, step 1 (Draft), 390px" width="240"> | <img src="after-state-one-pass-step1-1440.webp" alt="Centerpiece, step 1 (Draft), 1440px" width="360"> |
| 2. One pass | <img src="after-state-one-pass-step2-390.webp" alt="Centerpiece, step 2 (One pass), 390px" width="240"> | <img src="after-state-one-pass-step2-1440.webp" alt="Centerpiece, step 2 (One pass), 1440px" width="360"> |
| 3. Check | <img src="after-state-one-pass-step3-390.webp" alt="Centerpiece, step 3 (Check), 390px" width="240"> | <img src="after-state-one-pass-step3-1440.webp" alt="Centerpiece, step 3 (Check), 1440px" width="360"> |
| 4. Keep | <img src="after-state-one-pass-step4-390.webp" alt="Centerpiece, step 4 (Keep), 390px" width="240"> | <img src="after-state-one-pass-step4-1440.webp" alt="Centerpiece, step 4 (Keep), 1440px" width="360"> |

| example | 390 | 1440 |
|---|---|---|
| All match: 5 tokens, bonus | <img src="after-state-one-pass-all-match-390.webp" alt="Centerpiece, “All match” example, 390px" width="240"> | <img src="after-state-one-pass-all-match-1440.webp" alt="Centerpiece, “All match” example, 1440px" width="360"> |
| First guess wrong: 1 token | <img src="after-state-one-pass-first-wrong-390.webp" alt="Centerpiece, “First guess wrong” example, 390px" width="240"> | <img src="after-state-one-pass-first-wrong-1440.webp" alt="Centerpiece, “First guess wrong” example, 1440px" width="360"> |

Timeline with 16 requests batched (speculation is slower there):

<img src="after-state-timeline-16-requests-390.webp" alt="Timeline with 16 batched requests, 390px" width="300"> <img src="after-state-timeline-16-requests-1440.webp" alt="Timeline with 16 batched requests, 1440px" width="420">

Keyboard: Tab from the k = 2 bar lands on k = 3 with a visible focus ring (the bars are native buttons, so Enter and Space choose them):

<img src="after-state-speedup-keyboard-390.webp" alt="Speedup bars chosen with the keyboard (Tab, Enter): focus ring on k = 3, 390px" width="300"> <img src="after-state-speedup-keyboard-1440.webp" alt="Speedup bars chosen with the keyboard (Tab, Enter): focus ring on k = 3, 1440px" width="420">

## Motion

Motion on, 390x844. The clock waits on the first frame until most of the figure is on screen, then plays the round. Frames after scrolling the centerpiece into view:

| time | step text |
|---|---|
| 500 ms | The small model guesses 4 tokens, one quick pass each. |
| 2600 ms | The small model guesses 4 tokens, one quick pass each. |
| 4800 ms | The big model runs one prefill pass over the text plus the 4 guesses and keeps the next-token prediction at every position from “sat” on. |
| 6600 ms | The serving code compares each prediction with the guess for the same slot, left to right. |
| 9200 ms | The serving code compares each prediction with the guess for the same slot, left to right. |
| 12800 ms | Keep “on” and “the”, then the big model's “floor”: 3 tokens from one big pass. |

<img src="after-motion-one-pass-00500ms.webp" alt="500 ms" width="180"> <img src="after-motion-one-pass-02600ms.webp" alt="2600 ms" width="180"> <img src="after-motion-one-pass-04800ms.webp" alt="4800 ms" width="180"> <img src="after-motion-one-pass-06600ms.webp" alt="6600 ms" width="180"> <img src="after-motion-one-pass-09200ms.webp" alt="9200 ms" width="180"> <img src="after-motion-one-pass-12800ms.webp" alt="12800 ms" width="180">

Offscreen pause: scrolled away mid-round, waited 4 s, step unchanged (`Keep “on” and “the”, then the big model's “floor”: 3 tokens from one big pass.`): **paused**. Console errors: 0.

## Cover on the shelf

| | new | old |
|---|---|---|
| close-up, light | <img src="after-cover-light.webp" alt="New cover, close-up, light" width="200"> | <img src="before-cover-light.webp" alt="Old cover, close-up, light" width="200"> |
| close-up, dark | <img src="after-cover-dark.webp" alt="New cover, close-up, dark" width="200"> | <img src="before-cover-dark.webp" alt="Old cover, close-up, dark" width="200"> |
| shelf 1440, light | <img src="after-shelf-1440-light.webp" alt="New cover on the shelf, 1440x900, light" width="360"> | <img src="before-shelf-1440-light.webp" alt="Old cover on the shelf, 1440x900, light" width="360"> |
| shelf 1440, dark | <img src="after-shelf-1440-dark.webp" alt="New cover on the shelf, 1440x900, dark" width="360"> | <img src="before-shelf-1440-dark.webp" alt="Old cover on the shelf, 1440x900, dark" width="360"> |
| shelf 390, light | <img src="after-shelf-390-light.webp" alt="New cover on the shelf, 390x844, light" width="200"> | <img src="before-shelf-390-light.webp" alt="Old cover on the shelf, 390x844, light" width="200"> |
| shelf 390, dark | <img src="after-shelf-390-dark.webp" alt="New cover on the shelf, 390x844, dark" width="200"> | <img src="before-shelf-390-dark.webp" alt="Old cover on the shelf, 390x844, dark" width="200"> |

## Before (origin/main)

The old post at 390x844, section by section:

**before-post-390-01.webp** — Opening

<img src="before-post-390-01.webp" alt="Old post (origin/main), 390x844: Opening" width="390">

**before-post-390-02.webp** — Why text generation is slow

<img src="before-post-390-02.webp" alt="Old post (origin/main), 390x844: Why text generation is slow" width="390">

**before-post-390-03.webp** — Guess first, check together

<img src="before-post-390-03.webp" alt="Old post (origin/main), 390x844: Guess first, check together" width="390">

**before-post-390-04.webp** — What happens to a bad guess

<img src="before-post-390-04.webp" alt="Old post (origin/main), 390x844: What happens to a bad guess" width="390">

**before-post-390-05.webp** — What happens to a bad guess (cont.)

<img src="before-post-390-05.webp" alt="Old post (origin/main), 390x844: What happens to a bad guess (cont.)" width="390">

**before-post-390-06.webp** — Why the repair is needed

<img src="before-post-390-06.webp" alt="Old post (origin/main), 390x844: Why the repair is needed" width="390">

**before-post-390-07.webp** — Why the repair is needed (cont.)

<img src="before-post-390-07.webp" alt="Old post (origin/main), 390x844: Why the repair is needed (cont.)" width="390">

**before-post-390-08.webp** — Why the repair is needed (cont.)

<img src="before-post-390-08.webp" alt="Old post (origin/main), 390x844: Why the repair is needed (cont.)" width="390">

**before-post-390-09.webp** — When it is faster

<img src="before-post-390-09.webp" alt="Old post (origin/main), 390x844: When it is faster" width="390">

**before-post-390-10.webp** — Measured speedups

<img src="before-post-390-10.webp" alt="Old post (origin/main), 390x844: Measured speedups" width="390">

**before-post-390-11.webp** — The full loop

<img src="before-post-390-11.webp" alt="Old post (origin/main), 390x844: The full loop" width="390">

**before-post-390-12.webp** — Glossary

<img src="before-post-390-12.webp" alt="Old post (origin/main), 390x844: Glossary" width="390">

**before-post-390-13.webp** — Sources

<img src="before-post-390-13.webp" alt="Old post (origin/main), 390x844: Sources" width="390">

Old visuals, light and dark:

| | 390 light | 390 dark | 1440 light | 1440 dark |
|---|---|---|---|---|
| 1 | <img src="before-fig-1-390-light.webp" alt="Old visual 1, 390x844, light" width="170"> | <img src="before-fig-1-390-dark.webp" alt="Old visual 1, 390x844, dark" width="170"> | <img src="before-fig-1-1440-light.webp" alt="Old visual 1, 1440x900, light" width="170"> | <img src="before-fig-1-1440-dark.webp" alt="Old visual 1, 1440x900, dark" width="170"> |
| 2 | <img src="before-fig-2-390-light.webp" alt="Old visual 2, 390x844, light" width="170"> | <img src="before-fig-2-390-dark.webp" alt="Old visual 2, 390x844, dark" width="170"> | <img src="before-fig-2-1440-light.webp" alt="Old visual 2, 1440x900, light" width="170"> | <img src="before-fig-2-1440-dark.webp" alt="Old visual 2, 1440x900, dark" width="170"> |
| 3 | <img src="before-fig-3-390-light.webp" alt="Old visual 3, 390x844, light" width="170"> | <img src="before-fig-3-390-dark.webp" alt="Old visual 3, 390x844, dark" width="170"> | <img src="before-fig-3-1440-light.webp" alt="Old visual 3, 1440x900, light" width="170"> | <img src="before-fig-3-1440-dark.webp" alt="Old visual 3, 1440x900, dark" width="170"> |
| 4 | <img src="before-fig-4-390-light.webp" alt="Old visual 4, 390x844, light" width="170"> | <img src="before-fig-4-390-dark.webp" alt="Old visual 4, 390x844, dark" width="170"> | <img src="before-fig-4-1440-light.webp" alt="Old visual 4, 1440x900, light" width="170"> | <img src="before-fig-4-1440-dark.webp" alt="Old visual 4, 1440x900, dark" width="170"> |
| 5 | <img src="before-fig-5-390-light.webp" alt="Old visual 5, 390x844, light" width="170"> | <img src="before-fig-5-390-dark.webp" alt="Old visual 5, 390x844, dark" width="170"> | <img src="before-fig-5-1440-light.webp" alt="Old visual 5, 1440x900, light" width="170"> | <img src="before-fig-5-1440-dark.webp" alt="Old visual 5, 1440x900, dark" width="170"> |
| 6 | <img src="before-fig-6-390-light.webp" alt="Old visual 6, 390x844, light" width="170"> | <img src="before-fig-6-390-dark.webp" alt="Old visual 6, 390x844, dark" width="170"> | <img src="before-fig-6-1440-light.webp" alt="Old visual 6, 1440x900, light" width="170"> | <img src="before-fig-6-1440-dark.webp" alt="Old visual 6, 1440x900, dark" width="170"> |
| 7 | <img src="before-fig-7-390-light.webp" alt="Old visual 7, 390x844, light" width="170"> | <img src="before-fig-7-390-dark.webp" alt="Old visual 7, 390x844, dark" width="170"> | <img src="before-fig-7-1440-light.webp" alt="Old visual 7, 1440x900, light" width="170"> | <img src="before-fig-7-1440-dark.webp" alt="Old visual 7, 1440x900, dark" width="170"> |
| 8 | <img src="before-fig-8-390-light.webp" alt="Old visual 8, 390x844, light" width="170"> | <img src="before-fig-8-390-dark.webp" alt="Old visual 8, 390x844, dark" width="170"> | <img src="before-fig-8-1440-light.webp" alt="Old visual 8, 1440x900, light" width="170"> | <img src="before-fig-8-1440-dark.webp" alt="Old visual 8, 1440x900, dark" width="170"> |

## Final post text

The full post as committed in [`src/content/posts/speculative-decoding.mdx`](../../../src/content/posts/speculative-decoding.mdx), with each figure shown as its 390px light still.

---

# Speculative decoding


Speculative decoding makes an LLM write faster without changing what it writes. A small model guesses the next few tokens. The big model reads those guesses in one prefill pass, the same kind of pass it uses to read a prompt. The serving code keeps the guesses the big model agrees with, plus one token of the big model's own. In the two original papers this made generation 2 to 3 times faster.

The big model is a normal LLM. It isn't retrained and it gets no special prompt. The check uses something prefill already does: it predicts the next token at every position it reads.

## The two models

- **target model**: the big LLM you want answers from (a 27B model, say). Its weights and prompt don't change, and neither does its output. There is no separate verifier model; the LLM you'd run anyway does the check.
- **draft model**: a much smaller, faster model that guesses ahead (a 1.5B model from the same family, say).
  - it has to use the same tokenizer, because guesses are checked token by token
  - it can be wrong as often as it likes; a guess only becomes output once the target agrees

Pairs from the papers: Leviathan, Kalman and Matias used T5-small (77M) to draft for T5-XXL (11B), both existing checkpoints, and describe the method as working on "existing off-the-shelf models without retraining or architecture changes". Chen and coauthors at DeepMind trained a 4B draft with Chinchilla's tokenizer to draft for Chinchilla 70B.

## Prefill, step by step

Start with how the big model reads a prompt, say `The cat sat` ([prefill](https://devalparikh.me/writing/transformer-basics-prefill-and-decode/#prefill-process-the-prompt)).

During prefill the model goes through all the input tokens in parallel to fill the KV cache at each attention layer.

- each token gets its own KV cache entry at each layer
- it processes layer by layer, one after another, but within a layer all the tokens are processed in parallel
- each token can only see itself and the tokens before it, and only writes the KV cache entry for itself
  - (in layer N, a token's K and V are computed from that token's vector coming out of the layer below. That vector already mixed in the earlier tokens through the lower layers. Once written, an entry never changes.)
- each token fills the KV cache, and it also produces a prediction of the next token
  - (only at the last layer: that layer's output vector for the token goes through the output projection to get a score for every token in the vocabulary)
- if it's not the very last input token, just a token in the middle, that prediction gets discarded. Some runtimes don't even compute it.
- the very last token's prediction picks the first output token

<img src="after-fig-prefill-mask-390-light.webp" alt="prefill-mask" width="390">

### Why each token only sees the past

The root cause is causal training. The model is trained to predict each next token from only the tokens before it. (note: one pass over a training sentence gives a prediction, and a loss, at every position at once. That's called teacher forcing. It's the same per-position prediction prefill makes.)

So:

- the mask blocks future tokens, because in training a token never got to see what came after it
- each token's meaning is fixed once it's written, like writing in pen. Its K/V depend only on itself and earlier tokens, and those don't change.

Three things follow from that:

- **the KV cache**: earlier entries stay valid, so a new token only has to compute its own
- **parallel prefill**: every position's inputs are known up front, so all positions in a layer can run together
- **safe truncation**: cutting the last few entries leaves the rest exactly as they were. Speculative decoding relies on this when a guess is wrong.

## Decode: one pass per token

After prefill, decode loops one token at a time. Each step appends one token's K/V to the cache in every layer and attends over everything already there ([decode](https://devalparikh.me/writing/transformer-basics-prefill-and-decode/#decode-process-the-selected-token)):

```text
pass 1 (prefill)   reads "The cat sat"   →  keeps the prediction at "sat": "on"
pass 2 (decode)    reads "on"            →  predicts "the"
pass 3 (decode)    reads "the"           →  predicts "floor"
```

Pass 2 can't start until pass 1 has picked "on". Each pass is slow mostly because the GPU has to read every weight of the model from memory, even when only one token goes through. That cost is what speculative decoding shares across several tokens.

## Speculative decoding: prefill over the draft

In regular prefill the predictions at the middle tokens get thrown away. Speculative decoding uses them: the inference runtime compares them with the draft model's guesses.

One round:

1. the draft model guesses the next few tokens: `on the mat .` (four quick small-model passes)
2. the guesses go in as input to the big model, right after the text: `The cat sat on the mat .`
3. the big model runs prefill over it: one pass, all positions in parallel, each seeing only itself and earlier tokens and writing its own K/V
4. this time the next-token prediction at every position from "sat" on is kept
5. the runtime compares each prediction with the draft's guess for that slot
6. it keeps the matches plus one corrected token, cuts the rest, and truncates the KV cache to match

It's a prefill pass over the draft, not a decode step. The big model isn't told to stop at a wrong guess; it predicts at every position, as on any prefill. Ordinary serving-loop code does the comparing and keeps the matches plus the corrected token.

<img src="after-fig-draft-mask-390-light.webp" alt="draft-mask" width="390">

The prediction at "the" comes from `The cat sat on the` only. It's the same prediction normal decoding would make at that point, so comparing the guess against it is fair.

## Checking the guesses

<img src="after-fig-one-pass-check-390-light.webp" alt="one-pass-check" width="390">

Slot by slot, in the first example:

1. After "sat" the target predicts "on". The draft guessed "on". Keep it.
2. After "on" it predicts "the". The draft guessed "the". Keep it.
3. After "the" it predicts "floor". The draft guessed "mat". They differ, so take the target's "floor" and stop.
4. Slots 4 and 5 are dropped. Positions closer to the end have more context, and that context compounds through the layers: the position at "." read "mat" in every layer on its way up. Once "mat" is wrong, everything computed after it is built on it.

That gives `The cat sat on the floor`: three tokens for one big-model pass. Normal decoding needed three passes, a prefill and two decode steps, for the same three tokens.

The rules for one round with k guesses:

- keep guesses left to right while they match the target's prediction for their slot
- at the first difference, use the target's prediction for that slot, then stop
- if all k guesses match, also keep the prediction after the last guess (a free extra token)
- throw away everything after the first difference, including those positions' KV cache entries

So every round produces between 1 and k + 1 tokens. Even when the first guess is wrong, the target's prediction for slot 1 is still a correct next token, so the target never runs more passes than it would without a draft (Leviathan et al., section 2.1).

Every kept token was predicted by the target itself, from exactly the text before it. That's why greedy speculative decoding writes the same text as greedy normal decoding, up to floating-point rounding.

<details>
<summary>With sampling (temperature above 0)</summary>

The round above is the greedy version: the target always picks its top token, so a guess passes when it equals that token.

With sampling, the target picks at random from its probabilities, so equality isn't the right test. Both papers use the same accept/reject rule instead (Algorithm 1 in Leviathan et al., Algorithm 2 in Chen et al.):

- `p(x)`: the target's probability for token x at this slot; `q(x)`: the draft's
- if `q(x) ≤ p(x)`, accept the guess
- if `q(x) > p(x)`, accept it with probability `p(x) / q(x)`
- on a rejection, sample a replacement from `max(0, p − q)`, rescaled to add up to 1. That is the probability the draft left uncovered.
- if all k guesses pass, sample the extra token from the target's probabilities after the last guess

An example for slot 3, with made-up probabilities. The target gives floor 50%, mat 30% and rug 20%. The draft gives mat 60%, floor 20% and rug 20%.

<img src="after-fig-sampling-rule-390-light.webp" alt="sampling-rule" width="390">

The draft proposes "mat" too often (60 against 30), so half of those proposals are rejected. Every rejection is refilled with "floor", the token it proposed too rarely. The output lands on the target's own 50, 30 and 20. Both papers prove this holds for any draft model, and vLLM's docs call it lossless "up to the precision limits of hardware numerics".

</details>

## The KV cache through one round

<img src="after-fig-kv-cache-390-light.webp" alt="kv-cache" width="390">

- prefill of `The cat sat` writes K/V for all 3 tokens in every layer
- a normal decode step appends one token's K/V and attends over the cache
- the speculative pass appends K/V for the whole draft in one pass: "on", "the", "mat", "."
- on the mismatch ("mat" rejected for "floor") the runtime truncates the cache back to the accepted prefix, `The cat sat on the`, and appends the corrected token "floor". Like any newly chosen token, "floor" gets its K/V when the next pass reads it.

Truncating is safe because of causal training. The entries for `The cat sat on the` never saw "mat" or ".", so cutting those two leaves the cache exactly as normal decoding would have left it. The next round starts from "floor" with fresh guesses.

## Why checking 5 tokens costs about one pass

Every forward pass pays for two things:

- **reading the weights**: the GPU moves every weight from memory into its compute units. Paid once per pass, however many tokens go through.
- **math**: each token's vectors are multiplied by those weights. Grows with the number of tokens in the pass.

Rough numbers for a 27B model at 4 bits on a laptop GPU:

- the weights take about 16 GB, and memory bandwidth is about 300 GB/s, so reading them takes about 53 ms
- the math is about 2 operations per weight per token, so 54 billion per token. At about 10 trillion per second, that's about 5 ms.

With one token, the math finishes long before the weights finish arriving. The GPU spends most of the pass waiting on memory. That's what "decoding is memory-bandwidth bound" means. Chen et al. write that "Transformer sampling is typically memory bandwidth bound", and Hugging Face's assisted generation post says "the bottleneck in the forward pass comes from loading the model layer weights into the computation cores of your device, not from performing the computations themselves".

In the middle of a generation the cache already holds the text, so a check pass reads only the newest token and the four guesses: 5 positions, about 27 ms of math. That still fits inside the 53 ms weight read, so the pass takes about as long as a normal one. The four extra positions share that one read of the weights.

<img src="after-fig-pass-timeline-390-light.webp" alt="pass-timeline" width="390">

The draft adds its own time. A 1.5B draft at 4 bits is about 0.9 GB, so each guess costs about 3 ms and four of them about 12 ms. For this round that's about 65 ms for `on the floor`, against about 160 ms normally.

(note: prefill is the opposite case. A long prompt puts hundreds of tokens through each weight read, so the math dominates. That's why a model reads a prompt much faster per token than it writes.)

The second setting in the figure shows the limit. With 16 requests batched together, a normal step already carries 16 positions and its math outlasts the weight read. Four guesses per request make the check pass 80 positions long, and every extra position now costs real time.

## How much faster

Three numbers decide the gain:

- **acceptance rate (α)**: how often a guess matches the target. It depends on how close the two models are and on the text; code and other predictable text match more often.
- **guesses per round (k)**: more guesses can win more tokens per pass, but a guess only counts if every guess before it matched.
- **draft cost (c)**: one draft pass divided by one target pass. About 3 / 53 ≈ 0.06 in the laptop example.

If each guess matches with probability α, the expected number of tokens per target pass is (Leviathan et al., equation 1):

```text
tokens per target pass = (1 − α^(k+1)) / (1 − α)
speedup                ≈ tokens per target pass / (1 + k·c)
```

With α = 0.8, k = 4 and c = 0.06: (1 − 0.8⁵) / 0.2 = 3.36 tokens per target pass. Each round takes 1.24 target passes of time, so the speedup is about 2.7x.

<img src="after-fig-speedup-390-light.webp" alt="speedup" width="390">

What the papers measured, both at batch size 1:

- **Leviathan et al.**: T5-XXL (11B) with a T5-small (77M) draft on one TPU v4. 2.3x to 3.4x on translation and summarization, with α between 0.53 and 0.75.
- **Chen et al.**: Chinchilla 70B with a 4B draft on 16 TPU v4s and k = 4. 1.92x on XSum summaries and 2.46x on HumanEval code, with benchmark scores unchanged.

## When it doesn't help

- **busy servers**: with many requests batched, the GPU is no longer waiting on memory, so the extra positions cost real compute. vLLM recommends speculative decoding for "medium-to-low QPS (queries per second), memory-bound workloads", and TensorRT-LLM describes it as "a technique for accelerating LLM inference at low batch sizes".
- **a draft that guesses badly**: most rounds return one or two tokens and the draft's time is wasted. A bigram model used as a draft had α ≈ 0.2 in Leviathan et al., worth 1.25x at most.
- **a draft that's too slow**: a bigger draft guesses better but costs more. T5-large raised α to 0.82 yet only reached 1.7x, against 3.4x for the much smaller T5-small.
- **too many guesses**: rounds take longer and fewer guesses survive. Chen et al. found k = 3 fastest on XSum with nucleus sampling.
- **total compute**: rejected positions are wasted target math. Speculative decoding cuts the wait for each token but does more arithmetic overall (Leviathan et al., section 3.4).

## Other ways to get the guesses

The check stays the same. These change where the guesses come from:

- **prompt lookup (n-gram)**: copy the tokens that followed the same few tokens earlier in the prompt. No model at all; it helps when the output repeats the input, as in summaries and code edits.
- **Medusa**: a few extra heads on the target's last hidden state, each guessing one more position ahead. Its typical-acceptance check gives up the exact output for more speed.
- **EAGLE**: one extra decoder layer that predicts the target's next hidden state from its current hidden states and tokens, then reuses the target's output head to turn it into a guess. It keeps the standard check, so the output stays exact. It reported 2.7x to 3.5x on LLaMA2-Chat 70B.

To try it, Hugging Face transformers takes `model.generate(..., assistant_model=draft)`, vLLM takes `speculative_config={"method": "draft_model", "model": ..., "num_speculative_tokens": 4}`, and llama.cpp's `llama-server` takes a draft model with `-md`.

## Sources

- [Fast Inference from Transformers via Speculative Decoding](https://arxiv.org/abs/2211.17192), Leviathan, Kalman and Matias (2023)
- [Accelerating Large Language Model Decoding with Speculative Sampling](https://arxiv.org/abs/2302.01318), Chen, Borgeaud, Irving, Lespiau, Sifre and Jumper (2023)
- [Assisted Generation: a new direction toward low-latency text generation](https://huggingface.co/blog/assisted-generation), Hugging Face
- [Speculative decoding](https://docs.vllm.ai/en/latest/features/speculative_decoding/), vLLM documentation
- [Speculative decoding](https://nvidia.github.io/TensorRT-LLM/features/speculative-decoding.html), TensorRT-LLM documentation
- [Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads](https://arxiv.org/abs/2401.10774), Cai et al. (2024)
- [EAGLE: Speculative Sampling Requires Rethinking Feature Uncertainty](https://arxiv.org/abs/2401.15077), Li et al. (2024)

