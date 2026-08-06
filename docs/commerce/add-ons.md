# Add-Ons

Base is **$69, introductory $59**. This file decides what else is for sale, what it
costs to make, where it can physically live on Etsy, and what not to build.

Written 2026-08-06. Supersedes the variation rows in `etsy-listing.md` and rubric
criterion 6.

## The constraint that shapes everything

Etsy's own listing editor, on this shop, states plainly:

> Variations are unavailable for digital items.

So add-ons **cannot be dropdowns on the base listing**. They have to be separate
listings, a bundled higher tier, or sold at a different moment.

**Settled 2026-08-06 — no re-test needed.** The hypothesis was that this restriction
came from the listing being an *instant download*, and that switching to made-to-order
digital might unlock variations. It doesn't. The listing is already categorised
**Children's Books · Digital files • Made To Order**, and the notice is still there
verbatim. The restriction is on digital listings as such. **Separate listings are the
only route.**

What the listing *does* have is Etsy's newer **Custom options** — up to five buyer
input fields, four currently in use. They collect information and, in Etsy's own
words, "won't affect your available inventory" — meaning they cannot charge for
anything. **Do not sell add-ons through them.** A buyer who ticks "rush" at checkout
and is then asked for another $25 has a legitimate complaint, and that is a case
waiting to happen. Use the free fifth slot for the **dedication line** instead: it
costs nothing, so there is no charging problem, and it is exactly the sort of thing
that belongs at checkout rather than in a follow-up email.

## Where add-ons actually live

Three surfaces, in descending order of how well they convert.

**1 · Preview approval — the warm window.** The buyer has paid, waited a day, and
just opened style previews of their own child. That is the highest-intent moment in
the entire funnel and it is currently used for nothing but approval. One line at the
bottom of the preview message — *"Want the printable PDF too? Add it here"* with a
direct listing link — is free to run and will out-convert the listing page by a wide
margin. This is where the money is.

**2 · A bundled tier listing.** Etsy has no variations, but nothing stops a second
full listing: **Little Fables Deluxe, $109** — book + printable PDF + art print +
MP3 pack. Priced against $69 + $12 + $15 + $9 = $105, so the bundle is barely a
discount and mostly a decision-shortcut. Tiered listings are a pattern Etsy buyers
already read fluently.

**3 · The Add-Ons shop section.** Necessary, but weak on its own — buyers do not
leave a listing to go shopping for accessories. Make it work by putting the add-on
menu **inside the base listing**: one sentence in the description and one listing
image that is just a clean price card. They need to know the options exist before
checkout even if they buy them later.

## The economics

Net is after Etsy's cut (6.5% transaction + 3% + $0.25 payment ≈ 9.75%). Time is
attended minutes. Narration priced at Pro-tier $0.000198/char.

| Add-on | Price | Net | Time | Rate | Ship |
|---|---:|---:|---:|---:|---|
| Rush — finished in 72h | $25 | $22.18 | 0 min | scheduling only | **launch** |
| Dedication page | $0 | — | 5 min | — | **launch** |
| Printable PDF | $12 | $10.41 | 10 min | $62/hr | **launch** |
| Art print of one illustration | $15 | $13.13 | 5 min | **$158/hr** | phase 2 |
| Narration MP3 pack | $9 | $7.69 | 5 min | $92/hr | phase 2 |
| Second narrator voice | $15 | $10.70 | 10 min | $64/hr | phase 2 |
| Extra character in the story | $19 | $16.45 | 20 min | $49/hr | phase 2 |
| Colouring pack, 6 pages | $12 | $10.41 | 20 min | $31/hr | test |
| Sibling book, same world | $45 | $35.19 | 75 min | $28/hr | separate SKU |
| **Base @ $69** | $69 | $61.99 | 143 min | **$26/hr** | — |
| **Base @ $59 intro** | $59 | $52.95 | 143 min | **$22/hr** | — |

Read the rate column against the base. **Every add-on on this list earns more per
hour than the book does.** That is not a coincidence — the book carries all the
concepting and art, and the add-ons are derivatives of work already done.

## Launch with three, not nine

Nine add-ons at launch reads as a menu and dilutes the thing you are actually
selling. Three:

**Rush, $25.** Pure margin — you are selling queue position, not labour. Cap it
visibly ("3 rush slots a week") so it stays credible and so December does not eat
you. This is also the honest answer to the Christmas cutoff problem: standard
closes ~Dec 19, and Dec 20–22 exists only as rush with a stated completion date.

**Dedication page, free.** Costs five minutes and buys the review. "For Ellie, from
Grandpa Ray, Christmas 2026" on the first page is the single cheapest thing in this
document that makes a buyer feel the book was made by a person. Do not charge for
it. Mention it in the listing so it reads as generosity rather than an afterthought.

**Printable PDF, $12.** This answers the loudest objection in the category — *I
can't hold it* — without touching shipping. It is also the honest halfway house to
physical: they can print it at home or take it to a print shop, and you never own a
delivery date. Worth watching the attach rate here, because a high one is real
evidence about whether the hardcover question is worth reopening.

## The narration add-on is worth more than $15

You asked for "different narration." Read literally that is *pick voice B instead of
voice A* — a $15 item nobody will feel strongly about, because a buyer who does not
love the default voice mostly just wants the default voice fixed.

The version worth building is **the grown-up reads it.**

