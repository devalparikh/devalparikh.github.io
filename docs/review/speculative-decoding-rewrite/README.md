# Speculative decoding rewrite: review

Round 2, after Deval's Nov 26 review. Screenshots come from the production build (`npm run build`, `./out`) in headless Chrome at device scale 2, saved as WebP. Figures are final stills with `prefers-reduced-motion: reduce`, except the motion frames. The "before" shots come from `origin/gh-pages` `a4238a10`, the deployed build of `origin/main` `5c757271`.

- [Root cause](#root-cause) ([full analysis](ROOT-CAUSE.md))
- [Before and after: visuals](#before-and-after-visuals)
- [Before and after: cover](#before-and-after-cover)
- [Post, 390x844](#post-390x844)
- [Each figure at 320, 390 and 1440, light and dark](#each-figure)
- [Interaction states](#interaction-states)
- [Motion](#motion)
- [Before: the old post](#before-the-old-post)
- [Final post text](#final-post-text)

## Root cause

Round 1 was a reference explainer. Deval learned this in a chat, one question at a time, around one example ("The cat sat", the draft "on the mat .", "floor"), and he locked in each step by restating it. The rewrite follows that path:

1. Is the big model a special model? (no, a normal LLM)
2. How can one pass check all the guesses? (the cat example)
3. Is that the decode step? Who tells it to stop? (prefill; plain code compares)
4. How prefill works (his own 11:14 explanation, with the two corrections)
5. The KV cache, with the cat example
6. Does a later token ever change an earlier entry?
7. Why it works this way (causal training, writing in pen)
8. What if a later word changes the meaning? ("I saw her duck", the notebook you can't erase)
9. Then the cost, the speedup, and the limits

Language: no slogan fragments, one idea per sentence in captions and narration, and the comma fix he asked for. Visuals: rebuilt on his ViT post's figure pattern. Cover: back to the origin/main drawing. [ROOT-CAUSE.md](ROOT-CAUSE.md) has the full analysis with his questions, what clicked, his skills and his vault's notes style.

## Before and after: visuals

| old (origin/main) | new |
|---|---|
| Serial vs speculative<br><img src="before-fig-2-1440-light.webp" alt="Old visual 2, 1440x900, light" width="320"> | One round: The cat sat + on the mat . → floor<br><img src="after-fig-one-pass-check-1440-light.webp" alt="one-pass-check, 1440x900, light, final still" width="320"> |
| Round explorer<br><img src="before-fig-5-1440-light.webp" alt="Old visual 5, 1440x900, light" width="320"> | Compare step: slot 3 differs<br><img src="after-state-one-pass-step3-1440.webp" alt="Centerpiece, step 3 (Compare), 1440px" width="320"> |
| Exactness (points)<br><img src="before-fig-6-1440-light.webp" alt="Old visual 6, 1440x900, light" width="320"> | Sampling rule, slot 3 out of 100 runs<br><img src="after-fig-sampling-rule-1440-light.webp" alt="sampling-rule, 1440x900, light, final still" width="320"> |
| Glossary<br><img src="before-fig-8-1440-light.webp" alt="Old visual 8, 1440x900, light" width="320"> | Prefill, layer by layer, with the causal mask (new; terms are now defined in the text)<br><img src="after-fig-prefill-pass-1440-light.webp" alt="prefill-pass, 1440x900, light, final still" width="320"> |
| (no old equivalent)<br> | KV cache: append, check, truncate<br><img src="after-fig-kv-cache-1440-light.webp" alt="kv-cache, 1440x900, light, final still" width="320"> |
| (no old equivalent)<br> | Where the time goes<br><img src="after-fig-pass-timeline-1440-light.webp" alt="pass-timeline, 1440x900, light, final still" width="320"> |
| (no old equivalent)<br> | Speedup vs acceptance rate and k<br><img src="after-fig-speedup-1440-light.webp" alt="speedup, 1440x900, light, final still" width="320"> |

Phone widths, old vs new:

| old, 390 | new, 320 | new, 390 |
|---|---|---|
| <img src="before-fig-5-390-light.webp" alt="Old visual 5, 390x844, light" width="200"> | <img src="after-fig-one-pass-check-320-light.webp" alt="one-pass-check, 320x568, light, final still" width="200"> | <img src="after-fig-one-pass-check-390-light.webp" alt="one-pass-check, 390x844, light, final still" width="200"> |

## Before and after: cover

Deval preferred the old cover, so the drawing, its motion and its subtitle match origin/main exactly. Only the word count in the footer changes with the post length.

| | old (origin/main) | now |
|---|---|---|
| close-up, light | <img src="before-cover-light.webp" alt="Old cover, close-up, light" width="200"> | <img src="after-cover-light.webp" alt="Cover close-up, light" width="200"> |
| close-up, dark | <img src="before-cover-dark.webp" alt="Old cover, close-up, dark" width="200"> | <img src="after-cover-dark.webp" alt="Cover close-up, dark" width="200"> |
| shelf 1440, light | <img src="before-shelf-1440-light.webp" alt="Old cover on the shelf, 1440x900, light" width="360"> | <img src="after-shelf-1440-light.webp" alt="Cover on the shelf, 1440x900, light" width="360"> |
| shelf 1440, dark | <img src="before-shelf-1440-dark.webp" alt="Old cover on the shelf, 1440x900, dark" width="360"> | <img src="after-shelf-1440-dark.webp" alt="Cover on the shelf, 1440x900, dark" width="360"> |
| shelf 390, light | <img src="before-shelf-390-light.webp" alt="Old cover on the shelf, 390x844, light" width="200"> | <img src="after-shelf-390-light.webp" alt="Cover on the shelf, 390x844, light" width="200"> |
| shelf 390, dark | <img src="before-shelf-390-dark.webp" alt="Old cover on the shelf, 390x844, dark" width="200"> | <img src="after-shelf-390-dark.webp" alt="Cover on the shelf, 390x844, dark" width="200"> |

## Post, 390x844

One viewport per screen, starting at each `##` heading. The sampling disclosure is closed, as a reader first sees it.

**after-post-390-01.webp**: Opening

<img src="after-post-390-01.webp" alt="New post, 390x844: Opening" width="390">

**after-post-390-02.webp**: Is the big model a special model?

<img src="after-post-390-02.webp" alt="New post, 390x844: Is the big model a special model?" width="390">

**after-post-390-03.webp**: How can one pass check all the guesses?

<img src="after-post-390-03.webp" alt="New post, 390x844: How can one pass check all the guesses?" width="390">

**after-post-390-04.webp**: How can one pass check all the guesses? (cont.)

<img src="after-post-390-04.webp" alt="New post, 390x844: How can one pass check all the guesses? (cont.)" width="390">

**after-post-390-05.webp**: How can one pass check all the guesses? (cont.)

<img src="after-post-390-05.webp" alt="New post, 390x844: How can one pass check all the guesses? (cont.)" width="390">

**after-post-390-06.webp**: Is that the decode step? Who tells it to stop?

<img src="after-post-390-06.webp" alt="New post, 390x844: Is that the decode step? Who tells it to stop?" width="390">

**after-post-390-07.webp**: Is that the decode step? Who tells it to stop? (cont.)

<img src="after-post-390-07.webp" alt="New post, 390x844: Is that the decode step? Who tells it to stop? (cont.)" width="390">

**after-post-390-08.webp**: How prefill works

<img src="after-post-390-08.webp" alt="New post, 390x844: How prefill works" width="390">

**after-post-390-09.webp**: How prefill works (cont.)

<img src="after-post-390-09.webp" alt="New post, 390x844: How prefill works (cont.)" width="390">

**after-post-390-10.webp**: How prefill works (cont.)

<img src="after-post-390-10.webp" alt="New post, 390x844: How prefill works (cont.)" width="390">

**after-post-390-11.webp**: How does each layer fill its KV cache in the cat example?

<img src="after-post-390-11.webp" alt="New post, 390x844: How does each layer fill its KV cache in the cat example?" width="390">

**after-post-390-12.webp**: How does each layer fill its KV cache in the cat example? (cont.)

<img src="after-post-390-12.webp" alt="New post, 390x844: How does each layer fill its KV cache in the cat example? (cont.)" width="390">

**after-post-390-13.webp**: Why does it work this way?

<img src="after-post-390-13.webp" alt="New post, 390x844: Why does it work this way?" width="390">

**after-post-390-14.webp**: Why does it work this way? (cont.)

<img src="after-post-390-14.webp" alt="New post, 390x844: Why does it work this way? (cont.)" width="390">

**after-post-390-15.webp**: Why does it work this way? (cont.)

<img src="after-post-390-15.webp" alt="New post, 390x844: Why does it work this way? (cont.)" width="390">

**after-post-390-16.webp**: Why checking 5 tokens costs about one pass

<img src="after-post-390-16.webp" alt="New post, 390x844: Why checking 5 tokens costs about one pass" width="390">

**after-post-390-17.webp**: Why checking 5 tokens costs about one pass (cont.)

<img src="after-post-390-17.webp" alt="New post, 390x844: Why checking 5 tokens costs about one pass (cont.)" width="390">

**after-post-390-18.webp**: Why checking 5 tokens costs about one pass (cont.)

<img src="after-post-390-18.webp" alt="New post, 390x844: Why checking 5 tokens costs about one pass (cont.)" width="390">

**after-post-390-19.webp**: How much faster is it?

<img src="after-post-390-19.webp" alt="New post, 390x844: How much faster is it?" width="390">

**after-post-390-20.webp**: How much faster is it? (cont.)

<img src="after-post-390-20.webp" alt="New post, 390x844: How much faster is it? (cont.)" width="390">

**after-post-390-21.webp**: When does it stop helping?

<img src="after-post-390-21.webp" alt="New post, 390x844: When does it stop helping?" width="390">

**after-post-390-22.webp**: Where else can the guesses come from?

<img src="after-post-390-22.webp" alt="New post, 390x844: Where else can the guesses come from?" width="390">

**after-post-390-23.webp**: Sources

<img src="after-post-390-23.webp" alt="New post, 390x844: Sources" width="390">

## Each figure

### One round (centerpiece)

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

### Prefill, layer by layer

| | light | dark |
|---|---|---|
| 320 | <img src="after-fig-prefill-pass-320-light.webp" alt="prefill-pass, 320x568, light, final still" width="260"> | <img src="after-fig-prefill-pass-320-dark.webp" alt="prefill-pass, 320x568, dark, final still" width="260"> |
| 390 | <img src="after-fig-prefill-pass-390-light.webp" alt="prefill-pass, 390x844, light, final still" width="260"> | <img src="after-fig-prefill-pass-390-dark.webp" alt="prefill-pass, 390x844, dark, final still" width="260"> |
| 1440 | <img src="after-fig-prefill-pass-1440-light.webp" alt="prefill-pass, 1440x900, light, final still" width="260"> | <img src="after-fig-prefill-pass-1440-dark.webp" alt="prefill-pass, 1440x900, dark, final still" width="260"> |

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

Picked with the step and mode buttons.

| state | 390 | 1440 |
|---|---|---|
| Round, step 1 (Draft) | <img src="after-state-one-pass-step1-390.webp" alt="Centerpiece, step 1 (Draft), 390px" width="220"> | <img src="after-state-one-pass-step1-1440.webp" alt="Centerpiece, step 1 (Draft), 1440px" width="340"> |
| Round, step 2 (One pass) | <img src="after-state-one-pass-step2-390.webp" alt="Centerpiece, step 2 (One pass), 390px" width="220"> | <img src="after-state-one-pass-step2-1440.webp" alt="Centerpiece, step 2 (One pass), 1440px" width="340"> |
| Round, step 3 (Compare) | <img src="after-state-one-pass-step3-390.webp" alt="Centerpiece, step 3 (Compare), 390px" width="220"> | <img src="after-state-one-pass-step3-1440.webp" alt="Centerpiece, step 3 (Compare), 1440px" width="340"> |
| Round, step 4 (Keep) | <img src="after-state-one-pass-step4-390.webp" alt="Centerpiece, step 4 (Keep), 390px" width="220"> | <img src="after-state-one-pass-step4-1440.webp" alt="Centerpiece, step 4 (Keep), 1440px" width="340"> |
| Round, all match: 5 tokens | <img src="after-state-one-pass-all-match-390.webp" alt="Centerpiece, “All match” example, 390px" width="220"> | <img src="after-state-one-pass-all-match-1440.webp" alt="Centerpiece, “All match” example, 1440px" width="340"> |
| Round, first guess wrong: 1 token | <img src="after-state-one-pass-first-wrong-390.webp" alt="Centerpiece, “First guess wrong” example, 390px" width="220"> | <img src="after-state-one-pass-first-wrong-1440.webp" alt="Centerpiece, “First guess wrong” example, 1440px" width="340"> |
| Prefill, step 2 (Layer 1) | <img src="after-state-prefill-step2-390.webp" alt="Prefill, regular, step 2 (Layer 1), 390px" width="220"> | <img src="after-state-prefill-step2-1440.webp" alt="Prefill, regular, step 2 (Layer 1), 1440px" width="340"> |
| Prefill, step 3 (Causal mask) | <img src="after-state-prefill-step3-390.webp" alt="Prefill, regular, step 3 (Causal mask), 390px" width="220"> | <img src="after-state-prefill-step3-1440.webp" alt="Prefill, regular, step 3 (Causal mask), 1440px" width="340"> |
| Prefill, step 5 (Predict) | <img src="after-state-prefill-step5-390.webp" alt="Prefill, regular, step 5 (Predict), 390px" width="220"> | <img src="after-state-prefill-step5-1440.webp" alt="Prefill, regular, step 5 (Predict), 1440px" width="340"> |
| Prefill over the draft, causal mask | <img src="after-state-prefill-draft-mask-390.webp" alt="Prefill over the draft, step 3 (Causal mask), 390px" width="220"> | <img src="after-state-prefill-draft-mask-1440.webp" alt="Prefill over the draft, step 3 (Causal mask), 1440px" width="340"> |
| Prefill over the draft, keep | <img src="after-state-prefill-draft-keep-390.webp" alt="Prefill over the draft, step 6 (Keep), 390px" width="220"> | <img src="after-state-prefill-draft-keep-1440.webp" alt="Prefill over the draft, step 6 (Keep), 1440px" width="340"> |
| KV cache, step 1 (First pass) | <img src="after-state-kv-step1-390.webp" alt="KV cache, step 1 (First pass), 390px" width="220"> | <img src="after-state-kv-step1-1440.webp" alt="KV cache, step 1 (First pass), 1440px" width="340"> |
| KV cache, step 2 (Check) | <img src="after-state-kv-step2-390.webp" alt="KV cache, step 2 (Check), 390px" width="220"> | <img src="after-state-kv-step2-1440.webp" alt="KV cache, step 2 (Check), 1440px" width="340"> |
| KV cache, step 3 (Truncate) | <img src="after-state-kv-step3-390.webp" alt="KV cache, step 3 (Truncate), 390px" width="220"> | <img src="after-state-kv-step3-1440.webp" alt="KV cache, step 3 (Truncate), 1440px" width="340"> |
| Timing, inside a pass | <img src="after-state-timeline-inside-390.webp" alt="Timing, 1 request, step 2 (Inside a pass), 390px" width="220"> | <img src="after-state-timeline-inside-1440.webp" alt="Timing, 1 request, step 2 (Inside a pass), 1440px" width="340"> |
| Timing, 16 requests, inside a pass | <img src="after-state-timeline-16-inside-390.webp" alt="Timing, 16 requests, step 2 (Inside a pass), 390px" width="220"> | <img src="after-state-timeline-16-inside-1440.webp" alt="Timing, 16 requests, step 2 (Inside a pass), 1440px" width="340"> |
| Timing, 16 requests, result | <img src="after-state-timeline-16-result-390.webp" alt="Timing, 16 requests, step 3 (Result), 390px" width="220"> | <img src="after-state-timeline-16-result-1440.webp" alt="Timing, 16 requests, step 3 (Result), 1440px" width="340"> |
| Keyboard focus ring after Tab | <img src="after-state-keyboard-focus-390.webp" alt="Keyboard focus ring on step 2 after Tab, 390px" width="220"> | <img src="after-state-keyboard-focus-1440.webp" alt="Keyboard focus ring on step 2 after Tab, 1440px" width="340"> |

## Motion

With motion on at 390x844, the clock waits on the first frame until 75% of the drawing is on screen. It keeps playing until less than 25% shows. Frames of the round after scrolling it into view:

| time | step |
|---|---|
| 600 ms | Draft. |
| 2800 ms | Draft. |
| 5600 ms | One pass. |
| 8400 ms | Compare. |
| 11000 ms | Keep. |
| 13600 ms | Keep. |

<img src="after-motion-one-pass-00600ms.webp" alt="600 ms" width="180"> <img src="after-motion-one-pass-02800ms.webp" alt="2800 ms" width="180"> <img src="after-motion-one-pass-05600ms.webp" alt="5600 ms" width="180"> <img src="after-motion-one-pass-08400ms.webp" alt="8400 ms" width="180"> <img src="after-motion-one-pass-11000ms.webp" alt="11000 ms" width="180"> <img src="after-motion-one-pass-13600ms.webp" alt="13600 ms" width="180">

- Offscreen: scrolled away mid-loop and waited 4 s; the step stayed on `Keep.` (**paused**).
- Reduced motion: the figure shows its final still (`Keep.`), and there are 0 Play buttons.
- Console errors: 0.

## Before: the old post

The old post at 390x844, section by section:

**before-post-390-01.webp**: Opening

<img src="before-post-390-01.webp" alt="Old post (origin/main), 390x844: Opening" width="390">

**before-post-390-02.webp**: Why text generation is slow

<img src="before-post-390-02.webp" alt="Old post (origin/main), 390x844: Why text generation is slow" width="390">

**before-post-390-03.webp**: Guess first, check together

<img src="before-post-390-03.webp" alt="Old post (origin/main), 390x844: Guess first, check together" width="390">

**before-post-390-04.webp**: What happens to a bad guess

<img src="before-post-390-04.webp" alt="Old post (origin/main), 390x844: What happens to a bad guess" width="390">

**before-post-390-05.webp**: What happens to a bad guess (cont.)

<img src="before-post-390-05.webp" alt="Old post (origin/main), 390x844: What happens to a bad guess (cont.)" width="390">

**before-post-390-06.webp**: Why the repair is needed

<img src="before-post-390-06.webp" alt="Old post (origin/main), 390x844: Why the repair is needed" width="390">

**before-post-390-07.webp**: Why the repair is needed (cont.)

<img src="before-post-390-07.webp" alt="Old post (origin/main), 390x844: Why the repair is needed (cont.)" width="390">

**before-post-390-08.webp**: Why the repair is needed (cont.)

<img src="before-post-390-08.webp" alt="Old post (origin/main), 390x844: Why the repair is needed (cont.)" width="390">

**before-post-390-09.webp**: When it is faster

<img src="before-post-390-09.webp" alt="Old post (origin/main), 390x844: When it is faster" width="390">

**before-post-390-10.webp**: Measured speedups

<img src="before-post-390-10.webp" alt="Old post (origin/main), 390x844: Measured speedups" width="390">

**before-post-390-11.webp**: The full loop

<img src="before-post-390-11.webp" alt="Old post (origin/main), 390x844: The full loop" width="390">

**before-post-390-12.webp**: Glossary

<img src="before-post-390-12.webp" alt="Old post (origin/main), 390x844: Glossary" width="390">

**before-post-390-13.webp**: Sources

<img src="before-post-390-13.webp" alt="Old post (origin/main), 390x844: Sources" width="390">

All old visuals, light and dark (1, 3, 4 are code blocks; 7 is the collapsed proof):

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

The full post as committed in [`src/content/posts/speculative-decoding.mdx`](../../../src/content/posts/speculative-decoding.mdx). Each figure appears as its 390px light still.

---

# Speculative decoding


Speculative decoding makes an LLM write faster without changing its output. With greedy decoding the text is the same, and with sampling the odds of each token are the same. A small model guesses the next few tokens. The big model reads those guesses in one prefill pass. The serving code keeps the guesses the big model agrees with. It also adds one token from the big model itself. In the two original papers, this made generation 2 to 3 times faster.

## Is the big model a special model?

No. It's the normal LLM you'd run without speculative decoding. It needs no retraining or special prompt.

- **target model**: the big LLM you want answers from (a 27B model, say). Its weights and prompt don't change, and neither does its output. There is no separate verifier model.
- **draft model**: a much smaller, faster model that guesses ahead (a 1.5B model from the same family, say).
  - it has to use the same tokenizer, because guesses are checked token by token
  - it can guess wrong. A guess only becomes output once the target agrees

Leviathan, Kalman and Matias used T5-small (77M) to draft for T5-XXL (11B), both existing checkpoints. They describe the method as working on "existing off-the-shelf models without retraining or architecture changes". Chen and coauthors at DeepMind trained a 4B draft with Chinchilla's tokenizer to guess tokens for Chinchilla 70B.

(note: some variants, like Medusa and EAGLE, replace the separate draft model with small extra layers trained on top of the big model. The big model is still the normal model in those too.)

## How can one pass check all the guesses?

Any decoder LLM already predicts the next token at every position of its input, in one pass. That's how it reads a prompt. Usually the serving code uses only the last position's prediction.

Speculative decoding puts the draft's guesses into the input and uses the predictions at each of those positions:

1. the draft model guesses the next few tokens
2. the serving code adds the guesses after the text. The big model reads all of it once
3. at each position, the big model predicts the next token. The prediction after "sat" checks the guess "on", the prediction after "on" checks the guess "the", and so on.
4. the serving code keeps each guess that matches. At the first mismatch, it uses the big model's token and drops the rest

With the text `The cat sat` and the draft guess `on the mat .`:

```text
big model reads   "The cat sat on the mat ."   (one pass)

after "sat"   →  predicts "on"      draft guessed "on"    keep
after "on"    →  predicts "the"     draft guessed "the"   keep
after "the"   →  predicts "floor"   draft guessed "mat"   use "floor", stop
after "mat"   →  predicts "."       dropped
after "."     →  predicts "It"      dropped

result            "The cat sat on the floor"
```

That's three new tokens from one big-model pass. Normal decoding needs three passes for the same three tokens.

<img src="after-fig-one-pass-check-390-light.webp" alt="one-pass-check" width="390">

The pass is cheap because a pass over five tokens takes about as long as a pass over one. The chip spends most of that time reading the model's weights from memory. It reads them once either way. The numbers are in [Why checking 5 tokens costs about one pass](#why-checking-5-tokens-costs-about-one-pass).

## Is that the decode step? Who tells it to stop?

It's the prefill step, run on the text plus the draft. A decode step feeds in one token. This pass feeds in all the guesses together and gets a prediction at every position, the same way the model reads a prompt.

The big model predicts the next token at every position, just as it does during prefill. It never checks for a mismatch or stops at one.

Ordinary code in the serving loop does the checking:

- compare guess 1 with prediction 1, guess 2 with prediction 2, and so on
- at the first mismatch, stop comparing
- keep the matching guesses, plus the big model's token at the mismatch
- if every guess matches, also keep the prediction after the last guess (a free extra token)
- throw away the rest, then repeat the loop with the draft guessing from the new end

So every round adds between 1 and k + 1 tokens for k guesses. Even when the first guess is wrong, the big model's prediction for that slot is still a correct next token. The big model never runs more passes than it would without a draft (Leviathan et al., section 2.1).

Every kept token was predicted by the big model itself, from exactly the text before it. That's why greedy speculative decoding writes the same text as greedy normal decoding, up to floating-point rounding.

<details>
<summary>With sampling (temperature above 0)</summary>

In greedy decoding, the target always picks its top token. The serving code accepts a guess when it matches that token.

With sampling, the target picks at random from its probabilities, so equality isn't the right test. Both papers use the same accept/reject rule instead (Algorithm 1 in Leviathan et al., Algorithm 2 in Chen et al.):

- `p(x)`: the target's probability for token x at this slot; `q(x)`: the draft's
- if `q(x) ≤ p(x)`, accept the guess
- if `q(x) > p(x)`, accept it with probability `p(x) / q(x)`
- on a rejection, sample a replacement from `max(0, p − q)`, rescaled to add up to 1. That is the probability the draft left uncovered.
- if all k guesses pass, sample the extra token from the target's probabilities after the last guess

Suppose slot 3 has these made-up probabilities. The target gives floor 50%, mat 30% and rug 20%. The draft gives mat 60%, floor 20% and rug 20%.

<img src="after-fig-sampling-rule-390-light.webp" alt="sampling-rule" width="390">

The draft proposes "mat" too often (60 against 30). The serving code rejects half of those proposals. It replaces each one with "floor", the token the draft proposed too rarely. The output comes out at 50, 30 and 20, which are the target's own odds. Both papers prove this holds for any draft model, and vLLM's docs call it lossless "up to the precision limits of hardware numerics".

</details>

## How prefill works

During prefill, the model goes through all the input tokens in parallel to fill the KV cache at each attention layer.

- each token gets its own KV cache entry at each layer
- the model processes one layer after another. Within a layer, it processes all the tokens in parallel
- each token can only see itself and the tokens before it, and it only writes the KV cache entry for itself
  - (each layer computes its K and V from the token vectors the layer below produced, so deeper layers' entries carry more of the earlier context)
- each token fills its cache entries, and it also produces a prediction of the next token
  - (only after the last layer: the token's final vector goes through the output projection to get a score for every token in the vocabulary. The middle layers refine the vector.)
- if it's not the very last input token, just a token in the middle, that prediction gets discarded. Some runtimes don't even compute it.
- the very last token's prediction becomes the first token of the reply. After that, decode runs on a loop: feed in that token, get the next one, repeat.

Speculative decoding keeps those middle predictions:

1. the draft tokens go in as input to the big model, after the text
2. the big model runs prefill over all of it
3. the inference runtime compares each prediction with the draft's guess for that slot
4. it keeps the matching guesses up to the first mismatch

To see why a middle prediction is correct, take the 5th token of `The cat sat on the mat .`, which is "the". The mask lets "the" see only `The cat sat on the`. It can't see "mat". So the prediction at "the" is exactly what the model would say if the text stopped at "the".

<img src="after-fig-prefill-pass-390-light.webp" alt="prefill-pass" width="390">

For comparison, normal decoding writes the same three tokens one pass at a time:

```text
pass 1 (prefill)   reads "The cat sat"   →  keeps the prediction at "sat": "on"
pass 2 (decode)    reads "on"            →  predicts "the"
pass 3 (decode)    reads "the"           →  predicts "floor"
```

Pass 2 can't start until pass 1 has picked "on". Prefill can run in parallel because the whole input is already known. Decode can't, because each token depends on the one before it. Speculative decoding uses the small model's guesses so the big model can check them in parallel, the way it reads a prompt.

## How does each layer fill its KV cache in the cat example?

Every attention layer has its own KV cache. For each token, that layer saves a key ("what I contain") and a value ("what I pass along").

1. **Prefill `The cat sat`.** Each layer computes a key and a value for each of the 3 tokens at once. The cache now holds K and V for The, cat and sat. A model with 32 layers does this in all 32 caches. The last position predicts "on".
2. **Decode "on".** Only "on" goes in. Each layer computes K and V for "on" and appends them, so the cache holds The, cat, sat, on. "on" also makes a query ("what am I looking for"). Attention compares that query with all 4 cached keys and mixes their values. Nothing is recomputed for the older tokens. The output predicts "the".
3. **Speculative pass.** The cache holds `The cat sat`, and the draft is `on the mat .`. The big model appends K and V for all 4 draft tokens in one pass. The serving code rejects "mat" and uses "floor". It cuts the cache back to `The cat sat on the`. The entries for "mat" and "." are dropped. "floor" gets its entries on the next pass, the one that reads it.

<img src="after-fig-kv-cache-390-light.webp" alt="kv-cache" width="390">

### Does a later token ever change an earlier entry?

No. Processing a token writes only that token's entry, in each layer. Later tokens read earlier entries and append their own.

One precision: layer N computes a token's K and V from that token's own incoming vector. That vector already took in the earlier tokens through attention in the layers below. So the earlier tokens shape it, but the K and V come from just that token.

Once written, an entry never changes. That's why the cache stays valid. It's also why speculative decoding can safely cut rejected entries off the end: everything before the cut is unaffected.

## Why does it work this way?

The root cause is causal training. The model learns to predict the next token using only what came before.

During training, the model sees a whole sentence and predicts every next token at once. If position 3 could see position 4, it would just copy the answer. So the mask blocks every token from seeing anything after it. (note: feeding in the real training sentence and predicting every position in one pass is called teacher forcing. It's the same per-position prediction that prefill makes.)

So the model only ever learns to build each token's meaning from the past. Adding new tokens later can't change it. "cat" in "The cat" means the same whether the sentence goes on to "sat on the mat" or to "ate the fish".

It's like writing in pen. You look back at the page as you write each new word. The earlier words stay as you wrote them. So each word's K and V can be saved once and reused.

Three things follow from that one rule:

- **the KV cache**: earlier entries stay valid, so a new token only has to compute its own
- **parallel prefill**: every position's inputs are known up front, so all the positions in a layer can run together
- **safe truncation**: cutting the last few entries leaves the rest exactly as they were, which is what speculative decoding does after a wrong guess

The cost is that the model can never revise its reading of an earlier word. Bidirectional models like BERT let every token see both directions, which helps them understand text. They can't reuse a cache this way, so they're a poor fit for generating text one token at a time.

### What if a later word changes the meaning of an earlier one?

Take the sentence "I saw her duck", read left to right the way the model does:

1. "duck" arrives last. Up to "her", the model has no idea whether "duck" will be the bird or the move.
2. "duck" looks back at "I saw her" and builds a meaning for itself: an ambiguous word that could be a noun or a verb.
3. The sentence goes on: "I saw her duck under the table". The new token "under" looks back at "duck". Now the model can tell that she ducked. That reading is stored in "under"'s own entry. The "duck" entry still says "ambiguous".
4. The next prediction reads "under", which already carries "she ducked", so the model continues the right way.

If the sentence goes "I saw her duck swimming in the pond" instead, "swimming" is the token that settles it as the bird.

The earlier word's entry stays as it was. The new reading lives in the later word's entry. Every later step reads both. It's like a notebook you can't erase: you wrote "bank" on line 2, and on line 4 you write "(line 2 meant riverbank)". Anyone reading later reads both lines.

This compounds through the layers. Tokens closer to the end have more context. Each layer builds on the vectors the layer below produced. By the last position, the model can gather the right reading of everything before it. That's the only place the meaning has to be right for the next prediction.

## Why checking 5 tokens costs about one pass

Every forward pass pays for two things:

- **reading the weights**: the GPU moves every weight from memory into its compute units. This is paid once per pass, however many tokens go through.
- **math**: each token's vectors are multiplied by those weights. This grows with the number of tokens in the pass.

Rough numbers for a 27B model at 4 bits on a laptop GPU:

- the weights take about 16 GB. At a memory bandwidth of about 300 GB/s, reading them takes about 53 ms
- the math is about 2 operations per weight per token, so 54 billion per token. At about 10 trillion per second, that's about 5 ms.

With one token, the math finishes long before the weights finish arriving. The GPU spends most of the pass waiting on memory. That's what "decoding is memory-bandwidth bound" means. Chen et al. write that "Transformer sampling is typically memory bandwidth bound", and Hugging Face's assisted generation post says "the bottleneck in the forward pass comes from loading the model layer weights into the computation cores of your device, not from performing the computations themselves".

In the middle of a generation, the cache already holds the text. So a check pass reads only the newest token and the four guesses, which makes 5 positions. Their math takes about 27 ms. That still fits inside the 53 ms weight read, so the pass takes about as long as a normal one.

<img src="after-fig-pass-timeline-390-light.webp" alt="pass-timeline" width="390">

The draft adds its own time. A 1.5B draft at 4 bits takes about 0.9 GB. Each guess costs about 3 ms, so four guesses take about 12 ms. For this round, that's about 65 ms for `on the floor`, against about 160 ms normally.

(note: prefill is the opposite case. A long prompt puts hundreds of tokens through each weight read, so the math dominates. That's why a model reads a prompt much faster per token than it writes.)

The second setting in the figure shows the limit. With 16 requests batched together, a normal step already carries 16 positions and its math outlasts the weight read. Four guesses per request make the check pass 80 positions long. Each extra position now makes the pass take longer.

## How much faster is it?

Three numbers decide the gain:

- **acceptance rate (α)**: how often a guess matches the target. It depends on how close the two models are and on the text. Code and other predictable text match more often.
- **guesses per round (k)**: more guesses can yield more tokens per pass. A guess only counts if every guess before it matched.
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

## When does it stop helping?

- **busy servers**: with many requests batched, the GPU is no longer waiting on memory, so the extra positions cost real compute. vLLM recommends speculative decoding for "medium-to-low QPS (queries per second), memory-bound workloads", and TensorRT-LLM describes it as "a technique for accelerating LLM inference at low batch sizes".
- **a draft that guesses badly**: most rounds return one or two tokens and the draft's time is wasted. A bigram model used as a draft had α ≈ 0.2 in Leviathan et al., worth 1.25x at most.
- **a draft that's too slow**: a bigger draft guesses better but costs more. T5-large raised α to 0.82 yet only reached 1.7x, against 3.4x for the much smaller T5-small.
- **too many guesses**: each extra guess adds time, and a smaller share of the guesses survive. Chen et al. found k = 3 fastest on XSum with nucleus sampling.
- **total compute**: rejected positions are wasted target math. Speculative decoding cuts the wait for each token but does more arithmetic overall (Leviathan et al., section 3.4).

## Where else can the guesses come from?

Most of these keep the same check. They change where the guesses come from:

- **prompt lookup (n-gram)**: copy the tokens that followed the same few tokens earlier in the prompt. This needs no draft model. It helps when the output repeats the input, as in summaries and code edits.
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

