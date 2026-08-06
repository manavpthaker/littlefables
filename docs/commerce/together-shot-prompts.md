# Device Shot Prompts — "Together, Not Alone"

Eight complete prompts. Each block is self-contained: style, scene, screen and
negative are all in one copy-paste. Nothing to assemble.

## The problem these fix

Almost every device shot in the current set is **one child, alone, lit only by a
screen, in a dark room.** That is a photograph of the thing your buyer is afraid
of. `positioning.md` puts 60% of US parents feeling guilty about screen time — and
we were showing them the guilt, then asking them to pay for it.

Six signals separate "reading together" from "screen time." Any shot missing three
of them reads as the wrong thing.

| Signal | Why |
|---|---|
| **Two faces visible** | Two backs of heads is surveillance. Faces are a relationship. |
| **The child is active** — pointing, mid-word, reaching | Slack passive watching is the YouTube face. |
| **The adult looks at the child, not the screen** | The most important one. The book is a reason to look at your kid. |
| **The device is shared** | One person's possession reads as consumption. |
| **Daylight, or lamplight on faces** | Screen as sole light source = screen-time picture. |
| **The screen is never the brightest thing** | Let the room out-light it. |

## Two passes

**The screen is visible in all eight.** The product is what's on it — for something
with no physical object, a photo of a device you can't see reads as evasive.

Each prompt is now two passes:

**Pass 1** generates the photograph with a blank screen.
**Pass 2** takes that plate plus a real screenshot of your reader and places one into
the other.

This beats both earlier approaches. Describing the screen in-prompt gets you
plausible gibberish where the words should be. Compositing by script gets real type
but flat, unlit, and obviously pasted. A real screenshot handed to the model gets
real words *and* real integration — light, glass, fingers in front.

The single most important line in Pass 2 is the instruction **not to redraw the
screenshot.** Left to itself a model will helpfully "improve" your UI and hand back
invented text. It has to be told it is transforming an existing image, not making a
new one.

Take the screenshots at the tablet's native resolution, in landscape for the spread
shots and in the dark theme for the bedtime one.

---

## 1 · Dad and daughter, kitchen, morning

**Pass 1 — the plate:**

```
Warm documentary family photography, natural window light, shallow depth of field,
soft film grain, Kodak Portra palette. Muted parchment-and-ink tones: cream, oatmeal,
faded sage, oxblood, worn wood. Candid and unposed — caught mid-moment, not arranged.
A real lived-in home, gently untidy. Nothing saturated, nothing glossy, no HDR.
Composition centred with generous margin; nothing important within 10% of any edge.

A father sits at a kitchen table in low golden morning light, his six-year-old
daughter kneeling on the chair beside him and leaning across his forearm. She is
pointing at the tablet they are holding between them, mouth open mid-sentence,
explaining something to him. He is not looking at the tablet — he is looking at her
face, smiling slightly. Both have hands on the device: his underneath steadying it,
hers on the near edge. Light rakes in from a window at the left across a worn wooden
table; a cereal bowl and two mugs sit at the edge of frame. He wears a soft grey marl
t-shirt, she a mustard cardigan over pyjamas, hair unbrushed. The room is brighter
than the screen. Shot at their eye level, the tablet turned nearly square-on to
camera and filling about a third of the frame width.

On the tablet screen: nothing. A FLAT BLANK WARM-WHITE RECTANGLE — evenly lit, no
content, no text, no icons, no glare, no reflection, no app bars, no browser chrome,
no operating-system interface. Clean and empty, with all four corners of the screen
clearly visible and unobstructed, ready for a screenshot to be placed into it.

No blue or cool screen glow, no screen as the only light source, no child alone, no
slack passive expression, no staring upward, no propped-up unattended device, no
stock-photo grins, no clutter-free showroom interior, no cool colour cast, no text
overlays, no watermarks, no brand logos on the device, no visible operating-system
interface.
```

**Pass 2 — attach this plate plus your reader screenshot:**

