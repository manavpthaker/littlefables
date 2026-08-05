# Walkthrough Video — "How it works"

A 75-second film for the landing page hero and the Etsy listing's video slot.
Mostly the finished product; just enough of the beginning to explain where it
came from.

**The job:** a parent who has never heard of this understands, in about a
minute, what they get and why it is not the usual AI slop. The proof is
watching a real book come together and then open on a real iPad.

---

## Principles

**Weight goes to the output.** Nobody wants to watch a form being filled in.
Show a few words about a child, then spend the film on what those words became.
The intake gets ten seconds and no screen recording — the transformation is the
interesting part, not the input.

**The motion is mechanical, not bouncy.** Heritage moves like a music-box gear —
`--motion-tick` 200ms for cuts, `--motion-wind` 600ms for panels,
`--ease-pendulum` for anything that travels. No springs. No bounce. Nothing
"pops."

**Silence is a feature.** The product's whole pitch is that it does not shout. A
video that shouts contradicts it. Soft piano or solo strings, low. No voiceover
on the first cut — let the type carry it, and let the product's own narration be
the only voice in the film.

**Nothing fake.** Every frame is the real book and the real app. No mockup of a
feature we do not have.

---

## Structure

Nine beats, 75 seconds.

| # | Beat | Time | Source |
|---|---|---|---|
| 1 | Cold open | 0:00–0:05 | Motion graphics |
| 2 | The promise | 0:05–0:12 | Real cover, slow push |
| 3 | A few words about a child | 0:12–0:22 | Type only |
| 4 | **It comes together** | 0:22–0:42 | Motion graphics, real art |
| 5 | It arrives | 0:42–0:52 | Screen recording |
| 6 | The payoff | 0:52–1:08 | Screen recording |
| 7 | Night | 1:08–1:15 | Screen recording |
| 8 | The quiet part | 1:15–1:23 | Type only |
| 9 | Close | 1:23–1:30 | Motion graphics |

Only beats 5, 6 and 7 need a camera or a screen recorder. Everything else the
pipeline builds from the book's own nine images.

---

## Shot list

### 1 · Cold open — 0:00–0:05

- **Source:** motion graphics.
- **What happens:** aged-ivory field. The tree mark draws itself in —
  stroke-dashoffset cascade, tree first, then rays radiating out, then roots.
  Mark motion **mode 2** from `design-system/tokens/motion.css`. Settles into
  **mode 1**, the slow halo breath. Wordmark fades in beneath.
- **Type:** `Little Fables` · then smaller, `custom storybooks, made one at a time`
- **Audio:** first piano note as the roots finish.

### 2 · The promise — 0:05–0:12

- **Source:** `cover.png` from the real book, held.
- **What happens:** slow push in, 4% over seven seconds. Barely perceptible —
  just enough that it is not a still.
- **Type:** `Your kid, in their own storybook.`

### 3 · A few words about a child — 0:12–0:22

No form. No cursor. Just the words a parent gave us, appearing as type on aged
ivory, one line at a time on `--motion-tick`.

- **Source:** type only.
- **Type, in sequence:**
  `Rosa.`
  `Five.`
  `Loves ponds, geese, and waiting for things.`
  then, smaller, after a beat: `That was all we asked for.`
- **Why it works:** it takes ten seconds to establish the entire input, and the
  last line does the job the whole intake sequence was going to do — it tells
  you this is easy.

### 4 · It comes together — 0:22–0:42

**The centrepiece.** Twenty seconds. Built entirely from the book's nine images
plus motion — no recording required.

Four movements, roughly five seconds each:

**a. Ink.** Rosa's character block appears as type, then dissolves into the
first line drawing of her. The words become the girl.

**b. Colour.** A page image arrives desaturated and slightly blurred, then
resolves — edges first, colour blooming inward, like wet paper drying. Two or
three pages in sequence, each on `--motion-settle`.

**c. Order.** The eight page images fan into place in reading order, small,
arranging themselves into a spread grid. They settle. This is the "eight pages,
one evening" moment — you can see the light change across them.

**d. Bound.** The grid collapses inward and the cover forms over it. A thin gilt
rule draws around the edge. The book exists.

- **Type:** one line, arriving late, under the finished cover:
  `Written, illustrated, and read aloud — in three days.`
- **Audio:** the piano builds very slightly here and only here.
- **Note:** movement (b) is the anti-slop argument made visually. It looks
  *painted*, not generated. Do not speed it up.

### 5 · It arrives — 0:42–0:52

- **Source:** screen recording, three quick cuts.
  - (a) the delivery email on a phone
  - (b) tapping the link, the reader opening
  - (c) the iOS share sheet → **Add to Home Screen** → the icon landing among
    other apps
