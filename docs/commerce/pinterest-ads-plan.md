# Pinterest Ads Plan — Little Fables

Operational extension of `pinterest-playbook.md` §9. Written 2026-08-08, before any
spend. The playbook says *whether and when*; this file says *exactly what, with which
dollars, judged by which numbers*.

## The two rules that govern everything

**1 · The gate (already decided, `gtm-decision.md` #1).** No paid spend until one
complete order — previews, revision round, book — is timed **under 1.5 attended
hours** and logged in `orders.csv`. Today's measured range is 2.2–4.3 hr. The gate
is *continuous*: if attended time creeps back above 1.5 hr mid-flight, ads pause
that day. Paid volume on manual fulfilment doesn't scale revenue, it scales burnout.

**2 · The sale and the ads budget compete for the same margin.** This is the new
finding. At $69 list with a 20% site-wide sale live, effective price is $55.20 and
net-after-Etsy-fees is ~$49.50. A realistic Q4 click ($0.70) at a realistic cold
conversion rate (1.5%) costs ~$47 per order — the entire contribution, before a
minute of labour. The same math at full $69 (net ~$62) leaves ~$15, and the
FABLEADS15 code (below) still gives the buyer 15% while preserving attribution.
**Therefore: no site-wide sale during any ad flight.** The ad code is the only
discount running. If a sale must run (e.g., a step in the price-ladder test), ads
go dark that week.

## Why consideration-only (unchanged from §9, verified current)

The Pinterest Tag cannot go on etsy.com, so conversion campaigns, Performance+
Sales, and catalog/shopping ads are all structurally unavailable — Performance+
additionally wants 50+ tracked conversion events/week, which is a 2027 conversation
at the earliest. What remains is the **consideration (traffic) objective**: billed
per click, no tag required, judged by promo-code redemptions + Etsy's own traffic
stats. This matches the practitioner playbook for digital products on Etsy.

## Readiness scorecard — all five green before the first dollar

| # | Check | Bar | Where measured | Owner |
|---|---|---|---|---|
| 1 | Attended time | < 1.5 hr, one full order, per-stage log | `orders.csv` | Manav (pipeline cuts per gtm memo) |
| 2 | Reviews | ≥ 5 honest reviews live | Listing page | Manav (friends/family orders) |
| 3 | Organic conversion proof | Listing CVR ≥ 1.5% on ≥ 300 organic visits, trailing 30d | Etsy Stats | watch together |
| 4 | Proven creative | ≥ 3 batch-01 pins with outbound CTR ≥ 0.30% and saves | Pinterest analytics (data lands ~Sept) | Claude |
| 5 | Plumbing | Domain claimed · FABLEADS15 minted · UTMs tested | Pinterest settings / Etsy codes | Claude + Manav (DNS TXT) |

A red on #1 is a hard no. A red on #2 or #3 means ads would pay to send people to a
listing that can't close them — fix the store, not the traffic. #4 red means we'd be
paying to test creative that organic could have tested free.

## Economics: what a click may cost vs. what an order is worth

Net contribution after Etsy fees (~9.5% + $0.45), before labour:

| Config | Effective price | Net/order | Break-even CAC | Target CAC (½) |
|---|---:|---:|---:|---:|
| Full price, FABLEADS15 redeemed | $58.65 | ~$52.50 | $52 | **$26** |
| Full price, no code | $69.00 | ~$62.00 | $62 | $31 |
| 20% sale live (forbidden w/ ads) | $55.20 | ~$49.50 | — | — |

Cost per order = CPC ÷ CVR. Benchmarks: Pinterest CPC for traffic campaigns runs
~$0.45–1.30, with Q4 auctions inflating 20–50%; assume **$0.60–0.90 in Oct–Nov**.

| | CVR 1.0% | 1.5% | 2.0% | 2.5% |
|---|---:|---:|---:|---:|
| CPC $0.60 | $60 ✗ | $40 ~ | $30 ~ | $24 ✓ |
| CPC $0.75 | $75 ✗ | $50 ~ | $38 ~ | $30 ~ |
| CPC $0.90 | $90 ✗ | $60 ✗ | $45 ~ | $36 ~ |

Reading: the test only *wins* if the listing converts ≥ 2% — which is what reviews
and Q4 gift intent are for. ✗ = underwater, ~ = tuition, ✓ = scalable.

## Flight 1 — the test (window: Oct 15 – Nov 5, only if scorecard is green)

- **Budget:** $15/day × 21 days = **$315 cap**. One campaign, consideration
  objective, optimize for **outbound clicks**, "Performance" bidding, all
  placements, US, English.
- **Two ad groups, $7.50/day each:**
  - **AG-Gift** — keywords from the Christmas + grandparent clusters (75–100 broad:
    "christmas gifts for kids", "gifts for grandchildren", "meaningful gifts for
    kids", "stocking stuffers kids"...). Creative: best 3–4 of p09/p10/p11/p20 +
    p07/p08 by organic CTR.
  - **AG-Category** — keywords from the personalized-book cluster ("personalized
    childrens book", "custom name book", "book with childs name", "personalized
    story book"...). Creative: best 3–4 of p01–p06/p19.
- **Destination:** the Etsy listing URL with ad-specific UTMs
  (`utm_source=pinterest&utm_medium=paid&utm_campaign=test1-{gift|category}`).
  Pin/description copy carries **FABLEADS15** (mint: 15% whole shop, expiry Jan 15
  2027, never published anywhere else — it exists only inside paid placements).
- **"Ad-only Pin" toggle OFF** — promoted pins keep earning organically after the
  flight.
- **Demographics:** women 25–54 + all 45–65 (grandparent wing) in AG-Gift; leave
  AG-Category broad — keywords carry the intent.

**In-flight kill rules (checked every 2–3 days, ~10 min):**

- Any single ad < 0.15% outbound CTR after ~3,000 impressions → pause it.
- Any ad group CPC > $1.10 sustained 4 days → pause group, rebuild keywords.
- **$150 spent with zero FABLEADS15 redemptions AND no visible Etsy visit lift →
  halt the flight early.** That's the tuition cap.

**End-of-flight verdict (one number):** blended **cost per redemption ≤ $26 →
scale. $26–$52 → hold** budget flat, swap losers for fresh creative, re-read in 2
weeks. **> $52 or zero orders → stop**; Q4 becomes organic-only and paid re-opens
at Mother's Day *only* if the scorecard has improved (more reviews, higher CVR).

## Flight 2 — scale (Nov 6 – Dec 10, only on a "scale" verdict)

$25–40/day. Add a third ad group (New Baby cluster, p12/p13) and fresh Christmas
creative (new image files — fresh pins win, same rule as organic). Re-verify CAC
weekly against Q4 CPC inflation; the moment blended cost per redemption crosses
$40, cut budget 50% rather than kill (December CVR usually rescues it).
**Hard stop Dec 10** — 3–5 day processing plus buyer comfort means later clicks
convert into January refund risk, not gifts.

## Standing guardrails

- Absolute monthly cap **$500** regardless of performance (cash discipline while
  review base < 20).
- Never: conversion objective, Performance+, catalogs — until littlefables.app
  sells directly with the Tag installed (that unlock also starts the 9-month VMP
  clock, a 2027 item).
- Never promote a pin organic hasn't validated. Ads amplify; they don't discover.
- Attended-time check rides along with every weekly read — Rule 1 is continuous.
- Log every flight: dates, spend, clicks, redemptions, verdict → `orders.csv`
  sidecar or `docs/commerce/ads-log.md` (create on first flight).

## Prep checklist (now → Oct 1, all zero-spend)

1. ~~Boards public, batch-01 live~~ ✓ Aug 7.
2. Domain claim: **Manav adds DNS TXT** `@ → pinterest-site-verification=
   c72d5e830316ff781409a9a0e853e59f` in Vercel → Claude re-runs claim (TXT method).
3. Manav: 2–3 friends/family orders → honest reviews (also produces the timed
   order for gate #1).
4. Manav: time one full order per-stage into `orders.csv` after the writing/art
   cuts from the gtm memo (Azi-verse + `fable` for story.json; character sheet
   locked first; page count by age).
5. Claude (Sept): pull 30-day organic analytics → rank batch-01 by outbound CTR →
   creative slate + keyword harvest from Pinterest search suggests + ads keyword
   planner → drop into this file.
6. Claude: mint FABLEADS15 in Etsy (leave dormant), pre-build the campaign in Ads
   Manager in **paused** state for Manav to eyeball.
7. Optional but recommended: base Pinterest Tag on littlefables.app now (audience
   building from site-cluster pin clicks; costs nothing, feeds retargeting later).
8. GA4-on-Etsy: if Shop Settings → Options → Web Analytics still accepts a
   measurement ID, add one; treat as bonus telemetry, never primary. Primary truth
   stays **FABLEADS15 redemptions + Etsy Stats traffic sources**.

## Calendar

| Date | Event |
|---|---|
| Sept 1 | Christmas organic ramp (already in playbook §7) |
| Sept 30 | Scorecard review #1 — five checks, written verdict |
| Oct 15 | Go/no-go. Green → Flight 1 launches. Red → organic-only Q4, next review Feb 1 (Mother's Day window Mar–Apr) |
| Nov 5 | Flight 1 verdict |
| Dec 10 | All paid dark |
| Jan | Post-mortem → fold learnings into 90-day review (§8 gates) |
