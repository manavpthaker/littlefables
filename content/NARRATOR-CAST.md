# Narrator Cast

Image prompts for the six characters who read stories aloud. Anchored to the
Heritage design system, so a narrator sitting in the reader's chrome belongs to
the same made object as the frame around it.

Six characters. **Each one reads by day and by night** — same carved figure, two
lightings, two moods. A child keeps their narrator across the whole day rather
than being handed off to a stranger at bedtime.

---

## The style anchor

Paste this into every narrator prompt, unchanged.

```text
hand-carved and hand-painted folk-craft character portrait, in the tradition of
antique carousel figures and music-box automata, visible carving grain and
brushwork, warm aged palette (aged ivory #EDE3CE, walnut ink #2A1D12, oxblood
#7D2E2B, tarnished brass #A67C3A, pre-war forest green #2E4B3B, burnished gilt
#B89154, deep navy #233450), paint slightly worn at the high points as if loved
for eighty years, centered portrait, no text, no logos, no watermarks, no
photorealism, no modern tech, gentle and age-appropriate for young children
```

**Why this differs from `ART-PROMPT.md`.** Book pages are painted plates — scenes
a child reads *inside*. Narrators are carved objects *in the room*, sitting on a
shelf. Same palette, different medium. That distinction is what stops a narrator
from looking like a character who escaped the story they're reading.

### Never
Corporate mascot proportions · big-eye cartoon cuteness · glossy 3D render ·
sunglasses, headphones, or any modern prop · text or letterforms · gradients ·
neon · anything frightening · anything that reads as a brand character rather
than a made thing.

---

## Day and night

Two lighting treatments, applied to the same carving. Append the relevant block
after the character block in every prompt.

**Day**

```text
Lit by even, soft daylight from a window just out of frame. Plain aged-ivory
ground. Colours at full warmth — brass, forest green and oxblood clearly read.
Eyes fully open, alert and present.
```

**Night**

```text
Lit by a single warm lantern low and to one side, everything else falling into
deep walnut and navy shadow. Ground is dark walnut rather than ivory. A thin rim
of burnished gilt catches the top edge of the figure. Eyes heavy-lidded and
drowsy, expression settled and unhurried.
```

The night treatment is not a different character and not a costume change. It is
the same object, later in the evening.

---

## The cast

Each entry gives the **character block** — paste verbatim into every prompt for
that narrator, day or night. Never paraphrase it.

### 1 · Wren

> Small carved wren, round body, warm brass-brown breast with fine painted
> feather strokes, alert black bead eyes, head tilted slightly as if
> mid-question, one tiny sprig of forest-green leaf tucked at the shoulder.

Quick, bright, a little mischievous. Best at momentum — birthday adventures,
silly stories, anything that wants to move.
**Day voice:** light, forward, smiling. **Night voice:** the same brightness
pulled down to a murmur, like someone telling you a secret.

### 2 · Hollow

> Carved brown bear in three-quarter bulk, deep walnut fur with visible chisel
> grain, heavy kind brow, small round gilt spectacles resting low, oxblood
> scarf worn soft at the fold.

Steady and grandfatherly. The one you want for a hard subject — big feelings,
long chapter books, anything a child needs to feel safe inside.
**Day voice:** low, unhurried, warm. **Night voice:** lower still, wide and slow,
almost a lullaby.

### 3 · Tilda

> Carved fox in seated poise, narrow intelligent face, tarnished-brass coat with
> cream throat and forest-green collar, ears forward and sharply attentive, one
> paw lifted mid-thought.

Curious and precise. Good with vocabulary. Mysteries, how-things-work stories,
anything built around a question.
**Day voice:** crisp, articulate, a smile underneath. **Night voice:** the same
precision, softened — thinking out loud rather than explaining.

### 4 · Moth

> Pale carved moth with broad soft wings in aged ivory and faint gilt vein
> tracery, small gentle body, antennae feathered and slightly drooping, wings
> half-folded as if settling.

Delicate and hushed. Naturally a night creature, but daylight suits her for
quiet stories and gentle subjects.
**Day voice:** soft, airy, unhurried. **Night voice:** breathy, close to the
microphone, nearly a whisper.

### 5 · Barrow

> Carved tortoise, dome shell in deep forest green with worn gilt seams between
> the plates, ancient patient face, heavy lids half-lowered, neck extended just
> a little.

Slow and deliberate. For a child who winds down gradually, or a story that
should not be rushed.
**Day voice:** deep, even, generous gaps between phrases. **Night voice:** slower
again, with real silence between sentences.

### 6 · Vesper

> Carved owl, compact and upright, walnut and ivory barred plumage in fine
> painted strokes, enormous still amber eyes, small tufted ears, talons curled
> over a worn brass perch.

