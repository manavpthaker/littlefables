# Bake-off — the ChatGPT arm

> ## ⚠️ STALE — do not run this against the current API results
>
> These prompts were generated from the **v1 fixture** and the ten-page story,
> at run `2026-08-09T10-46-34`. Both have moved since:
>
> - `cast.json` is now **v5**. The coat, teeth, ear, collar and lamp anchors
>   were all rewritten across four revisions — see the `_revisedAfterRun*`
>   notes in that file for what each one fixed and why.
> - There is now a **`worldAnchor`** (the setting block) that these prompts
>   predate entirely, and a much stronger `NOTHING_WRITTEN` block.
> - The story is now **20 pages**, not 10.
>
> The ChatGPT arm only means anything if it runs the *same* prompts the API
> arm ran — that is the single variable the whole comparison rests on.
> **Regenerate this file from the current `story.json` + `cast.json` before
> running the manual arm.** The exact text the API received is written to
> `bakeoff-out/<runId>/page-NN.prompt.txt` on every run, including
> `--dry-run`, which costs nothing; copy from there.

Same story, same cast, same prompts the fal providers got. The only variable is
the tool.

## How to run it so the result means something

1. **One fresh chat.** The whole thesis under test is that a chat session's
   consistency comes from conversational context, which decays. Starting a new
   thread partway through resets that and quietly makes ChatGPT look better
   than it is.
2. **Prompt 0 first**, then prompts 1–10 **in order**. Do not skip ahead: page
   9 is the drift check and only means something if pages 1–8 came before it.
3. **Do not regenerate a bad page.** The manual workflow's cost is the
   regeneration; if you fix drift by hand you erase the measurement. Keep the
   first output for every page, even the bad ones.
4. **Start a stopwatch.** Attended minutes is the number the API is being
   compared against — `docs/commerce/gtm-decision.md` puts the manual path at
   30–60 min per order.
5. **Do not paste the scoring section** at the bottom into the chat. A model
   told which page is the drift check will try harder on it.

---

## PROMPT 0 — character reference sheet

```text
Character reference sheet for a children's picture book.

Style: warm hand-drawn watercolour with ink linework, visible textured paper grain, soft edges, no digital gloss. Picture-book illustration, not photorealism, not 3D render, not anime.
Palette: paper cream, warm ink brown, marigold, sage, dusk violet

Characters on this sheet:
  - Nila (the lamplighter's granddaughter, a girl of about seven, warm brown skin, South Asian) — black hair in two short braids that stick out slightly at the ends, round face, thick eyebrows, a small gap between her front teeth, mustard-yellow wool coat, too big at the shoulders, three wooden buttons, dark green boots; always carries/wears: a large brass key on a loop of red string around her neck
  - Pim (the fox who learned the lamp, a small grey fox) — dusty grey coat with a cream chest and cream tail tip, one ear permanently folded over at the tip, the left one, narrow amber eyes, small for a fox, terrier-sized

Lay them out side by side on one clean sheet, each shown in three poses:
(1) standing three-quarter view, (2) leaning in / listening, (3) mid-motion.

Plain paper background. No text, no labels, no captions, no borders, no frames.
The same character must be identical between its own three poses — same
silhouette, same face, same colours, same props.
```

---

## PROMPT 1 — page 0

```text
Illustrate EXACTLY this moment from a children's picture book:

"At the bottom of Marigold Hill, where the road gave up and turned into grass, there lived a girl named Nila who was in charge of exactly one thing."

Composition: Wide establishing shot, full body, daylight. Baseline reference for every later page.

Characters present:
  - Nila — black hair in two short braids that stick out slightly at the ends, round face, thick eyebrows, a small gap between her front teeth, mustard-yellow wool coat, too big at the shoulders, three wooden buttons, dark green boots; always carries/wears: a large brass key on a loop of red string around her neck

Match the CHARACTER REFERENCE SHEET you generated at the top of this thread EXACTLY: same face, same silhouette, same colours, same props. Do not restyle or reinterpret the character.

Style: warm hand-drawn watercolour with ink linework, visible textured paper grain, soft edges, no digital gloss. Picture-book illustration, not photorealism, not 3D render, not anime.
Palette: paper cream, warm ink brown, marigold, sage, dusk violet

Render as a single scene. No text, no captions, no speech bubbles, no page
numbers, no borders, no frames. Do not add any human character who is not
listed above.
```

---

## PROMPT 2 — page 1

