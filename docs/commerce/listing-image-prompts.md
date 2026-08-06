# Listing Image Prompts

Twelve prompts for `assets/listing/etsy-photos`. Written against the visual system
sampled from `walkthroughfinal.mp4`.

## The gap these fill

Every image in the current set is a flat cream card. Beautiful, consistent — and cold.
In an Etsy grid where competitors show warm photographs of physical books in real hands,
a field of cream mockups reads as *digital, template, not-a-real-object.*

Six of the twelve below are **real-world device shots** — hands, rooms, lamplight,
a bed at night. That's the missing register, and it's what makes a digital product feel
like a thing you own.

---

## How to use these

**Two-stage for anything with a screen.** Image models cannot render legible UI type.
Do not try. Generate the *scene* — hands, device, room, light — with the screen as a
**blank warm-white rectangle**, then composite your real screenshot in afterward with a
perspective transform. Every device prompt below ends with that instruction.

**Prepend this style anchor to every prompt:**

```
Warm painterly photography, natural light, shallow depth of field, soft film grain.
Muted parchment-and-ink palette: cream #EEE3CF, deep brown-black #241B12, oxblood #7D2E2A.
Nothing saturated, nothing glossy, no lens flare, no HDR. Kodak Portra feel.
Composition centered with generous margin — nothing important within 10% of any edge.
```

**Append this negative:**

```
No text overlays, no watermarks, no logos on devices, no visible UI text, no plastic
sheen, no blue-white screen glow, no stock-photo smiles, no clutter, no modern minimalist
grey interiors, no cool colour cast.
```

**Render square (1:1) or 4:3 with the type inside the central square.** After the crop
audit, square is the safe default.

**No child-alone lifestyle shots.** Any real-world scene with a child should also show a
parent, grandparent, or caregiver presence: an arm around the child, an adult hand on the
tablet, someone tucking them in, or a nearby adult at the table. The product is a family
reading ritual, not a kid isolated with a device.

**Screen content reference** — from your own reader:

| Screen | Layout |
|---|---|
| Day mode, iPad landscape | Two-page spread. Illustration bleeds to the left panel edge; text right on cream, ragged-right serif, generous leading. Bottom-center control bar: tree glyph, oxblood circular play button, ‹ › arrows, italic book title. Small ✳ top right. |
| **Phone, portrait** | **Single page, not a spread.** Illustration top ~60%, text below. Same control bar, condensed. |
| Night mode | Ground #221B13, text only, centered, no illustration, controls at 40% opacity. |
| Home screen | Little Fables tree icon on cream tile, sitting among ordinary apps. |

---

## 1 · Hero — family reading together, bedtime

*Slot 1 candidate. The warmest possible version of "this is a real book."*

```
Close over-the-shoulder view of a child and parent reading together on a bed. The child
sits cross-legged beside the parent, both visible from behind or three-quarter rear, both
hands near an 11-inch tablet in landscape orientation. The parent is close enough to feel
protective and present. Rumpled linen duvet in oatmeal and faded sage. A brass bedside
lamp just out of frame casts warm low light from the left; the room falls into soft shadow
behind. A worn stuffed rabbit slumped beside them. Faces are not identifiable. Late
evening, curtains drawn.

The tablet screen is a FLAT BLANK WARM-WHITE RECTANGLE, evenly lit, no content, no
reflections, no glare. Screen fully visible and square-on to camera for compositing.
```

**Composite:** day-mode spread, perspective-matched, plus a faint warm screen bounce onto
the fingertips and duvet.

---

## 2 · Phone on a kitchen counter, morning

*Proves it isn't tablet-only. Second-most-common reading context.*

```
A phone propped against a stoneware mug on a worn wooden kitchen counter, portrait
orientation, screen facing camera. Morning light rakes in from a window at left, long and
low. Beside it: a half-eaten slice of toast on a small plate, a child's plastic cup tipped
on its side, a scatter of crumbs. A blurred adult forearm in a soft flannel sleeve reaches
in from the right edge. Shot at counter height, shallow focus, the background kitchen
falling into warm blur.

The phone screen is a FLAT BLANK WARM-WHITE RECTANGLE, no content, no glare, square-on to
camera for compositing.
```

