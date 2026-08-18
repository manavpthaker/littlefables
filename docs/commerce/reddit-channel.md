# Reddit as a Channel — and the AI Problem It Surfaced

Written 2026-08-10. Companion to `pinterest-playbook.md` (the channel that *is*
running) and `positioning.md` (voice + claims; positioning wins on any conflict).

Research base: three parallel sweeps — Reddit platform policy and ads mechanics,
subreddit-by-subreddit rules audit (~45 subs, subscriber counts pulled live from
`about.json`), and seller evidence with ~500 Reddit comments scored across 20 threads.
Every load-bearing claim carries a source. Claims I could not verify are flagged as
such rather than smoothed over.

---

## The call

**Do not run Reddit as an acquisition channel.** Not organic, not paid. The arithmetic
fails at three independent points and any one of them is disqualifying.

**Do run Reddit as a listening channel.** Free, no account risk, and it is the only
place where the people who *receive* your product talk about it unprompted.

The research paid for itself anyway, because Part 3 is the actual finding: Reddit is a
window onto how the AI-illustration question is going to land, and the commerce docs
are currently underweighting it. That section matters more than the channel verdict.

---

# Part 1 · Why Reddit fails as acquisition

## 1.1 The time arithmetic kills it before anything else

Practitioner consensus for running Reddit organically without getting banned is
**2–4 hours/week steady state**, plus **3.3–6.7 hours of pure warm-up** before you can
mention your business at all (Backlinko's E.A.R.S. framework, updated 2026-07-01 —
note Backlinko is owned by Semrush and sells AI-visibility tooling, so its estimate is
if anything optimistic about the payoff).

Three hours a week is **~156 hours/year**. At `gtm-decision.md`'s measured 2.2–4.3
attended hours per order, that is **the equivalent of fulfilling 36–71 orders**.

The best-documented organic outcome anywhere in the corpus — a small business owner
who spent three years building genuine Reddit standing, `$0` spend — reports
**1,000–1,500 website views per year**. At a generous 2% conversion that is 20–30
orders, arriving in year three.

> Reddit organic costs more attended hours than it returns in fulfillable orders,
> before a single dollar of revenue enters the calculation.

This is the decisive number and it does not depend on any of the softer findings below.

## 1.2 The ads floor is 3–5× above your budget, and the CPA exceeds your price

| | Reddit | Pinterest |
|---|---:|---:|
| Technical minimum | $5/day | $5/day |
| **Minimum viable test, per each platform's own advocates** | **$450–$900 month one**; "$3,000–5,000/month for 90 days" per a Reddit Certified Partner | **$70–$140 total** (14 days at $5–10/day) |
| CPM | $3.50–15 (avg $6.50) | **$2–5 (avg $3.50)** |
| E-commerce CPA | **$30–150** | $7–30 |

At $69 list with ~$62 net after Etsy fees, a $30–150 CPA is between marginal and
ruinous. Pinterest's benchmark is the only one in the set that clears the price point.

Two structural notes:

- **Every one of those benchmarks is vendor-published.** There is no independent
  measurement-firm benchmark for Reddit ads by vertical. The most credible signal in
  the whole table is that a *Reddit ads agency* published it and still gave Pinterest
  roughly half Reddit's CPM.
- **You cannot run Reddit conversion campaigns at Etsy.** The Reddit Pixel or
  Conversions API "must be implemented on your site for ad groups to optimize for
  conversion goals. When neither integration is set up, only the clicks event can be
  optimized." Etsy has no pixel-install path. Same structural wall as
  `pinterest-playbook.md` §9 — Reddit at Etsy is traffic-objective only, blind.

Add the click-quality problem: **~8 independent first-party advertiser reports,
2024–2026, of paid click counts wildly exceeding landing-page arrivals** — 237 clicks →
9 sessions (3.8% survival) at the worst, 48% at the best, with 2–10 second session
durations. Reddit's support account denies it; a 2024 click-fraud suit exists with no
reported outcome. Unresolved, but consistently reported.

The flagship thread — r/smallbusiness, "Don't waste your money on Reddit ads,"
324 upvotes, 174 comments — contains **zero reports of a profitable campaign**.

## 1.3 The surfaces with traffic are closed

Of ~45 subreddits audited, everything with meaningful traffic either bans
self-promotion, bans AI content, or both.