```text
Illustrate EXACTLY this moment from a children's picture book:

"Every evening she carried the brass key down the hill and wound the old lamp at the crossing, so that anyone walking home in the dark would know which way was home."

(The previous page read: "At the bottom of Marigold Hill, where the road gave up and turned into grass, there lived a girl named Nila who was in charge of exactly one thing.")

Composition: Full body in motion, walking, side view, late afternoon.

Characters present:
  - Nila — black hair in two short braids that stick out slightly at the ends, round face, thick eyebrows, a small gap between her front teeth, mustard-yellow wool coat, too big at the shoulders, three wooden buttons, dark green boots; always carries/wears: a large brass key on a loop of red string around her neck

Match the CHARACTER REFERENCE SHEET you generated at the top of this thread EXACTLY: same face, same silhouette, same colours, same props. Do not restyle or reinterpret the character.

Style: warm hand-drawn watercolour with ink linework, visible textured paper grain, soft edges, no digital gloss. Picture-book illustration, not photorealism, not 3D render, not anime.
Palette: paper cream, warm ink brown, marigold, sage, dusk violet

Render as a single scene. No text, no captions, no speech bubbles, no page
numbers, no borders, no frames. Do not add any human character who is not
listed above.
```

---

## PROMPT 3 — page 2

```text
Illustrate EXACTLY this moment from a children's picture book:

"The key was heavier than it looked. Nila's grandmother had carried it before her, and her grandmother's grandmother before that, and none of them had ever once been late."

(The previous page read: "Every evening she carried the brass key down the hill and wound the old lamp at the crossing, so that anyone walking home in the dark would know which way was home.")

Composition: Close-up on face and hands holding the key.

Characters present:
  - Nila — black hair in two short braids that stick out slightly at the ends, round face, thick eyebrows, a small gap between her front teeth, mustard-yellow wool coat, too big at the shoulders, three wooden buttons, dark green boots; always carries/wears: a large brass key on a loop of red string around her neck

Match the CHARACTER REFERENCE SHEET you generated at the top of this thread EXACTLY: same face, same silhouette, same colours, same props. Do not restyle or reinterpret the character.

Style: warm hand-drawn watercolour with ink linework, visible textured paper grain, soft edges, no digital gloss. Picture-book illustration, not photorealism, not 3D render, not anime.
Palette: paper cream, warm ink brown, marigold, sage, dusk violet

Render as a single scene. No text, no captions, no speech bubbles, no page
numbers, no borders, no frames. Do not add any human character who is not
listed above.
```

---

## PROMPT 4 — page 3

```text
Illustrate EXACTLY this moment from a children's picture book:

"But on the evening this story is about, Nila reached the crossing and found the lamp already lit — and a small grey fox sitting underneath it, looking very pleased with himself."

(The previous page read: "The key was heavier than it looked. Nila's grandmother had carried it before her, and her grandmother's grandmother before that, and none of them had ever once been late.")

Composition: Two characters, first appearance of Pim.

Characters present:
  - Nila — black hair in two short braids that stick out slightly at the ends, round face, thick eyebrows, a small gap between her front teeth, mustard-yellow wool coat, too big at the shoulders, three wooden buttons, dark green boots; always carries/wears: a large brass key on a loop of red string around her neck
  - Pim — dusty grey coat with a cream chest and cream tail tip, one ear permanently folded over at the tip, the left one, narrow amber eyes, small for a fox, terrier-sized

Match the CHARACTER REFERENCE SHEET you generated at the top of this thread EXACTLY: same face, same silhouette, same colours, same props. Do not restyle or reinterpret the character.

Style: warm hand-drawn watercolour with ink linework, visible textured paper grain, soft edges, no digital gloss. Picture-book illustration, not photorealism, not 3D render, not anime.
Palette: paper cream, warm ink brown, marigold, sage, dusk violet

Render as a single scene. No text, no captions, no speech bubbles, no page
numbers, no borders, no frames. Do not add any human character who is not
listed above.
```

---

## PROMPT 5 — page 4

