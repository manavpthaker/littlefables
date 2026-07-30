# Art prompt

Paste the relevant section into your image generator (Midjourney, Flux,
SDXL, Gemini Nano Banana, DALL-E, etc.) and fill in the bracketed pieces.
Each book gets a cover plus optional per-page scene art. Both live inside
the app's warm palette so the shelf and reader feel like one book.

The whole point is **consistency**. If Bramble is a hedgehog on page 1, he's
the same hedgehog with the same colors and the same posture on page 8.
Every image tool has its own trick for this — capture your final character
prompt at the top of the story folder as `character-notes.md` and reuse it
verbatim in every page prompt. Reference-image / style-reference features
(Midjourney `--sref` + `--cref`, Flux Redux, Gemini image-to-image) are the
easiest way to get there.

---

## The style anchor (in every prompt)

Use this exact language — every book uses it, so the shelf stays coherent:

> warm children's picture-book watercolor illustration, soft edges,
> hand-painted feel, cozy bedtime palette (paper cream #F4ECDA,
> terracotta, marigold, honey, sage green, teal), one clear focal moment,
> natural composition, gentle depth, no text, no logos, no watermarks,
> no photorealism, no harsh contrast, no screens or modern tech

Optional intensifiers when you want a specific mood:

- **cozy / snug:** "soft glow, wool-textured, tucked-in", "small warm
  light source (a lantern, a hearth, a moon)"
- **outdoors:** "dappled light, tall grass, hand-drawn foliage"
- **quiet / bedtime-leaning:** "hushed palette, moonlight,
  low-saturation, breath-held stillness"
- **wonder / discovery:** "big open sky, small character looking up,
  soft awe"

---

## 1 · Cover prompt

**Aspect ratio: 1:1** (looks best on the shelf grid). If your tool
requires a longer form (`--ar 1:1` in Midjourney, `1024x1024` in DALL-E,
etc.), add it. Portrait 4:5 also works.

Template:

> [style anchor]
>
> Book cover for "[TITLE]". A single hero moment: [MAIN CHARACTER,
> described in 6–10 words including species/species-like, size,
> distinguishing colors, one signature detail]. [ENVIRONMENT in a
> short phrase — one place, one time of day, one weather note]. The
> character is [POSTURE — what they're doing that makes the reader
> want to open the book]. Composition centers the character with room
> above for breath.

**Example** (for a story called "Hedgehog's Goodnight"):

> warm children's picture-book watercolor illustration, soft edges,
> hand-painted feel, cozy bedtime palette (paper cream, terracotta,
> marigold, honey, sage green, teal), one clear focal moment, no text,
> no logos.
>
> Book cover for "Hedgehog's Goodnight". A small round hedgehog with warm
> honey-brown quills, black button nose, a tiny yellow scarf around his
> neck, sitting on a bed of autumn leaves under a soft yellow lantern
> hanging from a birch branch. Twilight sky just deepening to indigo.
> Hedgehog is looking up at the lantern with eyes half-closed, smiling
> softly. Composition centers him with the lantern glowing above.

Save the result as `cover.png` in the book folder.

---

## 2 · Per-page scene prompt

**Aspect ratio: 4:3** (matches the reader's `.lf-art-card` shape). One
image per page you want illustrated. Missing pages fall back to the cover
in the reader — perfectly fine to only illustrate the pages that need it.

Template:

> [style anchor]
>
> Scene illustration. [CHARACTER description from your character-notes.md,
> copy-pasted verbatim]. [WHAT THEY ARE DOING on this page, taken
> literally from the page text]. [SETTING — where, when, weather, light].
> [ONE VISUAL DETAIL that anchors the moment — a specific object, a color
> accent, a small element that appears in the story text].
>
> Composition: [pick one — "wide, character small in the middle of a big
> quiet space" / "medium, character centered with breathing room" /
> "close, character fills the frame from shoulders up"].
>
> Mood: [pick one — "quiet and cozy" / "curious and awake" / "brave and
> ready" / "sleepy and settled"]. No text, no logos, no watermarks.

**Example** (Hedgehog page 3 — the text says "The forest went quiet. Even
the wind held its breath."):

> [style anchor]
>
> Scene illustration. Small round hedgehog, warm honey-brown quills,
> black button nose, tiny yellow scarf. Sitting very still on a fallen
> log, ears turned outward, listening. Autumn birch forest at dusk;
> mist gathering low; no wind — every leaf still. A single golden leaf
> is suspended mid-fall in front of him, caught in a paused breath.
>
> Composition: wide, character small in the middle of a big quiet
> space. Mood: quiet and cozy. No text.

Save as `pages/03.png` (matches the page number in the reader).

---

## 3 · Consistency tricks

Choose one and stick to it. Order from cheapest to best:

1. **Copy-paste the character block.** Write your character in 6–15
   words the first time, save it to `content/books/<slug>/character-notes.md`,
   and paste that exact block into every subsequent prompt. Small
   wording drift → visible drift.
2. **Reference-image style transfer.** After the cover generates,
   attach it as a style / character reference on every page prompt
   (Midjourney `--cref <url> --sref <url>`, Flux Redux input,
   Gemini image-to-image). This is the biggest single quality lift.
3. **Character sheet first.** Generate a dedicated "turnaround" image
   before any story pages — same character in 4 poses (standing,
   sitting, looking up, sleeping) — and use that sheet as the
   reference for every page. Tools that support multi-reference (recent
   Midjourney, some Flux workflows) benefit most.

Also:

- **Same time of day per scene, not per page.** If two adjacent pages are
  the same moment in the story, keep the lighting identical. If the
  story moves from dusk to night, let one page carry the transition
  explicitly ("the last light going out of the sky").
- **Palette discipline.** Reject any output that goes neon, high-contrast,
  or introduces a color that isn't in the anchor palette. Regenerate.
- **No text in art.** Every generator adds gibberish text sometimes.
  Reject and regenerate — never ship it.

---

## 4 · Cover vs page — one honest tradeoff

If you only have time to make one image per book, **make the cover well and
skip page art entirely**. The reader falls back to the cover for every
page (with a soft treatment), and one great cover reads much more like a
book than eight rushed page images. Add page art only for pages that need
a specific visual to land the moment (a big reveal, a scene the text
depends on, an emotional beat).

---

## 5 · After the images

For each book folder:

```
content/books/<slug>/
  story.json
  cover.png                (from Section 1)
  character-notes.md       (your character block — for reuse)
  pages/
    01.png                 (from Section 2, only for pages you illustrate)
    02.png
    ...
```

Then `pnpm content:add content/books/<slug>` uploads everything.

Re-runs are idempotent — swap a `pages/03.png` for a better version and
re-import; the reader picks up the new image on the next open.
