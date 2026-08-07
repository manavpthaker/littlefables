# Pinterest Playbook — Little Fables

Written 2026-08-07. Companion to `positioning.md` (voice + claims), `promotions.md`
(codes + calendar), and `etsy-listing-audit-2026-08-07.md` (asset bench). When copy
here conflicts with `positioning.md`, positioning wins.

Decisions this encodes, from Manav 2026-08-07: **split funnel** (Etsy + littlefables.app),
**as hands-off as possible**, **tools + small ad test budget**, **no existing Pinterest
account** (fresh build). Research base: ~90 sources across three sweeps (platform
mechanics, seller case studies, niche keywords/competitors), load-bearing platform
claims verified against Pinterest's official help pages on 2026-08-07.

---

## 0 · Why Pinterest, and why now

**The niche converts.** Practitioner consensus is blunt: Pinterest sends lots of
traffic that mostly doesn't buy — *except* in gift, occasion, wedding, and party
niches, which sellers consistently name as the ones that convert. A $69 personalized
gift with a grandparent axis is squarely in the good quadrant. The sober
counterexamples (a printables seller with 50k monthly views and ~200 clicks going
nowhere) are all non-occasion niches.

**The timing is exact.** Pinterest's own 2026 holiday guidance: festive activity
spikes as early as September; launch holiday content September–November; by November
"most festive decisions have already been made." Between October and December someone
searches for a gift on Pinterest **every six seconds**. Wishlists build from October
(self-gifting) and flip to "gift ideas for others" in December. The 60–90-day rule
for seasonal pins puts the Christmas seeding window at **late August–September —
i.e., now.** This playbook exists three weeks before the ideal first pin.

**The field is empty.** MagicPictureStory, RNBishere, and FlipWoo have **no Pinterest
presence at all**. The big brands treat it as a leftovers channel: I See Me has 12.3k
followers on 124 mostly-legacy boards, Hooray Heroes 5.8k, Wonderbly clearly
IG-first. Nobody in the category is doing fresh-pin, keyword-true Pinterest properly.
On Etsy you're outgunned 210 reviews to 0; on Pinterest you're the only one who
showed up.

**The audience matches the positioning.** Pinterest's Parenting Trend Report 2026:
*screen-free activities for kids* +200%, *family traditions ideas* +200%, *slow
motherhood* +310%. Pinterest Predicts 2026 ("Throwback Kid"): nostalgia toys +225%.
Your buyer — the intentional parent curating what enters their kid's life — is
demographically the core Pinterest user (women 25–44, 40% of US $150k+ households),
and the screen-time-that-earns-its-place story lands on a platform actively trending
against screen-slop. The grandparent axis works too, just indirectly: 55+ is only
~13–18% of users, so grandparent pins mostly reach *moms coordinating the
grandparent's gift* — write them accordingly ("send this to grandma").

**The honest caveat.** Pinterest is a compounding asset, not a faucet. Expect months
1–3 near-silent, traction at 3–6, meaningful volume at 6–12. Simple Pin's data: 60%
of saves land on pins *older than a year*. Every pin published this fall is still
working Christmas 2027. The Q4 corridor gives an unusually fast first read, but the
plan is judged at 90 and 180 days, not 30.

---

## 1 · How the Etsy↔Pinterest pipeline actually works in 2026

Facts that change tactics. Each verified current as of 2026-08-07; the first three
against Pinterest's official help center directly.

**You cannot claim your Etsy shop.** Pinterest: "you're unable to claim most social
accounts and online stores hosted on marketplaces like Etsy, eBay and Amazon." The
old claim-your-Etsy-shop flow died 2023–24 (Pinterest staff confirmed discontinued,
March 2025). Any guide telling you to claim your Etsy shop — including Tailwind's own
KB article — is stale. **So:** the domain you claim is **littlefables.app**, and pins
to Etsy are uploaded manually or via scheduler with the listing URL as destination
(this works fine; only the "save from site" button on etsy.com is blocked).

**Etsy links get product rich pins automatically.** Pinterest: Etsy-hosted sites
"do not need to add any markup… New Pins from these sites will have product
information on them within 24 hours" — live price, availability, title pulled from
the listing. **So:** your pins inherit the strikethrough sale price, the title, and
stock status with zero work — and whatever the listing title says is what the pin
says, which is one more reason the audit's title fix matters. (Not guaranteed
per-pin; if data doesn't populate, the pin still works as a normal link.)