**Composite:** phone layout — **single page, not a spread.**

---

## 3 · Night mode — dark room, grandparent nearby

*The screen-time defuser, made emotional instead of argued.*

```
A dark bedroom at night. A child and grandparent are reading together on a bed: the child
lies on their stomach with chin on folded arms, while the grandparent sits or lies close
beside them with one gentle hand near the child's shoulder. A tablet lies between them,
screen up, its dim warm glow the only light in frame. Both faces are cropped, turned
down, or softly obscured. The glow is amber-warm, never blue. Deep shadow fills the rest
of the frame; a sliver of hall light under a door in the far background. Quiet, still,
almost monochrome brown-black.

The tablet screen is a FLAT BLANK DIM WARM RECTANGLE at low brightness, no content, for
compositing.
```

**Composite:** night-mode screen. Keep it dim — the whole point is that it isn't bright.

---

## 4 · Home screen among ordinary apps

*Demystifies "saveable web app" for the non-technical buyer.*

```
A tablet held at a slight angle in an adult's hand against a soft blurred living-room
background — a sofa arm, a wool throw, warm afternoon light. Fingers along the bezel,
natural grip, no manicure styling. Casual, snapshot-like, not a product shot.

The tablet screen is a FLAT BLANK WARM-WHITE RECTANGLE for compositing.
```

**Composite:** a real home screen — the Little Fables tree icon on a cream tile, sitting in
a normal grid beside ordinary apps. The whole point is that it looks like it belongs there.

---

## 5 · Four children, four styles

*The range proof. Generate four separate illustrations, then grid them.*

Base for all four:

```
Children's picture-book illustration, full-bleed, no text, no border. A single child,
mid-action, warm and specific. Painterly, hand-made, visible medium texture.
```

Then vary — different child each time:

| Panel | Child | Style |
|---|---|---|
| A | Black girl, 4, yellow raincoat and boots | **Oil on board.** Visible brushwork, wet autumn street, puddle reflections, lamplight. |
| B | White boy, 5, blond, blue jumper | **Soft gouache.** Chalky matte, bedroom at night, wooden rocket in hand, star-field window. |
| C | East Asian girl, 7, black bob, round glasses | **Cut-paper collage.** Layered torn edges, visible paper fibre, city park, flat depth planes. |
| D | South Asian boy, 6, curly hair, green hoodie | **Scratchboard, gold ink on near-black.** Fine white line work, fireflies, night garden. |

Four different children *and* four different media. Same child four ways proves less —
a buyer sees one kid and doesn't see theirs.

---

## 6 · Intake answer → character

*Strongest before/after. Use a second child so the set isn't all Rosa.*

```
Children's picture-book illustration of a six-year-old South Asian boy with thick curly
black hair and a gap between his front teeth, wearing a red dinosaur t-shirt and one
untied sneaker, standing in a backyard holding a jar. Loose watercolour with soft bleeds
and visible paper grain. Full figure, centered, plain warm ground. No text.
```

**Layout:** the parent's typed answer on the left card, this on the right. Verbatim
answer text: *"Thick curly hair, gap in his front teeth, that red dinosaur shirt he
refuses to take off."*

---

## 7 · Reference books → resulting style

```
Children's picture-book illustration of a four-year-old girl in a mustard coat crouching
at the edge of a frozen pond, mittened hand reaching toward a duck. Loose watercolour,
generous white space, wet-on-wet sky, minimal line. Snow lit warm by low winter sun.
No text.
```

**Layout:** left card lists the named books as **plain text chips, no frames** — the
empty bordered boxes in the current 04 read as broken images. Never fill them with real
cover art: naming a book is fine, reproducing its cover isn't.

---

## 8 · Revision sequence

