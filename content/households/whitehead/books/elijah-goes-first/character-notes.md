# Character notes — Elijah Goes First

Paste these blocks **verbatim** into every prompt. Do not paraphrase, do not
"improve" the wording between pages — small wording drift is what makes a face
change between page three and page six.

These are text-only likeness anchors distilled from private family reference
photos, following the convention in
`content/art/recurring-human-character-references.md`. **The reference photos
themselves are not in this repo and must not be committed** (the `.gitignore`
rules under `content/households/**` cover images and `reference*/` folders).

**Likeness warning.** Per `CLAUDE.md`, generating a likeness from a buyer photo
is untested and gated. Do not feed the family's photographs to an image API.
These text blocks are the whole input.

---

## Elijah (main character — appears on every page)

```text
Elijah, a six-year-old Black boy with warm deep-brown skin, a round open face,
large dark eyes, and short dense black curls kept close to his head. He wears a
navy short-sleeve shirt with a red collar band, olive-and-tan camouflage cargo
pants, and navy sneakers with white soles. Small for six and aware of it;
carries himself chin-up and ready.
```

## Kinley (main character — appears on every page except 17)

```text
Kinley, a nine-year-old Black girl with warm brown skin, a steady watchful face,
and long dark box braids falling past her shoulders with small colorful beads
threaded at the ends. She wears a pale pink t-shirt with a soft faded graphic,
cream leggings with tiny multicolored dots, and white sneakers with pink and
silver at the heel. Taller than her brother by a clear head.
```

## Mama (pages 18 only)

```text
Mama, a Black woman in her late thirties with warm brown skin, long dark wavy
hair past her shoulders, an open bright smile, and a fine gold chain at her
throat. She wears an olive utility jacket over a black top. Modern everyday
clothes only.
```

## Daddy (pages 18 only; referred to on page 9)

```text
Daddy, a Black man in his late thirties with warm deep-brown skin, a cleanly
shaved head, a neat full dark beard, and a wide open grin. He wears a dark
navy button-down shirt with the sleeves pushed up. Modern everyday clothes only.
```

## Uncle Manav (pages 13 and 18)

Verbatim from `content/art/recurring-human-character-references.md` — this is the
same person who appears in the `home/` books as Papa. Keep him identical.

```text
Manav/Papa/Pap: modern human father in his 40s, Indian/Gujarati by heritage,
with warm medium-brown skin, short dark hair with close faded sides, neatly
trimmed full beard with subtle salt-and-pepper, dark kind eyes behind round
glasses or clear round frames, expressive brows, and a broad playful grin.
Contemporary everyday clothes such as tan jacket, brown overshirt, denim shirt,
or white tee; never ethnic/traditional/costume clothing unless the page text
explicitly calls for it. In this book he wears a lightweight denim shirt.
```

## Auntie Indira (pages 13 and 18)

Verbatim from the same file — the `home/` books' Mama.

```text
Indira/Mama: modern human mother in her 40s, Colombian by heritage, with warm
medium-brown skin, dark almond eyes, expressive arched brows, dark hair neatly
pulled back at home or smooth shoulder-length on outings, warm playful smile,
delicate gold jewelry, and sometimes thin round gold glasses. Contemporary
everyday clothes, never ethnic/traditional/costume clothing unless the page text
explicitly calls for it. In this book she wears a cream-and-charcoal striped top.
```

## Azi (pages 13, 17, 18)

Verbatim from the same file. He is a preschooler here, small enough to be
carried — keep him visibly younger and smaller than Elijah.

```text
Azi/Azad: preschool-age human boy with Colombian and Indian family heritage,
warm medium-brown skin, soft round cheeks, large dark expressive eyes, and dense
tousled black curls forming a rounded halo with ringlets across his forehead and
around his ears. Small red thread bracelet. Modern everyday child clothes only;
never plush, animal-like, furry, monkey-like, muzzle-faced, or dressed in
ethnic/traditional clothing unless the page text explicitly calls for it. In this
book he wears a yellow play shirt.
```

## Global human guardrail

Every character in this book is a real human being. None of them is ever plush,
animal-like, furry, or muzzle-faced. Heritage is context, not costume — keep all
clothing modern and everyday.

---

## Recurring objects

Two things anchor the book and must look identical every time they appear.

```text
The cap: a plain black baseball cap, slightly curved brim, no visible text or
logo of any kind, a little too big for a six-year-old so it sits down near his
eyebrows.
```

```text
Kinley's beads: small colorful glass beads — red, yellow, white, turquoise —
threaded onto the ends of her braids, four or five to a braid. They are the tell
for her power. When her longsight comes, they hang dead still.
```

**No text on the cap.** It is the one object a generator will want to brand.
Reject any output where the cap carries a letter, number, or logo.

---

## Continuity

The book opens on Elijah's sixth birthday, runs across the week after, and ends
the following Saturday night. Light moves forward and never goes back.

**No birthday iconography.** No cake, candles, banners, balloons, party hats, or
wrapped presents anywhere in the book — not even on pages 1–6. The birthday is
carried entirely by the text. The cap is the only present that matters and
nobody gave it to him.

| Page | When | Light |
|---|---|---|
| 1–2 | His birthday, late afternoon | Flat white heat, hard shadows |
| 3–6 | Birthday dinner, indoors | Warm interior light, blue wall, wood ceiling |
| 7–10 | Same evening, out back | Low gold sun, long shadows on asphalt |
| 11–12 | The week after | Bright ordinary daylight |
| 13 | Saturday, storm arriving | Plum-dark sky, last green light before rain |
| 14 | The blackout | Everything going out; deep navy, no gold anywhere |
| 15–17 | Full dark, raining | Only lightning and fireflies; navy and walnut |
| 18 | Streetlights return | Sudden full gold, everything wet and shining |
| 19–20 | Bedtime | One warm low lamp, soft rain on glass |

Pages 14 through 17 are the only pages in the book with **no gold light**. That
darkness is what makes page 18 land — do not sneak a warm lamp into them.

Pages 1 and 2 are the same afternoon; keep their lighting identical.

---

## Names to confirm with the family

Two things in the story text are assumptions, not facts, and are trivial to
find-and-replace in `story.json` before narration:

- **"Uncle Manav" / "Auntie Indira"** — assumed forms of address for the
  godparents. Change to whatever Elijah actually calls them.
- **"Mama" / "Daddy"** — placeholders for whatever Elijah calls his parents.

If either changes, update this file and `page-art-prompts.md` in the same pass.
