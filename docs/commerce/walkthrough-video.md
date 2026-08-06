# Walkthrough Video — "How it works"

A film for the landing page hero and the Etsy listing's video slot. Mostly the
finished product; just enough of the beginning to explain where it came from.

**Timings live in `video/src/beats.ts`, not here.** That file is the film as
data, and it moves — this document holds the reasoning, which does not. The
table below is a snapshot for orientation only; when the two disagree, the code
is right.

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

Ten beats, 125 seconds, as of the current cut.

| # | Beat | Time | Source |
|---|---|---|---|
| 1 | The question | 0:00–0:09 | Type, appearing as typed |
| 2 | The promise | 0:09–0:16 | Real cover, slow push |
| 3 | Tell us about your child | 0:16–0:34 | Screen recording of `/intake` |
| 4 | **It comes together** | 0:34–0:54 | Motion graphics, real art |
| 5 | It arrives | 0:54–1:08 | Rendered email + screen recording |
| 6 | The payoff | 1:08–1:32 | One continuous screen recording |
| 7 | Night | 1:32–1:40 | Screen recording |
| 8 | The range | 1:40–1:49 | Six style samples |
| 9 | The quiet part | 1:49–1:57 | Type only |
| 10 | Close | 1:57–2:05 | Logomark draw-on |

**There is no cold open.** An earlier cut spent five seconds on an animated
logo before showing anything. A logo is not what earns a stranger's next five
seconds, so the film opens on the book and the mark rides small in the corner
throughout, taking its full draw-on at the close where a signature belongs.

The app shots are captured by `video/capture.mjs` driving the real reader.
Everything else the pipeline builds from the book's own art. Only two shots
still need a phone, because neither is our software: the delivery email and the
iOS share sheet.

Run `node check-clips.mjs` after any capture. A recording shorter than the beat
using it makes the film freeze on its last frame, and nothing in the render
reports it.

---

## Shot list

### 1 · The question — 0:00–0:09

- **Source:** type only, appearing as it is typed.
- **What happens:** two lines arrive at human typing speed, a caret blinking
  after them.
- **Type:** `Rosa is five, and she cannot wait for anything.` then
  `Anything for her that isn't YouTube?`
- **Why it opens here:** the film used to open on the product. This opens on
  the reason anyone goes looking for it — a specific child, a specific evening,
  and the answer the parent does not want. It also sets up the beat at the far
  end: `No ads. No algorithm. No autoplay.` The film becomes a question and its
  answer.
- **The problem must be the one the book answers.** This first said "she loves
  horses", and the film then handed over a book about a pond, a lantern and a
  grandmother — breaking the only promise it makes, that these words become
  that book. Impatience is what the story is actually about. The intake beat
  picks accordingly: animals, ocean, magic; curious, stubborn.
- **Deliberately not a chat window.** Framing the words in a ChatGPT or Claude
  bubble would say the book was generated, which is the single claim this
  product exists to deny and the accusation every competitor on Etsy attracts.
  Set as type on paper it reads as a thought. The caret alone carries the sense
  that someone is typing it.

### 2 · The promise — 0:09–0:16

- **Source:** `cover.png` from the real book.
- **What happens:** the whole cover, held for two and a half seconds, then a
  push in that is still moving when the film cuts to the intake. The art is
  square and the frame is 16:9, so an object-fit:cover push threw away about
  forty-four percent of it and opened the film on a crop of pond weeds — you
  could not tell it was a book. It is fitted now, margins and all, so the
  viewer reads "book" before anything moves. The corner mark fades in here and
  stays for the rest of the film.
- **Type:** `Your kid, in their own storybook.`

### 2 · Tell us about your child — 0:07–0:25

- **Source:** screen recording of the real `/intake` page, in an iPad frame.
- **What happens:** a name typed, an age tapped, interest and trait chips
  chosen, a line about what she looks like, a photo dropped in. Real speed,
  nothing faked — the page exists at `app/intake/`.
- **Type:** `This is everything we ask.` · then `A photo helps, but words are enough`
  The page on screen already carries its own heading; a caption repeating it
  wasted the beat.
- **Why it works:** an earlier cut established the input as type on ivory,
  which was faster but asked the viewer to take our word for it. Watching the
  form get filled proves how little we ask.

### 3 · It comes together — 0:25–0:45

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

### 4 · It arrives — 0:45–0:59

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

### 5 · The payoff — 0:59–1:23

- **Source:** one continuous screen recording — `06-payoff.mp4`.
- **What happens:** play is pressed, the page is read to the end, the page
  turns, a word is tapped.
- **Type:** `Read aloud, warmly` → `Their book, their pace` → `Tap any word to
  hear it`, timed to the actions rather than to even thirds.
- **Why one take:** this was three separate captures cut together, and each one
  re-opened the book — so page one appeared, the film cut, and page one
  appeared again before flipping away. The narration ran on across that join
  too, still reading a page the picture had already left. A single take fixes
  both, and the hold after play is sized to outlast the 9.9s narration so the
  page finishes being read before it is turned.
- **Timing:** the recording's actions are at fixed offsets — page one settles
  at 7.5s, the turn is at 19.5s, the tap at 24.5s. `COPY.payoffAt` carries the
  caption times derived from those. A re-capture that shifts the actions has
  to shift those too.

### 6 · Night — 1:23–1:31

- **Source:** screen recording, one continuous take.
- **What happens:** the same book in day mode, the mode switch, then night —
  text-only, warm-dark, sleepy voice.
- **Overlay:** none. The transition is the point.
- **Type:** `And a quieter one for bedtime`

### 7 · The range — 1:31–1:38

- **Source:** six samples from `assets/listing/custom-story-page/`, sharing the
  figcaptions the listing page uses so the film and the shop speak one
  vocabulary.
- **What happens:** painted, cut paper and woodcut arrive side by side, a beat
  apart, each labelled.
- **Type:** `No two look alike.` · then `the style comes from the books you already love`
- **Why it works:** everything before this follows one book in one style, which
  sells that book rather than the service. All six at once, rather than in
  sequence, because the comparison only lands if the eye can make it in a
  single glance — a sequence asks the viewer to hold five images in memory to
  do the same work. Six fits because these are 1448x1086; the three strips this
  replaced were ~615px and could only ever be shown a third of a frame wide.
- **Placement:** after night, not before. The product demo finishes — day, then
  bedtime — and only then does the range open up.

### 8 · The quiet part — 1:38–1:46

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

### 9 · Close — 1:46–1:54

- **Source:** motion graphics.
- **What happens:** the logomark draws itself on — trunk, roots, branches,
  leaves, then the halo. This is the only place the brand animation plays; the
  film opened on the product instead. Details settle beneath once it lands.
- **Type:** `$29 · previews in 24 hours · book in 3–4 days` → `littlefables.app`
  → `etsy.com/shop/LittleFablesStories` in brass small caps beneath
- **Audio:** piano resolves.

---

## Recording checklist

Two shots. `video/capture.mjs` drives the real reader and records the other
five automatically — re-run it after any reader change, or the film shows a UI
that no longer exists. Everything else is built from the book's own images.

| # | Shot | Device | Notes |
|---|---|---|---|
| 1 | Delivery email | Phone | Or render `EmailShell` — the current cut does |
| 2 | Add to Home Screen | iPad | Apple's share sheet; nothing can automate it. Hold two seconds on the home-screen icon |

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