**Native scheduler can't run a hands-off operation.** Verified limits: 30 days
ahead, one at a time, **max 10 pins pending**. A 1–2/day cadence needs 30–60 queued.
**So:** a third-party scheduler is required, not optional (§6).

**Verified Merchant / catalogs / conversion ads are all own-domain features.** VMP
needs a claimed website *created ≥9 months ago*, a product feed, and Pinterest Tag
conversion events — none possible through etsy.com. **So:** not available now;
becomes available via littlefables.app once the site is old enough and sells
directly. Long-game unlock, not a 2026 concern.

**The algorithm, distilled (2025–26 consensus + Pinterest's own engineering posts):**

- **Fresh pins win.** A "fresh pin" = a new image file, even for an old URL.
  Repinning your own pin to more boards is near-worthless; recycling is the top
  stall cause.
- **First 24–48 hours are a test window** against a sample audience; performance
  there sets wider distribution. Traction on the pin builds over 2–6 weeks; pins
  pull clicks for up to ~2 years.
- **Saves drive distribution; outbound clicks drive your business.** Design for
  both: save-worthy (idea-shaped, reference-shaped) *and* click-worthy (curiosity
  gap, price/offer visible).
- **Follower count is irrelevant.** Distribution is search + interest-graph
  (Pinterest's 2025 ranking models match against up to 16,000 lifelong user
  actions). Niche consistency is what the graph rewards — an account that is
  unmistakably "personalized kids' books + kids' gifting" beats a scattered one.
- **Boards are classification context.** Keyword-named boards with real
  descriptions tell Pinterest what a pin is; the first board a pin is saved to
  matters most.
- **Spam tripwires:** burst-uploading (10+ at once), same URL pinned repeatedly in
  a day, same image to many boards fast, keyword-stuffed descriptions, 25+/day
  sustained. Etsy sellers pushing dozens of daily pins all at one listing URL is
  the classic flag pattern.
- **Etsy-domain pins are not suppressed** — no evidence of that anywhere — but you
  inherit etsy.com's domain trust instead of building your own, which is another
  quiet argument for the split funnel.

**AI-content labels are coming for your imagery.** Pinterest auto-labels pins "AI
modified" via IPTC metadata + its own classifiers (stripping metadata doesn't work,
don't bother). Reach impact: unquantified; the only documented mechanism is a
user-side "see fewer AI pins" control rolling out in beauty/art/home-decor. **So:**
expect labels on illustration-led pins, don't fight it, and lean the pin mix toward
what's *real*: product UI screenshots (reader, night mode), the intake→character
process, the revision rounds. Conveniently, "curated, not AI slop" is already your
positioning — the pins that dodge the label problem are the pins that make your
argument.

**Measurement is leaky and you route around it.** Etsy Stats buckets Pinterest
under social (no UTM visibility); UTMs on Etsy URLs survive but are only readable
in GA4; Pinterest-app taps often land as "direct." The stack that works: GA4
installed on the Etsy shop (Shop Manager → Settings → Options → Web Analytics) +
UTM'd destination links + the `FABLEPIN15` code from `promotions.md` as the one
clean conversion signal + a "how did you find us" question in the intake.

**Dead tactics — do none of these** (all still parroted by 2026-dated articles):
claim-your-Etsy-shop instructions · group boards · hashtags · 20–30 pins/day ·
repin-heavy schedules · auto-syndicating Instagram posts · "buyable pins" (killed
years ago) · follow-for-follow.

---

## 2 · The funnel

```
                        ┌─ occasion/product pins ──→ Etsy listing(s) ─→ order
  Pinterest search ─────┤                              (rich pins, sale price,
  + interest feed       │                               FABLEPIN15 in description)
                        └─ story/brand/guide pins ──→ littlefables.app ─→ Etsy
                                                       (claimed domain, own
                                                        analytics, future Tag/VMP)
```

**Phase 1 (now): Etsy carries the weight.** Every product-intent pin points at an
Etsy listing. The site becomes a pin destination only once it has a page built to
receive gift traffic — don't send pins to an app shell.

**Spread the destinations as listings multiply.** The audit's September plan (Rush,
PDF, and 2–3 occasion listings) is also Pinterest infrastructure: point each pin
cluster at its matching listing — grandparent pins → the grandparent-gift listing,
new-sibling pins → the sibling listing. Three reasons, in priority order: each
listing is its own search lottery ticket; heavy low-converting traffic concentrated
on one listing can drag that listing's Etsy conversion score (the sharpest
practitioner threads route Pinterest traffic away from their organically-ranked
listing for exactly this reason); and varied destination URLs read as less spammy
than one URL forever. A few evergreen pins point at the **shop page** — that link
can never break.

