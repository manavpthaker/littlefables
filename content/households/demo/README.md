# Demo household

The one household we can point strangers at without touching Azi's shelf.
It contains one book (Rosa's *Lantern of Round Pond*) and is the household
featured in the walkthrough film and Etsy listing screenshots.

## Provisioning

Not yet in Supabase. First-time setup:

```bash
pnpm exec tsx scripts/new-household.ts \
  --name "Demo Household" \
  --child "Rosa" \
  --band 4-8 \
  --email demo@littlefables.app \
  --parent "Demo Parent" \
  --device-label "Demo iPad" \
  --base-url https://littlefables.app

# copy the printed household + child + magic URL into household.yaml

pnpm content:add content/households/demo/books/lantern-round-pond \
  --household <household-uuid-from-above>

pnpm content:narrate content/households/demo/books/lantern-round-pond
```

## What this household is for

- The marketing home page's "see the demo" link mints this magic URL.
- The walkthrough film records against this household's reader.
- Etsy listing screenshots pull from this shelf.

Do not add Azi-specific or family-only books here. If we ever want to
ship a book to every future customer as a freebie, put it in a shared
pool (introduce `content/households/_shared/` at that point) rather than
duplicating it into every household folder.
