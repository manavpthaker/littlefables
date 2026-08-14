# Whitehead household

Atlanta. Elijah (6) and his big sister Kinley (9/10). Our godson's family —
this is a gift household, not an Etsy order, so there is no intake row and no
order number.

## Books

| Slug | Title | Occasion | State |
|---|---|---|---|
| `elijah-goes-first` | Elijah Goes First | Elijah's sixth birthday | Text complete, art not generated |

## Status

- [x] `story.json` — 20 pages, 3 chapters, rubric 92/100
- [x] `character-notes.md`
- [x] `page-art-prompts.md`
- [x] `parent-guide.md`
- [ ] `cover.png` + `pages/01–20.png` — generate per `page-art-prompts.md`
- [ ] Household provisioned (`scripts/new-household.ts`) — `household.yaml`
      still has placeholder zeros
- [ ] `pnpm content:add content/households/whitehead/books/elijah-goes-first`
- [ ] Narrate + publish

## Open questions for the family

Two things in the story text are assumptions and are a find-and-replace to fix.
Settle them **before** narrating — audio is the expensive step to redo.

1. **"Mama" / "Daddy"** — placeholders for whatever Elijah actually calls his
   parents. Appear on pages 9 and 18.
2. **"Uncle Manav" / "Auntie Indira"** — assumed forms of address for the
   godparents. Appear on pages 13 and 18.

If either changes, update `story.json`, `character-notes.md`, and
`page-art-prompts.md` in the same pass.

## Reference photos

Supplied out of band and **deliberately not committed**, per
`content/art/recurring-human-character-references.md`. The likeness anchors in
`character-notes.md` are text-only and are the sole input to the image
generator. Per `CLAUDE.md`, likeness generation from a real photograph is
untested and gated — do not point an image API at the family's photos.
