# Deep Research Brief — Etsy GTM for Little Fables

Paste the block below into a deep-research tool. Everything above the line is
context for us, not part of the prompt.

## Why we're asking

Two decisions are live and neither should be made on instinct:

1. **Price.** We're at $29 with unlimited revisions and a full-refund guarantee.
   Net after Etsy fees is $25.79. If a book takes 2–4 hours including revision
   rounds, that's under $10/hour before any ad spend. The $29 anchor came from
   matching Wonderbly and I See Me — but those are *physical* books with
   name-swap personalization and no revision stage. We may have anchored to the
   wrong comp.
2. **Reviews.** Etsy's shilling policy is narrower than the folk advice suggests
   (see `etsy-setup-log.md`). We need to know what actually moves rank, how fast,
   and which acceleration tactics are both legal and effective.

---

# RESEARCH PROMPT

You are researching go-to-market for a specific Etsy product. Prioritise 2025–2026
data. Where you cite a number, say where it came from and how it was measured —
seller-survey self-report, scraped marketplace data, platform disclosure, or a
single anecdotal blog post — and flag when a widely-repeated figure traces back to
one unverifiable source.

## The product

A **custom-authored, illustrated, narrated children's storybook**, delivered as a
saveable web app rather than a file or a physical book. The child is the
protagonist of an original story written around their actual interests and
temperament — not a name dropped into a template. The buyer names picture books
whose art they love, and the illustration style is built from those references.

Mechanics that distinguish it from the category:

- A **two-stage flow**: style previews within 24 hours, buyer approves, finished
  book 3–4 days later. Unlimited preview revisions, full refund if we can't land it.
- Listed on Etsy as a **digital item**, so the instant download is a welcome PDF;
  the actual book is delivered afterwards by message and email.
- No shipping, so no seasonal cutoff — orders accepted through Dec 22.
- Current price $29. Second book $17. Rush +$12. Printable PDF +$5.
- New shop, zero reviews, targeting first listing live October 2026 for Christmas.
- Audience: screen-time-conscious "intentional" parents; secondary audience
  grandparents buying gifts.

## What we need to know

### 1 · Price

- What do **personalized children's books** actually transact at on Etsy in
  2025–26? Segment by: physical vs digital; name-swap personalization vs
  custom-authored; with vs without a proof/approval stage.
- Is there an observed **price ceiling for digital** goods on Etsy specifically,
  independent of the work involved? Do buyers systematically discount digital
  delivery, and by how much?
- Are **made-to-order commission** categories — custom pet portraits, custom
  family illustration, commissioned digital art — a better pricing comp than
  books? What do those clear at, and what justifies their premium?
- Evidence on where conversion breaks in this category across roughly
  $29 / $39 / $49 / $69. Is there a threshold above which Etsy buyers defect to
  a direct-to-consumer site?
- Does an **approval/revision stage** measurably support higher pricing, or does
  it mostly reduce refunds? Any data separating the two effects?
- How do buyers price-anchor a gift they can't hold? Is "digital" read as
  cheaper, or as different?

### 2 · Reviews and cold start

- What does the evidence actually say about **review count and Etsy search
  placement**? Is there a threshold effect, a continuous one, or is review count
  a weaker signal than commonly claimed? Distinguish causation from the obvious
  confound that listings which sell get both reviews and rank.
- Observed **review rate** — reviews per completed order — for digital vs
  physical, and for made-to-order vs instant-download. Does a long fulfilment
  conversation raise or lower it?
- Which **legitimate** tactics measurably raise review rate? Quantify where
  possible: Etsy's built-in review request, follow-up messaging, an included
  extra, timing of the ask.
- Does Etsy **weight review recency**? Does a burst of early reviews decay in value?
- How do new shops in saturated gift categories get the first 10–25 orders?
  What works and what is folklore?
- **Compliance:** confirm current rules on friends-and-family purchases,
  incentivised reviews, and discount-for-review offers. What specifically gets a
  new shop's reviews stripped or the shop suspended? Find enforcement accounts,
  not just policy text.

### 3 · Etsy search in 2026

- What currently drives ranking for a new listing? Is there a **new-listing
  visibility boost**, how large, how long, and does it reset on edits?
- Does **title front-loading** still matter as much as older advice claims?
- How are **structured attributes** weighted relative to tags and title,
  particularly for categories with few available attributes?
- Anything specific to **digital listings** — ranking, filtering, or buyer
  behaviour differences.
- How much does editing a live listing hurt? Is there a penalty for iterating on
  title/tags in the first weeks?

### 4 · Etsy Ads economics

- Realistic **CPC ranges in 2025–26** for personalized gifts and children's
  books, especially Oct–Dec.
- Realistic **conversion rates** for a new shop with few reviews running ads.
- At $29 with ~$25.79 net, what daily budget and CPC makes ads break even? At
  what price does the maths get comfortable?
- **Offsite Ads**: current thresholds, current fee, and what a 15% take does to
  the unit economics of a $29 digital item. Can it be avoided, and is opting out
  possible at our revenue level?

### 5 · Seasonality

- Actual search-volume curve for "personalized children's book", "custom kids
  book", "christmas gift for kids" across a year. **When does the Christmas
  build actually start** — and is it earlier than the common October assumption?
- When do gift buyers convert vs browse?
- Is an October 1 launch right for Christmas, or too late to accumulate the
  reviews and ranking that December traffic requires?
- Does the no-shipping-cutoff advantage actually convert late-December
  searchers, or do buyers self-select out of custom orders by mid-December
  regardless of stated turnaround?

### 6 · The digital-delivery risk

- How do Etsy buyers respond to a **digital listing that isn't an instant
  download** — where the real deliverable arrives days later? Is this an accepted
  pattern in custom categories, and does it generate cases or negative reviews?
- What's the **dispute and case rate** for made-to-order digital vs instant
  download? How does Etsy adjudicate when the buyer got a welcome PDF and the
  real product came by message?
- Any evidence that **web-app / PWA delivery** (versus PDF or EPUB) confuses
  buyers or raises support load.

### 7 · Competitive read

- Identify the current top-performing Etsy shops selling personalized children's
  books — digital and physical. For each: price, review count, review velocity,
  turnaround promised, personalization depth, what their reviews praise and what
  they complain about.
- Where are the **unmet complaints** in this category's reviews? Delivery
  anxiety, art quality, likeness accuracy, refund friction?
- Anyone else selling a *custom-authored* story rather than name-swap? How are
  they priced and positioned?

## Output

1. **Answer the two live decisions first** — a recommended price with the
   reasoning and the confidence level, and a review strategy that is explicitly
   policy-compliant.
2. Then the supporting findings, organised by the sections above.
3. A table of every quantitative claim with its source and source quality.
4. An explicit **"what we could not establish"** section. Unknowns stated plainly
   are more useful than confident numbers with no provenance.

Prefer: Etsy's own policy and seller-handbook pages, marketplace data providers
(eRank, Alura, Marmalead, EtsyHunt) with their methodology stated, academic or
industry pricing research, and first-hand seller accounts with numbers attached.
Discount: undated SEO listicles, affiliate content, and "top 10 tips" posts that
cite no data.
