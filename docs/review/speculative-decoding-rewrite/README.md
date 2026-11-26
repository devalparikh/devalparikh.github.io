# Speculative decoding rewrite: review

Round 3, after Deval's Nov 26 10:44 AM review. Screenshots come from the production build (`npm run build`, `./out`) in headless Chrome at device scale 2, saved as WebP. Figures are final stills with `prefers-reduced-motion: reduce`, except the motion frames. The "before" shots come from `origin/gh-pages` `a4238a10`, the deployed build of `origin/main` `5c757271`.

- [Root cause](#root-cause) ([full analysis](ROOT-CAUSE.md))
- [Outline](#outline)
- [Before and after: visuals](#before-and-after-visuals)
- [Before and after: cover](#before-and-after-cover)
- [Hover-preview terms](#hover-preview-terms)
- [Post, 390x844](#post-390x844)
- [Each figure at 320, 390 and 1440, light and dark](#each-figure)
- [Interaction states](#interaction-states)
- [Motion](#motion)
- [Before: the old post](#before-the-old-post)
- [Final post text](#final-post-text)

## Root cause

Round 2 turned Deval's chat questions into the headings, so the page read like a transcript of how he learned it. He wants the content he learned as a notes page, like his ViT post. That means topic headings, figures and the cat / "floor" example doing the explaining, short paragraphs, and term cards for vocabulary. Everything from the chat stays covered:

- the big model is a normal LLM
- the check is a prefill pass, not decode
- plain code compares
- the KV cache appends, then truncates
- entries never change
- causal training is like writing in pen
- later words carry the meaning

The "How prefill works" section keeps his language. [ROOT-CAUSE.md](ROOT-CAUSE.md) has rounds 1 to 3.

## Outline

About 1,790 prose words, down from 3,114 in round 2.

- One round
- How prefill works
- The KV cache: append, then truncate
- Causal training: writing in pen
- Why the check costs about one decode step
- How much faster
- Other drafts
- Sources

## Before and after: visuals

| old (origin/main) | new |
|---|---|
| Serial vs speculative<br><img src="before-fig-2-1440-light.webp" alt="Old visual 2, 1440x900, light" width="320"> | One round: The cat sat + on the mat . → floor<br><img src="after-fig-one-pass-check-1440-light.webp" alt="one-pass-check, 1440x900, light, final still" width="320"> |
| Round explorer<br><img src="before-fig-5-1440-light.webp" alt="Old visual 5, 1440x900, light" width="320"> | Compare step: slot 3 differs<br><img src="after-state-one-pass-step3-1440.webp" alt="Centerpiece, step 3 (Compare), 1440px" width="320"> |
| Exactness (points)<br><img src="before-fig-6-1440-light.webp" alt="Old visual 6, 1440x900, light" width="320"> | Sampling rule, slot 3<br><img src="after-fig-sampling-rule-1440-light.webp" alt="sampling-rule, 1440x900, light, final still" width="320"> |
| Glossary<br><img src="before-fig-8-1440-light.webp" alt="Old visual 8, 1440x900, light" width="320"> | Hover-preview terms replace the glossary<br><img src="after-term-prefill-hover-1440.webp" alt="Hover card for “prefill”, 1440px" width="320"> |
| (no old equivalent)<br> | Prefill, layer by layer, with the causal mask<br><img src="after-fig-prefill-pass-1440-light.webp" alt="prefill-pass, 1440x900, light, final still" width="320"> |
| (no old equivalent)<br> | KV cache: append, check, truncate<br><img src="after-fig-kv-cache-1440-light.webp" alt="kv-cache, 1440x900, light, final still" width="320"> |
| (no old equivalent)<br> | Where the time goes<br><img src="after-fig-pass-timeline-1440-light.webp" alt="pass-timeline, 1440x900, light, final still" width="320"> |
| (no old equivalent)<br> | Speedup vs acceptance rate and k<br><img src="after-fig-speedup-1440-light.webp" alt="speedup, 1440x900, light, final still" width="320"> |

Phone widths, old vs new:

| old, 390 | new, 320 | new, 390 |
|---|---|---|
| <img src="before-fig-5-390-light.webp" alt="Old visual 5, 390x844, light" width="200"> | <img src="after-fig-one-pass-check-320-light.webp" alt="one-pass-check, 320x568, light, final still" width="200"> | <img src="after-fig-one-pass-check-390-light.webp" alt="one-pass-check, 390x844, light, final still" width="200"> |

## Before and after: cover

The drawing, motion and subtitle match origin/main exactly; only the footer's word count follows the post length.

| | old (origin/main) | now |
|---|---|---|
| close-up, light | <img src="before-cover-light.webp" alt="Old cover, close-up, light" width="200"> | <img src="after-cover-light.webp" alt="Cover close-up, light" width="200"> |
| close-up, dark | <img src="before-cover-dark.webp" alt="Old cover, close-up, dark" width="200"> | <img src="after-cover-dark.webp" alt="Cover close-up, dark" width="200"> |
| shelf 1440, light | <img src="before-shelf-1440-light.webp" alt="Old cover on the shelf, 1440x900, light" width="360"> | <img src="after-shelf-1440-light.webp" alt="Cover on the shelf, 1440x900, light" width="360"> |
| shelf 1440, dark | <img src="before-shelf-1440-dark.webp" alt="Old cover on the shelf, 1440x900, dark" width="360"> | <img src="after-shelf-1440-dark.webp" alt="Cover on the shelf, 1440x900, dark" width="360"> |
| shelf 390, light | <img src="before-shelf-390-light.webp" alt="Old cover on the shelf, 390x844, light" width="200"> | <img src="after-shelf-390-light.webp" alt="Cover on the shelf, 390x844, light" width="200"> |
| shelf 390, dark | <img src="before-shelf-390-dark.webp" alt="Old cover on the shelf, 390x844, dark" width="200"> | <img src="after-shelf-390-dark.webp" alt="Cover on the shelf, 390x844, dark" width="200"> |

## Hover-preview terms

These use the site's existing `ArticleTerm` card, the same one the ViT and Transformer posts use. Hovering with a mouse shows the card; a tap opens it as a bottom sheet on phones.

| desktop hover | phone tap |
|---|---|
| <img src="after-term-prefill-hover-1440.webp" alt="Hover card for “prefill”, 1440px" width="420"> | <img src="after-term-prefill-sheet-390.webp" alt="Tapped “prefill”: bottom sheet, 390px" width="220"> |
| <img src="after-term-kv-cache-hover-1440.webp" alt="Hover card for “KV cache”, 1440px" width="420"> | <img src="after-term-kv-cache-sheet-390.webp" alt="Tapped “KV cache”: bottom sheet, 390px" width="220"> |

## Post, 390x844

**after-post-390-01.webp**: Opening

<img src="after-post-390-01.webp" alt="New post, 390x844: Opening" width="390">

**after-post-390-02.webp**: One round

<img src="after-post-390-02.webp" alt="New post, 390x844: One round" width="390">

**after-post-390-03.webp**: One round (cont.)

<img src="after-post-390-03.webp" alt="New post, 390x844: One round (cont.)" width="390">

**after-post-390-04.webp**: How prefill works

<img src="after-post-390-04.webp" alt="New post, 390x844: How prefill works" width="390">

**after-post-390-05.webp**: How prefill works (cont.)

<img src="after-post-390-05.webp" alt="New post, 390x844: How prefill works (cont.)" width="390">

**after-post-390-06.webp**: How prefill works (cont.)

<img src="after-post-390-06.webp" alt="New post, 390x844: How prefill works (cont.)" width="390">

**after-post-390-07.webp**: The KV cache: append, then truncate

<img src="after-post-390-07.webp" alt="New post, 390x844: The KV cache: append, then truncate" width="390">

**after-post-390-08.webp**: The KV cache: append, then truncate (cont.)

<img src="after-post-390-08.webp" alt="New post, 390x844: The KV cache: append, then truncate (cont.)" width="390">

**after-post-390-09.webp**: Causal training: writing in pen

<img src="after-post-390-09.webp" alt="New post, 390x844: Causal training: writing in pen" width="390">

**after-post-390-10.webp**: Causal training: writing in pen (cont.)

<img src="after-post-390-10.webp" alt="New post, 390x844: Causal training: writing in pen (cont.)" width="390">

**after-post-390-11.webp**: Why the check costs about one decode step

<img src="after-post-390-11.webp" alt="New post, 390x844: Why the check costs about one decode step" width="390">

**after-post-390-12.webp**: Why the check costs about one decode step (cont.)

<img src="after-post-390-12.webp" alt="New post, 390x844: Why the check costs about one decode step (cont.)" width="390">

**after-post-390-13.webp**: How much faster

<img src="after-post-390-13.webp" alt="New post, 390x844: How much faster" width="390">

**after-post-390-14.webp**: How much faster (cont.)

<img src="after-post-390-14.webp" alt="New post, 390x844: How much faster (cont.)" width="390">

**after-post-390-15.webp**: Other drafts

<img src="after-post-390-15.webp" alt="New post, 390x844: Other drafts" width="390">

**after-post-390-16.webp**: Sources

<img src="after-post-390-16.webp" alt="New post, 390x844: Sources" width="390">

## Each figure

### One round

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

| state | 390 | 1440 |
|---|---|---|
| Round, step 1 (Draft) | <img src="after-state-one-pass-step1-390.webp" alt="Centerpiece, step 1 (Draft), 390px" width="220"> | <img src="after-state-one-pass-step1-1440.webp" alt="Centerpiece, step 1 (Draft), 1440px" width="340"> |
| Round, step 2 (One pass) | <img src="after-state-one-pass-step2-390.webp" alt="Centerpiece, step 2 (One pass), 390px" width="220"> | <img src="after-state-one-pass-step2-1440.webp" alt="Centerpiece, step 2 (One pass), 1440px" width="340"> |
| Round, step 3 (Compare) | <img src="after-state-one-pass-step3-390.webp" alt="Centerpiece, step 3 (Compare), 390px" width="220"> | <img src="after-state-one-pass-step3-1440.webp" alt="Centerpiece, step 3 (Compare), 1440px" width="340"> |
| Round, step 4 (Keep) | <img src="after-state-one-pass-step4-390.webp" alt="Centerpiece, step 4 (Keep), 390px" width="220"> | <img src="after-state-one-pass-step4-1440.webp" alt="Centerpiece, step 4 (Keep), 1440px" width="340"> |
| Round, all match | <img src="after-state-one-pass-all-match-390.webp" alt="Centerpiece, “All match” example, 390px" width="220"> | <img src="after-state-one-pass-all-match-1440.webp" alt="Centerpiece, “All match” example, 1440px" width="340"> |
| Round, first guess wrong | <img src="after-state-one-pass-first-wrong-390.webp" alt="Centerpiece, “First guess wrong” example, 390px" width="220"> | <img src="after-state-one-pass-first-wrong-1440.webp" alt="Centerpiece, “First guess wrong” example, 1440px" width="340"> |
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

With motion on at 390x844, the clock waits on the first frame until 75% of the drawing is on screen, and keeps playing until less than 25% shows.

| time | step |
|---|---|
| 600 ms | Draft. |
| 2800 ms | Draft. |
| 5600 ms | One pass. |
| 8400 ms | Compare. |
| 11000 ms | Keep. |
| 13600 ms | Keep. |

<img src="after-motion-one-pass-00600ms.webp" alt="600 ms" width="180"> <img src="after-motion-one-pass-02800ms.webp" alt="2800 ms" width="180"> <img src="after-motion-one-pass-05600ms.webp" alt="5600 ms" width="180"> <img src="after-motion-one-pass-08400ms.webp" alt="8400 ms" width="180"> <img src="after-motion-one-pass-11000ms.webp" alt="11000 ms" width="180"> <img src="after-motion-one-pass-13600ms.webp" alt="13600 ms" width="180">

- Offscreen: the step stayed on `Keep.` for 4 s (**paused**).
- Reduced motion: the final still (`Keep.`), with 0 Play buttons.
- Console errors: 0.

## Before: the old post

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

All old visuals (1, 3 and 4 are code blocks; 7 is the collapsed proof):

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

The full post as committed in [`src/content/posts/speculative-decoding.mdx`](../../../src/content/posts/speculative-decoding.mdx). Each figure appears as its 390px light still. Term cards appear as plain words.

---

# Speculative decoding


Speculative decoding makes an LLM write faster without changing its output. A small draft model guesses the next few tokens. The big model checks all the guesses in one prefill pass. The serving code keeps the accepted guesses and one token from the big model.

The big model is the normal LLM you'd run anyway, with no retraining and no special prompt. The draft is a much smaller model with the same tokenizer, such as a 1.5B model guessing for a 27B one from the same family.

With greedy decoding, the text stays the same. With sampling, every token keeps the big model's odds. In the two original papers, this made generation 2 to 3 times faster.

## One round

The text so far is `The cat sat`, and the draft guesses `on the mat .`.

<img src="after-fig-one-pass-check-390-light.webp" alt="one-pass-check" width="390">

The big model agrees with "on" and "the". At slot 3, it predicts "floor", not "mat". So the round keeps `on the floor`: three tokens from one big-model pass. Normal decoding needs three passes for the same three tokens.

The check is a prefill pass over the text plus the draft, not a decode step. The big model predicts the next token at each position, as it would for a prompt. It never looks for a mismatch. Ordinary serving code handles the check:

- compare each guess with the big model's prediction for the same slot
- keep guesses until the first mismatch, then use the big model's token there
- if every guess matches, also keep the prediction after the last guess
- drop the rest, then repeat from the new end

A round adds between 1 and k + 1 tokens for k guesses. It never needs more big-model passes than normal decoding (Leviathan et al., section 2.1).

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

The draft proposes "mat" too often (60 against 30). The serving code rejects half of those proposals. It replaces each one with "floor", the token the draft proposed too rarely. The output probabilities are 50, 30 and 20, matching the target. Both papers prove this holds for any draft model. vLLM's docs call it lossless "up to the precision limits of hardware numerics".

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

To see why a middle prediction is correct, take the 5th token of `The cat sat on the mat .`, which is "the". The causal mask lets "the" see only `The cat sat on the`. It can't see "mat". So the prediction at "the" is exactly what the model would say if the text stopped at "the".

<img src="after-fig-prefill-pass-390-light.webp" alt="prefill-pass" width="390">

For comparison, normal decoding writes the same three tokens one pass at a time:

```text
pass 1 (prefill)   reads "The cat sat"   →  keeps the prediction at "sat": "on"
pass 2 (decode)    reads "on"            →  predicts "the"
pass 3 (decode)    reads "the"           →  predicts "floor"
```

Prefill can run in parallel because the whole input is known. Decode can't, because each token depends on the one before it.

## The KV cache: append, then truncate

<img src="after-fig-kv-cache-390-light.webp" alt="kv-cache" width="390">

- prefill of `The cat sat` writes K and V for all three tokens, in every layer
- a normal decode step appends one token's K and V and attends over the cache
- the speculative pass appends K and V for the whole draft in one pass
- after the check, the runtime cuts the cache back to `The cat sat on the`. "floor" gets its entries on the next pass, the one that reads it.

An entry never changes once it's written. Each layer writes one entry for the current token. Later tokens only read it. That's why cutting rejected entries off the end is safe.

(note: in layer N, a token's K and V come from that token's own incoming vector. That vector already took in earlier tokens through the layers below. So earlier tokens shape it, but the K and V come from just that token.)

## Causal training: writing in pen

The root cause is causal training. The model learns to predict each token using only the tokens before it. If position 3 could see position 4, it would copy the answer. So the mask hides everything after each token. (note: feeding in the real sentence and scoring every position at once is called teacher forcing.)

So a token's meaning is fixed once it's written, like writing in pen. You look back at the page as you write each word, but you never edit an earlier one. This allows cache reuse, parallel prefill and safe truncation.

The cost is that the model can't revise its reading of an earlier word. A bidirectional model like BERT can, but it can't reuse a cache this way.

### Later words carry the meaning

Take "I saw her duck". When "duck" arrives, it could be the bird or the move. In "I saw her duck under the table", the token "under" looks back at "duck" and settles it: she ducked. The model stores that reading in "under"'s entry. The "duck" entry doesn't change.

It's a notebook you can't erase. You wrote "bank" on line 2, and on line 4 you write "(line 2 meant riverbank)". Anyone reading later reads both lines.

This compounds through the layers. Tokens near the end have more context. Each layer builds on the vectors from the layer below. The last position, where the next prediction is made, can gather the right reading of everything before it.

## Why the check costs about one decode step

Each pass pays for two things:

- **reading the weights**: once per pass, however many tokens go through
- **math**: grows with the number of tokens

For a 27B model at 4 bits on a laptop GPU, reading its 16 GB at 300 GB/s takes about 53 ms. The math is about 5 ms per token: 2 operations per weight per token, at about 10 trillion operations per second.

So a one-token step mostly waits on memory. Decoding is memory-bandwidth bound. Chen et al. put it as "Transformer sampling is typically memory bandwidth bound".

Mid-generation, the check pass reads the newest token and four guesses: 5 positions, about 27 ms of math. That still fits inside the 53 ms weight read, so the check costs about one normal pass.

<img src="after-fig-pass-timeline-390-light.webp" alt="pass-timeline" width="390">

With 16 requests batched, the math already outlasts the weight read. Each extra position then takes more time. Under that load, speculation slows decoding.

## How much faster

Speedup depends on three numbers:

- **acceptance rate (α)**: how often a guess matches
- **guesses per round (k)**: a guess only counts if every guess before it matched
- **draft cost (c)**: draft pass time divided by big-model pass time, about 3 / 53 ≈ 0.06 here

```text
tokens per big pass = (1 − α^(k+1)) / (1 − α)
speedup             ≈ tokens per big pass / (1 + k·c)
```

With α = 0.8, k = 4 and c = 0.06, that's 3.36 tokens per big pass in 1.24 pass-times, about 2.7x (Leviathan et al., equation 1).

<img src="after-fig-speedup-390-light.webp" alt="speedup" width="390">

Measured at batch size 1:

- **Leviathan et al.**: T5-XXL (11B) with a T5-small (77M) draft, 2.3x to 3.4x on translation and summarization
- **Chen et al.**: Chinchilla 70B with a 4B draft, 1.92x on XSum and 2.46x on HumanEval, with benchmark scores unchanged

What limits the speedup:

- **the server is busy**: vLLM recommends it for "medium-to-low QPS (queries per second), memory-bound workloads", and TensorRT-LLM calls it "a technique for accelerating LLM inference at low batch sizes"
- **the draft guesses badly**: a bigram draft had α ≈ 0.2 in Leviathan et al., worth 1.25x at most
- **the draft is too slow**: T5-large raised α to 0.82 but reached only 1.7x, against 3.4x for T5-small
- **k is too large**: Chen et al. found k = 3 fastest on XSum with nucleus sampling

Rejected positions are wasted math, so total compute goes up even as each token arrives sooner (Leviathan et al., section 3.4).

## Other drafts

- **prompt lookup (n-gram)**: copy the tokens that followed the same few tokens earlier in the prompt. No draft model. It helps when the output repeats the input, as in summaries and code edits.
- **Medusa**: a few extra heads on the big model's last hidden state, each guessing one more position ahead. Its typical-acceptance check gives up the exact output for more speed.
- **EAGLE**: one extra decoder layer that predicts the big model's next hidden state, then reuses the big model's output head. It keeps the standard check, so the output stays exact. It reported 2.7x to 3.5x on LLaMA2-Chat 70B.

To try it, Hugging Face transformers takes `model.generate(..., assistant_model=draft)`, vLLM takes `speculative_config={"method": "draft_model", "model": ..., "num_speculative_tokens": 4}`, and llama.cpp's `llama-server` takes a draft model with `-md`.

## Sources

- [Fast Inference from Transformers via Speculative Decoding](https://arxiv.org/abs/2211.17192), Leviathan, Kalman and Matias (2023)
- [Accelerating Large Language Model Decoding with Speculative Sampling](https://arxiv.org/abs/2302.01318), Chen, Borgeaud, Irving, Lespiau, Sifre and Jumper (2023)
- [Assisted Generation: a new direction toward low-latency text generation](https://huggingface.co/blog/assisted-generation), Hugging Face
- [Speculative decoding](https://docs.vllm.ai/en/latest/features/speculative_decoding/), vLLM documentation
- [Speculative decoding](https://nvidia.github.io/TensorRT-LLM/features/speculative-decoding.html), TensorRT-LLM documentation
- [Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads](https://arxiv.org/abs/2401.10774), Cai et al. (2024)
- [EAGLE: Speculative Sampling Requires Rethinking Feature Uncertainty](https://arxiv.org/abs/2401.15077), Li et al. (2024)