```
Two images are attached: a photograph of a tablet with a blank screen, and a
screenshot of a storybook reader. Place the screenshot into the tablet's screen so
the device reads as actually displaying it.

Reproduce the screenshot exactly. Do not redraw, re-typeset, re-illustrate or
reinterpret any part of it — every word must stay identical and legible, the
illustration unchanged, the layout untouched. You are transforming an existing image,
not generating a new one.

Fit: match the perspective of the tablet's screen plane so all four corners of the
screenshot land precisely on the inner edge of the bezel. Preserve the screenshot's
aspect ratio — crop it slightly if the screen is a different shape, but never stretch
or squash it. No black bars, no gaps at the edges, no visible seam.

Light: the screen is emitting. Lift it just enough to read as lit from within, and
warm it to match the room's colour temperature. Keep it dimmer than the brightest
light in the photograph — nothing on the screen should be pure white or the brightest
thing in frame. Let a soft glow bleed a few pixels past the screen edge onto the
bezel and onto any hand holding it.

Depth: any finger, thumb or hand that crossed the screen area in the photograph must
remain in front of the overlay. Add a very faint sheen across the glass — no hard
specular highlight, no mirror reflection of the room.

Finish: match the photograph's grain, focus and softness so the screen is not sharper
than the rest of the image. A perfectly crisp screen inside a soft photograph is
exactly what reads as fake.

Change nothing else in the photograph.
```


---

## 2 · Grandmother reading aloud, sofa, afternoon

**Pass 1 — the plate:**

```
Warm documentary family photography, natural window light, shallow depth of field,
soft film grain, Kodak Portra palette. Muted parchment-and-ink tones: cream, oatmeal,
faded sage, oxblood, worn wood. Candid and unposed — caught mid-moment, not arranged.
A real lived-in home, gently untidy. Nothing saturated, nothing glossy, no HDR.
Composition centred with generous margin; nothing important within 10% of any edge.

A grandmother in her late sixties sits on a deep sofa in warm afternoon light, her
seven-year-old grandson tucked under her arm against her side. She is reading aloud —
mouth caught mid-word, glasses low on her nose, holding a tablet up in front of them
both so its face is turned toward the camera. He is looking up at her face rather
than at the device, caught laughing. Her other hand rests on his shoulder. She wears
a cream cable-knit cardigan; a wool throw is folded over the sofa arm. A window
behind them throws soft light across both faces, dust visible in the air. Nothing in
the room is tidy. Shot slightly below their eye level, close enough that both faces
fill the frame, the tablet screen clearly visible and filling about a quarter of the
frame width.

On the tablet screen: nothing. A FLAT BLANK WARM-WHITE RECTANGLE — evenly lit, no
content, no text, no icons, no glare, no reflection, no app bars, no browser chrome,
no operating-system interface. Clean and empty, with all four corners of the screen
clearly visible and unobstructed, ready for a screenshot to be placed into it.

No blue or cool screen glow, no screen as the only light source, no child alone, no
slack passive expression, no staring upward, no propped-up unattended device, no
stock-photo grins, no clutter-free showroom interior, no cool colour cast, no text
overlays, no watermarks, no brand logos on the device, no visible operating-system
interface.
```

**Pass 2 — attach this plate plus your reader screenshot:**

```
Two images are attached: a photograph of a tablet with a blank screen, and a
screenshot of a storybook reader. Place the screenshot into the tablet's screen so
the device reads as actually displaying it.

Reproduce the screenshot exactly. Do not redraw, re-typeset, re-illustrate or
reinterpret any part of it — every word must stay identical and legible, the
illustration unchanged, the layout untouched. You are transforming an existing image,
not generating a new one.

Fit: match the perspective of the tablet's screen plane so all four corners of the
screenshot land precisely on the inner edge of the bezel. Preserve the screenshot's
aspect ratio — crop it slightly if the screen is a different shape, but never stretch
or squash it. No black bars, no gaps at the edges, no visible seam.

Light: the screen is emitting. Lift it just enough to read as lit from within, and
warm it to match the room's colour temperature. Keep it dimmer than the brightest
light in the photograph — nothing on the screen should be pure white or the brightest
thing in frame. Let a soft glow bleed a few pixels past the screen edge onto the
bezel and onto any hand holding it.

Depth: any finger, thumb or hand that crossed the screen area in the photograph must
remain in front of the overlay. Add a very faint sheen across the glass — no hard
specular highlight, no mirror reflection of the room.

Finish: match the photograph's grain, focus and softness so the screen is not sharper
than the rest of the image. A perfectly crisp screen inside a soft photograph is
exactly what reads as fake.

Change nothing else in the photograph.
```


