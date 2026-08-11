# Intake Flow

How a buyer intake gets from an Etsy sale to a queued order in `/parent/intakes`, and where the build pipeline picks it up.

## Model in one line

Every sale gets a **pre-created intake row** with a magic link. The buyer
opens the link, fills only the creative brief, and never retypes their
email or order number.

## Why per-order magic links

The alternative — one generic `littlefables.app/intake` for everyone —
makes the buyer retype what Etsy already knew about them (email, name,
order number), gives us no way to reconcile the submission back to the
sale, and introduces a "prove you paid" trust wobble on a paid product.
Ten seconds per sale to run one script and paste one URL is cheaper than
every buyer spending a minute correcting the same fields.

## The three URLs a buyer might land on

| URL | Who reaches it | Behavior |
|---|---|---|
| `/intake/<token>` | The buyer, via the message you send | Form pre-filled with locked buyer email + Etsy order #. Greets by first name. Only asks the creative-brief questions. |
| `/intake` (no token) | Safety net: lost link, in-person friend order | Banner asks them to check Etsy messages first; if they proceed, they type email + order # themselves. |
| `/intake/<invalid-token>` | Typo or retired link | Friendly "this link isn't right" screen with an Etsy nudge — never 404. |

## Per-sale runbook

1. **Etsy notifies you** of a new order. Grab: buyer name, buyer email,
   Etsy order number.

2. **Run one command**:
   ```
   pnpm order:new --etsy 3852749102 --email kate@example.com --name "Kate Smith"
   ```
   Optional flags:
   - `--child "Emma"` if the listing captured a name (rare — Etsy
     personalization box is empty by design)
   - `--gift-from "Kate"` if it's a gift listing
   - `--send-email` also emails the buyer the welcome letter with a
     one-tap button to their intake URL (uses `sendWelcomeEmail`, same
     visual as the OTP email). Default off — Etsy prefers on-platform
     first contact. Turn it on for friend / direct orders, or when
     you'd rather skip the Etsy Message paste.
   - `--base-url` override (only useful in dev)

   Re-running with the same `--etsy` value returns the existing row's
   URL, not a duplicate.

3. **Paste the printed magic URL into Etsy's "message to buyer" thread**
   on that order (that's where buyers look for post-purchase
   instructions). URLs in Etsy Messages are fine — Etsy's TOS only cares
   about off-platform *payments*. Example message:

   > Hi Kate — welcome. Here's your personal link to tell us about your kid:
   > `https://littlefables.app/intake/A7X9K2P`. Takes about five minutes;
   > style previews land in your inbox within 24 hours.

   If you passed `--send-email`, the same welcome letter also lands in
   the buyer's inbox — treat Etsy Messages as belt, email as suspenders.

4. **Row appears in `/parent/intakes` under "Awaiting buyer".** No email
   sent to you yet.

5. **Buyer opens the link, fills the form, submits.**
   - Row updates in place (same `id`, same token — token is now spent).
   - Status flips `awaiting` → `new`.
   - Row moves to the **New** tab.
   - You get a Resend email at `INTAKE_NOTIFY_EMAIL` with a signed photo
     URL (7 days), the whole creative brief formatted for skim, and a
     link to the admin.
   - Buyer lands on `/intake/thanks` with a warm confirmation.

6. **Build the book** via the pipeline described below. Move the status
   through **In progress** → **Delivered** as you go. Notes field on
   each row is for slugs, provisioned URLs, and gotchas — persisted
   across sessions.

## What the buyer sees on the form

Prefilled and locked (from `order:new`):
- Buyer email
- Etsy order number
- Gift-from name (if you passed `--gift-from`)

Asked (step-per-screen, Typeform pattern):
- **Parent surname** — optional, but if given it seeds the household
  folder slug so we don't have to invent one at publish time.
- **Child's name** — prefilled if you passed `--child`, editable.
- **Age** — slider from 2 to 10 in half-year increments. Stored as
  numeric `age_years`; the four bands (3–4 / 5–6 / 7–8 / 9+) are
  derived so pacing decisions stay stable while we keep granularity.
