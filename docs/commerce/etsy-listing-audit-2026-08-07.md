# Etsy Listing Audit — 2026-08-07

Audit of the live listing ([4549899204](https://www.etsy.com/listing/4549899204/personalized-childrens-book-custom-story)) against the top of Etsy search as it renders today, the shop as buyers see it, and the asset bench sitting in `assets/listing/etsy-photos/`. Reviews are explicitly out of scope per Manav; a short zero-review-compensator section is included because the rest of the listing has to carry that weight until reviews exist.

**What was inspected live today:** the listing page (all 3 photos at full resolution, the video, buy box, personalization fields, full description), the shop page, Shop Manager (Info & Appearance), the search grid for `personalized childrens book` and `personalized story book digital download`, and competitor listings/shops (MagicPictureStory, RNBishere, FlipWoo, plus the physical top-of-grid ads: MinimalTales, Letterfest, TailoredCanvases, MelisaDreamland).

---

## The one-paragraph verdict

The words are the best in the category — no competitor's description comes close to the AT A GLANCE / HOW IT WORKS / FAQ structure, and the About page is the only genuinely human one in the field. But the listing is competing with roughly a third of its assets on the field. It shows 3 lifestyle photos and an 11-second mood video against competitors running 10–12 images (half of them proof/claim cards), 15-second demo videos, strikethrough sale pricing on every single top tile, and thousands of reviews. The proof images that would carry the differentiators — style range, before/after, revision rounds, home-screen install, turnaround — are **already built and sitting on disk unpublished**. Publishing the bench, cutting a demo video, and running the planned $69→$59 intro sale are the three moves that close most of the gap this week. The deeper structural gap is that this is a one-listing shop in a category where every serious competitor runs a portfolio.

---

## Scorecard vs. the field (as rendered today)

| | **Little Fables** | MagicPictureStory | RNBishere | FlipWoo | Physical giants (Letterfest / TailoredCanvases) |
|---|---|---|---|---|---|
| Price shown | $69, no sale | $44.99 ~~$59.99~~ 25% off + countdown | $144.99 ~~$289.99~~ 50% off | $14.49 | $32–40, 15–25% off |
| Reviews | 0 | 210 (4.9) | 288 (5.0), Star Seller | 0 (2 mo old, 1 sale) | 22.8k–28.1k |
| Photos | **3** | 12 | 10 | ~8 | 10 |
| Video | 11s, one spread fading in | 15s demo | 15s demo | yes | yes, every tile |
| Claim cards in gallery | 0 | ~5 ("Looks Just Like Them!", "Free Digital!") | text-heavy cover card | some | name-on-cover heroes |
| Turnaround | **24h preview · 3–4 days** | ~1–2 wks to ship | **20–25 days** | instant template | 1–2 wks |
| Personalization depth | **authored story, custom art style** | photo-likeness AI art, fixed stories | from-scratch art, fixed-ish flow | name/photo swap template | name + presets |
| Revision guarantee | **unlimited previews or refund** | preview before print | none stated | none | none |
| Listings in shop | **1** | 73 | ~dozens | 7 | hundreds |

Two readings of this table. Little Fables loses on everything a buyer sees **before the click** (price theater, review count, thumbnail proof density) and wins on almost everything that matters **after the click** (turnaround, personalization depth, guarantee, prose). The audit is mostly about moving the after-the-click strengths in front of the click. Also worth noting: RNBishere reached 288 reviews and Star Seller in one year at $145–158 with a 20–25 day turnaround and no revision promise — the premium tier of this category is winnable, and their operational weaknesses are exactly Little Fables' strengths.

---

## Priority 0 — this week

### 1. Publish the photo bench (3/10 slots used; the other 7 are already built)

The live gallery is three same-register lifestyle shots: couch (hero), two kids on rug, kitchen table. All warm, all good — and collectively they prove only one thing, three times: "families read this on a tablet." Zero of the four differentiators in `positioning.md` are visible in the gallery. Meanwhile the finished proof cards sit in `assets/listing/etsy-photos/`.

Recommended order (files exist under these names):

| Slot | File | Job |
|---|---|---|
| 1 | current hero (couch) — keep | Warmth + device at 170px. A/B against `02` after 30 days per the photo doc. |
| 2 | `02-four-children-four-styles.png` | "Your taste, not our dropdown." The category-beating claim, proven. Four faces still read at 170px (verified in `00-thumbnail-test-170.png`). |
| 3 | `03-intake-to-character.png` | Intake answer → the kid that came back. Personalization is real, not name-swap. |
| 4 | `04-reference-books-to-style.png` | "You name the books you love" → resulting style. No competitor can show this. |
| 5 | `05-preview-revisions.png` | Round 1 → Round 2 → Final. Makes "unlimited revisions" visible — this is the zero-review trust workhorse. |
| 6 | `08-turnaround-card.png` | 24h · 3–4 days · no shipping. The loudest differentiator, scannable in-grid. |
| 7 | `07-home-screen-icon.png` | "Save it like an app." Converts the non-technical grandparent. |
| 8 | `09-night-mode.png` | "And a quieter one for bedtime." Screen-time defuser. |
| 9 | current kids-on-rug **or** `07B-phone-on-counter.png` | Keep one more lifestyle beat. 07B adds new information (works on a phone); the rug shot adds a sibling read. Slight edge: 07B. |
| 10 | `10C-gift-handoff.png` now → swap `10B-christmas-cutoff.png` in Nov | Gift-buyer close; seasonal urgency later. |

The kitchen shot and whichever of rug/07B loses slot 9 shouldn't die — move them to the About page or use in occasion listings (below).

Two cautions carried over from your own docs, both still right: only show styles you can reproduce on request, and note that the four style panels in `02` are a promise buyers will hold you to. And the live hero and kitchen shots show full AI-generated faces — the competitor grid shows real children holding real books. That's not a reason to pull them (a device-in-hands shot is the honest register for a digital product, and your no-real-children rule is correct), but it is a reason to make the *product* images (slots 2–8) dominate the gallery rather than the synthetic-lifestyle ones.

**Alt text** — set it on every image while you're in the editor (accessibility + Google Images indexing; Etsy exposes the field per photo). Suggested strings:

- Hero: `Parent and child reading a personalized illustrated storybook together on a tablet`
- 02: `Four children in four different custom illustration styles for a personalized children's book`
- 03: `Parent's questionnaire answer next to the custom illustrated child character it produced`
- 04: `Picture books a family loves next to the custom art style built from them`
- 05: `Three preview revision rounds of a personalized storybook illustration, sketch to final`
- 08: `Style previews in 24 hours, finished digital storybook in 3 to 4 days, no shipping`
- 07: `Little Fables storybook icon saved to a tablet home screen like an app`
- 09: `Child and grandparent reading the quiet night mode of a personalized storybook in a dark bedroom`
- 07B: `Personalized digital children's book open on a phone on a kitchen counter`
- 10C: `Grandparent handing a printed Little Fables gift certificate to a parent`

### 2. Fill both video slots (updated 2026-08-07: the listing editor now offers two)

The current video is a single spread slowly fading in — atmosphere, no mechanics. Every top competitor's video *demonstrates*. With two slots, split the two jobs and retire the fade:

**Slot A — the demo (plays first).** Mechanics for the skeptic. Etsy videos play muted, so it must work silent and captioned. `walkthrough-video.md` already prescribes the Etsy cut — beats 3 + 4 + 6 (intake → assembly → reading), reframed square from the Remotion source. If the slot still caps at 15s, compress to:

- **0–2.5s** — intake question on screen, a name being typed: *"What should we know about Mara?"*
- **2.5–6s** — three style previews fan out; one gets picked (tap).
- **6–9.5s** — the reader: cover with the child's name → page turn.
- **9.5–12s** — night mode flip: same book, dark, text-only. Caption: *"and a quieter one for bedtime."*
- **12–15s** — end card: *Previews in 24h · Book in 3–4 days · No shipping, ever* + tree mark + `littlefables.app` / Etsy lockup.

Caption every beat (muted playback). This one asset does the work of four photos in search results, where the video autoplays on hover/scroll. (If the second slot raised the length cap — the upload dialog will say — use the 30s beats-3+4+6 cut the walkthrough doc already specifies instead of compressing.)

**Slot B — the human moment (already built, zero production).** `assets/listing/lifestyle/grandmother-and-grandson.mp4` — 10s, 720p, grandmother and grandson over a real reader spread (*Mikey the Moto*), her hand following the words, the boy turning to smile at her. It's the register no competitor's flip-through video has, it targets the grandparent buyer directly, and its one flaw (generated audio that doesn't match) is erased by Etsy muting all listing video. Optional: one closing caption frame — *"Twenty quiet minutes."* — since in the carousel it won't have the walkthrough's surrounding type beats to anchor it. Later upgrade for this slot: the 4-second "child shows the adult" Flow clip (`flow-video-prompt.md`) padded with an end card, once generated.

Order them demo first, grandma second — mechanics earn the click, warmth closes it.

### 3. Turn on the intro sale — a naked $69 is the worst possible number in that grid

Every tile in the top row of both search grids today shows a strikethrough: 15%, 25%, 40%, 50%, 68% off. Against that wall, $69 with no anchor, no reviews, and no badges reads as "most expensive, least proven." `add-ons.md` already made this call — run **$69 list with an Etsy Sale to $59**, publicly tied to an end condition ("first 25 books" or "through September 30") stated in the description, so it reads as an intentional launch price rather than desperation, and so ending it later is a sale ending rather than a price increase. This also keeps faith with the GTM rule: no discount-for-reviews mechanics, just a bounded intro price.

(If you'd rather follow `gtm-decision.md`'s $49 launch ladder instead, run $69 struck to $49 — but the $59 recommendation in `add-ons.md` is the newer decision and the economics at $59 still clear organic-only. Either way: **struck-through, bounded, stated.**)

### 4. Spend the 42 unused title characters

Live title (98/140): `Personalized Children's Storybook, Written & Narrated About Your Child, Custom Story Gift for Kids`

The first 40 characters are right. What's missing is **format** ("digital" — 2026 Etsy search maps queries to expected format, and buyers actively filter physical vs digital in this category) and **audience/age**. Two options, both verified ≤140:

- **A (124):** `Personalized Childrens Book, Custom Story About Your Child, Illustrated & Narrated Digital Storybook, Gift for Kids Ages 3-9`
- **C (126):** `Personalized Childrens Book, Your Child as Main Character, Custom Illustrated & Narrated Digital Storybook, Kids Gift Ages 3-9`

Rationale: "Personalized Childrens Book" (no apostrophe-s clutter) matches the head query as typed; "Digital Storybook" claims the format honestly — it filters out hardcover-intent clicks *before* they click, which protects conversion rate, which is the ranking input that actually matters. C keeps "main character," your sharpest differentiator, in the title itself. Recommendation: **C**, A/B the spec's alternates after 30 days as planned.

### 5. Rebuild the 13 tags as semantic variants (stop duplicating the title)

Etsy's current guidance and every 2026 SEO source agree: tags should widen the net with variants, not repeat title words. The live tag set (per the setup log, entered verbatim from spec) spends ~5 slots re-saying "personalized/custom kids book," which the title already covers. Replacement set, all ≤20 chars (verified):

```
book about my child · custom name book · kids book with name · story about my kid ·
narrated storybook · bedtime story book · digital kids book · gift for grandkids ·
new sibling gift · birthday gift kids · christmas gift kids · homeschool gift ·
custom story gift
```

December swap stays as specced: `birthday gift kids` + `new sibling gift` → `last minute gift` + `stocking stuffer`.

### 6. Three surgical description edits

1. **First line is 161 chars — the snippet clips at 160**, cutting exactly the payoff. Drop ", and": *"…illustrated in a style you choose, narrated with care. No shipping, ever — delivered in 3–4 days."* → 157 chars, ends cleanly inside the snippet. (This was flagged in the setup log; the 161 variant is what's live.)
2. **Add a Length line to AT A GLANCE.** The video says "twenty pages," the listing says length is matched to age — both can't be true, and a concrete count is exactly what a made-to-order buyer scans for before risking $69 on a zero-review shop. Decide the truth (e.g. `Length · 12–20 pages, set by age`) and state it.
3. **Fix the Christmas dates before traffic arrives** (GTM decision #6 — currently live copy is the old promise). A 3–4 day build means a Dec 22 standard order misses Christmas. Change to: **standard through Dec 19 · Dec 20–22 rush only, with a stated completion date** — and rewrite the "reading this on December 21, you're still fine" line to "…grab a rush slot and you're still fine." Selling honesty in December is cheaper than refunding heartbreak on the 26th.

### 7. Fill the two empty post-purchase text fields (they're blank right now)

Seen empty in Shop Manager → Info & Appearance today. These are free trust surface and, for a digital listing, the **Digital Items message is the only automatic post-purchase touchpoint** — the moment the welcome letter was designed for. Paste-ready:

**Message to Buyers for Digital Items:**
> Thank you — your storybook is officially in motion. Within a few hours you'll get an Etsy Message from us with your personal questionnaire link (takes about 5 minutes). Style previews of your child as the main character land within 24 hours after that, and your finished book arrives 3–4 days after you approve. Questions any time — it's Manav answering.

**Message to Buyers (all orders):**
> Thank you for trusting us with your kid's story. Watch your Etsy Messages — your personal questionnaire link arrives within a few hours, and previews within 24 hours of your answers.

### 8. Add the free dedication line as personalization field 4 or 5

Live fields today: name (required), deadline (optional), gift (optional) — good and low-friction. Add the free dedication field from `add-ons.md` (costs five minutes per book, reads as generosity, produces the review): label `Dedication line (optional)`, instruction ≤120 chars:
> Optional dedication for page one — e.g. "For Ellie, love Grandpa Ray, Christmas 2026." We'll letter it into the book.

And mention it in AT A GLANCE: `Dedication · Free — add yours at checkout`.

---

## Priority 1 — next two weeks

### 9. Stop being a one-listing shop

This is the biggest structural gap and nobody's copy fixes it. FlipWoo — also new in 2026, also digital, 1 sale — runs 7 listings. MagicPictureStory runs 73. Each listing is a separate lottery ticket in search (its own primary keyword, its own thumbnail test) and a shop with one item looks like a stall, not a store. Variations are confirmed unavailable on digital listings, so per `add-ons.md` these are **separate listings**:

- **Rush — 72h start to finish, $25** ("3 rush slots a week" cap stated). Also the honest answer for Dec 20–22.
- **Printable PDF add-on, $12** — answers "I can't hold it," and its attach rate is your hardcover-question evidence.
- **2–3 occasion angles of the same base product** — same book, different lead photo + title cluster: *Grandparent gift* (lead with `10C`/gift-certificate flow, title leads "Personalized Book from Grandma & Grandpa…"), *New sibling book*, *Birthday book*. Books-are-files makes these cheap; each occasion owns different queries year-round.
- **Deluxe bundle $109** after the first ten orders, per the build order.

Then add one **price-card image** ("Add-ons: Rush $25 · Printable PDF $12 · Dedication free") to the base listing gallery so buyers know the menu exists, and put the one-line PDF upsell in every preview-approval message — the warm window where attach actually converts.

### 10. Shop-level fixes

- **Banner still carries the retired tagline** ("Stories as unique as your little one") baked into the image, while the shop tagline field now reads "Make your kid the main character of their stories." Regenerate the banner with the current line — first formatting inconsistency a skeptical zero-review buyer can catch. Consider the recommended `Your kid, in their own storybook.` for both.
- **About / featured photos** — the About story is excellent and person-shaped; give it the process images built for it: `featured-01-character-sheet.png`, `featured-02-rough-to-final.png`, `featured-03-coloring-page.png`. Try the full 1:56 walkthrough as the About video; if Etsy caps it, use the reader-demo cut.
- **Shop-policies FAQ** (currently absent): three entries — *Is anything shipped?* / *How does my child read it?* / *What if I don't like it?* — each answered in two sentences from the listing FAQ.
- **Cancellation toggle** (still unset): accept cancellations. It's the only shop-level control that touches the refund promise, and "full refund, no questions" with cancellations *off* reads contradictory. Revisit only if abused.
- **Verify Offsite Ads opt-out** happened (GTM decision #4 — one minute in Settings → Offsite Ads).
- **Etsy Plus is running** ($10/mo, seen in Shop Manager). Use it or lose it: it includes monthly listing credits and a $5 Etsy Ads credit — but the GTM gate (no paid spend until attended time < 1.5h) still applies; banked credits don't force spending. If none of the perks get used by October, downgrade.
- **Check Etsy Search Visibility weekly** (Shop Manager → Etsy search visibility) once the title/tag changes land — it shows which queries the listing enters and where it loses the click.

### 11. Zero-review compensators (while the flywheel spins up)

Until ~10 reviews exist, the listing itself has to answer "can I trust a stranger with $69?" The levers, most already in hand: make the **preview-approve-then-build mechanic visually unmissable** (photo 05 + slot 5 placement — "you approve before we build" is the functional substitute for social proof); keep the **maker visible** (About story + process photos + "it's Manav answering" in the digital-items message); **answer messages in hours** (response time is a Star Seller metric and buyers pre-test it); let the **bounded intro sale** signal launch-not-desperation; and put the **littlefables.app + etsy.com/shop/LittleFablesStories lockup** on the gift certificate and video end card so a suspicious recipient can verify you're real. The first five orders per GTM: warm buyers, no incentives, one honest review ask at delivery — and be conspicuously generous with post-delivery corrections, which are nearly free in your pipeline and are what produce the review text.

---

## Verify-in-editor list (couldn't be confirmed read-only today)

1. **Live tags** — setup log says all 13 entered verbatim; confirm before swapping to the new set.
2. **Alt text** — likely unset on all three live photos.
3. **Offsite Ads opt-out** — GTM said "today," no record it happened.
4. **Cancellation toggle** — recorded as unset in the setup log.
5. **Order-completion mechanics** — `intake-flow.md` says `LF-welcome-letter.pdf` is attached to the listing. Make sure the *finished book PDF* (link + instructions) is attached to each order within 7 days as the completing artifact, per GTM decision #3 — the welcome letter alone opening the review window / marking delivery is the case-risk scenario.
6. **Processing-time display** — digital listings show no processing time; confirm the buy box's delivery expectations read correctly to a stranger (the description carries the whole two-stage timeline).

## Watch-outs (don't do)

- Don't put add-on charges into personalization fields (can't charge; case risk — `add-ons.md`).
- Don't run countdown-timer sale theater like MagicPictureStory's "ends in 2:04" — off-brand and Etsy recycles it into wallpaper; the bounded intro price does the same work honestly.
- Don't chase the physical-book thumbnail look. The grid is wall-to-wall hardcover mockups; a warm real-device scene plus a four-faces range grid is *differentiated* in that wall, and "digital is the feature" is the positioning.
- Don't add a hardcover SKU to fix the price gap (`add-ons.md` already ruled it: different company, contradicts "no shipping, ever").

## Suggested sequence

| When | Do |
|---|---|
| Today | Photos 2–10 + alt text · sale on at $59 w/ stated end · title C · new tags · first-line trim · digital-items message · dedication field |
| This week | 15s demo video · Christmas dates fix · page-count line · cancellation toggle · Offsite Ads check |
| Next 2 wks | Rush listing · PDF listing · price-card image · banner regen · About featured photos + video · policies FAQ |
| Sept | 2–3 occasion listings · A/B thumbnail (hero vs range grid) · first title-alternate test |
| Nov 1 | Seasonal swaps: `10B` into slot 10 · December tags · rush pricing decision ($25 flat vs +$22 spec — reconcile in `positioning.md`) |

---

## Sources

Platform behavior: [Marmalead — How Etsy's Algorithm Works in 2026](https://blog.marmalead.com/etsy-algorithm-2026/) · [Insight Agent — Etsy Search Algorithm Updates 2026](https://www.insightagent.app/guides/etsy-search-algorithm-updates-2026) · [Growing Your Craft — Etsy SEO Guide 2026](https://www.growingyourcraft.com/blog/etsy-search-seo-ranking-getting-found) · [Voolist — Etsy SEO 2026](https://www.voolist.com/blog/etsy-seo-guide)

Competitors (inspected 2026-08-07): [MagicPictureStory astronaut listing](https://www.etsy.com/listing/1802182278/) · [RNBishere flagship](https://www.etsy.com/listing/4345844559/fully-personalized-kids-story-book) · [FlipWoo shop](https://www.etsy.com/shop/FlipWoo) · live search grids for `personalized childrens book` and `personalized story book digital download`.

Internal: `docs/commerce/` — positioning, etsy-listing, etsy-setup-log, gtm-decision, add-ons, photo-shot-list, listing-image-prompts, shop-bio-copy, intake-flow, market-research. Note: Ahrefs keyword volumes were unavailable (plan limit), so keyword choices lean on Etsy-native signals — competitor title language, buyer filter chips ("Exclude digital downloads", PDF/Hardcover/Video), and the category grid itself.