---

## 3 · Two siblings on the floor, midday

**Pass 1 — the plate:**

```
Warm documentary family photography, natural window light, shallow depth of field,
soft film grain, Kodak Portra palette. Muted parchment-and-ink tones: cream, oatmeal,
faded sage, oxblood, worn wood. Candid and unposed — caught mid-moment, not arranged.
A real lived-in home, gently untidy. Nothing saturated, nothing glossy, no HDR.
Composition centred with generous margin; nothing important within 10% of any edge.

Two children — a nine-year-old girl and her five-year-old brother — lie on their
stomachs on a rug in a sunlit living room, elbows down, heads close together, a
tablet on the floor between them. She is pointing at something on it and turning to
look at him; he is grinning up at her, mid-laugh, one sock off. Bright midday light
floods across the rug from a window out of frame, far brighter than the screen. The
room is warm and plainly lived in — a toy basket, a leaning stack of books, an old
radiator. Shot from floor level, close, angled slightly down over the device so the
screen reads clearly.

On the tablet screen: nothing. A FLAT BLANK WARM-WHITE RECTANGLE — evenly lit, no
content, no text, no icons, no glare, no reflection, no app bars, no browser chrome,
no operating-system interface. Clean and empty, with all four corners of the screen
clearly visible and unobstructed, ready for a screenshot to be placed into it.

No blue or cool screen glow, no screen as the only light source, no child alone, no
slack passive expression, no staring upward, no propped-up unattended device, no
stock-photo grins, no clutter-free showroom interior, no cool colour cast, no text
overlays, no watermarks, no brand logos on the device, no visible operating-system
interface.
```

**Pass 2 — attach this plate plus your reader screenshot:**

```
Two images are attached: a photograph of a tablet with a blank screen, and a
screenshot of a storybook reader. Place the screenshot into the tablet's screen so
the device reads as actually displaying it.

Reproduce the screenshot exactly. Do not redraw, re-typeset, re-illustrate or
reinterpret any part of it — every word must stay identical and legible, the
illustration unchanged, the layout untouched. You are transforming an existing image,
not generating a new one.

Fit: match the perspective of the tablet's screen plane so all four corners of the
screenshot land precisely on the inner edge of the bezel. Preserve the screenshot's
aspect ratio — crop it slightly if the screen is a different shape, but never stretch
or squash it. No black bars, no gaps at the edges, no visible seam.

Light: the screen is emitting. Lift it just enough to read as lit from within, and
warm it to match the room's colour temperature. Keep it dimmer than the brightest
light in the photograph — nothing on the screen should be pure white or the brightest
thing in frame. Let a soft glow bleed a few pixels past the screen edge onto the
bezel and onto any hand holding it.

Depth: any finger, thumb or hand that crossed the screen area in the photograph must
remain in front of the overlay. Add a very faint sheen across the glass — no hard
specular highlight, no mirror reflection of the room.

Finish: match the photograph's grain, focus and softness so the screen is not sharper
than the rest of the image. A perfectly crisp screen inside a soft photograph is
exactly what reads as fake.

Change nothing else in the photograph.
```


---

## 4 · Mother and toddler, window seat, morning

**Pass 1 — the plate:**