- **Interests** — up to 3, combobox with type-ahead + custom entries.
  Optional "anything more?" text field for specifics
  ("horses, but only Icelandic ones").
- **Traits** — up to 2, same combobox pattern.
- **Cast** — free-text list of other humans the book should include
  (siblings, cousins, best friend). See the "no fabricated humans" rule
  below.
- **Sticky moment** — "What's ONE thing that's been sticky for {kid}
  lately?" The current developmental knot (transitions, big feelings,
  bedtime, sharing). This drives the story arc and the metaphor. Without
  it, a book is a highlight reel of interests dressed as a story.
- **Hoped lesson** — "What's one thing you hope {kid} learns from this
  book?" The intended takeaway. Names the tool the book puts in the
  family's shared vocabulary.
- **Art inspirations** — picture books the buyer loves the look of.
  Anchors the art-style previews.
- **Look** — free text + optional photo upload. The upload carries the
  consent copy: a drawing reference, used by us and by the illustration
  tools we draw in, never published, kept until the book is delivered and
  then deleted unless the buyer opts to keep it. **Silence deletes.** That
  sentence is the whole retention model and it is load-bearing — see below.
- **Gift context** — only asked if `--gift-from` wasn't set at order
  creation.

### No fabricated humans

Every human in the book must be someone the buyer named on the intake
or supplied a photo for. If they only named the child, the cast is
**just the child** — the mentor voice belongs to objects, nature, or
animals, not to invented parents / coaches / grandparents. This is a
product-integrity failure if we get it wrong; buyers notice invented
people and don't come back.

### Photo retention

The photo is the only thing we collect that would matter if it leaked, so it
is the only thing with a lifecycle:

1. **Upload** — `photo_consent_at` is stamped, but only on a submission that
   actually carried a file. Editing an intake later without re-attaching does
   not re-date consent, and a row that merely inherits an older `photo_path`
   never gains consent it was not given.
2. **Through the build** — the photo is needed, so it stays. `order:preview`
   pulls it into the book's gitignored `reference/` folder.
3. **Delivery** — moving a row to `delivered` in `/parent/intakes` stamps
   `delivered_at`, which starts the clock. Only on the way in, so flipping a
   row back and forth does not keep pushing deletion out. The delivery email
   carries `/intake/<token>/photo`.
4. **The buyer chooses** — delete (immediate, irreversible) or keep for a
   future book (revocable from the same page, forever).
5. **Silence** — `pnpm photo:purge` deletes anything still `pending` more than
   30 days after delivery. Dry-run by default; `--apply` to act.

`keep` is never swept. Rows whose photos predate the consent copy were
backfilled to `delete` rather than `pending`, because `pending` would be
waiting on an answer to a question those buyers were never asked.

**If you remove any of this, remove the promise too.** The claim appears on the
intake form, `/privacy`, `/faq`, the home page, and in `market-research.md` as
a competitive differentiator. It was a claim before it was a feature; do not
let it go back to being one.

## Data path

```
Etsy sale
  │
  ▼
pnpm order:new  ──►  intakes row (status=awaiting, token,
  │                              buyer_email, buyer_name,
  │                              etsy_order, gift_from)
  │
  │             ──►  (optional) sendWelcomeEmail via Resend
  │                  when --send-email is set
  │
  ▼
Buyer receives magic URL (Etsy Message and/or email)
  │
  ▼
Buyer opens link  ──►  GET /intake/[token]  ──►  hydrate form from row
  │
  ▼
Buyer submits  ──►  POST /api/intake  (multipart, token in body)
                     ├─ optional photo → intake-uploads bucket (private)
                     ├─ row updated in place, status → 'new'
                     └─ sendIntakeNotification to INTAKE_NOTIFY_EMAIL
  │
  ▼
Manav triages in /parent/intakes  ──►  order:preview → build → order:publish
```

## Env

Set on Vercel (and `.env.local` for dev):

