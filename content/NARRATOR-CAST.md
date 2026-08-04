# Narrator Cast

Image prompts for the characters who read stories aloud. Anchored to the
Heritage design system (v4), so a narrator sitting in the reader's top bar
belongs to the same made object as the chrome around it.

Each narrator needs three things: a **character block** (pasted verbatim into
every prompt so the face never drifts), a **turnaround** (four angles, generated
once, reused as reference), and a **state set** (five expressions the `Buddy`
component switches between).

---

## The style anchor

Paste this into every narrator prompt, unchanged.

```text
hand-carved and hand-painted folk-craft character portrait, in the tradition of
antique carousel figures and music-box automata, visible carving grain and
brushwork, warm aged palette (aged ivory #EDE3CE, walnut ink #2A1D12, oxblood
#7D2E2B, tarnished brass #A67C3A, pre-war forest green #2E4B3B, burnished gilt
#B89154), soft even light with no theatrical shadow, paint slightly worn at the
high points as if loved for eighty years, centered portrait on plain aged-ivory
ground, no text, no logos, no watermarks, no photorealism, no modern tech,
gentle and age-appropriate for young children
```

**Why this and not the family style anchor.** `ART-PROMPT.md` describes the
book-page style — watercolor scenes a child reads inside. Narrators are not
scenes. They are *objects in the room*: carved, painted, sitting on a shelf.
The distinction is what keeps a narrator from looking like a character who
escaped from the story they're reading.

### Never
Corporate mascot proportions · big-eye cartoon cuteness · glossy 3D render ·
sunglasses, headphones, or any modern prop · text or letterforms · gradients ·
neon · anything frightening · anything that reads as a brand character rather
than a made thing.

---

## The cast

Six narrators. Three read by day, three by night. Each is an animal or figure
that already belongs to folk-craft tradition — nothing invented, nothing cute
for its own sake.

### 1 · Wren — day, bright and quick

> Small carved wren, round body, warm brass-brown breast with fine painted
> feather strokes, alert black bead eyes, head tilted slightly as if
> mid-question, one tiny sprig of forest-green leaf tucked at the shoulder.

Reads: birthday adventures, silly stories, anything with momentum.
Voice: light, quick, a little mischievous. Mid-range, forward energy.

### 2 · Hollow — day, steady and grandfatherly

> Carved brown bear in three-quarter bulk, deep walnut fur with visible chisel
> grain, heavy kind brow, small round gilt spectacles resting low, oxblood
> scarf worn soft at the fold.

Reads: long chapter books, anything a child needs to feel safe inside.
Voice: low, unhurried, warm. The one you want for a hard subject.

### 3 · Tilda — day, curious and precise

> Carved fox in seated poise, narrow intelligent face, tarnished-brass coat with
> cream throat and forest-green collar, ears forward and sharply attentive, one
> paw lifted mid-thought.

Reads: mysteries, how-things-work stories, questions.
Voice: crisp, articulate, a smile underneath. Good with vocabulary.

### 4 · Moth — night, hushed and delicate

> Pale carved moth with broad soft wings in aged ivory and faint gilt vein
> tracery, small gentle body, antennae feathered and slightly drooping, wings
> half-folded as if settling.

Reads: bedtime, quiet stories, anything after lights-out.
Voice: breathy, very soft, close to the microphone. Nearly a whisper.

### 5 · Barrow — night, slow and deliberate

> Carved tortoise, dome shell in deep forest green with worn gilt seams between
> the plates, ancient patient face, heavy lids half-lowered, neck extended just
> a little.

Reads: stories for a child who winds down slowly. Long, even pacing.
Voice: deep, wide gaps between phrases, no urgency at all.

### 6 · Vesper — night, watchful and wise

> Carved owl, compact and upright, walnut and ivory barred plumage in fine
> painted strokes, enormous still amber eyes, small tufted ears, talons curled
> over a worn brass perch.

Reads: fables with a lesson, folk tales, anything with weight.
Voice: measured, slightly formal, kind. The oldest voice in the cast.

---