*Three panels, equal width, Final never clipped.*

Generate the same scene three times:

```
[SCENE] — a five-year-old girl in a green cardigan sitting on grass beside a pond at
dusk, brass lantern on a post beside her.
```

| Panel | Treatment |
|---|---|
| Round 1 | Loose graphite underdrawing on toned paper. Construction lines visible, minimal colour wash. |
| Round 2 | Full colour, warm sunset palette, gold sky. Finished but bright. |
| Final | Same composition, deep blue evening. Lantern is now the only warm light source. |

The Final has to be the most beautiful and the most visible — it's the payoff.

---

## 9 · Gift certificate on a table

```
A single printed card lying on a scrubbed oak table, shot from directly above. Cream
laid paper with a visible deckle edge, letterpress bite in the type. A length of narrow
oxblood grosgrain ribbon curls loosely beside it. A sprig of pine and one pinecone at the
upper corner. Morning window light from the left, long soft shadow. A pair of reading
glasses folded at the edge of frame.

The card face is BLANK CREAM PAPER — no text, no printed marks — for compositing.
```

**Composite:** the certificate face — including `etsy.com/shop/LittleFablesStories`
alongside `littlefables.app`, which is what lets a suspicious recipient verify you're real.

---

## 10 · The handoff

*Grandparent conversion. Nothing else in the set has two people in it.*

```
An older woman's hands — soft, ringed, slightly weathered — passing a cream printed card
across a table to a younger adult's hands reaching to receive it. Both figures cropped at
the forearm; no faces. A cardigan sleeve in heather grey, a wool cuff in dark green.
Christmas morning light, warm and diffuse; out-of-focus fairy lights bokeh in the deep
background. Wrapping paper scraps at the frame's edge.

The card face is BLANK CREAM PAPER for compositing.
```

---

## 11 · Twenty quiet minutes

*The close. Sells the feeling rather than the feature.*

```
A tablet lying face-down on a rumpled duvet beside a sleeping child, seen from above.
Only the child's shoulder and the back of their head are in frame, hair against the
pillow. A parent or grandparent sits at the bedside, cropped at torso and hands, gently
tucking the blanket or resting a hand near the child's shoulder. A stuffed animal half
under the covers. The room is dark; a single warm nightlight from the low left. Nothing
glowing, nothing on. Stillness.
```

No composite needed — the screen is face-down, which is the point.

---

## 12 · Coloring page with crayons

*Featured photo, not a listing slot. Process, not marketing.*

```
A sheet of printer paper on a kitchen table, shot from above at a slight angle. Line-art
colouring page, partly coloured in by a child — waxy crayon strokes going outside the
lines, pressed hard in places. A child's hand is mid-stroke with a crayon, and a parent
or grandparent hand gently steadies the page near one corner. A scatter of stubby crayons,
one broken. Warm overhead kitchen light, ordinary and unstyled.

The page artwork is BLANK WHITE for compositing.
```

**Composite:** your actual line-art coloring page.

---

## Ordering

| Slot | Image |
|---|---|
| 1 | #1 hero, family reading together — or #5 range grid. A/B them. |
| 2 | #5 four children, four styles |
| 3 | #6 intake → character |
| 4 | #7 reference → style |
| 5 | #8 revision sequence |
| 6 | #4 home screen |
| 7 | #2 phone on counter |
| 8 | existing turnaround card |
| 9 | #3 night mode |
| 10 | #9 gift certificate, or #10 handoff |
| Nov–Dec swap | Christmas cutoff card into slot 10 |

Featured photos, shop About page: character sheet · rough-to-final · #12 coloring page.

## Two constraints to hold

**Only show styles you can reproduce.** Four media in the grid is a promise a buyer will
hold you to.

**No real child's photograph anywhere.** Not a customer's, not your own. Every child above
is illustrated, shown with a caregiver, shown from behind, cropped, or asleep —
deliberately. The photo→illustration pair is the one compelling image in this category
you should skip.
