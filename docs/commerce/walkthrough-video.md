# Walkthrough Video — "How it works"

A 90-second film for the landing page hero and the Etsy listing's first video
slot. Screen recordings of the real app, composited with Heritage motion
graphics.

**The job:** a parent who has never heard of this understands, in ninety
seconds, what they get and why it is not the usual AI slop. The proof is
watching a real book open on a real iPad.

---

## Principles

**Show the product, narrate the promise.** Every claim in the copy gets a
matching frame of real software. "Delivered in days" is a sentence; a finished
book opening on a home screen is evidence.

**The motion is mechanical, not bouncy.** Heritage moves like a music-box gear —
`--motion-tick` 200ms for cuts, `--motion-wind` 600ms for panels, `--ease-pendulum`
for anything that travels. No springs. No bounce. Nothing "pops."

**Silence is a feature.** The product's whole pitch is that it does not shout.
A video that shouts contradicts it. Soft piano or solo strings, low. No
voiceover on the first cut — let the type carry it. Add VO later only if the
silent version tests poorly.

**Nothing fake.** Every frame is the real app. No mockup that shows a feature we
do not have. If a shot needs a book that does not exist yet, we make the book.

---

## Structure

Nine beats, 90 seconds. Timings are targets, not law.

| # | Beat | Time | On screen |
|---|---|---|---|
| 1 | Cold open | 0:00–0:06 | Mark draws in, title card |
| 2 | The promise | 0:06–0:14 | Headline over a real cover |
| 3 | Step one — tell us | 0:14–0:30 | Intake form, real typing |
| 4 | Step two — approve | 0:30–0:44 | Three style previews, one chosen |
| 5 | Step three — it arrives | 0:44–0:56 | Email → link → Add to Home Screen |
| 6 | The payoff | 0:56–1:12 | Reading: page turn, word tap, narration |
| 7 | Night | 1:12–1:20 | Day-to-night switch |
| 8 | The quiet part | 1:20–1:28 | No ads / no algorithm / intake deleted |
| 9 | Close | 1:28–1:34 | Price, turnaround, CTA |

---

## Shot list

Each beat lists the **recording** you capture and the **overlay** the pipeline
composites on top.

### 1 · Cold open — 0:00–0:06

- **Recording:** none.
- **Overlay:** aged-ivory field. The tree mark draws itself in — stroke-dashoffset
  cascade, tree first, then rays radiating out, then roots. This is mark motion
  **mode 2** from `design-system/tokens/motion.css`. Settles into **mode 1**, the
  slow halo breath. Wordmark fades under it in IM Fell English.
- **Type:** `Little Fables` then, smaller, `custom storybooks, made one at a time`.
- **Audio:** first piano note lands as the roots finish.

### 2 · The promise — 0:06–0:14

- **Recording:** a real finished cover, held on screen. Slow push in, 4% over
  8 seconds — barely perceptible, just enough that it is not a still.
- **Overlay:** headline slides up on `--ease-pendulum`.
- **Type:** `Your kid, in their own storybook.`

### 3 · Step one — tell us about your child — 0:14–0:30

- **Recording:** the intake form. Real cursor, real typing — do not speed-ramp
  the typing itself, it reads as fake. Capture: the name field being filled, two
  or three interest chips being tapped, the art-inspiration field being typed
  into.
- **Overlay:** step label top-left in small caps — `STEP ONE`. A gilt underline
  grows beneath the field currently in focus, tracking down the form.
- **Type:** `Tell us about your child` · sub: `about five minutes`
- **Cut on:** the art-inspiration field, because that is the differentiator —
  linger a beat longer there than on the name.

### 4 · Step two — approve the look — 0:30–0:44

- **Recording:** the preview email or preview screen, showing three style
  options side by side. Then the moment of choosing one.
- **Overlay:** as the choice lands, the two unchosen previews desaturate and
  recede 6%; the chosen one gets a thin gilt border drawn around it on
  `--motion-wind`.
- **Type:** `You approve the art before we build the book` · sub: `unlimited
  revisions, or your money back`
- **Why this beat matters most:** it is the entire anti-slop argument in one
  gesture. Do not rush it. If a beat has to grow, grow this one.

### 5 · Step three — it arrives — 0:44–0:56

- **Recording:** three quick cuts. (a) The delivery email on a phone. (b) Tapping
  the link, the reader opening. (c) The iOS share sheet → **Add to Home Screen**
  → the icon landing on the home screen among other apps.
- **Overlay:** none over (a) and (b) — let them read. Over (c), a single small
  callout arrow at the moment the icon appears.
- **Type:** `Delivered in days` · sub: `saved to their iPad like a favorite app`
- **This is the shot that sells grandparents.** It answers "but is it
  complicated" without saying a word.

