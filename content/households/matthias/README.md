# Matthias household

Averill's household. Created from order `test-26-08-0605` — a **test order**,
not a real Etsy sale (buyer email is one of ours).

## ⚠️ `take-it-with-you` has no source folder

`docs/commerce/orders.csv` records that book as `IMPORTED` on 2026-08-07, with
a live delivery URL. But the folder
`content/households/matthias/books/take-it-with-you/` does not exist on this
machine and **never appears in git history** — searched with
`git log --all --diff-filter=A --name-only`.

This violates binding rule #2 (books are files; the DB row is a cache). Right
now the only copy of that book is the Supabase row. Consequences:

- Re-running `pnpm content:add` cannot rebuild it.
- Editing it means editing the DB directly, or re-authoring from scratch.

Most likely it was authored on another machine (CLAUDE.md notes the Mini has a
different skill set) and never synced. **Before doing anything else with this
household, check the other machine for that folder.** If it is there, commit
it. If it is gone, pull the story text back out of Supabase and reconstruct the
folder so the file stays the source of truth.

## Books

| Slug | Status |
|---|---|
| `take-it-with-you` | Imported 2026-08-07 · **source folder missing** |
| `one-step-then-me` | Draft, authored 2026-08-14 — see `books/one-step-then-me/` |

## Provisioning

Already provisioned. The UUIDs in `household.yaml` come from the orders.csv
row. Do **not** re-run `scripts/new-household.ts` for this household — it
rotates the device token and would break the delivered magic URL.