```
Warm documentary family photography, natural window light, shallow depth of field,
soft film grain, Kodak Portra palette. Muted parchment-and-ink tones: cream, oatmeal,
faded sage, oxblood, worn wood. Candid and unposed — caught mid-moment, not arranged.
A real lived-in home, gently untidy. Nothing saturated, nothing glossy, no HDR.
Composition centred with generous margin; nothing important within 10% of any edge.

A mother sits cross-legged in a window seat with her three-year-old in her lap, both
turned toward bright morning light. Her chin rests on the top of the child's head,
eyes closed, caught mid-laugh. The toddler holds a tablet in both small hands, tilted
so its face catches the light, and is talking — one finger pointing at
the edge of it. A linen curtain is half drawn, a plant on the sill, chipped paint on
the window frame. Both faces catch the window light fully. Shot from the side at
their level, close.

The tablet is tilted just enough that its screen is visible to camera, filling about
a fifth of the frame width, catching the window light without glare.

On the tablet screen: nothing. A FLAT BLANK WARM-WHITE RECTANGLE — evenly lit, no
content, no text, no icons, no glare, no reflection, no app bars, no browser chrome,
no operating-system interface. Clean and empty, with all four corners of the screen
clearly visible and unobstructed, ready for a screenshot to be placed into it.

No blue or cool screen glow, no screen as the only light source, no child alone, no
slack passive expression, no staring upward, no propped-up unattended device, no
stock-photo grins, no clutter-free showroom interior, no cool colour cast, no text
overlays, no watermarks, no brand logos on the device, no visible operating-system
interface.
```

**Pass 2 — attach this plate plus your reader screenshot:**

```
Two images are attached: a photograph of a tablet with a blank screen, and a
screenshot of a storybook reader. Place the screenshot into the tablet's screen so
the device reads as actually displaying it.

Reproduce the screenshot exactly. Do not redraw, re-typeset, re-illustrate or
reinterpret any part of it — every word must stay identical and legible, the
illustration unchanged, the layout untouched. You are transforming an existing image,
not generating a new one.

Fit: match the perspective of the tablet's screen plane so all four corners of the
screenshot land precisely on the inner edge of the bezel. Preserve the screenshot's
aspect ratio — crop it slightly if the screen is a different shape, but never stretch
or squash it. No black bars, no gaps at the edges, no visible seam.

Light: the screen is emitting. Lift it just enough to read as lit from within, and
warm it to match the room's colour temperature. Keep it dimmer than the brightest
light in the photograph — nothing on the screen should be pure white or the brightest
thing in frame. Let a soft glow bleed a few pixels past the screen edge onto the
bezel and onto any hand holding it.

Depth: any finger, thumb or hand that crossed the screen area in the photograph must
remain in front of the overlay. Add a very faint sheen across the glass — no hard
specular highlight, no mirror reflection of the room.

Finish: match the photograph's grain, focus and softness so the screen is not sharper
than the rest of the image. A perfectly crisp screen inside a soft photograph is
exactly what reads as fake.

Change nothing else in the photograph.
```


---

## 5 · Bedtime, together — night mode

**Pass 1 — the plate:**

```
Warm documentary family photography, natural lamplight, shallow depth of field, soft
film grain, Kodak Portra palette. Muted parchment-and-ink tones: cream, oatmeal,
faded sage, oxblood, worn wood. Candid and unposed — caught mid-moment, not arranged.
A real lived-in home, gently untidy. Nothing saturated, nothing glossy, no HDR.
Composition centred with generous margin; nothing important within 10% of any edge.

A parent sits propped against the headboard of a child's bed with a seven-year-old
beside them, shoulder to shoulder, duvet across both laps. A warm brass bedside lamp
at the left lights BOTH faces clearly — the room is dim but not dark, and the lamp is
plainly brighter than the tablet. The child is talking, one hand raised mid-gesture;
the parent is watching them, head tilted, listening. The tablet rests on the child's
knees, held by both of them. A stuffed rabbit slumps against the pillow. Pyjamas,
rumpled hair, late but not sleepy. Shot from the foot of the bed at their level, the
tablet angled toward camera at about a quarter of the frame width.

On the tablet screen: nothing. A FLAT BLANK, DIM WARM-GREY RECTANGLE — evenly lit at
low brightness, clearly less bright than the bedside lamp, no content, no text, no
icons, no glare, no app bars, no browser chrome, no operating-system interface. All
four corners of the screen clearly visible and unobstructed, ready for a screenshot
to be placed into it.

No blue or cool screen glow, no screen as the only light source, no child alone, no
slack passive expression, no staring upward, no propped-up unattended device, no
stock-photo grins, no clutter-free showroom interior, no cool colour cast, no text
overlays, no watermarks, no brand logos on the device, no visible operating-system
interface.
```

**Pass 2 — attach this plate plus your reader screenshot:**