### 6 · The payoff — 0:56–1:12

The longest beat. Real reading, minimal overlay. Let the software speak.

- **Recording:** (a) a page turn, full directional flip animation. (b) a word
  being tapped and lighting up as it is spoken. (c) the transport controls,
  a thumb hitting play. (d) a slow pan across an illustrated spread.
- **Overlay:** almost none. One small caption per sub-shot, low, in EB Garamond,
  fading in and out. Never covering the art.
- **Type:** `Read aloud, warmly` → `Tap any word to hear it` → `Their book, their
  pace`
- **Audio:** bring the real narration up here. This is the one place the
  product's own voice should be audible.

### 7 · Night — 1:12–1:20

- **Recording:** the same book, day mode, then the mode switch, then night —
  text-only, warm-dark, sleepy voice.
- **Overlay:** none. The transition is the point.
- **Type:** `And a quieter one for bedtime`

### 8 · The quiet part — 1:20–1:28

- **Recording:** none. Full-frame type on aged ivory.
- **Overlay:** three lines arriving in sequence, each on `--motion-tick`, with a
  small fleuron ornament between them.
- **Type:**
  `No ads. No algorithm. No autoplay.`
  `It ends when the story ends.`
  `We delete what you told us once the book is delivered.`
- **This is the beat that converts the screen-time-guilty parent.** It is the
  only place in the video where we say what we *don't* do.

### 9 · Close — 1:28–1:34

- **Recording:** none.
- **Overlay:** mark returns, breathing. Details settle beneath it.
- **Type:** `$29 · previews in 24 hours · book in 3–4 days` then `littlefables.ai`
- **Audio:** piano resolves.

---

## Recording checklist

Capture these before any compositing. Record at **the highest resolution the
device allows** — downscaling is free, upscaling is not.

| # | Shot | Device | Notes |
|---|---|---|---|
| 1 | Cover, held | — | Still export, not a recording |
| 2 | Intake: name field | Desktop | Real typing speed |
| 3 | Intake: interest chips | Desktop | Tap two or three |
| 4 | Intake: art inspirations | Desktop | Linger here |
| 5 | Three previews | Desktop | Side by side |
| 6 | Choosing one | Desktop | The click, clearly |
| 7 | Delivery email | Phone | |
| 8 | Tapping link → reader opens | Phone | |
| 9 | Add to Home Screen | iPad | Full share-sheet flow |
| 10 | Page turn | iPad | Landscape, full flip |
| 11 | Word tap + highlight | iPad | Close enough to read |
| 12 | Transport, thumb on play | iPad | |
| 13 | Illustrated spread | iPad | Slow, steady |
| 14 | Day → night switch | iPad | One continuous take |

**iOS:** Settings → Control Center → Screen Recording. Turn on Do Not Disturb
first — a notification banner mid-take ruins it.
**macOS:** `Cmd+Shift+5`, record a selection, not the whole screen.

Drop everything in `video/recordings/` named to match the numbers above:
`01-cover.png`, `02-intake-name.mov`, and so on. The pipeline reads that folder.

---

## Hard blocker

**Beats 2 and 6 need a finished book in the Heritage art style.** Recording the
reader against a v3-palette book would put cream-and-terracotta illustrations
inside walnut-and-oxblood chrome, and the mismatch is exactly the kind of thing
that reads as unfinished.

One book unblocks: this video, the landing-page image slots, the Etsy hero
photograph, and the sample spreads. It is the single highest-leverage thing
left before launch.

---

## Pipeline

Remotion, in `video/` as its own package so the app's dependency tree stays
small. See `video/README.md` once scaffolded.

Compositions are JSON-driven: one file per beat describing recording path,
in/out points, overlay type, and copy. Changing a headline means editing JSON,
not TSX.

Motion-graphic components to build — none of operator-economy's transfer, since
those are built for talking-head footage:

- `DeviceFrame` — iPad or phone bezel around a recording, correct corner radius
- `ZoomPan` — Ken Burns into a UI region, `--ease-pendulum`
- `Callout` — small arrow plus label, timestamp-synced
- `TitleCard` — Heritage type on aged ivory, mark optional
- `MarkDraw` — the cold-open draw-in, ported from `assets/mark-motion.js`
- `StepLabel` — small-caps step marker with the gilt tracking underline
- `QuietLines` — beat 8's sequenced lines with fleurons

Render at 1920×1080 for the landing page. A 1080×1920 vertical cut for Etsy and
social comes from the same source, reframed — Etsy's video slot is square-ish
and short, so plan a 30-second cut of beats 3, 4, 5 and 6 only.