**Phase 2 (when a `/gift` page exists on littlefables.app):** gift-guide and
story-content pins point at the site. That page's job: answer gift intent in one
screen (what it is, the 15s demo, the guarantee) and hand off to Etsy — until the
day it sells directly, at which point the Pinterest Tag goes on it and conversion
campaigns/VMP open up (§9).

**Every pin is watermarked `littlefables.app`.** Small, corner, every design. Three
jobs: theft protection (stolen product pins pointing at scam sites is a real
pattern in this category — one seller's stolen pins got *her own* Etsy listing taken
down); attribution when pins get re-saved beyond your control; and the escape hatch
— if you ever leave Etsy, the domain repoints and ten thousand legacy pins keep
working. This is also why the watermark is the *domain*, never the Etsy URL.

**Link hygiene, every pin:** destination gets
`?utm_source=pinterest&utm_medium=social&utm_campaign=<cluster>` (clusters:
`christmas` · `grandparent` · `newbaby` · `birthday` · `bedtime` · `evergreen`).
Strip Etsy's own `?ref=` junk before appending. Pin descriptions close with the
`FABLEPIN15` line once minted — code redemptions are your only clean
Pinterest→order attribution on Etsy.

**The December weapon.** Wonderbly cuts off Dec 17–19. Every physical competitor
dies mid-December. You take rush orders **through Dec 22**. From roughly Dec 10,
the pin angle nobody else in the category can run: *"Forgot the kid's gift? It's
not too late — no shipping, ever."* Last-minute-gift searches surge exactly when
your only real competitors have gone dark. Pre-build this cluster in November;
schedule it to flood Dec 10–22.

---

## 3 · Account setup (the run sheet for our setup session)

Do in order; ~45 minutes total.

1. **Create a fresh business account** (not a converted personal) at
   business.pinterest.com, from desktop, with the hello@/manav Little Fables email.
   In onboarding, describe the business as ecommerce/Etsy seller.
2. **Handle:** try `littlefables`, then `littlefablesstories` (matches the Etsy
   handle), then `littlefablesapp`. The audit's rename note applies here — shop is
   **LittleFablesStories** now; keep whatever handle you pick recorded in
   `etsy-setup-log.md`.
3. **Name field** (searchable, spend it on keywords):
   `Little Fables · Personalized Children's Books & Custom Storybook Gifts`
4. **Bio** (voice rules apply — warm, no exclamation marks):
   > Your kid, in their own storybook. Personalized children's books — written
   > about your child, illustrated in a style you choose, narrated, delivered in
   > days. Gifts for birthdays, new babies, and Christmas morning.