Watchful and wise — the oldest voice in the cast. Fables with a lesson, folk
tales, anything with weight.
**Day voice:** measured, slightly formal, kind. **Night voice:** the same
formality gone gentle, like a grandparent who has told this one before.

---

## What to generate, in order

### Step 1 — Turnaround (once per narrator, day light)

The reference every later image attaches to. Generate this first and do not skip
it; it is what actually holds a face together across a dozen prompts.

```text
[STYLE ANCHOR]

Character turnaround reference sheet. [CHARACTER BLOCK, verbatim].

Four views of the same carved figure in one row, evenly spaced on plain
aged-ivory ground: front-facing, three-quarter turned left, three-quarter turned
right, and full profile facing left. Identical carving, identical paint,
identical proportions across all four — this is one object photographed from four
sides, not four similar objects. Neutral resting expression throughout. Even soft
daylight. No text, no labels, no numbering.
```

→ `content/art/narrators/<name>/turnaround.png`

Attach it as a character or style reference on everything after — Midjourney
`--cref`, Flux Redux, Gemini image-to-image.

### Step 2 — Day states (five per narrator)

The `Buddy` component switches between five states. Each has a fixed ring colour
from the design system; the portrait should sit comfortably inside that ring
without repeating it.

| State | Ring | Expression |
|---|---|---|
| `idle` | none | Resting, eyes open, gently attentive. The default face. |
| `listening` | navy `#233450` | Head turned slightly toward the viewer, ears or antennae forward, mouth closed, held still — genuinely waiting. |
| `thinking` | ink-soft `#57432E` | Eyes cast slightly up and away, brow softened, small considering tilt. Not confused. Turning something over. |
| `speaking` | forest `#2E4B3B` | Mouth open mid-word, warm and animated, engaged with the viewer. |
| `painting` | brass `#A67C3A` | Looking off to one side with quiet anticipation, watching something being made just out of frame. |

```text
[STYLE ANCHOR]

Portrait of the same carved figure, front-facing, matching the attached
turnaround reference exactly. [CHARACTER BLOCK, verbatim].

Expression: [STATE DESCRIPTION from the table].

[DAY LIGHTING BLOCK]

Head and shoulders, centered, even soft light. Identical carving and paint to the
reference. No text, no props beyond those named in the character block.
```

→ `content/art/narrators/<name>/day-<state>.png`

### Step 3 — Night states (two per narrator)

Night mode is text-only, so the narrator is present but quiet — it does not need
the full five. Generate `idle` and `speaking` only.

Same prompt as Step 2, with the **night lighting block** substituted and the
expression softened toward drowsiness.

→ `content/art/narrators/<name>/night-idle.png`, `night-speaking.png`

**Total: 8 images per narrator, 48 across the cast.** If that is too much to do
at once, generate all six turnarounds first, then `day-idle` for all six — that
alone is enough to wire the cast into the app and see it working.

---

## Check every state at 84px

The `Buddy` face renders at 84px by default. Expression that reads clearly at
full resolution often collapses to mush at thumbnail scale. If two states are
indistinguishable small, **exaggerate the head angle rather than the face** —
silhouette survives downscaling, eyebrows do not.

---

## Output paths

```text
content/art/narrators/
  wren/
    character-block.md      # the verbatim block, so a later session need not reconstruct it
    turnaround.png
    day-idle.png
    day-listening.png
    day-thinking.png
    day-speaking.png
    day-painting.png
    night-idle.png
    night-speaking.png
  hollow/
  tilda/
  moth/
  barrow/
  vesper/
```

---

## Pairing narrators to voices

`story.json` carries a `characters` map of name → ElevenLabs `voiceId` and
optional `nightVoiceId`. Record casting here so the visual and the voice never
drift apart.

| Narrator | Day register | Night register | voiceId | nightVoiceId |
|---|---|---|---|---|
| Wren | light, forward, smiling | bright pulled to a murmur | — | — |
| Hollow | low, unhurried, warm | wide and slow, near-lullaby | — | — |
| Tilda | crisp, articulate | precise but thinking aloud | — | — |
| Moth | soft, airy | breathy, near-whisper | — | — |
| Barrow | deep, even, spacious | slower, real silence between lines | — | — |
| Vesper | measured, slightly formal | formal gone gentle | — | — |

Day voices sit between roughly 0.95× and 1.05× speaking rate. Night voices want
0.85× to 0.92× — the reader already applies a further 0.9× multiplier in night
mode, so a night voice that is *also* slow at source will drag.

---

## For custom orders

Buyers do not pick a narrator in the intake today. If it becomes an upsell, the
shape is one question — "who should read it?" — with six portraits and a
one-line personality each. The turnaround and state sets above are exactly what
makes that possible without commissioning new art per order.

Until then, choose from the occasion: Wren or Tilda for birthdays and
adventures, Hollow for big feelings, Moth or Barrow for bedtime, Vesper for
anything with a lesson in it.
