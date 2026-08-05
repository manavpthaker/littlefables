# Etsy Setup Log — 2026-08-04

Record of the actual Etsy shop + listing build against [`etsy-listing.md`](etsy-listing.md).
Written by Claude during the live setup session.

## Status

| | |
|---|---|
| **Shop** | `LittleFablesStories` — live, payments + billing + 2FA complete |
| **Listing** | Draft saved, **not published** — listing id `4549899204` |
| **Blocking publish** | 10 photos, `Little-Fables-Welcome.pdf` |

**Shop URL: https://www.etsy.com/shop/LittleFablesStories**

> Renamed from `LittleFablesBooks` after setup. Etsy shows **4 name changes left**; after
> that a rename needs Etsy approval. Anywhere the old handle is recorded — Pinterest bio,
> email templates, the welcome PDF when it's built — needs the new URL. Etsy does not
> redirect the old one.

Shop-level items done: announcement, tagline, logo, About page, owner bio, shop location
(New Jersey), sections `Custom Storybooks` + `Add-Ons`, listing filed under Custom
Storybooks, renewal automatic.

## What went in

| Field | Value | Note |
|---|---|---|
| Category | Children's Books | Etsy tags it "Physical or digital" |
| Item type | **Digital** | per spec |
| When made | Made To Order | |
| Title | Primary title, verbatim | **129**/140 chars |
| Description | Full spec text, verbatim | Markdown hard-wraps unwrapped to real paragraphs |
| Tags | All 13, verbatim | "All 13 used" |
| Price | $29.00 | Etsy shows **estimated earnings $25.79** — matches the spec's economics table to the cent |
| Quantity | 999 | Spec was silent. Digital + made-to-order; prevents sell-out. Lower it if capacity is the constraint. |
| Custom option 1 | Child's first name — text, **required** | |
| Custom option 2 | Child's age — dropdown, **required**, 3–4 / 5–6 / 7–8 / 9+ | |
| Custom option 3 | Deadline — text, **optional** | |
| Custom option 4 | Is this a gift? — dropdown, **optional** | |
| Who made it | I did | |
| What is it | A finished product | |
| Digital content created | **With an AI generator** | Manav's call — see note below |
| Shop section | Custom Storybooks | |
| Renewal | Automatic ($0.20/renewal) | Etsy default |
| Shop announcement | Spec text, verbatim | 128 chars |
| Shop sections | `Custom Storybooks`, `Add-Ons` | both created |
| Tagline | `Make your kid the main character of their stories.` | 50/**55** — limit verified live |
| About headline | `One kid, one book, made on purpose for them.` | 44/150 |
| About story | Parent-founder rewrite | 1,916/5,000 — replaced the pasted listing copy |

**On the AI disclosure.** Selected *With an AI generator*. The fulfillment stack uses the ChatGPT
`fable-art-custom` skill and the listing FAQ already says "we use modern tools to help illustrate,"
so *Created by me* ("designed and created entirely by me") would have been a misdeclaration — and a
new shop has no review history to absorb a policy violation. positioning.md's anti-slop case
(human QA pass, buyer approves before build, style built from the buyer's own references) is a
stronger differentiator stated openly than one that depends on the disclosure going unread.

## Where the spec hit Etsy's actual limits

Four places `etsy-listing.md` doesn't survive contact with the form. Worth correcting in the doc.

### 1. Shop name was taken

`LittleFables` is already registered. Used the spec's own fallback, `LittleFablesBooks`.
Etsy allows one rename later.

### 2. Personalization *instructions* cap at 120 chars, not 256

The spec's 256 is the buyer's **answer** limit — a separate field on the same modal.
The instruction text itself is capped at 120. Field 1's instruction was 200 chars and rejected.

Rewritten to 115:

```
Your child's first name, exactly as it should appear in the book. We'll email a short questionnaire after checkout.
```

Field 3's instruction (100 chars) fit as written.

### 3. Dropdown option labels cap at 20 chars

The spec's gift-field options are 31 and 26 chars — both rejected.

| Spec | Used |
|---|---|
| `Yes — send me a gift certificate` | `Yes, it's a gift` (16) |
| `No — it's for my own child` | `No, for my own kid` (18) |

Age options (`3–4`, `5–6`, `7–8`, `9+`) fit unchanged.

### 4. The description's first line overflows the search snippet

The spec says the first ~160 chars are written to work standalone as the Google/Etsy snippet.
The actual line is **166 chars**, so it truncates at `...delivered in 3–4` — losing the payoff word.

Entered verbatim as specced. Two ways to fix, both keep the meaning:

```
161 → Your kid, in their own storybook. Written for who they are, illustrated in a style you choose, and narrated with care. No shipping, ever — delivered in 3–4 days.
157 → Your kid, in their own storybook. Written for who they are, illustrated in a style you choose, narrated with care. No shipping, ever — delivered in 3–4 days.
```

The 157 version clears the cut cleanly including the period. Dropping "help" costs a little
of the "you're in control" beat — worth it to keep "3–4 days" in the snippet.

## Field limits worth recording (all verified live, not guessed)

| Field | Limit |
|---|---|
| Listing title | 140 |
| Shop name | 20 |
| Tagline | 55 |
| About headline | 150 |
| About story | 5,000 |
| Personalization field title | 45 |
| Personalization **instructions** | **120** — not 256; 256 is the buyer's *answer* limit |
| Dropdown option label | **20** |
| Shop section title | 24 |

## Three spec fields that have no home on a digital listing

- **Processing time (1–3 business days).** Etsy replaces the whole shipping/processing block on
  digital listings with: *"Buyers will download your uploaded files once you complete the order."*
  There is no processing-time field to set. The two-stage timeline only lives in the description
  (where it already is) and in shop policies. The spec's note about processing time suppressing
  impressions doesn't apply here — but neither does the search-filter benefit.
- **Materials.** Not offered on digital listings in the current editor. The spec's materials string
  (`digital download, custom illustration, ...`) has nowhere to go. Some of those terms are already
  covered by tags.
- **Return policy.** Etsy's Returns & exchanges page says outright it is *"for non-digital items."*
  Digital items are non-returnable by default and there is **no editable return-policy field** for
  them. Fixed policies are read-only and cover only shipping/customs. So the spec's return-policy
  wording lives only in the listing description — where the "What if I don't like it?" FAQ already
  carries it. Nothing was lost, but the spec's shop-settings table implies a field that doesn't exist.

## Open — one toggle, needs a decision

**Cancellation policy** (Settings → Policy settings → Cancellations) is the *only* shop-level
control that touches the refund promise on a digital listing. It is a single binary toggle —
"I don't accept order cancellations" — with no free-text field, so it can't express the nuance the
guarantee actually has ("cancel any time before we start work"). Currently unset.

Left it unpublished rather than committing the shop either way. Off (cancellations accepted) is
consistent with "full refund, no questions"; on is the safer operational stance for made-to-order
work that starts within hours. Five seconds either way once you've decided.

## A gap-filler worth knowing about

Settings → Info & Appearance has **"Message to Buyers for Digital Items"** — free text that Etsy
shows on the Downloads page for every digital order. That is the same moment the welcome PDF is
meant to own: immediately post-checkout, before any email arrives.

It won't replace the PDF, but it can carry the Typeform link and the 24-hour promise in plain text
the day the link exists — which means the listing could go live before the Heritage DS lands, with
the PDF added later. Left blank for now because there is no Typeform URL yet.

## Still to build

| Item | Blocked on |
|---|---|
| 10 listing photos | Heritage DS |
| `Little-Fables-Welcome.pdf` (the instant download) | Heritage DS **+ a Typeform URL + a contact email — neither exists anywhere in `docs/commerce` yet** |
| Cancellation toggle | A decision (above) |
| Shop logo / banner / tagline | Heritage DS |

The listing cannot publish without at least one photo and the digital file. Everything textual is done.

**The real critical path is the Typeform URL, not the design system.** Without it there is no intake,
so an order that arrives can't be fulfilled — and it also blocks the welcome PDF *and* the digital-items
message. The photos block publishing; the Typeform blocks the business working at all. Worth building
first even in a rough state.