```
Two images are attached: a photograph of a tablet with a blank screen, and a
screenshot of a storybook reader in its dark night-reading theme. Place the
screenshot into the tablet's screen so the device reads as actually displaying it.

Reproduce the screenshot exactly. Do not redraw, re-typeset, re-illustrate or
reinterpret any part of it — every word must stay identical and legible, the
illustration unchanged, the layout untouched. You are transforming an existing image,
not generating a new one.

Fit: match the perspective of the tablet's screen plane so all four corners of the
screenshot land precisely on the inner edge of the bezel. Preserve the screenshot's
aspect ratio — crop it slightly if the screen is a different shape, but never stretch
or squash it. No black bars, no gaps at the edges, no visible seam.

Light: the screen is emitting, but only faintly — this is a bedtime page. Keep it
clearly dimmer than the bedside lamp, warm rather than blue, and never the brightest
thing in frame. The lamp lights the faces; the screen does not. Let a soft glow bleed a few pixels past the screen edge onto the
bezel and onto any hand holding it.

Depth: any finger, thumb or hand that crossed the screen area in the photograph must
remain in front of the overlay. Add a very faint sheen across the glass — no hard
specular highlight, no mirror reflection of the room.

Finish: match the photograph's grain, focus and softness so the screen is not sharper
than the rest of the image. A perfectly crisp screen inside a soft photograph is
exactly what reads as fake.

Change nothing else in the photograph.
```


---

## 6 · The child shows the adult

*The strongest idea here — structurally impossible for YouTube. Nobody shows a
parent an algorithmic feed.*

**Pass 1 — the plate:**

```
Warm documentary family photography, natural window light, shallow depth of field,
soft film grain, Kodak Portra palette. Muted parchment-and-ink tones: cream, oatmeal,
faded sage, oxblood, worn wood. Candid and unposed — caught mid-moment, not arranged.
A real lived-in home, gently untidy. Nothing saturated, nothing glossy, no HDR.
Composition centred with generous margin; nothing important within 10% of any edge.

A five-year-old stands beside a seated adult, holding a tablet up with both arms to
show them — screen turned toward the adult and toward camera. The child is looking at
the adult's face, waiting for a reaction: proud, expectant, slightly impatient. The
adult is leaning in with genuine surprised delight, one hand half raised. A kitchen
or living room in bright late-afternoon light, the room clearly brighter than the
screen. The child's whole posture is presenting, not consuming. Shot from just behind
the adult's shoulder so the tablet faces camera nearly square-on, filling about a
third of the frame width.

On the tablet screen: nothing. A FLAT BLANK WARM-WHITE RECTANGLE — evenly lit, no
content, no text, no icons, no glare, no reflection, no app bars, no browser chrome,
no operating-system interface. Clean and empty, with all four corners of the screen
clearly visible and unobstructed, ready for a screenshot to be placed into it.

No blue or cool screen glow, no screen as the only light source, no child alone, no
slack passive expression, no staring upward, no propped-up unattended device, no
stock-photo grins, no clutter-free showroom interior, no cool colour cast, no text
overlays, no watermarks, no brand logos on the device, no visible operating-system
interface.
```

**Pass 2 — attach this plate plus your reader screenshot:**

```
Two images are attached: a photograph of a tablet with a blank screen, and a
screenshot of a storybook reader. Place the screenshot into the tablet's screen so
the device reads as actually displaying it.

Reproduce the screenshot exactly. Do not redraw, re-typeset, re-illustrate or
reinterpret any part of it — every word must stay identical and legible, the
illustration unchanged, the layout untouched. You are transforming an existing image,
not generating a new one.

Fit: match the perspective of the tablet's screen plane so all four corners of the
screenshot land precisely on the inner edge of the bezel. Preserve the screenshot's
aspect ratio — crop it slightly if the screen is a different shape, but never stretch
or squash it. No black bars, no gaps at the edges, no visible seam.

Light: the screen is emitting. Lift it just enough to read as lit from within, and
warm it to match the room's colour temperature. Keep it dimmer than the brightest
light in the photograph — nothing on the screen should be pure white or the brightest
thing in frame. Let a soft glow bleed a few pixels past the screen edge onto the
bezel and onto any hand holding it.

Depth: any finger, thumb or hand that crossed the screen area in the photograph must
remain in front of the overlay. Add a very faint sheen across the glass — no hard
specular highlight, no mirror reflection of the room.

Finish: match the photograph's grain, focus and softness so the screen is not sharper
than the rest of the image. A perfectly crisp screen inside a soft photograph is
exactly what reads as fake.

Change nothing else in the photograph.
```


