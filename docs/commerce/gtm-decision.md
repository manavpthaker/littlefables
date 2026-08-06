# GTM Decision Memo

Reconciling the two research reports and the listing rubric. Written 2026-08-05.

## The reports disagree by 57% on price

| | Launch | Standard | Confidence |
|---|---|---|---|
| **Report A** (compass) | $44 | $44, test $49 later | HIGH that $29 is wrong, MEDIUM on $44 |
| **Report B** | $59 | $69 after 10–15 orders | Moderate |
| **Your rubric v1** | $45 base | — | — |

They are not actually contradicting each other. **They are pricing different moments.**

Report A argues from *demonstrated demand* — where books visibly cluster and sell.
MagicPictureStory does ~991 sales at $44.99–$59.99. Name-swap books cluster $38–$45.
That's the price a shop can convert at.

Report B argues from *labour economics and commission comps* — custom-authored work
clears $157, and $29 doesn't pay for the hours.

Both are right. The resolution is a ladder, because **price is a function of proof,
not just of the product.** The $157 comps carry 283 reviews. MagicPictureStory has
207. You have zero. A commission premium is something you earn with evidence, and
you don't have the evidence yet.

Report B's step to $69 after 10–15 orders is the weakest link in either report. The
listings that command that band have 20× that review count.

## What neither report says clearly

Both reports price the product. Neither prices the *production*. The whole decision
turns on attended time per order — a number Manav has now supplied, so the section
below replaces the assumed 2–4 hours both reports leaned on.

## Measured production time

Manav's pipeline figures, 2026-08-05, for a 12–15 page book:

| Stage | Wall clock | Attended? |
|---|---|---|
| Write `story.json` | 60–120 min | **attended** |
| Illustrations, 15 PNGs, iterate for consistency | 30–60 min | **attended** |
| Narration (`narrate-book.ts`, ElevenLabs, serial per segment) | 10–20 min | unattended |
| Upload to Supabase Storage | 10–20 sec | unattended |
| DB upsert + schema validate | 1–2 sec | unattended |

Two corrections to the analysis above, one in each direction.

**In your favour: narration is waiting, not working.** I was charging all wall-clock
as labour. Ten to twenty minutes of ElevenLabs API time costs money only if you sit
watching it. Attended first-pass time is **1.5–3.0 hours**, not 2.0–3.5.

**Against you: the preview stage isn't in that estimate.** The flow is intake →
style previews → approval → book. Your figures cover the book. Previews plus one
revision round add roughly 40–80 minutes attended. **Realistic attended time per
order today is 2.2–4.3 hours.**

### What that buys at each price

Contribution after labour at $25/hour, attended hours only:

| Attended hrs | $44 | $49 | $59 | $69 | $79 |
|---:|---:|---:|---:|---:|---:|
| 1.0 | $14.37 | $18.89 | $27.95 | $36.99 | $46.05 |
| 1.5 | $1.87 | $6.39 | $15.45 | $24.49 | $33.55 |
| 2.0 | −$10.63 | −$6.11 | $2.95 | $11.99 | $21.05 |
| 2.5 | −$23.13 | −$18.61 | −$9.55 | −$0.51 | $8.55 |
| 3.0 | −$35.63 | −$31.11 | −$22.05 | −$13.01 | −$3.95 |

To leave $25/hour **and** afford a $0.30 click at 1.5% conversion, attended time has
to fall below:

| Price | Attended time ceiling |
|---:|---|
| $49 | 0.96 hr |
| $59 | 1.32 hr |
| $69 | 1.68 hr |
| $79 | 2.04 hr |
| $89 | 2.40 hr |

At today's 2.2–4.3 hours, **no price below $79 supports paid acquisition.**

### Three configurations that actually work

**A · Organic-only at $69.** No Etsy Ads. Needs attended ≤2.4 hr, which is reachable
at the good end of your current range. Growth comes from Pinterest, organic search
and repeat buyers. Slowest, but viable today with no pipeline work.

**B · Ads-viable at $59.** Needs attended ≤1.32 hr — roughly half of today. Requires
the writing and art cuts below. This is the version that scales.

**C · Premium at $79–89.** Works today on time, but asks a zero-review shop to price
above every visible comp except the $157 tier. High risk at launch, reasonable once
you hold reviews.

Recommendation stands at **launch $49 → $59 → $69**, but with the ads decision
explicitly deferred: **run no paid spend until attended time is measured below
1.5 hours.** Until then this is configuration A.

### Where the time actually comes from

**Writing, 60–120 min — the biggest single cut available.** You already have the
Azi-verse Claude project drafting stories and the `fable` skill converting a draft
to validated `story.json`. Drafting there and running `fable`, with a human editorial
pass, should land at 20–30 minutes. That alone is −40 to −90 min.

**Art, 30–60 min — the consistency tax.** Two levers. Lock the character sheet
*first* and reference it on every page rather than re-deriving the child each time;
you already work this way for Rosa. And **cut page count for younger ages** — the
listing already promises length matched to the child's age, and 10 pages instead of
15 is a third less art. Page count isn't only a product decision, it's the margin
decision.

**Narration parallelisation is not a margin lever.** You flagged it as the biggest
speedup, and for wall clock it is — 15–25 min down to 5–8. But it's unattended time,
so it changes nothing in the tables above. What it *does* improve is the delivery
promise, which matters for the December cutoff. Worth doing for that reason, not for
economics.

### Two consequences nobody has drawn out

**Your revision guarantee is mispriced relative to your own pipeline.** Republishing
an edited book costs 1–3 minutes. Preview revisions cost a full art regeneration
cycle. So the expensive revisions are the ones *before* the book exists, and the
cheap ones are *after*. The guarantee should say so: bound the preview rounds, and
be conspicuously generous with post-delivery corrections — they're nearly free and
they're what produces the review.

