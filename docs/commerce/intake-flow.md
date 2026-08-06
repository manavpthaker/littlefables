# Intake Flow

How a buyer intake gets from an Etsy sale to a queued order in `/parent/intakes`.

Supersedes [`intake-typeform.md`](intake-typeform.md) — we self-host now.

## Model in one line

Every Etsy sale gets a **pre-created intake row** with a magic link. The
buyer opens the link, fills only the creative brief, and never retypes
their email or order number.

## Why per-order magic links

The alternative — one generic `littlefables.app/intake` for everyone — makes
the buyer retype what Etsy already knew about them (email, name, order
number), gives us no way to reconcile the submission back to the sale, and
introduces a "prove you paid" trust wobble on a paid product. Manav
spending ten seconds per sale to run one script and paste one URL is
cheaper than every buyer spending a minute correcting the same fields.

## The three URLs a buyer might land on

| URL | Who reaches it | Behavior |
|---|---|---|
| `/intake/<token>` | The buyer, via the Etsy message Manav sends | Form pre-filled with locked buyer email + Etsy order #. Greets by first name. Only asks the creative-brief questions. |
| `/intake` (no token) | Safety net: lost link, in-person friend/family order | Banner asks them to check Etsy messages first; if they proceed, they type email + order # themselves. |
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
   - `--base-url` override (only useful in dev)

   Re-running with the same `--etsy` value returns the existing row's
   URL, not a duplicate.

3. **Copy the printed magic URL** and paste it into Etsy's "message to
   buyer" thread on that order. That's where buyers look for post-purchase
   instructions. Example message:

   > Hi Kate — welcome. Here's your personal link to tell us about your kid:
   > `https://littlefables.app/intake/A7X9K2P`. Takes about five minutes;
   > style previews land in your inbox within 24 hours.

4. **Row appears in `/parent/intakes` under "Awaiting buyer".** No email
   sent to you yet.

5. **Buyer opens the link, fills the form, submits.**
   - Row updates in place (same `id`, same token — token is now spent).
   - Status flips `awaiting` → `new`.
   - Row moves to the **New** tab.
   - You get a Resend email at `INTAKE_NOTIFY_EMAIL` with a signed photo
     URL (7 days) and a link to the admin.
   - Buyer lands on `/intake/thanks` with a warm confirmation.

6. **You build the book.** Move the status through **In progress** →
   **Delivered** as you go. Notes field on each row is for slugs,
   provisioned URLs, and gotchas — persisted across sessions.

## What the buyer sees on the form

Prefilled and locked:
- Buyer email
- Etsy order number
- Gift-from name (if you passed `--gift-from`)

Asked:
- Child's name (prefilled if you passed `--child`, editable)
- Age band (3–4 / 5–6 / 7–8 / 9+)
- Up to 3 interests (chips)
- Up to 2 traits (chips)
- Picture books they love the look of (free text)
- What the child looks like (free text) + optional photo upload
- Gift context (only if `--gift-from` wasn't set at order creation)

The chip lists and free-text prompts match
[`intake-typeform.md`](intake-typeform.md) so we can A/B against a hosted
form later without re-authoring the questions.

## Data path

```
Etsy sale
  │
  ▼
pnpm order:new  ──►  intakes row (status=awaiting, token, buyer_email,
  │                              etsy_order, buyer_name, gift_from)
  │
  ▼
Etsy message with /intake/<token>
  │
  ▼
Buyer opens link  ──►  GET /intake/[token]  ──►  hydrate form from row
  │
  ▼
Buyer submits  ──►  POST /api/intake  (multipart, token in body)
                     ├─ optional photo → intake-uploads bucket (private)
                     ├─ row updated in place, status → 'new'
                     └─ Resend notification to INTAKE_NOTIFY_EMAIL
  │
  ▼
Manav triages in /parent/intakes
```

## Env

Set on Vercel (and `.env.local` for dev):

| Var | Purpose | Default |
|---|---|---|
| `INTAKE_NOTIFY_EMAIL` | Where new-submission pings land | falls back to `RESEND_FROM_EMAIL` |
| `NEXT_PUBLIC_BASE_URL` | Absolute base for magic URLs in emails | `https://littlefables.app` |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` / `RESEND_FROM_NAME` | Notification email | required for the ping to send |
| `SUPABASE_URL` / `SUPABASE_SECRET_KEY` | Service role for row writes + photo bucket | required |

## Files

| Concern | File |
|---|---|
| Migration (table + status enum) | `supabase/migrations/20260805000019_intakes.sql` |
| Migration (token + buyer_name + awaiting) | `supabase/migrations/20260805000020_intakes_tokens.sql` |
| Per-order provisioning CLI | `scripts/new-order.ts` (aliased `pnpm order:new`) |
| Token-scoped intake page | `app/intake/[token]/page.tsx` |
| Walk-up intake page (safety net) | `app/intake/page.tsx` |
| Shared form | `app/intake/intake-form.tsx` |
| Submission handler (dual-path) | `app/api/intake/route.ts` |
| Thanks page | `app/intake/thanks/page.tsx` |
| Admin listing | `app/parent/intakes/page.tsx` |
| Admin row + actions | `app/parent/intakes/intake-row.tsx`, `actions.ts` |
| Notification email | `lib/server/resend-mailer.ts` → `sendIntakeNotification` |

## Where this hands off

Once a row is in **New**, the rest of the pipeline is the existing
fulfillment playbook: author `story.json`, run the art skill, publish
with `pnpm content:add`. Provisioning the household and minting the
reader magic URL is [`scripts/new-household.ts`](../../scripts/new-household.ts).
Later, we may auto-link the intake row to the provisioned household so
`/parent/intakes` shows the reader URL inline — for now, the household
UUID goes in the row's notes field manually.