**Closed — do not post:**

| Sub | Subs | Why closed |
|---|---:|---|
| r/Parenting | 8.3M | Self-promo → auto perma-ban. "AI/LLM content" in ban list |
| r/teachers | 2.4M | "Violations=ban." AI content "banned with extreme prejudice" |
| r/Mommit | 2.7M | "Absolutely NO promotions/advertising" |
| r/daddit | 2.0M | Bans "any product or service you created or are selling, **to include apps**" |
| r/somethingimade | 3.1M | Businesses banned; "Using AI to post here is not allowed" |
| r/beyondthebump | 808k | Both |
| r/GiftIdeas | 581k | See below — the rule names your category |
| r/NewParents | 530k | Product-recommendation posts explicitly banned |
| r/homeschool | 236k | "Ban you without warning." AI tools named as spam |
| r/childrensbooks | 51k | Conditional promo + disclosed-AI-for-discussion-only = mutually exclusive for you |

r/GiftIdeas — the largest gift-request sub on Reddit — added this rule in roughly
February 2026:

> "Posts or comments promoting websites or tools that generate gifts using AI (e.g.,
> AI card generators, AI video generators, AI calendar generators, etc.) are not
> allowed. This subreddit is for sharing real, thoughtful gift ideas, not promoting
> automated generators or low-effort AI products."

**Open, and small.** The complete list of surfaces where you could post without
breaking a rule:

| Sub | Subs | Terms |
|---|---:|---|
| r/Gifts | 335k | 10% promo cap; **"Links from Amazon, Etsy, Ebay etc are preferred."** No AI rule. Best of the large subs |
| r/Autism_Parenting | 102k | "Self-Promotion Saturday" thread, disclosure required. Has an "No AI slop" rule |
| r/Dyslexia | 39k | Carve-out: paid services allowed **when answering someone who asked**. Narrated read-along is genuinely on-point |
| r/predaddit | 82k | "Product recommendations and links are allowed and encouraged" |
| r/santashelpers | 15k | "Promoting" flair, declare financial interest. Friendliest rules found anywhere |
| r/perfectgift | 7.7k | `"rules": []` — no policy at all |
| r/ChristmasGiftIdeas | 8.4k | "Crafters and personalized item makers are welcome to share their work once every week" |

Combined addressable audience of the four permissive ones: ~113k, seasonal, low
engagement. Not a channel. At most a December afternoon.

**There is no grandparent channel on Reddit.** r/grandparents is 2,231 subscribers and
restricted; r/Grandparents_Rights has 3 members. Any grandparent play routes through
r/Gifts or nowhere.

**Categories with no viable sub at all:** bedtime routines, teacher gifts, baby
shower/first birthday, screen-time-conscious parenting (r/lowscreenparenting: "this
sub does not tolerate AI-generated content of any sort" — and a web app is
definitionally off-message there anyway).

**Ethically off-limits regardless of rules:** r/babyloss, r/NICUParents (has an "Angel
Baby" flair), r/Adoption (adoptee-led), r/fosterit. A paid keepsake starring "who your
child is" lands as monetising unresolved grief. Do not go near these, including for
research.

## 1.4 The SEO / AI-citation play is dead, in both directions

This is the strongest remaining argument for Reddit and it does not survive contact.

**Reddit links pass nothing.** Direct HTML inspection: link-post targets carry
`rel="nofollow noopener ugc"`; comment links carry `rel="noopener nofollow noreferrer
ugc"`. Google's documentation (updated 2025-12-10): links with these attributes "will
generally not be followed." Anyone selling Reddit backlinks is selling a closed loophole.

**Reddit is a traffic sink, not a source.** Reddit received ~1.2 *billion* Google
Search referrals in April 2025 and passed ~34M pageviews back out to ~4,500 publishers
— **less than 1% of those publishers' overall referral traffic** (Digiday /
Chartbeat / Similarweb, 2025-06-12). A SparkToro × Datos clickstream panel measured
Reddit referrals **falling 30% over 13 months**.