---

## 7 · Blanket fort, two friends

**Pass 1 — the plate:**

```
Warm documentary family photography, natural diffused daylight, shallow depth of
field, soft film grain, Kodak Portra palette. Muted parchment-and-ink tones: cream,
oatmeal, faded sage, oxblood, worn wood. Candid and unposed — caught mid-moment, not
arranged. A real lived-in home, gently untidy. Nothing saturated, nothing glossy, no
HDR. Composition centred with generous margin; nothing important within 10% of any
edge.

Two seven-year-olds under a bedsheet fort strung between kitchen chairs, daylight
glowing through the fabric above them so the whole space is lit soft and warm. They
sit cross-legged facing each other, one holding a tablet flat between them, both
leaning over it and talking at once. Cushions, a torch that isn't switched on, odd
socks. Shot from just outside the fort opening, slightly low, both faces visible and
lit by the light coming through the sheet.

The tablet lies flat between them and is seen from above at a slight angle, its
screen clearly visible and filling about a quarter of the frame width.

On the tablet screen: nothing. A FLAT BLANK WARM-WHITE RECTANGLE — evenly lit, no
content, no text, no icons, no glare, no reflection, no app bars, no browser chrome,
no operating-system interface. Clean and empty, with all four corners of the screen
clearly visible and unobstructed, ready for a screenshot to be placed into it.

No blue or cool screen glow, no screen as the only light source, no child alone, no
slack passive expression, no staring upward, no propped-up unattended device, no
stock-photo grins, no clutter-free showroom interior, no cool colour cast, no text
overlays, no watermarks, no brand logos on the device, no visible operating-system
interface.
```

**Pass 2 — attach this plate plus your reader screenshot:**

```
Two images are attached: a photograph of a tablet with a blank screen, and a
screenshot of a storybook reader. Place the screenshot into the tablet's screen so
the device reads as actually displaying it.

Reproduce the screenshot exactly. Do not redraw, re-typeset, re-illustrate or
reinterpret any part of it — every word must stay identical and legible, the
illustration unchanged, the layout untouched. You are transforming an existing image,
not generating a new one.

Fit: match the perspective of the tablet's screen plane so all four corners of the
screenshot land precisely on the inner edge of the bezel. Preserve the screenshot's
aspect ratio — crop it slightly if the screen is a different shape, but never stretch
or squash it. No black bars, no gaps at the edges, no visible seam.

Light: the screen is emitting. Lift it just enough to read as lit from within, and
warm it to match the room's colour temperature. Keep it dimmer than the brightest
light in the photograph — nothing on the screen should be pure white or the brightest
thing in frame. Let a soft glow bleed a few pixels past the screen edge onto the
bezel and onto any hand holding it.

Depth: any finger, thumb or hand that crossed the screen area in the photograph must
remain in front of the overlay. Add a very faint sheen across the glass — no hard
specular highlight, no mirror reflection of the room.

Finish: match the photograph's grain, focus and softness so the screen is not sharper
than the rest of the image. A perfectly crisp screen inside a soft photograph is
exactly what reads as fake.

Change nothing else in the photograph.
```


---

## 8 · The child reads aloud to the adult

**Pass 1 — the plate:**