**The $17 second book is underwater.** With a saved profile the character and style
are locked, so the art-consistency work largely disappears — but the writing doesn't.
A second book is roughly 60–90 minutes attended. At $17 that's deeply negative; at
$29–$39 it clears. Reprice it, or define it explicitly as a variation reusing the
existing story rather than a new one.

## Decisions

### 1 · Cut attended time before spending on ads

Production time is now measured (above), so the open question is no longer *how long*
but *how far it can fall*. Target **1.5 attended hours**: route writing through the
Azi-verse project plus `fable`, lock the character sheet before page art, and set
page count by age band.

Time one complete order end to end after those changes — including previews and a
revision round — and log per-stage minutes in `orders.csv`. **No paid ad spend until
that number is below 1.5 hours.**

### 2 · Price: launch $49, hold, step later on evidence

Splitting A and B, weighted toward A because cold-start conversion is the binding
constraint:

| Stage | Price | Trigger to move |
|---|---:|---|
| Launch | **$49** | — |
| After ~15 fulfilled orders **and** ≥10 reviews | $59 | Only if conversion held at $49 |
| After ~40 orders, Star Seller held | $69 | Only if $59 held |

$49 clears break-even at 1.76 hours, sits just above the visible $38–$45 cluster so
it reads as the premium option rather than an outlier, and leaves room to climb.
Do not launch at $69 with zero reviews.

**Both reports agree on this and so do I: do not use a launch discount to buy
reviews.** If you run an intro price, tie it to a date or an order count, and say so.

Second book at $17 is wrong at any base price. If it's a genuinely new story, it's
$29–$39. If it's a variation reusing the character and style, $17 is fine — but the
listing has to say which.

### 3 · Fix the listing structure — this is more urgent than price

Both reports independently landed on the same defect, and it's live in your draft.

Etsy's Cases Policy allows a buyer to open a case if a made-to-order download **is
not made available within 7 days of purchase**. Your listing is currently configured
as an instant download whose deliverable is the welcome PDF, with the real book
arriving later by message and email.

That creates four problems:

- The **review window opens when the welcome PDF downloads** — before the book exists.
- The order reads as digitally delivered while the work hasn't started.
- The Etsy fulfilment record doesn't match the actual delivery event.
- "Not as described" becomes genuinely ambiguous in a case.

**Reconfigure as a made-to-order digital listing**, and attach the finished
deliverable — a PDF carrying the book link, recipient name, access instructions —
to the Etsy order inside 7 days. Keep every delivery confirmation in Etsy Messages.

This is a policy-risk fix, not an optimisation. It goes first.

### 4 · Opt out of Offsite Ads today

15% under $10k, and opting out is allowed until you cross it. On a $49 order that's
$7.35 — roughly a fifth of your contribution. Free to fix, takes a minute.

### 5 · Launch mid-September, not October 1

Both reports agree, for the same reason: the new-listing boost lasts hours to days,
Christmas search builds through October and peaks around the third week of November,
and a zero-review shop needs runway to accumulate the engagement data that ranking
actually runs on.

That makes the deadline **roughly five weeks out**, not eight.

### 6 · Christmas cutoff — the current promise isn't honest

A 3–4 day turnaround means an order placed Dec 22 finishes Dec 25–26. "Orders through
Dec 22" cannot be sold as guaranteed Christmas delivery.

Revise to: standard cutoff ~Dec 19, Dec 20–22 rush only with a stated completion
date, later orders sold explicitly as post-Christmas or as a gift certificate now
with the book to follow.

## Conflicts with rubric v1

Worth resolving before you score anything against it.

**Criterion 1 wants a "physical-feeling book mockup" thumbnail.** That contradicts
everything we just built — the together-shots and the flat spreads. It's also in
tension with Report A's own advice to position as a *commission* rather than an
object. Decide which, because the rubric currently fails the images you have.

**Criterion 6 prices a hardcover at +$49 and criterion 7 names Lulu as a production
partner.** There is no physical product line anywhere in `positioning.md`,
`etsy-listing.md`, or `fulfillment-playbook.md`. That's a significant scope
expansion that appears only in the rubric. If it's real it changes the pricing
analysis substantially — Report A's evidence is that physical commands more, and it
would answer the "I can't hold it" objection outright. If it's aspirational, take it
out of the rubric so the rubric doesn't fail every listing on a criterion you can't
meet.

**Criterion 6 says base $45**, which is close to Report A and below my $49. Fine
either way — the gap is inside the noise. What matters is that it's not $29.

## Sequence

| When | Do |
|---|---|
| Today | Opt out of Offsite Ads. Reconfigure the listing as made-to-order digital. |
| This week | Fulfil one complete book, timed. Resolve the hardcover/Lulu question. |
| Next week | Set price from the measured production time. Rebuild the Christmas dates. |
| Late August | Listing scored against a corrected rubric, ≥90 before publish. |
| Mid-September | Live. Warm buyers first, no incentives, one honest review ask at delivery. |
| Early November | Decide on $59 and on whether ads are viable at your measured hours. |

## The honest summary

Both reports told you $29 is wrong and they're right. But with your production
figures in hand the sharper finding is this: **at today's attended time, no price
below $79 supports paid acquisition at all.**

That doesn't mean price higher. It means the choice is between an organic-only shop
at $69, or halving attended time so that $59 plus ads becomes a machine. The first
is available today. The second is the one that scales, and the route to it runs
through the Azi-verse project and the character sheet — not through the narration
parallelisation you flagged, which speeds up the clock without touching the margin.

Launch at $49 either way. Decide on ads only after you've timed an order with the
writing and art changes in place.
