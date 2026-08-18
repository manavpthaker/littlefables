# Instagram — Launch Kit

Account: [@littlefables_stories](https://www.instagram.com/littlefables_stories/)
Written 2026-08-14. Voice rules from `positioning.md` — that file wins on any conflict.

## What Instagram is for (and isn't)

**Not a content channel.** Organic IG needs months of near-daily posting before it
compounds, which is the same lag as Pinterest at several times the effort. Nothing
started in August contributes to Christmas 2026.

**It's a tool, three jobs:**

1. **Creator outreach.** The micro-creator seeding play runs in IG DMs. Creators
   check whether the person messaging them is real before replying.
2. **Credibility surface.** Cold buyers glance at social before a $49 purchase from
   an unknown shop. An empty profile costs a little conversion; nine posts fixes it
   permanently.
3. **Optionality.** A Business profile keeps Meta ads available if Etsy Ads prove
   the listing converts.

Build it, then leave it alone. Revisit in January — if creator seeding produces a
stream of UGC worth reposting, an IG that mostly reposts real customers is a
genuinely low-effort channel. That's a 2027 decision made on evidence we don't have.

---

## Profile state

| Field | Value | Status |
|---|---|---|
| Handle | `littlefables_stories` | done |
| Name | `Personalized Children's Books` | done — search matches name *and* handle, and the handle already carries the brand, so the name field is spent on the search term. IG allows 2 name changes per 14 days. |
| Bio | see below | done (141/150) |
| Website | `https://littlefables.app` | **still to do — mobile app only.** IG won't let you edit profile links from web. |
| Profile photo | `assets/listing/branding/etsy-profile-photo-400.png` (tree mark) | done |
| AI creator toggle | **off** | done — see the warning below |
| Account type | Business · category Baby goods/kids goods (hidden) · contact `brownmanbeard@gmail.com` | done |

**Bio (live):**

```
Your kid, in their own storybook.
Written about your child, illustrated in a style you choose, narrated. Ready in days — opens on any tablet.
```

### The AI creator toggle — check it after any settings change

**It switched itself on during the business-account conversion.** For a while the
profile publicly read `AI creator` under the name, on a brand whose second
differentiator is "curated, not AI slop." Turned back off 2026-08-14.

The distinction that matters: per-image AI labels are unavoidable and fine — the
Pinterest playbook already says don't fight them. A *profile-level* badge is a
different claim. It's a self-applied identity marker sitting above the work, and it
hands the AI-backlash objection to a buyer before they've seen a single page.

Re-check this toggle after any Instagram settings change.

### Business profile setup — as configured

- **Type:** Business, not Creator. Creator is for individuals; Business gives the
  contact button, category, and full ads access.
- **Category:** **Baby goods/kids goods.** Not Product/service, which was the first
  pick and was wrong — it's accurate but tells Meta nothing. The category feeds Meta's
  business classification, so the useful question isn't "what is this product" but
  "what should Meta infer about the audience." Kids goods says *parents of young
  children*, which is the targeting signal that matters if Meta ads ever run. The
  "goods implies physical" objection doesn't hold; category is coarse classification,
  not a product description, and it's hidden anyway.

  Considered and rejected: *Bookstore* (implies reselling other people's books),
  *Book* / *Book Series* (implies the account is about one title), *Gift Shop* (right
  intent, but a much broader audience than the primary segment).

  **Left hidden on the profile** — the Name field already reads "Personalized
  Children's Books" and a second line would be redundant.

  Note: the category search on IG web is slow enough to look broken. Typing "kid"
  returns nothing for ~10 seconds, then populates. Wait before concluding a category
  doesn't exist.
- **Contact:** email only, shown on profile. Phone and street address deliberately
  blank — a public address on a children's brand is a bad trade.
- **Insights** unlock immediately and are the only reason the switch matters
  short-term. Full insights and promotions live in the mobile app.

---

## Where the assets actually live

**`public/landing/` is the good bench. `assets/listing/etsy-photos/` mostly is not.**

The landing folder has correctly-rendered reader captures (day *and* night), real
photographs of a child holding the actual product, printed-spread samples in six art
styles, and — most valuable — **five videos** under `public/landing/motion/`: four 8s
process loops and a 134s walkthrough, all 1280×720.

The walkthrough is the single richest source in the repo. Its frames are already
captioned with positioning lines ("No two look alike," "No ads. No algorithm. No
autoplay," "Tap any word to hear it"), so they're finished posts, not raw material.

Everything below was built from those two folders. Nothing needed designing.

## The grid — 21 posts + 3 Reels

**Built and ready in `assets/social/instagram/`, statics 1080×1350, Reels 1080×1920.**

Three fitting methods, chosen per source — this matters, and getting it wrong is
visible:

- **Mount on cream (#EDE3CE)** — for 4:3 art and printed spreads. Cropping landscape
  to 4:5 would cut ~44% of the width and destroy layouts like the four-styles grid.
  Reads as a plate in a book, which suits the product.
- **Edge-extend** — for the reader captures, which carry their own tan gradient. A
  cream mount left a visible seam; stretching the source's own edge rows continues the
  gradient seamlessly. Do **not** use this on anything whose top row crosses artwork —
  it smears into vertical bands.
- **Centre-crop** — for photographs, where the subject is centred and losing width is
  fine.

| # | File | Job |
|---|---|---|
| 1 | `01-four-styles.jpg` | your taste, not our dropdown |
| 2 | `02-real-kid.jpg` | **real child, real device** — the proof a cold account needs |
| 3 | `03-reader-day.jpg` | the product, day mode |
| 4 | `04-reader-night.jpg` | the product, night mode |
| 5 | `05-hero-cover.jpg` | craft — full bleed, the scroll-stopper |
| 6 | `06-spread-painted.jpg` | a finished spread |
| 7 | `07-intake.jpg` | the six questions the whole book comes from |
| 8 | `08-sketch.jpg` | where a page starts |
| 9 | `09-rendered.jpg` | where it ends — pair with 8 |
| 10 | `10-no-two-alike.jpg` | six styles, one grid *(caption in image)* |
| 11 | `11-tap-any-word.jpg` | the word-tap feature *(caption in image)* |
| 12 | `12-no-ads.jpg` | screen-time defuser *(caption in image)* |
| 13 | `13-saved-to-ipad.jpg` | lives on the home screen *(caption in image)* |
| 14 | `14-spread-woodcut.jpg` | range — the striking one |
| 15 | `15-spread-crayon.jpg` | range — the playful one |
| 16 | `16-spread-manga.jpg` | range — the one that surprises people |
| 17 | `17-book-ready.jpg` | delivery — "Rosa's book is ready" |
| 18 | `18-shelf.jpg` | their own library |
| 19 | `19-coloring-page.jpg` | real hands, crayons — the extra |
| 20 | `20-real-kid-parent.jpg` | reading together, over the shoulder |
| 21 | `21-home-screen-steps.jpg` | three taps, with headline |

**Reels** — video out-reaches statics on a cold account by a wide margin:

| File | Length | Source |
|---|---|---|
| `reel-01-walkthrough.mp4` | 90s | the landing walkthrough, first 90s |
| `reel-02-how-its-made.mp4` | 32s | the four process loops stitched — intake → sketch → render → delivery |
| `reel-03-grandmother.mp4` | 10s | the lifestyle clip, grandparent angle |

All three are 9:16 cream-padded with a hook line above and the mark below. A 16:9
source in a 9:16 frame only fills a third of the screen, so the bands are doing work
rather than sitting empty.

### Posting queue — as of 2026-08-15

**Live (10):** the three Reels · `01-four-styles` · plus five from an earlier batch —
the bed/tablet photo, the intake-to-character pair, rough-to-final, the turnaround
card, the dark bedtime shot, and preview-revisions.

**Two of the live posts need attention:**

| Post | Issue | Do |
|---|---|---|
| Mother + child in bed with tablet | **The reader text is clipped mid-sentence** by the child's hand — "and she k…", "was som…". This is the broken composite. | Delete and replace with `20-real-kid-parent` |
| Dark bedtime photo | Not broken, but the tablet is illegible, so the product never shows | Leave it, or swap for `12-no-ads`, which makes the same point readably |

**Remaining queue, in order.** Sequenced by what the grid is currently missing rather
than by file number — right now there is no real child, no reader, and only one art
style visible.

| | File | Why here |
|---|---|---|
| 1 | `02-real-kid` | Nothing on the grid shows a real child with the product. Highest-value gap. |
| 2 | `04-reader-night` | A named differentiator, completely absent |
| 3 | `14-spread-woodcut` | Breaks the "it all looks the same" read, hard |
| 4 | `03-reader-day` | The product itself |
| 5 | `10-no-two-alike` | The range argument in one image *(use the corrected caption)* |
| 6 | `20-real-kid-parent` | Second real-human proof |
| 7 | `15-spread-crayon` | Range — the playful end |
| 8 | `11-tap-any-word` | The feature people ask about |
| 9 | `05-hero-cover` | Craft, full bleed |
| 10 | `16-spread-manga` | Range — the one that surprises people |
| 11 | `13-saved-to-ipad` | Home screen |
| 12 | `07-intake` | The actual form *(read the warning on that caption first)* |
| 13 | `06-spread-painted` | A finished spread |
| 14 | `17-book-ready` | Delivery |
| 15 | `12-no-ads` | Screen-time defuser |
| 16 | `18-shelf` | Their own library |
| 17 | `19-coloring-page` | The extra |
| 18 | `21-home-screen-steps` | Three taps |

`08-sketch` and `09-rendered` are **redundant** with the rough-to-final post already
live — skip them unless you want the craft story told slowly as a pair.

Roughly one a day, mixing categories rather than posting three spreads in a row.
Eighteen posts is about three weeks.

Note Instagram shows newest first, so the grid fills bottom-right to top-left.

> **Stale files.** Earlier passes left `02-hero-cover`, `02-the-reader`,
> `03-character-sheet`, `03-intake-to-character`, `03-reader-spread`,
> `04-rough-to-final`, `05-night-mode`, `05-spread-painted`, `06-home-screen-steps`,
> `06-spread-painted`, `06-spread-woodcut`, `06-turnaround`, `07-claim-your-kid`,
> `07-home-screen-steps`, `07-quiet-minutes`, `07-spread-crayon`, `08-claim-your-kid`,
> `08-intake`, `08-revisions`, `08-rough-to-final`, `09-coloring-page`,
> `09-home-screen`, `_sample-01` in that folder. Delete them — the 21 numbered above
> plus the three reels are canonical.

### Broken source assets — do not use until fixed

The composited device photos in `assets/listing/etsy-photos/` have bad screen
composites and were cut from the grid because of it:

| Asset | Problem |
|---|---|
| `06-reader-day-mode-device` | The reader UI is **clipped mid-sentence** by the child's hand — "and she k…", "was som…", "had plas…". The composite extends past the device and gets occluded. |
| `09-night-mode` | The night-mode screen is pasted **flat, ignoring the tablet's perspective**. A lit sliver of the real screen shows beside it. Obviously wrong at any size. |
| `07-home-screen-icon`, `07B-phone-on-counter` | Screens too small to read; the point doesn't land. |
| `11-twenty-quiet-minutes` | Too dark — the tablet is barely legible. |

**The rule that falls out of this: flat UI captures work, photo composites don't.**
Every asset where a screen was pasted into a photograph has a visible defect. Every
asset where the screen *is* the image is clean. `public/landing/` follows the second
approach throughout, which is why it's the better bench.

Also: `a2hs-steps` has a **typo baked into the source** — step 2 reads
`Add to Home Screen'.` with a stray closing apostrophe and no opening quote. It's in
both `assets/listing/custom-story-page/` and `public/landing/`, so it's live on the
site. Worth fixing at source.

---

## Captions

**→ Moved to [`instagram-copy.md`](instagram-copy.md)** — one block per image file, in
posting order, with hashtags. That's the sheet to keep open while posting. The
versions below are kept in sync but the copy sheet is canonical.

Voice: warm, second person, present tense. No exclamation marks, no emoji, no
"AI-powered."

Four of these (10–13) already carry their caption inside the image, so the written
caption goes lighter — don't repeat the line that's on screen.

> **Copy rule, learned the hard way.** Never write a caption that counts the styles.
> "Four styles," "six looks," "choose from" — all of it reads as a menu, which is the
> exact opposite of the claim. There is no menu. The style is built from the picture
> books *that family* named. The images show four or six examples of range; the words
> have to say where that range came from, every time.

**01 · Four styles**
```
There is no style menu.

You tell us which picture books you already love the look of, and the art gets built
from those. Four different families, four completely different books — not one of
them picked from a list.
```

**02 · Real kid**
```
This is what it looks like when it arrives.

Her name is in it. Her face is in it. The thing she has been working through this
year is what the whole story is about.
```

**03 · Reader, day**
```
Day mode.

Illustrated, and read aloud in a bright narrator voice. Tap any word and it says it
back — which is how a four-year-old ends up reading without noticing.
```

**04 · Reader, night**
```
Night mode. Same book.

The pictures go away, the palette warms, and the voice gets slower and quieter. It
switches itself at bedtime, or you flip it with one tap.

One of these two is built to end with a kid asleep.
```

**05 · Hero cover**
```
One kid, one book, made on purpose for them.

Not a name dropped into someone else's story.
```

**06 · A finished spread**
```
A page from a finished book.

Twenty of these, written about one specific child, in a style built from the picture
books their family already loves.
```

**07 · The intake**
```
About five minutes, and then it is our problem.

Their name and age, what they are into, two words you would use to describe them, one
thing that has been sticky for them lately, and any picture books you love the look
of.

That last one is where the art style comes from. The one before it is where the story
comes from — the book is built around the sticky thing, not around a list of
interests.
```
> ⚠︎ **Check before posting.** The landing walkthrough says "six questions," but the
> live form (`intake-flow.md`) asks for more than six — name, age, interests, traits,
> cast, sticky moment, hoped lesson, art inspirations, plus the gate questions. The
> `more` section is skippable, so a buyer *can* stop early, but "six questions" still
> undersells the ask. The caption above says "about five minutes," which matches the
> wording already used in the Etsy welcome message. Decide which number is true and
> make the site, the reel, and this caption agree.

**08 · Sketch**
```
Every page starts here.
```

**09 · Rendered**
```
And ends here.

Same character on every page — locked before a single page gets drawn, so she does
not quietly become a different child by the end of the book.
```

**10 · No two alike** *(caption in image)*
```
Six families, six answers to the same question — which picture books do you love the
look of?

Nobody chose from a list. The style gets built from whatever you already reach for at
bedtime, which is why none of these six look related.
```

**11 · Tap any word** *(caption in image)*
```
For the age where they are half reading and half remembering — and would rather not
admit which.
```

**12 · No ads** *(caption in image)*
```
Screen time that earns its place.

Twenty quiet minutes with your kid inside their own story, and then it is over.
Nothing is trying to get them to do anything next.
```

**13 · Saved to iPad** *(caption in image)*
```
No app store, no account, no password for a five-year-old to forget.
```

**14 · Woodcut spread**
```
Same service. Wildly different book.

This one came from a family who loved the old two-colour print look.
```

**15 · Crayon spread**
```
And this one came from a five-year-old who wanted it to look like she drew it
herself.
```

**16 · Manga spread**
```
The style is not a filter we apply. It is built from the books you already reach for.

Tell us you love Ghibli and this is the direction it goes.
```

**17 · Book ready**
```
The email that turns up three or four days after you order.

No shipping, no tracking number, nothing to arrive late.
```

**18 · The shelf**
```
Order a second book and it lands on the same shelf, with the same character.

The profile is saved, so the second one skips the preview stage entirely.
```

**19 · Coloring page**
```
Every book comes with a page they can colour in themselves.

Same character, same story, in line art — so it does not end when the last page
does.
```

**20 · Reading together**
```
The point was never the iPad.

It was twenty minutes where somebody sits down and reads to them about themselves.
```

**21 · Home screen steps**
```
Three taps and it is theirs.

It works offline once it is saved, which is the version of this that survives a
long car journey.
```

### Reels

**reel-01 · Walkthrough**
```
The whole thing, start to finish.

You answer six questions. We write the story, build the art style from the picture
books you love, narrate it, and send it three or four days later.

Your kid opens it on the iPad and finds themselves inside it.
```

**reel-02 · How it's made**
```
Intake, sketch, finished page, delivered.

The part that takes the longest is the writing, and that is the part that has to be
right — the story is built around one real thing your kid is working through.
```

**reel-03 · Grandmother**
```
The gift they open in December and are still reading in July.

A book about exactly who your grandchild is right now. Sent, not shipped — nothing
to arrive late.
```

---

## Hashtags

Instagram still uses hashtags for topic classification, unlike Pinterest where
they're ignored. Three to five per post, matched to the post. Never a wall of thirty.

- **Core** — `#personalizedbooks` `#childrensbooks` `#personalizedgifts` `#kidsbooks`
- **Bedtime / screen-time** — `#bedtimestories` `#gentleparenting` `#intentionalparenting`
- **Grandparent** — `#giftsforgrandkids` `#grandparentgifts`
- **Seasonal, from November** — `#christmasgiftsforkids` `#personalizedchristmasgift`

---

## Open items

- [x] Profile photo uploaded
- [x] Business profile conversion finished, contact email set
- [x] AI creator label off
- [x] Website link added
- [x] 21 statics + 3 Reels built in `assets/social/instagram/`
- [ ] Delete the stale files listed above
- [ ] Fix the `a2hs-steps` apostrophe at source (it is live on the site)
- [ ] Posts scheduled over ~three weeks
- [ ] Creator target list verified on-platform (see `creator-seeding.md`) — the DMs
      are the actual point, the account is just the thing they check first