- **Overlay:** nothing over (a) and (b). One small callout arrow as the icon
  appears in (c).
- **Type:** `Delivered in days` · sub: `saved to their iPad like a favourite app`
- **This is the shot that sells grandparents.** It answers "but is it
  complicated" without a word.

### 6 · The payoff — 0:52–1:08

The longest live beat. Real reading, minimal overlay.

- **Source:** screen recording on iPad.
  - (a) a page turn, full directional flip
  - (b) a word tapped, lighting up as it is spoken
  - (c) the transport controls, a thumb hitting play
  - (d) a slow pan across an illustrated spread
- **Overlay:** almost none. One small caption per sub-shot, low, in EB Garamond,
  fading in and out. Never covering the art.
- **Type:** `Read aloud, warmly` → `Tap any word to hear it` → `Their book, their pace`
- **Audio:** bring the real narration up. The only voice in the film.

### 7 · Night — 1:08–1:15

- **Source:** screen recording, one continuous take.
- **What happens:** the same book in day mode, the mode switch, then night —
  text-only, warm-dark, sleepy voice.
- **Overlay:** none. The transition is the point.
- **Type:** `And a quieter one for bedtime`

### 8 · The quiet part — 1:15–1:23

- **Source:** type only, full frame on aged ivory.
- **What happens:** three lines in sequence on `--motion-tick`, a small fleuron
  between each.
- **Type:**
  `No ads. No algorithm. No autoplay.`
  `It ends when the story ends.`
  `We delete what you told us once the book is delivered.`
- **This is the beat that converts the screen-time-guilty parent.** It is the
  only place we say what we *don't* do, and it earns that because everything
  before it was product.

### 9 · Close — 1:23–1:30

- **Source:** motion graphics.
- **What happens:** mark returns, breathing. Details settle beneath.
- **Type:** `$29 · previews in 24 hours · book in 3–4 days` → `littlefables.app`
- **Audio:** piano resolves.

---

## Recording checklist

Only seven shots. Everything else is built from the book's images.

| # | Shot | Device | Notes |
|---|---|---|---|
| 1 | Delivery email | Phone | |
| 2 | Tap link → reader opens | Phone | One continuous take |
| 3 | Add to Home Screen | iPad | Full share-sheet flow, icon landing |
| 4 | Page turn | iPad | Landscape, full directional flip |
| 5 | Word tap + highlight | iPad | Close enough to read the word |
| 6 | Transport, thumb on play | iPad | |
| 7 | Day → night switch | iPad | One continuous take, do not cut |

**iOS:** Settings → Control Center → Screen Recording. Turn on Do Not Disturb
first — a notification banner mid-take ruins it.
**macOS:** `Cmd+Shift+5`, record a selection rather than the whole screen.

Record at the highest resolution the device allows. Downscaling is free;
upscaling is not.

Drop them in `video/recordings/` as `01-email.mov`, `02-open.mov`, and so on.

---

## Dependency

Beats 2, 4, 6 and 7 need the finished art for **The Lantern of Round Pond**
(`content/households/demo/books/lantern-round-pond/`). Beat 4 uses all nine images
directly; beats 6 and 7 need the book imported so it can be read on a device.

Nothing else is blocking.

---

## Pipeline

Remotion, in `video/` as its own package so the app's dependency tree stays
small.

Compositions are JSON-driven — one file per beat with source paths, in/out
points, overlay type and copy. Changing a headline means editing JSON, not TSX.

Components to build. None of operator-economy's transfer; those are built for
talking-head footage, and this film has none.

| Component | Used by | What it does |
|---|---|---|
| `MarkDraw` | 1, 9 | Cold-open draw-in, ported from `design-system/assets/mark-motion.js` |
| `TitleCard` | 1, 3, 8, 9 | Heritage type on aged ivory, sequenced lines, optional mark |
| `SlowPush` | 2 | Imperceptible Ken Burns on a still |
| `Develop` | 4b | Desaturated and blurred resolving to sharp — the wet-paper-drying reveal |
| `PageFan` | 4c | Images arranging into a reading-order grid |
| `Bind` | 4d | Grid collapsing under a cover, gilt rule drawing around |
| `DeviceFrame` | 5, 6, 7 | iPad or phone bezel around a recording, correct corner radius |
| `Callout` | 5 | Small arrow plus label, timestamp-synced |

Render 1920×1080 for the landing page. A 30-second cut of beats 3, 4 and 6 —
the words, the assembly, the reading — reframes to square for Etsy's video slot
from the same source.