```text
Illustrate EXACTLY this moment from a children's picture book:

""You cannot light the lamp," said Nila. "You do not have the key." The fox looked at the key. The fox looked at Nila. The fox did not appear to think the key was the important part."

(The previous page read: "But on the evening this story is about, Nila reached the crossing and found the lamp already lit — and a small grey fox sitting underneath it, looking very pleased with himself.")

Composition: Both characters, eye level, dusk.

Characters present:
  - Nila — black hair in two short braids that stick out slightly at the ends, round face, thick eyebrows, a small gap between her front teeth, mustard-yellow wool coat, too big at the shoulders, three wooden buttons, dark green boots; always carries/wears: a large brass key on a loop of red string around her neck
  - Pim — dusty grey coat with a cream chest and cream tail tip, one ear permanently folded over at the tip, the left one, narrow amber eyes, small for a fox, terrier-sized

Match the CHARACTER REFERENCE SHEET you generated at the top of this thread EXACTLY: same face, same silhouette, same colours, same props. Do not restyle or reinterpret the character.

Style: warm hand-drawn watercolour with ink linework, visible textured paper grain, soft edges, no digital gloss. Picture-book illustration, not photorealism, not 3D render, not anime.
Palette: paper cream, warm ink brown, marigold, sage, dusk violet

Render as a single scene. No text, no captions, no speech bubbles, no page
numbers, no borders, no frames. Do not add any human character who is not
listed above.
```

---

## PROMPT 6 — page 5

```text
Illustrate EXACTLY this moment from a children's picture book:

"His name was Pim, and he had been lighting the lamp for eleven nights, ever since the evening Nila's grandmother stopped coming down the hill."

(The previous page read: ""You cannot light the lamp," said Nila. "You do not have the key." The fox looked at the key. The fox looked at Nila. The fox did not appear to think the key was the important part.")

Composition: Fox alone, close, warm lamplight from above.

Characters present:
  - Pim — dusty grey coat with a cream chest and cream tail tip, one ear permanently folded over at the tip, the left one, narrow amber eyes, small for a fox, terrier-sized

Match the CHARACTER REFERENCE SHEET you generated at the top of this thread EXACTLY: same face, same silhouette, same colours, same props. Do not restyle or reinterpret the character.

Style: warm hand-drawn watercolour with ink linework, visible textured paper grain, soft edges, no digital gloss. Picture-book illustration, not photorealism, not 3D render, not anime.
Palette: paper cream, warm ink brown, marigold, sage, dusk violet

Render as a single scene. No text, no captions, no speech bubbles, no page
numbers, no borders, no frames. Do not add any human character who is not
listed above.
```

---

## PROMPT 7 — page 6

```text
Illustrate EXACTLY this moment from a children's picture book:

"Nila sat down on the cold step, because that was a thing she had not let herself think about for eleven nights."

(The previous page read: "His name was Pim, and he had been lighting the lamp for eleven nights, ever since the evening Nila's grandmother stopped coming down the hill.")

Composition: Character alone, seated, back three-quarter, night.

Characters present:
  - Nila — black hair in two short braids that stick out slightly at the ends, round face, thick eyebrows, a small gap between her front teeth, mustard-yellow wool coat, too big at the shoulders, three wooden buttons, dark green boots; always carries/wears: a large brass key on a loop of red string around her neck

Match the CHARACTER REFERENCE SHEET you generated at the top of this thread EXACTLY: same face, same silhouette, same colours, same props. Do not restyle or reinterpret the character.

Style: warm hand-drawn watercolour with ink linework, visible textured paper grain, soft edges, no digital gloss. Picture-book illustration, not photorealism, not 3D render, not anime.
Palette: paper cream, warm ink brown, marigold, sage, dusk violet

Render as a single scene. No text, no captions, no speech bubbles, no page
numbers, no borders, no frames. Do not add any human character who is not
listed above.
```

---

## PROMPT 8 — page 7

```text
Illustrate EXACTLY this moment from a children's picture book:

""She showed me how," said Pim. "She said someone ought to know, in case there was ever an evening when nobody came.""

(The previous page read: "Nila sat down on the cold step, because that was a thing she had not let herself think about for eleven nights.")

Composition: Two characters, night, strong lamp backlight.

Characters present:
  - Nila — black hair in two short braids that stick out slightly at the ends, round face, thick eyebrows, a small gap between her front teeth, mustard-yellow wool coat, too big at the shoulders, three wooden buttons, dark green boots; always carries/wears: a large brass key on a loop of red string around her neck
  - Pim — dusty grey coat with a cream chest and cream tail tip, one ear permanently folded over at the tip, the left one, narrow amber eyes, small for a fox, terrier-sized

Match the CHARACTER REFERENCE SHEET you generated at the top of this thread EXACTLY: same face, same silhouette, same colours, same props. Do not restyle or reinterpret the character.

Style: warm hand-drawn watercolour with ink linework, visible textured paper grain, soft edges, no digital gloss. Picture-book illustration, not photorealism, not 3D render, not anime.
Palette: paper cream, warm ink brown, marigold, sage, dusk violet

Render as a single scene. No text, no captions, no speech bubbles, no page
numbers, no borders, no frames. Do not add any human character who is not
listed above.
```

