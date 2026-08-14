# Whitehead household

Atlanta. Elijah (6) and his big sister Kinley (9/10). Our godson's family —
this is a gift household, not an Etsy order, so there is no intake row and no
order number.

## Books

| Slug | Title | Occasion | State |
|---|---|---|---|
| `elijah-goes-first` | Elijah Goes First | Elijah's sixth birthday | Published to prod with art |

## Art style — off-shelf on purpose

This book does **not** use the shared watercolor anchor in
`content/ART-PROMPT.md`. It is drawn as a vintage four-color superhero comic —
1960s–70s newsprint, heavy black inks, Ben-Day halftone, off-register misprint,
single full-bleed splash panels. The story is a superhero story, so the book
looks like one.

That means it will not match the rest of the shelf, which is a real trade the
household chose. The `theme` block in `story.json` re-tints the reader chrome to
newsprint cream, comic ink black and four-color red so the frame agrees with the
art instead of fighting it.

Two constraints that fall out of the style and are easy to lose:

- **No lettering in any image** — no balloons, caption boxes, sound effects, or
  logo on the cap. Baked-in text competes with the story text and breaks
  tap-a-word.
- **Pages 19–20 turn the idiom off** — level camera, flat calm colour, no motion
  lines. A comic that keeps shouting through the coda is not a bedtime book.

## Status — shipped

- [x] `story.json` — 20 pages, 3 chapters, rubric 91/100
- [x] `character-notes.md`
- [x] `page-art-prompts.md`
- [x] `parent-guide.md`
- [x] `cover.png` + `pages/01–20.png` — generated per `page-art-prompts.md`
- [x] Household provisioned — hosted Supabase IDs in `household.yaml`;
      magic URL kept local-only (bearer token, not in git)
- [x] `pnpm content:add` — book row live, art in Storage
- [x] `pnpm content:narrate` — 40/40 page × voice jobs succeeded
- [x] `pnpm content:audit-narration` — every page has matching MP3 +
      timestamps; no page falls back to browser TTS

## Names — resolved

- **"Mama" / "Dada"** — confirmed by the buyer.
- **"Uncle Manav" / "Auntie Indira"** — confirmed by the buyer (he is the
  godfather himself).

## Known nit — page 1 opener

The go-first reframe re-merged the opening sentence to 26 words — the longest in
the book, and the first line read aloud. The 6–8 band target is 8–14. An earlier
pass had it split as 14+14. It splits cleanly again after "August":

> Elijah turned six on a Friday in the middle of August. It was the kind of
> afternoon when summer sits on Atlanta like a big warm dog.

**This is no longer free.** Narration has shipped, so changing page 1 means
re-running `content:narrate` for that page and re-auditing its timestamps. Given
that, leaving it as written is a perfectly reasonable call — a 26-word opener is
a wobble, not a defect, and the book averages 8.4.

Logged here rather than silently fixed because the text is the author's. The
rubric's `age_fit` is scored 17 rather than 18 while it stands, and names the
reason.

## Reference photos

Supplied out of band and **deliberately not committed**, per
`content/art/recurring-human-character-references.md`. The likeness anchors in
`character-notes.md` are text-only and are the sole input to the image
generator. Per `CLAUDE.md`, likeness generation from a real photograph is
untested and gated — do not point an image API at the family's photos.