5. **Claim littlefables.app.** HTML-tag method: Pinterest gives a meta tag; it goes
   in the Next.js root layout `<head>`; deploy; verify. (I can prep this one-line
   change whenever — it's `app/layout.tsx`.) DNS TXT is the fallback.
6. **Profile assets:** the tree mark as avatar; a 2:3 crop of the range grid or
   couch hero as the profile cover. Banner rule from the audit applies — current
   tagline only ("Your kid, in their own storybook."), not the retired one.
7. **Etsy side, same sitting:** paste the GA4 `G-` ID into Shop Manager → Settings
   → Options → Web Analytics (create a GA4 property first if none exists) · mint
   **`FABLEPIN15`** per `promotions.md` §6 (15%, scoped to the storybook listing
   once add-on listings exist) · confirm Offsite Ads opt-out happened (audit
   verify-list #3 — unrelated to your own pinning, but it's the same
   settings screen).
8. **Boards:** create the eight §4 boards as **secret**, seed each to ~10 pins over
   the first week or two, then flip public. Empty public boards read as abandoned
   to both users and the classifier.

---

## 4 · Board architecture

Eight at launch. Names are verified search phrases (Pinterest hub pages or real
in-niche accounts use them verbatim). One search intent per board; descriptions
below are paste-ready. The **first board a pin is saved to** does the most
classification work — save each pin to its cluster's home board first, wait 2–3
days before the second-board save.

| # | Board | Cluster | Description (paste) |
|---|---|---|---|
| 1 | **Personalized Children's Books** | evergreen · home board | Personalized children's books where your kid is the main character — custom storybooks written about your child, illustrated in a style you choose, and narrated. Ideas and inspiration for one-of-a-kind kids' books. |
| 2 | **Personalized Gifts for Kids** | evergreen | Meaningful personalized gift ideas for kids — custom storybooks, keepsakes, and presents made about one specific child. For the kid who has enough toys. |
| 3 | **Christmas Gifts for Kids** | christmas | Christmas gift ideas for kids they'll still love in July — personalized storybooks, keepsake gifts, and stocking stuffers for children. Including last-minute options with no shipping cutoff. |
| 4 | **Sentimental Gifts for Grandchildren** | grandparent | Sentimental gifts for grandchildren from grandma and grandpa — personalized books and keepsakes that say "I know exactly who you are." Gift ideas grandparents can send in minutes. |
| 5 | **New Baby & Baby Shower Gifts** | newbaby | New baby gifts and baby shower ideas with meaning — personalized storybooks, big-sibling gifts, and keepsakes for welcoming a new kid to the family. |
| 6 | **Birthday Gift Ideas for Kids** | birthday | Birthday gift ideas for kids ages 3–9 — personalized storybooks and meaningful presents for the kid who has everything. First birthdays to big-kid birthdays. |
| 7 | **Bedtime Stories for Kids** | bedtime | Bedtime stories for kids and the rituals around them — read-alouds, personalized storybooks, and quiet screen-time that actually earns its place in the bedtime routine. |
| 8 | **Screen-Free(ish) Kids Ideas** | bedtime/brand | Quiet-time and screen-time ideas for intentional parents — no ads, no autoplay, no algorithm. Twenty-minute rituals, reading nooks, and stories worth the screen. |

Seasonal boards added later, ~60 days ahead of each moment: **Stocking Stuffers for
Kids** (Oct 1) · **Easter Basket Ideas for Kids** (Feb 1) · **Mother's Day Gift
Ideas** (Mar 1, searches peak in March) · **Father's Day Gift Ideas** (Apr 15).

Boards 1–6 are ~100% own pins. Boards 7–8 are the two where saving *some* others'
content (reading nooks, bedtime-routine charts — never competitors) is fine to
round out the board's usefulness; keep own-content majority.

---

## 5 · Pin design system

**Specs, non-negotiable:** 1000×1500 px (2:3) statics · title ≤100 chars with the
keyword in the first 40 (only ~40 display in feed) · description 150–300 chars,
conversational sentences not comma-lists, close with the code line · **alt text on
every pin** (Tailwind's 1.2M-pin study: alt text correlated with +123% outbound
clicks — and you already have alt-text strings written in the audit) · text overlay
≥24pt, top-loaded · `littlefables.app` watermark, corner · no hashtags.

**Six archetypes.** The unpublished asset bench in `assets/listing/etsy-photos/`
maps almost one-to-one — the first ~20 pins are crops, not creations:

| Archetype | Job | Existing raw material |
|---|---|---|
| A · Lifestyle | warmth, stops the scroll | couch hero · rug shot · `07B` phone-on-counter · `09` night mode |
| B · Claim card | the differentiator, in-grid | `08` turnaround card · screen-time defuser line · "no shipping, ever" |
| C · Process/proof | "personalization is real" — nobody else can show this | `03` intake→character · `04` books→style · `05` revision rounds |
| D · Range grid | "your taste, not our dropdown" | `02` four-kids-four-styles |
| E · Gift guide | save-bait; future site traffic | new: "6 gifts for the kid who has everything" listicle graphics |
| F · Video | demo; 6–15s sweet spot | the 15s demo cut the audit already specced · reader screen capture |

Statics are the workhorse (89% of viral pins); one video pin per cluster is plenty.
Archetype C is the strategic one — process pins are simultaneously your best
conversion argument, your most save-worthy content, and your least
AI-label-exposed format.

**Titles/descriptions — formula and three worked examples.** Formula: `[search
phrase] — [differentiator hook]`, then a description that reads like a person and
lands 2–3 secondary keywords + one line of the offer.

- **Title:** `Personalized Children's Book — Your Kid as the Main Character`
  **Desc:** They're not just named in it — the story is about them, illustrated in
  a style you choose and narrated with care. Previews in 24 hours, the finished
  custom storybook in 3–4 days. 15% off with code FABLEPIN15.
- **Title:** `Christmas Gift for Grandkids They'll Read Past December`
  **Desc:** A personalized storybook about exactly who they are right now — from
  grandma and grandpa, delivered in days with no shipping to miss. A sentimental
  gift for grandchildren that takes minutes to send. Code FABLEPIN15 takes 15% off.
- **Title:** `Last-Minute Christmas Gift for Kids — No Shipping, Ever` *(Dec 10–22
  cluster)* **Desc:** Ordered December 20th? Still fine. A custom children's book
  with your kid as the main character, rush-delivered to any phone or tablet before
  Christmas morning. When every shipping cutoff has passed, this one hasn't.

**Volume per listing:** ≥5 distinct designs per listing at launch (different
archetype × different keyword angle, not recolors), +2–3 new designs per listing
per month. Ten near-identical variants in a week reads as spam; five genuinely
different angles reads as coverage.

**Templates:** build 6 master Canva templates (one per archetype) in the brand
system once; every future pin is a fill-in. This is the single biggest
hands-off lever.

---

## 6 · Cadence & automation (the hands-off operating model)

**Cadence: 1–2 fresh pins/day, every day.** That's 30–60/month — inside every
credible 2026 recommendation (the 20–30/day era is over; consistency beats
volume), high enough to matter, low enough to batch monthly. Never go silent for
2+ weeks; never burst 10+ in a sitting.

**Scheduler: Tailwind Pro, ~$17.99/mo on annual.** The 150 posts/mo cap fits this
cadence with headroom; SmartSchedule picks posting times; interval pinning
auto-spaces the same design across boards 2–3 days apart — which is exactly the
spam-safety rule, automated. ($0 alternative: Metricool's free tier — one brand,
auto-UTMs — with slightly more manual spacing. Skip Tailwind Communities either
way; not worth the time in 2026.)

**The monthly batch (~2 hours, once a month):**

1. 10 min — check Pinterest Trends + search autocomplete for the coming month's
   terms; skim last month's top pins in analytics.
2. 60–75 min — produce 30–40 pins in Canva from the 6 templates: every live
   listing gets 2–3 new designs, the seasonal cluster ~60 days out gets the rest.
   Export with keyworded filenames (`personalized-childrens-book-christmas.png`).
3. 20–30 min — load into Tailwind: title, description, alt text, UTM'd link,
   board assignments (home board first). SmartSchedule drips them out.

**The weekly glance (~10 min, non-negotiable even in hands-off mode):** Pinterest
analytics sorted by outbound clicks — note the top 3 pin designs (next month's
batch doubles down on whatever archetype/angle is winning) · check saves on
anything new · confirm the queue isn't empty.

**Guardrails (the spam rules, consolidated):** every published pin is a new image
· same image to ≤3 boards, 2–3 days apart (Tailwind handles) · same destination
URL ≤1 pin/day · ≤10 pins/day absolute ceiling · no keyword-stuffed comma-list
descriptions · rotate destinations as listings multiply.

---

## 7 · Seasonal calendar (merged with the promo + listing calendar)

| Month | Pinterest reality | Little Fables moves |
|---|---|---|
| **Aug '26** | Holiday searches already visible; back-to-school | Account setup (§3) · boards secret-seeded · first ~20 pins from the bench · evergreen + first christmas pins queued |
| **Sep** | Historic start of holiday planning | Boards public · full cadence on · Christmas cluster ramps to half of output · occasion listings go live → each gets its 5-pin set · intro sale ends Sep 30, pins inherit the price change automatically via rich pins |
| **Oct** | Christmas spikes begin; self-gift wishlists build; gift-search-every-6-seconds corridor opens | Stocking Stuffers board · Christmas ≥60% of output · `FIRSTFABLE15` on (promotions §4) · join Etsy's holiday sales event · **ads go/no-go decision** (§9) |
| **Nov** | Wishlist peak; "most festive decisions made" by late Nov | Grandparent cluster heavy (they buy early) · `10B` christmas-cutoff photo into listing slot 10 (audit) · December tags swap · pre-build the Dec 10–22 last-minute cluster |
| **Dec 1–9** | Gift-ideas-for-others surge | Last regular Christmas pins; `LOVEFABLES` window (promotions §5) |
| **Dec 10–22** | Last-minute panic; physical competitors' cutoffs pass Dec 15–19 | **Flood the no-shipping cluster** — this is the ownable window · discounts off Dec 16–24, the deadline is the offer |
| **Jan '27** | Gift lull; self-care season; birthdays/baby steady | Cadence drops to 1/day evergreen (birthday, newbaby, bedtime) · 90-day review |
| **Feb** | Easter planning starts; Valentine's | Easter Basket board · valentine "book about the kid you love" mini-cluster |
| **Mar** | **Mother's Day searches peak (March, not May)**; Easter peak; World Book Day (UK) | Mother's Day board + grandma-angle pins · Easter conversion window |
| **Apr–May** | Father's Day planning; steady occasions | Father's Day board Apr 15 · daddy-and-me angle |
| **Jun–Jul** | Summer lull; earliest holiday planners appear in July | Evergreen maintenance · **180-day review** · pre-produce Christmas '27 from what won in '26 |

Steady year-round regardless of season: birthday, new-baby/baby-shower, bedtime.
These are the floor under the seasonal spikes.

---

## 8 · Measurement

**The stack:** Pinterest analytics (impressions, saves, outbound clicks) → GA4 on
the Etsy shop reading UTM session campaigns (undercounts — app taps leak to
"direct"; treat as directional) → Etsy Stats social bucket (crude) →
**`FABLEPIN15` redemptions + the intake "how did you find us?" answer — the two
signals that tie Pinterest to actual orders.** Add that intake question if it
isn't there.

**Benchmarks to judge against (from the research, not hopes):**

| Metric | Platform reality | Good |
|---|---|---|
| Outbound CTR (clicks ÷ impressions) | 0.2–0.5% average | ≥1% |
| Save rate | — | ≥0.5% is strong |
| Distribution shape | Top 1% of pins take >50% of impressions | expect 2–3 winners carrying everything; feed the winners |

**Expectation ladder** (calibrated to seller reports, ± wide): day 30 — hundreds
to a few thousand impressions, single-digit daily clicks, zero-to-few sales;
day 90 (≈ Nov, boosted by Q4) — 5–20k monthly impressions, 100–400 outbound
clicks/mo, first attributable orders if the niche thesis holds; day 180 —
compounding or not, and you'll know which.

**Decision gates:** at 90 days, if outbound clicks are flowing but `FABLEPIN15` +
intake attribution show ~zero orders, the problem is listing conversion, not
Pinterest — fix downstream before pinning harder. At 180 days, if impressions
never left four digits monthly, cut to 3 pins/week maintenance and let the
long-tail work; the asset keeps compounding either way. Scale signal: any pin
holding ≥1% CTR at ≥10k impressions is the creative brief for everything after it.

---

## 9 · Ads (phase-gated, small)

**The gate comes first and it's already written:** `gtm-decision.md` #1 — no paid
spend until attended time per order is measured below 1.5 hours. That rule was
written for Etsy Ads; it applies with more force here (Pinterest clicks convert
slower). Nothing in this section happens before the gate passes.

**When it passes, the only campaign type that works for Etsy destinations:**
consideration/traffic (pay-per-click). Conversion campaigns, Performance+ sales,
catalogs — all need the Pinterest Tag or a feed, impossible on etsy.com. The
practitioner playbook for exactly this case (digital products on Etsy): promote
your 2–3 *proven* organic pins, $10–20/day, 2–4 week test, 75–150 broad keywords
from the §4 clusters, UTM everything, judge in GA4 + code redemptions. Expect
CPC ~$0.50–0.70.

**The math to hold it against:** at ~$62 net on a $69 order, a $15/day
two-week test (~$210, ~300–400 clicks) needs ~3–4 orders to pay for itself —
roughly a 1% click-to-order rate, which is optimistic-but-possible for a gift
product in November and fantasy in February. **If the gate passes in time, the
one window worth testing is Oct 15–Nov 30.** Otherwise skip ads entirely this
year; organic Q4 is the experiment that matters.

**Later unlocks, for the file:** Pinterest Tag on littlefables.app the day it can
take an order → conversion campaigns · VMP once the claimed site is 9+ months old
with a working catalog — that's the 2027 conversation.

---

## 10 · Rollout

**This week (with me, ~1 hr):** §3 run sheet end to end — account, handle, bio,
claim littlefables.app (I prep the meta-tag change), GA4 on Etsy, mint
`FABLEPIN15`, create 8 secret boards · then first pin batch: crop ~20 pins from
the existing bench, write titles/descriptions/alt text (I draft, you approve),
queue at 1–2/day.

**Weeks 2–3:** boards flip public as they hit ~10 pins · Tailwind trial →
SmartSchedule on · 15s demo video becomes the first video pin · Canva master
templates built.

**September:** first full monthly batch · occasion listings land → 5-pin sets
each · Christmas ramp.

**Oct–Dec:** calendar §7 · ads go/no-go · December cluster.

**Jan + Jul '27:** 90/180-day reviews against §8 gates.

Effort at steady state: **~2 hrs once a month + 10 min weekly.** Everything else
is the scheduler's job.

---

## Appendix A · Stale-advice warning list

If a guide says any of the following, close the tab: claim your Etsy shop on
Pinterest (dead since ~2023–24) · buyable pins / in-pin checkout for Etsy (dead)
· join group boards (dead as growth lever) · use hashtags (ignored) · pin 25–30×
daily (2020 advice; now a spam pattern) · repin your own pins across boards as
strategy (near-worthless) · auto-share from Instagram (wrong format, stripped
audio) · Idea Pins as a separate format (merged away Aug 2023).

## Appendix B · Key sources

**Official (verified 2026-08-07):** Pinterest Help — claim your website (Etsy/eBay
/Amazon unclaimable) · rich pins (Etsy auto product-pins, no markup) · schedule
pins (30 days / 10 pending) · Verified Merchant criteria · Performance+ ·
gen-AI labels (newsroom, Apr 2025) · Pinterest holiday guide 2026 (Jul 30, 2026:
September spikes, Q5) · Pinterest Predicts 2026 + Parenting Trend Report 2026
(newsroom) · festive gifting insights (wishlist timing, 6-second stat) ·
TransActV2 ranking (engineering blog, Jun 2025).

**Practitioner (2025–26):** Tailwind 2025 Benchmark Study (1.2M pins: alt-text
+123% clicks, top-1%-takes-half, 89% statics) + cadence articles (Aug–Oct 2025) ·
Simple Pin Media (save-age data; Etsy strategy; ep 463 Etsy case $25k/9mo) ·
Heather Farris (Pinterest ads for Etsy digital, Nov 2025) · GrowthWillow
(Etsy-domain problems, Sep 2025) · yourpincoach + linkgrab + rankmypin + madpinmedia
(algorithm consensus, late 2025–mid 2026) · Laura Rike (CTR benchmarks, Apr 2026) ·
r/EtsySellers threads Mar 2026 (conversion-score protection, link-target tactics) +
Oct 2025 + Apr 2025 (niche conversion reality checks) · listadum Etsy seasonal
calendar 2026.

**Competitor state (checked 2026-08-07):** I See Me 12,343 followers/124 boards
(Wayback 2026-03) · Hooray Heroes USA 5,753 (Wayback 2026-02) · Wonderbly
unfetchable, IG-first (~303k IG) · MagicPictureStory / RNBishere / FlipWoo — no
Pinterest presence found.

**Internal:** `positioning.md` · `promotions.md` · `gtm-decision.md` ·
`etsy-listing-audit-2026-08-07.md` · `shop-bio-copy.md` · `add-ons.md`.
