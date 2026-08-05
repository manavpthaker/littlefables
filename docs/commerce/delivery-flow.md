# Delivery & Gift Flow — revised

Supersedes steps 24, 27, and 28 in [`fulfillment-playbook.md`](fulfillment-playbook.md).
Written before the gift certificate is built, so none of this is rework.

## The problem this solves

For a normal order the magic link is the **fourth** touch — intake ack, previews,
approval, then delivery. The buyer has been talking to us for days and approved
artwork. No trust problem.

Gift orders break that. Grandma buys, does the intake, gets every email, approves the
previews, prints the certificate — then hands it to **the parents**, who have had zero
contact with us. Every trust-building touch accrued to the wrong person. The parent is
a cold recipient being asked to open an unfamiliar domain and put something on their
child's tablet. That's the exact segment `positioning.md` flags as tech-nervous.

Playbook step 28 currently sends the certificate with *the same magic URL* as the
buyer's. That also means no revocation — if the certificate is lost, photographed, or
posted (grandparents post everything), the token is the book, permanently.

## Three arrival states

| URL | Who | What they see |
|---|---|---|
| `littlefables.app` — no token | Anyone. Pinterest, a typo, a curious parent | **Landing page.** Marketing. Never a book. |
| `/read/<slug>` — valid token, has context | The buyer | **The book, immediately.** No interstitial, no install prompt. They've been waiting days for this. |
| `/gift/<code>` — valid gift code, no context | The recipient parent | **One orientation screen, then the book.** See below. |

The third one is the whole reason gift orders need their own route.

## Slug shape

Current: `app/f/[token]/route.ts` → `littlefables.app/f/9Kx2mQ`

An opaque string after a single letter reads like a tracking link. Proposed:

```
littlefables.app/read/maya-and-the-lost-mitten-7fkq2m
```

- **`read`** instead of `f` — a word, not a variable. On-brand, and it says what the
  page is for.
- **Story title slug**, not the child's name alone. Warmer, reads like a book rather
  than an account — and it survives the second-book offer. One child gets multiple
  books; `/maya/` collides on book two, `/maya-and-the-lost-mitten/` doesn't.
- **Short token appended**, still non-guessable. Readability doesn't buy security.

Two segments (`/read/<slug>/<token>`) works equally well — the point is that the
majority of the URL is words.

**Privacy note:** story titles will usually contain the child's first name, so the URL
carries a first name either way. That's acceptable — it's a first name, not an
identifier — but it means the link is not safe to post publicly, which is a second
reason gift recipients should get their own code rather than a copy of the buyer's.

## Show first, install after

The install prompt moves to **after the last page**, framed as convenience rather
than setup:

> *You can save this to the home screen so it opens like a book on the shelf —
> one tap, no app store.*

Then the platform steps.

Three implementation notes:

- Fire it **once**, on the final page, dismissible. Not a modal on arrival.
- Suppress it when already installed — check `display-mode: standalone`.
- The parent may be reading aloud at bedtime with a kid on their lap. Nothing should
  interrupt mid-story.

This also removes the worst version of the current flow: an install prompt from an
unfamiliar domain *before* anything has been shown to justify it.

## Gift redemption

Issue the recipient a **separate code**, not the buyer's magic URL.

1. Certificate carries `/gift/<code>` plus a QR of the same.
2. Parent opens it and gets one screen before the book:
   - Whose book it is — the child's name and the cover art
   - Who it's from — *"A gift from Grandma"*, using the name the buyer gave at intake
   - One line on what it is
   - A single button: **Open the book**
3. That button redeems the code and provisions the recipient's own device token,
   landing them on `/read/<slug>` from then on.

What this buys, beyond trust:

- **Revocation.** A lost or photographed certificate can be reissued. Today it can't.
- **A delivery signal.** We can tell the buyer their gift was opened — which is the
  single most reassuring email a grandparent can get on December 26.
- **Separation.** The buyer's link and the recipient's link have independent lifetimes.

## What goes on the certificate

The paper has to answer *"is this real?"* on its own, because the parent has no other
context.

- The shop name, spelled out — Little Fables
- One line of what it is
- The child's name
- Who it's from
- The gift URL **and** the QR
- **The Etsy shop URL** — `etsy.com/shop/LittleFablesStories`

That last one is free and it's the strongest anti-phishing artifact in the flow: a
suspicious parent can go find a real shop with real reviews in ten seconds.

## Changes to make

| Where | Change |
|---|---|
| `app/f/[token]/route.ts` | Becomes `/read/<slug>-<token>`. Route handler → page. |
| `scripts/new-household.ts` | Emit a story-title slug; print the readable URL |
| Reader | Move install prompt to last page; suppress when standalone |
| New | `/gift/<code>` route + redemption screen |
| New | Bare-domain landing page (currently nothing lives there) |
| Playbook step 24 | Record slug alongside token in `orders.csv` |
| Playbook step 27 | Delivery email carries the readable URL |
| Playbook step 28 | **Rewrite** — gift certificate carries `/gift/<code>`, never the buyer's URL |
| `email-templates.md` #3 | Install steps move out of the email and into the reader |
| All hosts | `littlefables.ai` → `littlefables.app` everywhere buyer-facing |

## Open question

Email 3 currently carries the full install instructions. If the reader handles the
prompt after the last page, the email gets shorter and better — it becomes *"here's
the book"* and nothing else. Worth deciding whether the email keeps a fallback copy of
the steps for people who never reach the last page.