---

## PROMPT 9 — page 8

```text
Illustrate EXACTLY this moment from a children's picture book:

"So they wound it together, the girl and the fox, one turn each, until the light went out across the fields the way it was supposed to."

(The previous page read: ""She showed me how," said Pim. "She said someone ought to know, in case there was ever an evening when nobody came."")

Composition: Two characters mid-action, hands and paws on the lamp, night.

Characters present:
  - Nila — black hair in two short braids that stick out slightly at the ends, round face, thick eyebrows, a small gap between her front teeth, mustard-yellow wool coat, too big at the shoulders, three wooden buttons, dark green boots; always carries/wears: a large brass key on a loop of red string around her neck
  - Pim — dusty grey coat with a cream chest and cream tail tip, one ear permanently folded over at the tip, the left one, narrow amber eyes, small for a fox, terrier-sized

Match the CHARACTER REFERENCE SHEET you generated at the top of this thread EXACTLY: same face, same silhouette, same colours, same props. Do not restyle or reinterpret the character.

Style: warm hand-drawn watercolour with ink linework, visible textured paper grain, soft edges, no digital gloss. Picture-book illustration, not photorealism, not 3D render, not anime.
Palette: paper cream, warm ink brown, marigold, sage, dusk violet

Render as a single scene. No text, no captions, no speech bubbles, no page
numbers, no borders, no frames. Do not add any human character who is not
listed above.
```

---

## PROMPT 10 — page 9

```text
Illustrate EXACTLY this moment from a children's picture book:

"And in the morning Nila climbed back up Marigold Hill with the brass key swinging at her neck and a grey fox trotting a little way behind her, pretending not to follow."

(The previous page read: "So they wound it together, the girl and the fox, one turn each, until the light went out across the fields the way it was supposed to.")

Composition: Wide shot, morning daylight, both characters.

Characters present:
  - Nila — black hair in two short braids that stick out slightly at the ends, round face, thick eyebrows, a small gap between her front teeth, mustard-yellow wool coat, too big at the shoulders, three wooden buttons, dark green boots; always carries/wears: a large brass key on a loop of red string around her neck
  - Pim — dusty grey coat with a cream chest and cream tail tip, one ear permanently folded over at the tip, the left one, narrow amber eyes, small for a fox, terrier-sized

Match the CHARACTER REFERENCE SHEET you generated at the top of this thread EXACTLY: same face, same silhouette, same colours, same props. Do not restyle or reinterpret the character.

Style: warm hand-drawn watercolour with ink linework, visible textured paper grain, soft edges, no digital gloss. Picture-book illustration, not photorealism, not 3D render, not anime.
Palette: paper cream, warm ink brown, marigold, sage, dusk violet

Render as a single scene. No text, no captions, no speech bubbles, no page
numbers, no borders, no frames. Do not add any human character who is not
listed above.
```

---

## Scoring — DO NOT PASTE INTO THE CHAT

`_stressTest` from `story.json`: what each page is designed to break. Never
sent to any model, in either arm.

| Page | What it stresses |
|---|---|
| 0 | Wide establishing shot, full body, daylight. Baseline reference for every later page. |
| 1 | does the character survive a profile view. |
| 2 | does the face hold at close range after two wide shots. |
| 3 | does adding a second character destabilise the first. |
| 4 | two-character consistency in changed light. |
| 5 | the second character alone, under coloured light. |
| 6 | the hardest pose — seated, from behind, in the dark. |
| 7 | silhouette legibility when rim-lit. |
| 8 | interaction without limb errors. |
| 9 | return to page-1 conditions — the drift check. Compare directly against page 1. |

### The five anchors to check on every page

Score each page pass/fail against the character sheet, not against the page
before it — drift is cumulative and grading against the neighbour hides it.

- **Brass key on red string** — the sharpest signal. A persistent prop is the
  first thing to vanish.
- **Two short braids** that stick out at the ends
- **Mustard coat, three wooden buttons**, too big at the shoulders
- **Dark green boots**
- **Pim's folded LEFT ear tip** and cream tail tip (pages 3, 4, 5, 7, 8, 9)

### Result to record

- Attended minutes (stopwatch, including waiting on each render)
- Pages refused outright
- Pages you would have regenerated in real fulfilment (but did not)
- First page where the key disappears
