# Whitehead household

Atlanta. Elijah and his big sister Kinley (9). Our godson's family — this is a
gift household, not an Etsy order, so there is no intake row and no order
number. Elijah's exact age is deliberately unnamed in the book text at the
buyer's request; the book calls him "the birthday kid".

## Books

| Slug | Title | Occasion | State |
|---|---|---|---|
| `elijah-goes-first` | Elijah Goes First | Elijah's August birthday | v2 shipped end-to-end — text, art, narration all live |

## Art style — off-shelf on purpose

This book does **not** use the shared watercolor anchor in
`content/ART-PROMPT.md`. It is drawn as a vintage four-color superhero comic —
1960s–70s newsprint, heavy black inks, Ben-Day halftone, off-register misprint.
The story is a superhero origin, so the book looks like one.

That means it will not match the rest of the shelf, which is a real trade the
household chose. The `theme` block in `story.json` re-tints the reader chrome to
newsprint cream, comic ink black and four-color red so the frame agrees with the
art instead of fighting it.

Three constraints that fall out of the style and are easy to lose:

- **No lettering in any image** — no balloons, caption boxes, sound effects, or
  logo on the cap. Baked-in text competes with the story text and breaks
  tap-a-word.
- **Cover only may be a splash; every interior page is 2–3 panels** — at the
  buyer's request, reversing the original "single splash per page" rule. Never
  more than three; four-plus is unreadable confetti at phone size. Full rules in
  `character-notes.md → Panel format`. All 20 page prompts declare their layout
  inline.
- **The last page turns the idiom off** — level camera, flat calm colour, no
  motion lines, minimal halftone. A comic that keeps shouting through the coda
  is not a bedtime book. Note this is now carried by the *inking*, not the
  layout: page 20 is three panels like everything else, and the quiet comes
  from how it is drawn rather than from giving it the page to itself.

## Status — v2 shipped

- [x] `story.json` — 20 pages, 3 chapters, 913 words, rubric 93/100. Rewritten
      as a proper superhero origin: Elijah earns the cap by climbing an oak
      for a stranger's tabby cat while grownups call for a fire truck; Kinley
      reveals her powers AFTER his; Ch 3 climax is deliberately low-stakes
      (same tabby stuck in another tree during the blackout, Kinley stuck on
      a low branch, Elijah lifts them both down). Page-1 and page-3 openers
      split so no sentence in the book runs over 20 words.
- [x] `character-notes.md` — age dropped from Elijah's likeness block; the
      tabby added as a recurring character; new panel-format section.
- [x] `page-art-prompts.md` — all 20 page prompts rewritten for new arc AND
      new panel format.
- [x] `parent-guide.md` — unchanged. The Two-Part Power still applies; it
      maps better now that Kinley is established rather than confessed.
- [x] `cover.png` + `pages/01–20.png` — v2 regenerated per the new prompts
      and the new 1–3-panel format.
- [x] Household provisioned — hosted Supabase IDs in `household.yaml`;
      magic URL kept local-only (bearer token, not in git).
- [x] `pnpm content:add` — v2 text + v2 art uploaded to Supabase in one pass;
      no mixed-state window on the live URL.
- [x] `pnpm content:narrate` — 40/40 page × voice jobs succeeded. Day ch1p5
      needed a retry after a transient ElevenLabs fetch failure on the first
      pass; second-pass `--voice day --force` swept it clean.
- [x] `pnpm content:audit-narration` — every page has matching MP3 +
      timestamps; nothing falls back to browser TTS.

## Re-publish command (if the text ever changes again)

```
pnpm content:add     content/households/whitehead/books/elijah-goes-first
pnpm content:narrate content/households/whitehead/books/elijah-goes-first
pnpm content:audit-narration elijah-goes-first
```

## Names — resolved

- **"Mama" / "Dada"** — confirmed by the buyer.
- **"Uncle Manav" / "Auntie Indira"** — confirmed by the buyer (he is the
  godfather himself).
- **The tabby** — deliberately unnamed. She is "the tabby" both times she
  appears; her collar has no visible name tag.

## Reference photos

Supplied out of band and **deliberately not committed**, per
`content/art/recurring-human-character-references.md`. The likeness anchors in
`character-notes.md` are text-only and are the sole input to the image
generator. Per `CLAUDE.md`, likeness generation from a real photograph is
untested and gated — do not point an image API at the family's photos.