| Var | Purpose | Default |
|---|---|---|
| `INTAKE_NOTIFY_EMAIL` | Where new-submission pings land | falls back to `RESEND_FROM_EMAIL` |
| `NEXT_PUBLIC_BASE_URL` | Absolute base for magic URLs in emails | `https://littlefables.app` |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` / `RESEND_FROM_NAME` | Both notification + welcome emails | required for sending |
| `SUPABASE_URL` / `SUPABASE_SECRET_KEY` | Service role for row writes + photo bucket | required |

## Migrations

Applied to hosted Supabase in order:

| # | File | Adds |
|---|---|---|
| 19 | `20260805000019_intakes.sql` | Table + status enum + private `intake-uploads` bucket |
| 20 | `20260805000020_intakes_tokens.sql` | `token`, `buyer_name`, `awaiting` status |
| 21 | `20260806000021_intakes_refinement.sql` | `age_years` (numeric), `interests_note`, `traits_note` |
| 22 | `20260806000022_intakes_companions.sql` | `companions` (cast free-text) |
| 23 | `20260806000023_intakes_lastname.sql` | `parent_lastname` (for folder slugs) |
| 24 | `20260807000024_intakes_story_spine.sql` | `sticky_moment`, `hoped_lesson` |
| 26 | `20260811000026_intakes_photo_retention.sql` | `photo_consent_at`, `photo_retention`, `photo_choice_at`, `photo_deleted_at`, `delivered_at` |

## Files

| Concern | File |
|---|---|
| Per-order provisioning CLI | `scripts/new-order.ts` (aliased `pnpm order:new`) |
| Token-scoped intake page | `app/intake/[token]/page.tsx` |
| Walk-up intake page (safety net) | `app/intake/page.tsx` |
| Step-per-screen form | `app/intake/intake-form.tsx` |
| Intake shell (header + footer branding) | `app/intake/layout.tsx` |
| Submission handler (dual-path) | `app/api/intake/route.ts` |
| Thanks page | `app/intake/thanks/page.tsx` |
| FAQ page (linked from shell) | `app/faq/page.tsx` |
| Privacy policy | `app/privacy/page.tsx` |
| Buyer photo keep/delete page | `app/intake/[token]/photo/page.tsx` + `photo-choice.tsx` |
| Photo retention endpoint | `app/api/intake/photo/route.ts` |
| Deletion sweep | `scripts/photo-purge.ts` (aliased `pnpm photo:purge`) |
| Admin listing | `app/parent/intakes/page.tsx` |
| Admin row + actions | `app/parent/intakes/intake-row.tsx`, `actions.ts` |
| Welcome + notification emails | `lib/server/resend-mailer.ts` (`sendWelcomeEmail`, `sendIntakeNotification`) |
| Welcome letter (Etsy download) | `LF-welcome-letter.pdf` (attached to the Etsy listing) |

## What happens after the row is "New"

Once the buyer submits, the build pipeline picks up. Each step is a
dedicated `pnpm order:*` script that reads the intake row by id.

1. **`pnpm order:preview <intake-id>`**
   Scaffolds the working folder, downloads the reference photo,
   emits two paste-ready artifacts:
   - `art-prompts-preview.md` — feed into ChatGPT with the
     `fable-art-custom` skill to generate 3 cover variants (A/B/C).
   - `buyer-preview.md` — the story text + three-cover ask, ready to
     paste into email/Etsy. Requires `story.json` + `character-notes.md`
     to already be authored (that's the creative step — draft with
     Claude, then run this).

2. **Buyer approves a cover style.** Paste the exact style anchor
   from the approved cover into `previews/APPROVED-prompt.txt`.

3. **`pnpm order:full-book <intake-id>`**
   Reads the approved anchor and the story, emits the per-page prompt
   bundle for the full-book ChatGPT session. Generate pages in that
   session; drop `cover.png` and `pages/NN.png` into the book folder.

4. **`pnpm order:publish <intake-id>`**
   Provisions the household if needed (calls `new-household.ts`,
   parses UUIDs + reader magic URL from its stdout), updates
   `household.yaml` with the provisioned IDs and intake breadcrumbs,
   spawns `content:add` to import cover + pages to Supabase Storage
   and upsert the books row, appends to `docs/commerce/orders.csv`,
   prints the reader magic URL for the delivery email.

The three scripts share `scripts/order-lib.ts` for intake fetching,
folder resolution, and slug logic.