**The AI-citation thesis is unstable to the point of unusable.** Semrush (230k prompts,
2025-07 to 2025-10) measured ChatGPT's Reddit citation rate going from ~60% of
responses to ~10% in five weeks. Two firms then measured the identical Oct 2025 →
Jan 2026 window on the same denominator and got **opposite signs** (Conductor: −50%;
Tinuiti/Profound: +73%). And Ahrefs (1.4M prompts, April 2026) found that **67.8% of
all pages ChatGPT retrieved but did not cite were Reddit** — it reads Reddit constantly
and credits it 1.93% of the time.

**Reddit itself is closing the door.** It has hardened robots.txt, blocked the Wayback
Machine from archiving posts (Aug 2025), shipped Reddit Answers to keep answer traffic
on-platform, and told AdExchanger in June 2026: *"There is no guarantee that what is on
Reddit will make its way into LLMs, and we question the legitimacy of any provider
suggesting they can."* Enforcement now removes ~100,000 accounts/day using LLM
detection of "coordinated patterns of fake behavior and artificial hype."

One correction worth recording, because the opposite is widely believed: **Reddit was
not deranked in Google.** SE Ranking (100k keywords, 2026-06-05) measured its TOP-3
share rising 9.19% → 10.24% across three core updates, with #1 rankings up 54%. Google's
site-reputation-abuse policy has an explicit, unchanged carve-out for "sites designed
to allow user-generated content, such as a forum website." Reddit ranks fine. It just
sends you nothing and passes you no equity.

## 1.5 The failure modes are real and asymmetric

The upside is capped at a few hundred views. The downside is not capped.

- **The permanent-URL problem.** The best-documented case: a coding bootcamp whose
  Google result #2 for its own brand name became r/codingbootcamp threads titled
  "Codesmith is an enormous waste of money," ranking since Sept 2024, surfaced by
  ChatGPT too. Executives self-report ~80% revenue decline with ~half attributed to it.
  *(Magnitude is self-reported and contested — an industry-wide bootcamp collapse is a
  competing explanation. The mechanism is not in dispute.)*
- **Rule compliance is not protection.** An Etsy seller posting in a subreddit that
  explicitly permitted promotion: "I received many extremely rude and nasty comments…
  I don't think calling my photos 'shitty Photoshop mock-ups' is valid critique."
- **Deliberate SEO poisoning is now a retaliation norm.** One documented case: ~30
  near-identical comments seeded against a founder's domain — *"lgcies.com is spam.
  lgcies.com is unsafe."* Rationale given: "all spammers get negative GEO now."
- **Second-order Etsy risk.** Posting your shop link in r/EtsySellers exposes it to
  rival sellers filing Etsy-side reports. One commenter, unprompted: "Will I report
  that shop if they are in violation of handmade, copyright or not vintage? In a
  heartbeat."
- **The tactic you'd be advised to use is named and policed.** The r/EtsySellers head
  mod, on "share the process, don't drop the link": *"Am I the only one that's
  uncomfortable with the sub rule basically being 'Obvious promotion is horrible, but
  if you're sneaky about it, that's cool'?"* Detection heuristic adopted: audit the
  poster's profile for promo ratio.

**What is *not* in the evidence, and should stop being feared:** nobody in the corpus
reported a sitewide account ban, a domain-level ban, or a shadowban for posting a
product. Enforcement was uniformly sub-level. "Reddit will ban your domain" is folklore.

---

# Part 2 · What Reddit is actually for

Three things, all near-zero hours, no account risk, no ban surface.

