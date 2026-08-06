# Little Fables — Commerce Docs

Everything needed to sell custom storybooks on Etsy. Written 2026-08-04.

## What this is

Little Fables sells **custom personalized children's storybooks**. A buyer orders on
Etsy for a specific child; the child becomes the main character; we author the story,
generate the art, and deliver a saveable web-app (PWA) the buyer adds to their kid's
iPad home screen.

Target: first listing live **October 2026**, Christmas 2026 as the volume season.

## Read in this order

| File | What it holds |
|---|---|
| [`positioning.md`](positioning.md) | Audience, promise, price, differentiators, voice. **Source of truth for all copy.** |
| [`etsy-listing.md`](etsy-listing.md) | Listing title, tags, description, personalization fields, SKUs, photo shot list |
| [`intake-flow.md`](intake-flow.md) | **How the self-hosted intake works today** — per-order magic links, `pnpm order:new`, admin at `/parent/intakes`. Start here. |
| [`intake-typeform.md`](intake-typeform.md) | Superseded question spec (kept as reference for wording) |
| [`fulfillment-playbook.md`](fulfillment-playbook.md) | Per-order runbook, intake → delivery |
| [`delivery-flow.md`](delivery-flow.md) | Landing / `/read/<slug>-<token>` / `/gift/<code>` — the three arrival states, and why gift orders get their own route. Supersedes steps 24/27/28 of the playbook. |
| [`email-templates.md`](email-templates.md) | Six canned emails covering the whole order lifecycle |
| [`market-research.md`](market-research.md) | Competitor pricing, audience data, channel findings |
| [`orders.csv`](orders.csv) | Order tracking template |

## The offer in one table

| | |
|---|---|
| **Product** | Custom illustrated + narrated children's storybook, delivered as a PWA |
| **First book** | $69 |
| **Second book** | Not offered yet — mechanic built, price undecided |
| **Rush** | +$12 year-round, +$22 December |
| **Turnaround** | Style previews in 24h · final book 3–4 days after approval |
| **Guarantee** | Unlimited preview revisions, or full refund |
| **Christmas cutoff** | Dec 20 standard · Dec 22 with rush |

## Tooling

- **Intake**: Typeform (conversational mode), linked from the Etsy order confirmation
- **Art**: ChatGPT `fable-art-custom` skill (`~/.codex/skills/fable-art-custom/`)
- **Provisioning**: `pnpm exec tsx scripts/new-household.ts` → prints magic URL
- **Import**: `pnpm content:add content/households/<slug>/books/<book-slug>` (household inferred from folder path via `household.yaml`)
- **Delivery**: readable magic URL at `/read/<story-slug>/<token>` → buyer adds to home screen (see [`delivery-flow.md`](delivery-flow.md))

## Open items

- [ ] Heritage design system rebuild in progress — visual templates (gift cert,
      coloring page, email HTML, listing photos) wait on it
- [ ] Launch-date call: Christmas 2026 with current reader, or 2027 with full
      Heritage retrofit
- [ ] Etsy shop not yet created
