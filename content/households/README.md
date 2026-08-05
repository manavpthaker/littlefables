# Households

Each folder here is one household — us (`home/`), the public demo (`demo/`),
and every custom-order buyer we ship to (`<lastname>/`).

The folder is the source of truth for **which books belong to this household**.
The Supabase rows for `households`, `parents`, `children`, `child_devices`,
and `books.household_id` are a deployment cache of what's in the folder plus
what `scripts/new-household.ts` provisioned.

## Layout

```
content/households/<slug>/
  household.yaml          # metadata: name, child, band, contact, provisioned IDs
  README.md               # per-household notes (magic URL, order#, delivery date)
  books/
    <book-slug>/          # normal book folder — story.json, cover.png, pages/, audio/
      story.json
      cover.png
      pages/
      audio/
```

Slug convention:

- `home` — us. Special-cased so we don't shove our surname in a folder name.
- `demo` — the public demo household (Rosa). What buyers see in the walkthrough.
- `<lastname>` — a real buyer household. e.g. `patel`, `okafor`, `kim-tanaka`.
  If two families share a last name, disambiguate with `<lastname>-<city>`.

## Adding a household

For a real order:

```bash
# 1. Provision the DB rows + magic URL
pnpm exec tsx scripts/new-household.ts \
  --name "Patel Family" \
  --child "Ravi" \
  --band 4-8 \
  --email buyer@example.com \
  --parent "Priya Patel" \
  --device-label "Ravi's iPad" \
  --base-url https://littlefables.app

# 2. Copy the printed IDs + magic URL into content/households/patel/household.yaml
mkdir -p content/households/patel/books
cp content/households/_TEMPLATE.yaml content/households/patel/household.yaml
# → fill in the yaml with what new-household.ts printed

# 3. Author the book under content/households/patel/books/<slug>/
#    (character-notes.md, story.json, cover.png, pages/, audio/)

# 4. Import the book. The household is inferred from the folder path via
#    household.yaml → household.provisioned_id, so no --household flag needed
#    once the yaml is filled in. Pass --household <uuid> only to override.
pnpm content:add content/households/patel/books/<slug>

# 5. Narrate + publish
pnpm content:publish content/households/patel/books/<slug>
```

The `household.yaml` is metadata-only right now — it documents what was
provisioned so we (or a future script) can rebuild the household without
guessing. It is **not** read at runtime.

## What NOT to put here

- Buyer PII beyond email/name — no addresses, no phone numbers. Keep those
  in the Etsy dashboard.
- Raw device tokens — the printed magic URL is fine to keep (rotates on
  re-provision anyway), but never paste the raw token hash.
- Reference photos of the child — those go in
  `content/households/<slug>/books/<slug>/reference/child-photo.jpg` and
  are gitignored by the existing `reference/` rule.
