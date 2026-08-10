# Art-provider bake-off

Does an API hold a character across a whole book without a human checking every
third page?

That check is the thing being priced. `docs/commerce/gtm-decision.md` measured
art at **30–60 attended minutes per order**, inside 2.2–4.3 attended hours
total, and `docs/commerce/fulfillment-playbook.md` step 22 says why: *"check
consistency every 3 pages — hair silhouette, palette, props, lighting … regenerate
anything off-model before moving on."*

That step exists because the manual ChatGPT session's consistency comes from
**conversational context, which decays**. An API's consistency comes from
**explicit reference images, which don't**. This test is whether that theory
survives contact with ten real pages.

**It is not a cost exercise.** ChatGPT Pro is $200/mo across every project and
isn't going anywhere. A whole book of API art is $1–5. If the only outcome were
saving money it wouldn't be worth running.

## Result (2026-08-09) — GPT Image 2, via fal

**An API holds a character across twenty pages.** `openai/gpt-image-2` through
fal, run `2026-08-10T01-24-39`: 20/20 pages, zero retries, zero failures,
**$5.25 and 40.3 minutes entirely unattended**.

Page 19 against page 0 — twenty pages of drift — shows nothing to point at: same
face, same braids, same coat, same brass key on red string, same boots, same
junction. Page 19 against page 9 shows nothing either, which is the measurement
a ten-page test cannot produce. The hard pages hold too: Pim returns correct
after four pages absent (13), both faces survive a shared close-up eighteen
pages after the sheet (18), identity is readable at bird's-eye scale (14), and
the second character carries pages alone at 15 and 16.

**Two defects, both on prop pages, both preventable by rule rather than by
regeneration** — see "Two authoring rules" below.

### The four-way, ten pages (`2026-08-10T00-06-01`)

| Blind | Model | Pages | Cost | Unattended | Verdict |
|---|---|---:|---:|---:|---|
| B | **GPT Image 2** | 9/10 | $2.50 | 17.8 min | **Winner** — held identity, prop, fox scale, the folded ear, and varied expression |
| A | Nano Banana Pro | 9/10 | $1.50 | 3.8 min | Strong second. 4x faster, $1 cheaper, but **frames its pages** — a deckled paper border twice, unusable full-bleed |
| D | Seedream V4 | 9/10 | $0.30 | 4.9 min | Competent and 8x cheaper. Violet tail contamination; ignores the three-pose sheet instruction; refuses camera direction away from the face |
| C | FLUX.2 pro | 7/10 | $0.40 | 2.6 min | **Disqualified.** Merged the cast — drew a wolf wearing Nila's coat, boots and key. Refused two benign pages with `content_policy_violation` |

A content refusal mid-order is an attended interruption by definition, which is
what rules FLUX out regardless of price.

**Gemini is not absent from this result.** Nano Banana Pro *is* Gemini 3 Pro
Image; fal supplies the model without the direct Google integration that was
judged not worth it. Google's own Imagen line was deprecated with shutdown on
2026-08-17 and its named replacement is that same model — so there is no
separate Imagen arm worth building.

### Two authoring rules

Both defects are generator-agnostic prompt-design faults, so these apply to the
manual ChatGPT path as much as to the API:

1. **A page whose action removes a persistent prop will render it twice.**
   Page 10 hangs the brass key on a nail while Nila is still wearing it. The
   `persistentProps` anchor says "always carries/wears" and the page action says
   "takes it off"; both win. Move the prop out of `persistentProps` for that
   page and into its `_composition`.
2. **A prop rendered with no character in frame loses its details.** Page 11
   put the key on a brown leather cord instead of the red string. The prop is
   anchored *through* the character. On any prop-only page, restate the prop's
   full description in `_composition`.

### What is still NOT answered

Everything under "What this test does NOT answer" below stands unchanged. This
was a **fictional character with no photograph**. Every real order conditions on
a buyer's child's face, which is the harder problem and the one with actual
policy exposure. Nothing here licenses pointing an API at a buyer photo — that
is phase 2, on your own child first.

Scope of the read: 11 of 20 pages inspected closely, weighted to the stress
pages, on one seed and one story.

## Run it

```bash
pnpm art:bakeoff --dry-run      # writes every prompt, zero API calls, zero spend
pnpm art:bakeoff                # every provider whose key is set
pnpm art:bakeoff --providers fal:nano-banana-pro,fal:seedream-v4
pnpm art:bakeoff --pages 0-3    # cheap smoke test before committing to all ten
```

Keys go in `.env.local` (gitignored). Set only the ones you want to race:
`FAL_KEY`, `OPENAI_API_KEY`. A provider with no key is skipped **loudly** — a
silent skip would read as a loss.