```
Warm documentary family photography, natural window light, shallow depth of field,
soft film grain, Kodak Portra palette. Muted parchment-and-ink tones: cream, oatmeal,
faded sage, oxblood, worn wood. Candid and unposed — caught mid-moment, not arranged.
A real lived-in home, gently untidy. Nothing saturated, nothing glossy, no HDR.
Composition centred with generous margin; nothing important within 10% of any edge.

A six-year-old sits on a sofa reading aloud from a tablet held in their own lap,
mouth caught mid-word, one finger tracking under a line. An adult sits beside them
turned inward, one arm along the sofa back, looking at the child's face with an easy
half-smile — not at the screen. Late afternoon light from a window at the right
catches both faces and fills the room well beyond the brightness of the screen. A
muted sofa, a mug on the side table, a rug rucked at one corner. Camera at the
child's eye level and slightly to one side, so the tablet reads nearly square-on and
fills about a third of the frame width.

On the tablet screen: nothing. A FLAT BLANK WARM-WHITE RECTANGLE — evenly lit, no
content, no text, no icons, no glare, no reflection, no app bars, no browser chrome,
no operating-system interface. Clean and empty, with all four corners of the screen
clearly visible and unobstructed, ready for a screenshot to be placed into it.

No blue or cool screen glow, no screen as the only light source, no child alone, no
slack passive expression, no staring upward, no propped-up unattended device, no
stock-photo grins, no clutter-free showroom interior, no cool colour cast, no text
overlays, no watermarks, no brand logos on the device, no visible operating-system
interface.
```

**Pass 2 — attach this plate plus your reader screenshot:**

```
Two images are attached: a photograph of a tablet with a blank screen, and a
screenshot of a storybook reader. Place the screenshot into the tablet's screen so
the device reads as actually displaying it.

Reproduce the screenshot exactly. Do not redraw, re-typeset, re-illustrate or
reinterpret any part of it — every word must stay identical and legible, the
illustration unchanged, the layout untouched. You are transforming an existing image,
not generating a new one.

Fit: match the perspective of the tablet's screen plane so all four corners of the
screenshot land precisely on the inner edge of the bezel. Preserve the screenshot's
aspect ratio — crop it slightly if the screen is a different shape, but never stretch
or squash it. No black bars, no gaps at the edges, no visible seam.

Light: the screen is emitting. Lift it just enough to read as lit from within, and
warm it to match the room's colour temperature. Keep it dimmer than the brightest
light in the photograph — nothing on the screen should be pure white or the brightest
thing in frame. Let a soft glow bleed a few pixels past the screen edge onto the
bezel and onto any hand holding it.

Depth: any finger, thumb or hand that crossed the screen area in the photograph must
remain in front of the overlay. Add a very faint sheen across the glass — no hard
specular highlight, no mirror reflection of the room.

Finish: match the photograph's grain, focus and softness so the screen is not sharper
than the rest of the image. A perfectly crisp screen inside a soft photograph is
exactly what reads as fake.

Change nothing else in the photograph.
```


---

## The screen, for reference

Both descriptions above are the reader's real design, from
`app/read/story/[id]/page-spread.tsx` and the token files:

| | Day | Night |
|---|---|---|
| Split | 48% art / 52% words | no art at all |
| Art | full bleed — no card, no radius, no margin | — |
| Paper | `#EDE3CE` | `#1F1A14` |
| Ink | `#2A1D12` | `#F0E5CD` |
| Type | IM Fell English, 30px / 1.55 | same |
| Words | vertically centred, max 520px | centred both ways, max 620px |
| Controls | under the words only, never over the art | centred below |
| Crease | 88px, bright leaf edge at centre | — |

Night mode having **no illustration** is the design, not an omission — worth
keeping in the prompt, because every model will want to add a picture back.

## Render settings

- **2K minimum.** The last batch of plates were 1448×1086 and got upscaled 1.9× to
  2700; that softness was in every image before anything else happened.
- **Square (1:1) or 4:3 with everything important inside the central square.**
- For prompts 1, 6, 8 — if you want zoom-proof text, generate the blank-screen
  variant and composite instead.

## Suggested six

| Slot | Shot | Screen size in frame |
|---|---|---|
| 1 | #6 child shows the adult | ~33% — composite this one |
| 2 | #1 dad and daughter, kitchen | ~33% — composite this one |
| 3 | #2 grandmother reading aloud | ~25% |
| 4 | #3 siblings on the floor | ~25% |
| 5 | #7 blanket fort | ~25% |
| 6 | #5 bedtime together | ~25%, night |

#4 and #8 are drop-in spares.

Judge each render at 170×170 **and** at 100%. If the screen convinces at both, ship
the generated version; if only at 170, composite it.