The parent or grandparent records the narration themselves; you master it and drop
it into the reader alongside the professional track, with a toggle. A grandparent
three time zones away can read their grandchild a bedtime story in their own voice,
every night, at a tap.

Why this is the strongest item in the document:

- It is **zero AI** in the part of the product buyers are most suspicious of.
  `positioning.md` already promises no voice clones and calls out a competitor for
  triggering exactly that reaction. This delivers the emotional payload of voice
  cloning with none of the creepiness, because the person is doing it on purpose.
- Print competitors **structurally cannot offer it.** A paper book cannot talk.
- It converts the long-distance-grandparent buyer, who is the highest-intent, least
  price-sensitive segment in the category.
- It is worth **$39, not $15.**

Two things gate it, which is why it is phase 2 and not launch.

**Word-tap needs timestamps.** ElevenLabs hands you per-word timings today. A parent
recording does not have them — you would need forced alignment (WhisperX or Montreal
Forced Aligner against the known script) to generate them. That is real engineering,
and until it exists the parent track either ships without word-tap or blocks the
feature. Additive is the answer: the professional narration stays the default with
word-tap intact, and the parent track is a second option. **The deliverable must
never get worse for having bought an add-on.**

**Home recordings vary.** Bound it in the copy: record in a quiet room from the
script we send, one page per take, we do the rest — and if it is unusable we will
tell you inside 24 hours and refund the add-on. Say it plainly and the failure case
stops being a dispute.

Keep a plain **second voice, $15** on the menu as well. It is cheap and it catches
the buyer who simply wants a woman's voice instead of a man's.

## What not to build

**Voice cloning.** `positioning.md` says "No voice clones stored" and names KidTeller
as the cautionary example. Selling a cloned voice would break a promise printed in
your own listing copy, in the exact place the category is most fragile. The
parent-recorded version above gets you the same emotion by the opposite route.

**Hardcover / Lulu.** Rubric criteria 6 and 7 price a hardcover at +$49 and name Lulu
as a production partner. This is not an add-on; it is a different company. It
reintroduces shipping, print QC, courier dates, damaged-in-transit returns and a
December cutoff four weeks earlier than the digital one — and it directly contradicts
"No shipping, ever," which is currently a selling point. Either take it out of the
rubric or run it as a deliberate second phase after Christmas. It should not be a
line item on a launch price card.

**A colouring pack at launch.** Lowest rate on the board and it drags the product
toward *activity bundle*, which is the commodity end of the category. Test it in
January if PDF attach is strong.

## The sibling book is not an add-on

`gtm-decision.md` flagged the $17 second book as deeply underwater, and it is: a
genuinely new story is 60–90 attended minutes regardless of how much is saved in the
profile.

Split it properly:

| Product | Price | What it is |
|---|---:|---|
| **Sibling book** | $45 | New story, new child, same world and art style. Character sheet is new; style is not. |
| **Same-child second story** | $39 | New story, existing character sheet. The cheapest real book you can make. |
| **Reprint / re-theme** | *not priced yet* | Same story, new occasion framing or dedication. Minutes of work. Was $17 against a $29 book; needs revisiting at $69. |

All three are repeat-purchase, which is the only thing that fixes customer
acquisition cost. Offer the second one in the delivery email, not the listing.

## Why this matters more than the base price

`gtm-decision.md` concluded that at 2.2–4.3 attended hours, **no price below $79
supports paid acquisition.** Add-ons are the way around that without putting $79 on
the thumbnail.

| | Net | Attended | Rate |
|---|---:|---:|---:|
| Base $69 alone | $61.99 | 2.38 hr | $26/hr |
| Base $69 + rush | $84.17 | 2.38 hr | **$35/hr** |
| Base $69 + PDF + print | $85.53 | 2.63 hr | $33/hr |
| Deluxe bundle $109 | $98.38 | 2.72 hr | **$36/hr** |

A 40% attach rate on a $15 average add-on puts AOV at ~$75 while the listing still
reads $69. That is the difference between an organic-only shop and one where ads
close — and it costs almost no additional time, because rush is scheduling and the
print and PDF are exports of assets that already exist.

**Add-ons are not a nice-to-have here. They are the mechanism that makes the ad
maths work.**

## On the $59 intro price

Two mechanics, both worth getting right.

**Run it as an Etsy Sale, not as a $59 list price.** A sale renders as $69 struck
through with $59 beside it. The strikethrough does real work in a search grid, and
it means going to $69 later is the sale *ending* rather than a price *increase* —
which is a materially easier thing to do to a shop with reviews on it.

**Give it a stated end condition.** Both research reports were emphatic that
discounts must not be used to buy reviews. Tie it to something public and finite —
*first 25 books* or *through September 30* — and put it in the listing. An
open-ended intro price is just a price.

Add-ons stay at full price throughout. Discount the entry, never the attach.

## Build order

| When | Do |
|---|---|
| Done | Made-to-order digital is already set. Variations confirmed unavailable — build separate listings. |
| Launch | Rush $25 · Dedication free · Printable PDF $12. Add-on price card as a listing image. Dedication goes in custom-option slot 5. |
| Order 1 onward | One add-on line at the bottom of every preview-approval message. |
| After ~10 orders | Art print $15 · MP3 pack $9 · second voice $15. Deluxe bundle at $109. |
| After forced alignment ships | **Parent-recorded narration, $39.** The one that matters. |
| January | Colouring pack, if PDF attach justified it. Revisit hardcover as a phase, not an add-on. |