**Gemini is out** (2026-08-09, Manav's call — not worth the integration).
`providers/gemini.ts` stays in the tree unwired: it carries the model-cascade
and `candidateCount` quirks already paid for in debugging, so deleting it would
just mean rediscovering them if Google ever comes back up for discussion.

Output lands in `bakeoff-out/<timestamp>/` (gitignored). Start at
`contact-sheet.html`.

**Run it on the Mac, not in a cloud session.** Claude Code's remote container
enforces an egress allowlist and `fal.run` is not on it (HTTP 403 "Host not in
allowlist"), so the harness cannot reach any provider from there. The MacBook
or the mini both work.

### Reading a failure

All four request shapes are now proven against live endpoints, so a failure is
usually the account rather than the code:

- **403 / "Exhausted balance" / "TOP_UP"** — fal is out of credit. If this hits
  the *character sheet*, the run aborts by design: every page would otherwise
  generate unconditioned, which measures nothing, because "each page
  conditioned on that provider's own sheet" IS the method. That guard exists
  because a flapping balance once cost $4.50 of plausible, worthless art.
- **422 with `content_policy_violation`** — the model refused the prompt. Not a
  bug; record it as a finding. FLUX.2 pro does this on benign pages.
- **422 without it** — an input field name is wrong for that model family; the
  error names the function to fix (`FAL_MODELS[...].buildInput`) and the API
  page.

Smoke-test before committing to a full book: `pnpm art:bakeoff --pages 0`.

## Method

Per provider, identical prompts, identical reference order:

1. **Character sheet** generated from text alone.
2. **All ten pages**, every one conditioned on *that provider's own sheet*.

So each provider is judged against its own best reference, not a shared one.
That's deliberately generous — a provider that can't hold its own sheet has no
chance of holding a buyer's child.

## The story is a torture test, not a nice story

`story.json` has ten pages that walk the character through the axes that
actually break in production. Each page carries `_composition` (sent to the
model) and `_stressTest` (scoring note, never sent — a model told "this is the
drift check" would try harder on that page and invalidate it).

| Page | What breaks |
|---|---|
| 0 | baseline, wide, daylight |
| 1 | profile view |
| 2 | close-up face after two wide shots |
| 3 | a second character arrives |
| 4 | two characters, changed light |
| 5 | second character alone, coloured light |
| 6 | seated, from behind, at night — the hardest pose |
| 7 | rim-lit silhouette |
| 8 | two characters interacting — where limb errors appear |
| 9 | back to page-0 conditions — the ten-page drift check |
| 10 | interior — **no world anchor applies** (`_offWorld`) |
| 11 | the prop alone, no character in frame |
| 12 | occluded silhouette — hood up, braids hidden |
| 13 | second character **returns after four pages absent** |
| 14 | bird's-eye, both characters tiny |
| 15 | second character alone, late in the book |
| 16 | low camera, single character mid-action |
| 17 | sleeping pose — removes the strongest identity cue |
| 18 | both faces in one close-up, 18 pages after the sheet |
| 19 | back to page-0 conditions — **the twenty-page drift check** |

Pages 10–19 were added once the shipping length was settled at ~20. They
deliberately do not repeat the first ten's axes: they test what only a *long*
book breaks. **Page 13 is the most important of them** — a character returning
after several pages of absence is an axis a ten-page book structurally cannot
contain.

Page 19 against page 0 is the whole test in one comparison. Page 19 against
page 9 is the part a ten-page run cannot see: a short test can *eliminate* a
provider but it cannot *certify* one at shipping length.

`_offWorld: true` on a page suppresses the world anchor. Without it, the outdoor
setting block is injected under an interior composition and the model has to
resolve a contradiction — and whichever way it resolves it, you are scoring the
prompt rather than the model.

`cast.json` carries deliberately over-specified anchors (the folded left ear,
three wooden buttons, the gap between her front teeth). Vague anchors would let
every provider look equally good. **Nila's brass key on red string is the
sharpest signal**: a persistent prop is the first thing to vanish, and a prop
that vanishes on page 6 is precisely the failure the manual every-3-pages check
is paid to catch.

## Score it blind, then unblind

Providers are shuffled behind A/B/C. The mapping is in `KEY.json`, which the
contact sheet never reads. **Score first.** You already have a hypothesis; this
is the cheap way to stop it from confirming itself.

Three questions per column, in order:

1. **Identity** — same girl on page 9 as page 0? Face, braids, coat?
2. **The prop** — is the key on its red string on every page she appears?
3. **Style** — still watercolour and ink on page 9, or drifted to digital gloss?

**A column only wins if you'd have shipped all ten pages with zero
regenerations.** Anything less means the human check survives, and the human
check is the entire cost.

The contact sheet also reports unattended minutes, retries, and failures per
provider. Those matter less than consistency but they're free to collect.

## What this test does NOT answer

**Likeness from a buyer's photo.** Every custom order conditions on a real
child's photograph, and this test uses a fictional character with no photo. That
is the harder problem and the one with actual policy exposure — minors' likeness
is the highest-scrutiny category in every provider's terms, and an account
suspension in December would cost more than every efficiency here combined.

Phase 2, only after a provider wins this round: rerun with a photo of **your own
child**, which you can consent to yourself, and read that provider's terms
before any buyer photo goes near it. Do not skip to buyer photos because phase 1
looked good.

## Adding a provider

`scripts/art-bakeoff/providers/` — implement the `Provider` interface in
`types.ts`. For another fal model it's one entry in `FAL_MODELS`, which is the
main argument for fal as the integration layer regardless of which model wins.

**Reference order is load-bearing.** Character sheets first, style refs after;
the prompt tells the model "the FIRST N images are the character" by counting
from the front. Reorder them and character fidelity silently degrades to
style-only conditioning — which looks fine on page 1 and wrong by page 8.

## Why this lives in `scripts/`, not `lib/`

Binding rule 1: no LLM calls in `lib/`. These are ops scripts and never ship in
the app bundle, so nothing in `lib/` gains a provider dependency.