**1 · Voice-of-customer mining.** Free, unlimited, no account needed. The parenting and
gift subs are the highest-density source of unprompted language about personalized
books that exists anywhere — better than any survey you could run, and `market-research.md`'s
open questions ("no verified data on digital-vs-physical preference within that
segment") are partly answerable by reading r/Gifts and r/Preschoolers for an hour.
Note the one closed door: r/childrensbooks now treats "what does your child like in a
children's book?" posts as hostile data-scraping and asks members to report them
(387 points, **1.00 upvote ratio**, 2026-06-21). Read, never ask.

**2 · Brand and category monitoring.** The Codesmith failure mode is not that a hostile
thread appeared — it's that nobody noticed for a year while it climbed to #2 on the
brand term. Detection is free; remediation is not. Set alerts for `littlefables.app`,
`LittleFablesStories`, and "personalized children's book."

**3 · Reddit Pro.** Free, no ad spend, no revenue floor, no verification required —
just a verified email and a business self-declaration. The two useful features are
**Trends** and **Links** (tracks where your URLs get shared on Reddit). Sign up; treat
it as a listening tool, not a publishing one. The optional "verified business" badge
buys trust signal only — Reddit states it "doesn't affect moderation rules, feed
ranking, ad performance, or access to product features."

One rule if you ever do post: **Reddit's Manipulated Content policy requires AI
disclosure** — "be transparent and include a tag (or other form of indication)
disclosing that the content was generated or modified by AI." Undisclosed sample pages
are a policy violation, not just a reputational risk. And the 9:1 self-promotion ratio
is **still live in official Reddiquette** as of 2025-08-18, contrary to every SEO blog
claiming it was retired.

---

# Part 3 · The finding that matters

## 3.1 What the sentiment actually measures

An agent read ~500 comments across 20 threads, pulling scores and upvote ratios from
Reddit's JSON. In the seven threads where every comment was counted: **roughly 83–87%
anti-AI, 8–9% pro or tolerant.** In r/childrensbooks specifically the ratios run 30:2,
49:2, 78:3. Substantive pro-AI comments sit at −8, −11, −22.

The bullseye is a moderator's exasperated megathread from 2026-05-08 titled
**"Almost every day this week we've had someone ask what we think of their idea for
personalized AI storybooks"** (102 points, 0.99 ratio). You are not entering a neutral
market. You are the archetype the rule was written for.

Representative, with scores:

> "People who use AI want all the glory of having written or illustrated something
> without putting in the hard work. They don't value children's lit, they usually just
> want to make a quick buck." — **+89**

> "I'M NOT BUYING ANY BOOKS USING AI." — **+142**

> "My in-laws bought a personalised book for my son for Christmas and I absolutely
> LOATHE reading it."

> "There is no scenario in which I will willingly feed images of my children to AI." — +8

## 3.2 Four findings that should change what you do

### Finding 1 — The buyer is not the reader, and the reader is the one who talks

This is the highest-value insight in the research and it is not really about AI.

`positioning.md` names grandparents as the secondary buyer. **In these threads, the
grandparent-gifted AI book is the recurring villain** — at least five separate
households describe receiving one from in-laws and hating it. WIRED ran a piece titled
*"Boomers Can't Stop Gifting Their Grandkids AI-Generated Slop Books"* naming three
direct competitors (Imagitime, StoryWonderBook, Childbook.ai) in exactly that frame.
*(I could not fetch the WIRED page directly — blocked — so treat the headline and
competitor list as one agent's finding, not verified by me.)*

The structure: **grandparent buys once and never reads it; parent reads it aloud
nightly and writes the review.** Your reviews, your word of mouth, and your repeat
purchases all run through the person who didn't pay.

**`delivery-flow.md` already describes this exact flow and diagnoses it as a
different problem.** Verbatim:

> "Grandma buys, does the intake, gets every email, approves the previews, prints the
> certificate — then hands it to **the parents**, who have had zero contact with us.
> Every trust-building touch accrued to the wrong person."

That doc treats it as an *onboarding* problem — a cold recipient on an unfamiliar
domain. The Reddit evidence says it is worse than that: **the person who never
approved the art is the person who has to read it aloud two hundred times.** Your one
real quality gate — unlimited preview revisions — is being spent on the buyer who will
never open the book again, and withheld from the reader who decides whether you get a
review.

The fix is not more onboarding. It is putting the parent in the approval loop.
Options, cheapest first: a "send previews to the parent too" checkbox on a gift intake;
a post-delivery revision offer aimed at the parent (`gtm-decision.md` already notes
post-delivery corrections are nearly free and are what produce the review); or, at the
strong end, gift orders that defer the intake to the recipient entirely and sell the
grandparent a certificate rather than a finished book. Worth a decision before
December, when gift orders are the volume.

### Finding 2 — Disclosure buys you nothing, and you have to do it anyway

In ~500 comments there is **not one instance of anyone crediting a seller for
disclosing**. Every documented instance made it worse: a parent who found an AI
disclaimer in a book's front matter called it "basically a scam product" and demanded a
refund. A self-publishing author who *asked* about disclosure got a 0.05 upvote ratio.

Etsy requires the disclosure regardless — and `etsy-setup-log.md` already made the
right call selecting *With an AI generator*, for the right reason (a zero-review shop
cannot absorb a policy violation). So: **disclose because it's required and because
being caught is far worse, not because it earns goodwill. Budget zero credit for it.**

The corollary is that the *placement and wording* of the disclosure is the only lever
you have, and Finding 3 tells you where to put it.

### Finding 3 — Your configuration is the defensible one, but you're not claiming it

Two pieces of evidence point opposite ways and both are real.

**Reddit says "human text + AI illustration" is the worst offence, not a lighter one**,
because illustration is understood as the load-bearing part of a picture book (+44:
"the illustration is 75% of what's most important about kids books"). Every hybrid
attempt in the corpus was treated as fully AI.

**The one actual study says the opposite.** Jin (NC State) & Yuan (McMaster),
*International Journal of Child-Computer Interaction*, 2025-11-12,
[doi:10.1016/j.ijcci.2025.100787](https://doi.org/10.1016/j.ijcci.2025.100787) — n=13
parent-child groups, qualitative, part-funded by the OpenAI Researcher Access Program
*(disclose that when citing it)*. I verified the DOI resolves to a real Elsevier
article; I could not read the full text. Findings as reported:

- Most parents **will accept AI images if the text is human-authored** and the images
  have been reviewed by educators, librarians, or other experts.
- Most parents were **not** comfortable with AI generating the *text*.
- Parents preferred **"a clear notification on the cover"** — cover label, not
  page-level flags. On page-level labels: "Most parents and children neither noticed
  nor used the labels."

These reconcile if you take Reddit as the **vocal cohort** and the study as the
**buying cohort**. Both are true; they are different populations. The r/EtsySellers
read on it is blunt: "People don't care that its AI if they think it's pretty/fits
their needs" (+26). But note the counterweight — the one actual personalized-AI-kids'-book
Etsy shop found in the data made **zero sales in six weeks on $25/day of ads**,
diagnosed by other sellers as "All the pictures with children look fake/are weirding me
out."

**So the acceptable configuration is: human-authored text, AI illustration, disclosed
on the cover.** That is very close to what Little Fables already is.

**And `positioning.md` never claims it.** Read the file: the word "authored" appears
once, in the price table, as an aside. The single most load-bearing sentence in your
entire AI defence — *a person writes the story* — is absent from the source of truth
for all buyer-facing copy. Fix that first.

### Finding 4 — Two objections that have nothing to do with AI

**The photo objection has no counter-argument anywhere.** "There is no scenario in
which I will willingly feed images of my children to AI." In ~500 comments, nobody
defended the practice once — it is the only objection in the set with zero dissent.

**Little Fables is very close to being able to answer it, and doesn't.** Checking the
actual pipeline rather than assuming: the intake takes an **optional** photo
(`intake-flow.md` — "Look — free text + optional photo upload"), it lands in a private
bucket, and `fulfillment-playbook.md` steps 20–22 **stay manual precisely so that no
buyer photo goes near an image API** — "minors' likeness is the highest-scrutiny
category in every provider's terms." A person looks at the photo and writes the
description. `etsy-listing.md` already says the honest version: "it's an illustration
inspired by your child, not a photograph of them."

So the true claim is not "we never ask for a photo." It is stronger and more specific:

> **The photo is optional. If you send one, a person looks at it and describes your
> child. It never goes into a model.**

Nothing in the corpus argues against that. `positioning.md` §3 currently frames privacy
as *retention* — "we delete the intake" — which is the weaker half. The claim above is
about what you never do in the first place, and it is the only differentiator you have
that the vocal cohort concedes without a fight.

**Two things to fix alongside it.**

- **The Etsy title oversells it.** "Custom Kids Book Personalized with Your Child's
  Name & Photo" is a keyword title that promises photo-likeness, which the FAQ then
  walks back. That gap is exactly where "basically a scam product" attaches. Keep the
  keyword if search demands it, but the first gallery image or description line has to
  close the gap, not the FAQ four screens down.
- **Phase 2 of the art pipeline would break this claim.** The bake-off result (GPT
  Image 2 via fal, twenty pages unattended) is gated behind "before any buyer photo
  goes near an API." If that gate opens, the strongest uncontested claim in your
  positioning goes away. **That is a marketing cost on an ops decision, and it should
  be priced into it.** Note it in `content/bakeoff/README.md` and
  `fulfillment-playbook.md` step 22 so the decision isn't made on throughput alone.

**The category objection predates AI and is sharper than the AI one.** The
r/childrensbooks moderator, +46:

> "I personally think personalized books, even before AI was a thing, tend to be
> incredibly bland. They focus more on selling a gimmick than telling a good story.
> They're the Hallmark cards of the storybook world, read and toss."

And, +12: "I work at a used bookstore and you have no idea how often they are
unceremoniously dumped on us and tossed in the recycling because they have no resale
value."

The second one is answered by being digital. The first is a craft charge and only
craft answers it — which means the story sample in the listing gallery and the
walkthrough video are doing more work than any claim you can write.

**And the moat objection**, +10: *"if for some unforeseen reason, I needed a
personalized AI storybook I can prompt my own because I'm literate."* Your answer is
narration, art direction, the approval loop, and the reader app — none of which a
parent with ChatGPT gets. Say it explicitly somewhere.

## 3.3 The commercial signal hiding in the hostility

Demand for personalization is real and warm **as long as AI isn't mentioned**.
r/Preschoolers, Sept 2025: "My kids love theirs" (+9), "she cried lol. It was so worth
it" (+2).

And there is a thread in r/childrensbooks titled **"Personalized stories that DON'T use
AI?"** — a parent actively hunting for your product minus the pipeline.

That gap is the interesting finding, not the outrage. There is an unserved segment that
wants personalization and is willing to pay to avoid slop. You cannot claim
zero-AI. You *can* claim the three things that segment is actually buying: a person
wrote it, no photo of your child went anywhere, and you approve every image before the
book is built.

---

# Part 4 · Positioning audit

Every claim below is checked against the objections ranked by frequency in the corpus.

## 4.1 `positioning.md`

| Current | Verdict | Change |
|---|---|---|
| **§2 "Curated, not AI slop"** — human QA pass, art from your references, character matched not swapped | **Strong asset, wrong argument.** Every clause is about *process*. The #1 objection is a moral judgment about *effort and care*, and process language reads as procedural defence | Lead the section with authorship: *"A person writes your child's story. Not a template with a name slot, not a prompt."* Keep the QA/reference/character clauses beneath it |
| **Human authorship of the text** | **Absent.** Appears once as "authored" in a price-table aside | Add it as its own differentiator, ranked #2. This is the claim the only real study says parents need |
| **§3 Privacy** — "we delete the intake," "no voice clones stored" | Right instinct, weaker half of the claim | Add the non-collection half: **"The photo is optional. If you send one, a person looks at it — it never goes into a model."** Zero-dissent objection, uncontested win over KidTeller |
| **Copy line: "Not free-tier AI. Not $50 hardcover."** | **Cut it.** A comparative that concedes the frame — it argues you're the good AI, which is the exact position the corpus is angriest at | Replace with the authorship line |
| **Copy line: "Anti-slop"** as a label | Keep the stance, drop the word. "Slop" is the anti-AI camp's vocabulary; using it invites the comparison | — |
| **§5 Grandparent-friendly** | Correct, but incomplete given Finding 1 | Add: the redeeming **parent** approves previews, not the purchasing grandparent. This is a product requirement, not copy |
| **Voice: never use "AI-powered"** | Right, and now load-bearing | Add to the never-list: never use "AI-generated," "AI-illustrated," or "powered by" in headline position. Disclosure belongs in the FAQ and on the cover, not in a hook |
| **Trust guarantee** — unlimited preview revisions | Underrated. It is the structural answer to "AI books are off in cadence / the character drifts" | Promote it in the AI FAQ answer specifically: *you see every image before the book exists* |

## 4.2 The Etsy AI FAQ — rewrite it

Current (`etsy-listing.md`):

> **Do you use AI?** We use modern tools to help illustrate, the same way a studio
> would. Every book gets a human pass before it reaches you, and you approve the art
> before we build it. We're not interested in shipping something we wouldn't give our
> own kid.

The last sentence is excellent and should survive verbatim (in first person, per
`shop-bio-copy.md`). The first is a hedge — "modern tools," "the same way a studio
would" — and hedges are what the "basically a scam product" reaction attaches to. The
study says parents want plain, cover-level clarity. Proposed:

> **Do you use AI?** Yes, for the illustrations — and I'll be specific about where.
> Your child's story is written by a person. The pictures are generated and then
> art-directed by hand, image by image, and you approve every one before the book is
> built. The photo is optional, and if you send one, I look at it and describe your
> child in my own words — it never goes into a model. I'm not interested in shipping
> something I wouldn't give my own kid.

Four things that does: leads with yes (no hedge to catch on), draws the text/art line
the study says matters, converts the preview loop into the quality guarantee, and lands
the uncontested photo claim. **Check it against the pipeline before publishing** — the
sentence is only true while steps 20–22 stay manual.

## 4.3 On the cover

The highest-scoring single objection in the largest thread (+120): *"I don't buy books
that don't have an illustrator's name on the cover!"*

You cannot name an illustrator. **You can put a byline.** "Written for Rosa by [name]"
on the cover or title page — plus, per the study, a plain cover-level note about the
illustrations. This is a small build against the most-upvoted objection in the corpus,
and it converts your biggest liability into the thing that makes the book feel made.

Worth checking against `story-concepting.md` and the reader's cover rendering
(`book-cover.tsx`) before committing.

## 4.4 Pinterest copy — `pinterest-batch-01.md`

The playbook already handles the mechanical risk correctly (§ on AI-content labels:
Pinterest auto-labels via IPTC + classifiers, don't fight it, shift the mix toward
what's real). Three additions from this research:

1. **No pin in batch 01 says a person writes the story.** p03 gets closest — "Real
   personalization, not a name swap" — but that's a *depth* claim, not an *authorship*
   claim. Add the authorship line to at least the evergreen pins. It is the one claim
   that is both true and load-bearing, and it costs a clause.
2. **p04-evergreen-revisions is your best AI-defence pin and isn't framed as one.**
   "See your child as the main character before anything is final" answers character
   drift, uncanny faces, and cadence complaints in one image. Consider promoting it in
   the publish order.
3. **Make the photo claim a pin.** "Your child's photo never goes into a model" is a
   distinct, uncontested, competitor-differentiating hook and there is no pin for it.
   It pairs naturally with the screen-time and privacy angles already in the mix, and
   it is the one claim KidTeller structurally cannot make.

The playbook's existing instinct — lean toward product UI screenshots, the
intake→character process, the revision rounds — is now doubly right. Those are the pins
that dodge the AI label *and* make the craft argument.

---

# Part 5 · What to do

| Size | Action | Where |
|---|---|---|
| **10 min** | Sign up for Reddit Pro (free). Set brand + category alerts | reddit.com/pro |
| **30 min** | Add human-authorship as differentiator #2 in `positioning.md`. Cut the "Not free-tier AI" line | `positioning.md` |
| **20 min** | Add the non-collection half of the privacy claim: photo optional, never goes into a model | `positioning.md` §3, `etsy-listing.md` |
| **20 min** | Rewrite the Etsy AI FAQ per §4.2 | `etsy-listing.md` |
| **10 min** | Record that opening the buyer-photo-to-API gate costs the strongest claim in positioning | `content/bakeoff/README.md`, `fulfillment-playbook.md` step 22 |
| **1 hr** | Gift orders: get the **parent** into the preview-approval loop. `delivery-flow.md` confirms today only the grandparent approves | `delivery-flow.md`, `intake-flow.md` |
| **30 min** | Add authorship clause to evergreen pin descriptions; add a "photo never goes into a model" pin to batch 02 | `pinterest-batch-01.md` |
| **2 hrs** | Cover byline + plain cover-level illustration note | `story-concepting.md`, `book-cover.tsx` |
| **1 hr/quarter** | Read r/Gifts, r/Preschoolers, r/Autism_Parenting for language. Never post, never ask | — |
| **December only, optional** | One honest, disclosed post each in r/santashelpers, r/perfectgift, r/ChristmasGiftIdeas. Expected value: low. Risk: also low | — |
| **Never** | Reddit Ads. Reddit organic in the parenting subs. Any "Reddit seeding" vendor | — |

**The one thing to keep spending on stays Pinterest** — not because Pinterest is
great (the seller evidence is thin: the modal r/EtsySellers position is
"traffic yes, sales no," and the best hard figure is one seller reporting ~9% of shop
visits from one share per listing). It wins on the denominator. Near-zero marginal
hours, a $70–140 test floor, a CPA benchmark that clears your price, a 70–80% female
audience that matches children's-book buyers, and no reputational tail risk. Reddit
loses on every one of those.

---

## What I could not verify

- **The WIRED piece** naming Imagitime / StoryWonderBook / Childbook.ai — the URL is
  blocked to my fetcher. One agent's finding, not independently confirmed. Verify
  before citing it anywhere buyer-facing.
- **The Jin & Yuan study's full text.** DOI resolves to a real Elsevier article; the
  specific findings are as reported by the research agent, not read by me. It is
  part-funded by OpenAI's Researcher Access Program — disclose that if you ever cite it.
- **All Reddit and Pinterest ad benchmarks.** Zero come from a source with disclosed
  methodology. Directional only.
- **Reddit's official Ads Help Center article text** — the site is JS-rendered and
  returns 401 to fetchers; figures were extracted via search indexing of the official
  URLs, not read from the pages.
- **Etsy's current AI/Creativity Standards policy text.** Not reached. `etsy-setup-log.md`'s
  disclosure call still looks right, but re-read the policy before the listing goes live.
- **A claim that "17,000+ Etsy listings were removed in 2025 for AI disclosure
  violations."** Blog-sourced, no primary source found. Do not cite.

## Sources

Platform policy and mechanics:
[Reddiquette](https://support.reddithelp.com/hc/en-us/articles/205926439-Reddiquette) (upd. 2025-08-18) ·
[Reddit spam policy](https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam) (upd. 2026-05-19) ·
[Manipulated Content and Misleading Behavior](https://support.reddithelp.com/hc/en-us/articles/41180423371156-Manipulated-Content-and-Misleading-Behavior) (upd. 2026-05-19) ·
[Reddit Rules](https://www.redditinc.com/policies/reddit-rules) ·
[What is Reddit Pro](https://support.reddithelp.com/hc/en-us/articles/24368510335892-What-is-Reddit-Pro) (upd. 2026-03-30) ·
[Conversion Goals](https://business.reddithelp.com/s/article/Conversion-Goals) ·
[Reddit Ads cost](https://business.reddithelp.com/s/article/How-much-do-Reddit-Ads-cost)

Search and AI visibility:
[Semrush, most-cited domains in AI](https://www.semrush.com/blog/most-cited-domains-ai/) (2025-11-10) ·
[SE Ranking, May 2026 core update analysis](https://www.seranking.com/blog/google-may-2026-core-update-analysis/) (2026-06-05) ·
[Digiday, Reddit as publisher traffic source](https://digiday.com/media/media-briefing-reddit-becomes-a-more-noticeable-source-of-publisher-traffic/) (2025-06-12) ·
[CNBC, Reddit Q2 2026 earnings](https://www.cnbc.com/2026/07/30/reddit-rddt-q2-2026-earnings-report.html) ·
[CNBC, Reddit–Google deal renegotiation](https://www.cnbc.com/2026/07/22/reddit-stock-google-ai-content-deal.html) (2026-07-22)

Seller evidence:
[r/smallbusiness — "Don't waste your money on Reddit ads"](https://www.reddit.com/r/smallbusiness/comments/1bcc52i/) ·
[Codesmith reputation-attack writeup](https://larslofgren.com/codesmith-reddit-reputation-attack/) (2025-10-08)

AI sentiment:
[r/childrensbooks — personalized AI storybook megathread](https://www.reddit.com/r/childrensbooks/comments/1t77y8n/) (2026-05-08) ·
[r/childrensbooks — sub being scraped for data](https://www.reddit.com/r/childrensbooks/comments/1uc01nk/) (2026-06-21) ·
[r/childrensbooks — "Personalized stories that DON'T use AI?"](https://www.reddit.com/r/childrensbooks/comments/1pfmy47/) ·
[r/Parents — on reading AI books aloud](https://www.reddit.com/r/Parents/comments/1piuqkx/) ·
[r/Etsy — AI personalized kids' book shop, zero sales](https://www.reddit.com/r/Etsy/comments/1owwbrk/) ·
[Jin & Yuan, IJCCI 2025](https://doi.org/10.1016/j.ijcci.2025.100787)
