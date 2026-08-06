# Email Templates

Six canned messages covering the order lifecycle. Save as Gmail templates
(Settings → Advanced → Templates). Variables in `{braces}`.

Voice: warm, second person, present tense. No exclamation marks in body copy. No
emoji. Never corporate.

---

## 1 · Intake acknowledgment

Sent within 2 hours of the Typeform landing. Confirms receipt, restates the promise.

**Subject:** `We've got {kid}'s story — previews coming within 24 hours`

```
Hi {buyer_first_name},

Thanks for telling us about {kid}. We read every word of these — the two words you
picked, the art you named, all of it.

Here's what happens next:

Within 24 hours we'll send you two to four style previews — {kid} as the main
character, each in a different art style built from the books you mentioned. You pick
the one you love.

If none of them land, tell us and we'll try again. As many times as it takes. And if
we still can't get there, you get a full refund.

Once you approve a style, the finished book arrives 3–4 days later.

Talk soon,
Little Fables
```

---

## 2 · Preview delivery

The critical email. Attach 2–4 preview images labeled Style A / B / C / D.

**Subject:** `{kid}'s style previews are ready`

```
Hi {buyer_first_name},

Here's {kid} — three ways.

Style A · {short description, e.g. "loose watercolor, soft and warm"}
Style B · {short description}
Style C · {short description}

Just reply with the letter you like best and we'll build the whole book in that style.

If none of these are right, tell us what's off — too soft, too bold, hair not quite
there, whatever it is. We'll send another round. There's no limit and no charge.

Once you pick, the finished book lands in 3–4 days.

Little Fables
```

---

## 3 · Delivery

The magic URL plus install instructions. Screenshots blocked on Heritage DS.

**Subject:** `{kid}'s book is ready`

```
Hi {buyer_first_name},

{kid}'s storybook is finished. Here it is:

{magic_url}

To put it on their tablet so it opens like an app:

On an iPad or iPhone
  1. Open the link above in Safari
  2. Tap the share button (the square with the arrow)
  3. Tap "Add to Home Screen"
  4. Tap "Add"

On an Android tablet or phone
  1. Open the link above in Chrome
  2. Tap the three dots in the top right
  3. Tap "Add to Home screen"
  4. Tap "Add"

An icon appears on their home screen. Tap it and the book opens — no app store, no
password, no account. It works offline once it's loaded.

Two things worth knowing:

Day mode has the illustrations. Night mode is text only with a sleepier narrator
voice — it switches automatically in the evening, and there's a small control in the
top right to flip it manually.

Tapping any word plays it aloud. That's it for features. We kept it quiet on purpose.

Hope {kid} loves it.

Little Fables
```

---

## 4 · Day +3 check-in

Soft, no ask. Builds the relationship that makes the day-7 review request land.

**Subject:** `How's {kid} liking the book?`

```
Hi {buyer_first_name},

Just checking in — did {kid} get a chance to read it?

No agenda here. We're a small operation and we genuinely like hearing how these land.
If something's not working, tell us and we'll fix it.

Little Fables
```

---

## 5 · Day +7 review request

Pair with the printable coloring page (line-art version of their book's cover).
Also click Etsy's built-in "request a review" button the same day.

**Subject:** `A coloring page for {kid} — and a small ask`

```
Hi {buyer_first_name},

We made {kid} a coloring page from their book cover. It's attached — print it on
regular paper and hand it over.

And the small ask: if the book landed well, would you leave a review on Etsy? We're a
new shop, and reviews are genuinely the whole thing for us. It takes about a minute.

{etsy_review_link}

If it didn't land well, reply here instead and tell us what happened. We'd rather fix
it than have you write a polite review you don't mean.

Little Fables
```

---

## 6 · Day +30 second-book offer

Only send to buyers who opted into saving their profile.

**Subject:** `{kid}'s next book — half price, one click`

```
Hi {buyer_first_name},

We still have {kid}'s profile saved — their character, the art style you picked, all
of it. That means the next book skips the preview stage entirely.

All we need is what it's for. A birthday. Starting school. A new sibling. Losing a
tooth. Missing someone. Or nothing at all — sometimes the best ones are just a
Tuesday.

Reply with the occasion and we'll take it from there.

{second_book_link}

If you'd rather we delete {kid}'s profile, just say so and it's gone within the day.

Little Fables
```

---

## Sending schedule

| When | Email | Trigger |
|---|---|---|
| Order + 0–2h | 1 · Intake ack | Typeform webhook lands |
| Order + 24h | 2 · Preview delivery | Previews generated |
| Approval + 3–4d | 3 · Delivery | Book imported and smoke-tested |
| Delivery + 3d | 4 · Check-in | Manual |
| Delivery + 7d | 5 · Review request | Manual + Etsy review button |
| Delivery + 30d | 6 · Second book | Manual, opted-in buyers only |

## Notes

- Emails 1–3 are transactional and go to everyone
- Emails 4–6 are relationship-building; skip 6 for buyers who declined profile save
- Never send more than one email in a 48-hour window
- If a buyer goes quiet for 5 days at the preview stage, send one gentle nudge, then
  refund and close the order
- Attach the coloring page to email 5, not a link — attachments feel more like a gift