## Turnaround sheet

Generate these four **once per narrator**, before any state work. Together they
are the reference set every later prompt attaches to.

```text
[STYLE ANCHOR]

Character turnaround reference sheet. [CHARACTER BLOCK, verbatim].

Four views of the same carved figure in one row, evenly spaced on plain
aged-ivory ground: front-facing, three-quarter turned left, three-quarter
turned right, and full profile facing left. Identical carving, identical paint,
identical proportions across all four — this is one object photographed from
four sides, not four similar objects. Neutral resting expression throughout.
Even soft light. No text, no labels, no numbering.
```

Save as `content/art/narrators/<name>/turnaround.png`. Attach it as a character
or style reference on every subsequent prompt — Midjourney `--cref`, Flux Redux,
or Gemini image-to-image. This is what actually holds the face together across
a dozen images.

---

## State set

The `Buddy` component switches between five states. Each needs its own portrait,
and each has a fixed ring colour from the design system — the art should feel at
home inside that ring without repeating it.

| State | Ring | Expression to generate |
|---|---|---|
| `idle` | none | Resting, eyes open, gently attentive. The default face. |
| `listening` | navy `#233450` | Head turned slightly toward the viewer, ears or antennae forward, mouth closed, held still — the face of someone genuinely waiting. |
| `thinking` | ink-soft `#57432E` | Eyes cast slightly up and away, brow softened, a small considering tilt. Not confused. Turning something over. |
| `speaking` | forest `#2E4B3B` | Mouth open mid-word, warm and animated, eyes engaged with the viewer. |
| `painting` | brass `#A67C3A` | Looking off to one side with quiet anticipation, as though watching something being made just out of frame. |

```text
[STYLE ANCHOR]

Portrait of the same carved figure, front-facing, matching the attached
turnaround reference exactly. [CHARACTER BLOCK, verbatim].

Expression: [STATE DESCRIPTION from the table above].

Head and shoulders, centered, plain aged-ivory ground, even soft light.
Identical carving and paint to the reference. No text, no props beyond those
named in the character block.
```

Save as `content/art/narrators/<name>/<state>.png`.

The `Buddy` face renders at 84px by default. **Check every state at 84px before
accepting it** — expression that reads clearly at full size often collapses to
mush at thumbnail scale. If two states are indistinguishable small, exaggerate
the head angle rather than the face.

---

## Output paths

```text
content/art/narrators/
  wren/
    turnaround.png
    idle.png
    listening.png
    thinking.png
    speaking.png
    painting.png
    character-block.md
  hollow/
  tilda/
  moth/
  barrow/
  vesper/
```

`character-block.md` holds the verbatim block for that narrator, so a later
session regenerating one state doesn't have to reconstruct it from this file.

---

## Pairing narrators to voices

`story.json` carries a `characters` map of name → ElevenLabs `voiceId` and
optional `nightVoiceId`. Once a narrator's voice is cast, record it here so the
visual and the voice never drift apart.

| Narrator | Register | voiceId | Cast |
|---|---|---|---|
| Wren | light, quick, mischievous | — | not yet |
| Hollow | low, unhurried, warm | — | not yet |
| Tilda | crisp, articulate | — | not yet |
| Moth | breathy, near-whisper | — | not yet |
| Barrow | deep, very slow | — | not yet |
| Vesper | measured, slightly formal | — | not yet |

Day narrators should sit between roughly 0.95× and 1.05× speaking rate. Night
narrators want 0.85× to 0.92× — the reader already applies a further 0.9×
multiplier in night mode, so casting a night voice that is *also* slow at source
will drag.

---

## For custom orders

Buyers do not pick a narrator in the intake today. If that becomes an upsell,
the natural shape is a single question — "who should read it?" — with three or
four narrator portraits and a one-line personality description each. The
turnaround and state sets above are what make that possible without new art per
order.

Until then, choose the narrator yourself from the occasion: Wren or Tilda for
birthdays and adventures, Hollow for big feelings, Moth or Barrow for bedtime,
Vesper for anything with a lesson in it.
