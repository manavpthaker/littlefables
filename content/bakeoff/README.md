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

## Run it

```bash
pnpm art:bakeoff --dry-run      # writes every prompt, zero API calls, zero spend
pnpm art:bakeoff                # every provider whose key is set
pnpm art:bakeoff --providers fal:nano-banana-pro,gemini
pnpm art:bakeoff --pages 0-3    # cheap smoke test before committing to all ten
```

Keys go in `.env.local` (gitignored). Set only the ones you want to race:
`FAL_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`. A provider with no key is skipped
**loudly** — a silent skip would read as a loss.

Output lands in `bakeoff-out/<timestamp>/` (gitignored). Start at
`contact-sheet.html`.

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
| 9 | back to page-0 conditions — **the drift check** |

Page 9 against page 0 is the whole test in one comparison.

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
