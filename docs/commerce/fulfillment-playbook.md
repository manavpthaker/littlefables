# Fulfillment Playbook

Per-order runbook, intake to delivery. Written for manual execution on orders 1–10.
Human-in-the-loop everywhere; automate later once the shape is proven.

**Target timeline:** previews within 24h · final book 3–4 days after approval.

> **Delivery & gift flow:** steps 24, 27, and 28 below are being superseded by
> [`delivery-flow.md`](delivery-flow.md) — readable `/read/<slug>-<token>` URLs,
> a separate `/gift/<code>` redemption route, and install prompt moved to the
> end of the book. Once the code changes land, this playbook will be edited to
> match; for now the spec is the source of truth for those three steps.

## At your desk

- Chrome: Gmail, Etsy Seller dashboard, ChatGPT (with `fable-art-custom` skill),
  image generation tab, Supabase console
- Terminal at `~/Documents/GitHub/little-fables`
- Editor
- Finder at `~/fables-orders/`

---

## A · Intake received (0–2h)

1. **Typeform webhook fires** — JSON lands in the fulfillment inbox.

2. **Copy the Etsy order number.** This is the slug root:
   `fables-<order_id>-<kidname>` → e.g. `fables-3421-zoe`

3. **Verify payment cleared** in the Etsy dashboard. If rush, flag it.

4. **Create the working folder:**
   ```bash
   mkdir -p ~/fables-orders/<slug>/{intake,previews,final}
   ```
   Drop the raw Typeform JSON into `intake/typeform.json`.

5. **Add a row to `orders.csv`** with stage `INTAKE`.

6. **Send email 1** (intake acknowledgment) from
   [`email-templates.md`](email-templates.md).

---

## B · Story spine (2–6h)

> **⚠ Cast rule — non-negotiable.** The only real humans in the book are ones the
> buyer named in the `companions` field at intake. If `companions` is blank, the
> book stars the child alone and mentor voices belong to objects, animals, or
> nature (the ball, the moto, the moon, the wind). Never invent a Papa, Mama,
> coach, grandparent, sibling, or friend because the story shape suggests one.
> Adult presence may be *implied* — a hand off-frame, a shadow on the grass — but
> no face, no distinguishing features. This rule was added after an early test
> shipped fabricated parents; it is a product-integrity requirement, not a style
> preference. See the "no fabricated humans" note in memory.

7. **Read the intake's `companions` field first.** It answers "who besides the
   child appears in the art?" — either a list of named people with descriptions
   (and ideally photos, chased by email if missing) or blank. Blank = solo book.
   Everything in step 8 downstream depends on this choice, so decide it before
   you start writing.

8. **Author the story.** Open ChatGPT or Claude. Paste the intake and ask for a
   `story.json` following the schema in `lib/models/book.ts`. Attach an existing book's
   `story.json` as a shape reference.

   Prompt shape:
   > Author a Little Fables story.json. `kind: "quick"`, 1 chapter, 6–10 pages, each
   > page 1–3 sentences, gentle arc addressing `{help_with}`. Include the kid's name
   > and the occasion. **Cast rule:** the only human characters are `{companions
   > or "just the child"}` — do not invent parents, coaches, siblings, or any
   > other people. If the story needs a mentor voice, give it to an object,
   > animal, or piece of nature (Little Blue Truck's trucks, Tabitha Paige's
   > moon, etc.). Return JSON only.

9. **Read it yourself.** Fix names. Remove any modern tech or screens. **Sweep
   for fabricated humans** — every named or described person must trace back to
   the intake. If a scene calls for an adult that wasn't supplied, rewrite the
   beat so the child interacts with an object, animal, or setting instead. Make
   sure the "help with" resolves warmly rather than didactically. Set
   `by: "Little Fables, for {kid}"`.

10. **Save and validate:**
    ```bash
    # save to content/households/<slug>/books/<book-slug>/story.json
    pnpm content:add content/households/<slug>/books/<book-slug> --check
    ```
    Must pass `bookSchema.parse` before any art work starts.

11. **Write `character-notes.md`** in the same folder. Start with a **cast rule
    block** ("The only real human in this book is `{kid}`. Any other person shown
    was supplied by the buyer: `{companions or "none"}`."), then per-character
    likeness blocks (15–25 words each, per the `fable-art-custom` skill) for
    every real human the buyer supplied, then the non-human speaking co-stars
    (ball, moon, favourite toy, etc.), then the style anchor. This file gets
    pasted verbatim into every prompt. If the buyer sent photos, drop them at
    `content/households/<slug>/books/<book-slug>/reference/child-photo.jpg` +
    `reference/<relationship>-photo.jpg` (all gitignored).

---

## C · Preview generation (6–24h)

12. **Open ChatGPT with the `fable-art-custom` skill.** Upload `story.json`,
    `character-notes.md`, and `typeform.json`.

    Ask for **preview mode**: one character block plus three cover prompts (Style A,
    B, C) varying only the style anchor. **Reiterate the cast rule in the
    prompt itself** — the skill will otherwise infer a stock family from the
    scene ("kid at soccer" → hallucinated Papa on the sideline).

13. **Generate the three covers** in your image tab. Reject anything with text
    artifacts, photorealism, content-policy issues, **or any human face beyond
    the child and the buyer-supplied companions**. If a hand or arm sneaks in
    from off-frame, that's fine; a face is not. Regenerate as needed.

14. **Save previews:**
    ```
    ~/fables-orders/<slug>/previews/v1-cover-A.png
    ~/fables-orders/<slug>/previews/v1-cover-B.png
    ~/fables-orders/<slug>/previews/v1-cover-C.png
    ```

15. **Send email 2** (preview delivery) with the three images attached and a one-line
    description of each style.

---

## D · Approval and revisions

16. **Buyer replies with a letter.** Log the choice in `orders.csv`, move stage to
    `STYLE_LOCKED`. Save:
    - `previews/APPROVED-cover.png`
    - `previews/APPROVED-prompt.txt` ← the exact style anchor, reused for every page

17. **Revision requested?** Update `character-notes.md` with the correction,
    regenerate all three variations, resend. **Soft cap: 3 rounds.** The listing
    promises unlimited; operationally, past round 3 the fit usually isn't there.

18. **Refund triggers:**
    - Buyer still unhappy after round 3
    - Buyer non-responsive for 5 days after one gentle nudge
    - Buyer wants something outside the content policy

    Issue the Etsy refund, keep the files, close the order.

---

## E · Full book art (24–72h after approval)

19. **Back to `fable-art-custom`, full-book mode.** Feed it `story.json`,
    `character-notes.md`, and `APPROVED-prompt.txt`. Ask for one prompt per page in
    reading order, each ending with the character block and style anchor verbatim.
    Re-state the cast rule in the prompt — the skill will otherwise regress and
    invent a stock family across an 8-page book.

20. **Generate every page in the same tab and model as the approved cover.** Switching
    generators mid-book causes visible style drift.

21. **Check consistency every 3 pages** — hair silhouette, palette, props, lighting
    continuity within a scene, **and no fabricated faces have crept in**.
    Regenerate anything off-model before moving on.

22. **Save into the book folder:**
    ```
    content/households/<slug>/books/<book-slug>/cover.png
    content/households/<slug>/books/<book-slug>/pages/01.png … NN.png
    ```
    Pages are numbered globally across chapters: `01` = ch1p1, `02` = ch1p2,
    `03` = ch2p1 if chapter 1 has two pages.

23. **Narration:** skip for orders 1–10. The reader falls back to browser speech
    synthesis, which is decent. If narration is ever sold as an upsell:
    ```bash
    pnpm content:narrate content/households/<slug>/books/<book-slug>
    ```
    Requires `ELEVENLABS_API_KEY`, `DAY_VOICE_ID`, `NIGHT_VOICE_ID` in `.env.local`.

---

## F · Assembly

24. **Confirm folder shape:**

    | File | Required |
    |---|---|
    | `story.json` | yes |
    | `cover.png` | yes — also the per-page fallback |
    | `pages/NN.png` | optional per page; missing pages fall back to cover |
    | `character-notes.md` | authoring only, ignored by import |
    | `reference/` | gitignored, buyer photos |

25. **Provision the household.** For a **normal order** (buyer = parent):
    ```bash
    pnpm exec tsx scripts/new-household.ts \
      --name "{Kid} Family" \
      --child "{Kid}" \
      --band 4-8 \
      --email {buyer_email} \
      --parent "{Buyer Name}" \
      --device-label "{Kid}'s iPad" \
      --book-title "{Story Title}"
    ```
    For a **gift order** (buyer ≠ parent), add `--gift-from "{Buyer Name}"`:
    ```bash
    pnpm exec tsx scripts/new-household.ts \
      --name "{Recipient Family}" --child "{Kid}" --band 4-8 \
      --email {recipient_email} --parent "{Recipient Parent Name}" \
      --book-title "{Story Title}" \
      --gift-from "{Buyer Name}"
    ```
    Prints:
    - **MAGIC URL** — `/read/<story-slug>/<token>`. What the buyer/parent uses.
    - **GIFT URL + GIFT CODE** *(gift orders only)* — `/gift/<code>`. What goes on the
      printed certificate. The recipient parent opens it, sees one screen of context,
      and taps **Open the book** — that redeems the code and provisions their own
      device token. Single-use.

    Save the household uuid, child uuid, magic URL, and (if gift) the gift URL + code
    into `orders.csv`. The raw device token is only shown once.

26. **Fill in `content/households/<slug>/household.yaml`** with the uuids the
    provisioning script printed (copy `_TEMPLATE.yaml` if you haven't yet).
    Then **import the book:**
    ```bash
    pnpm content:add content/households/<slug>/books/<book-slug>
    ```
    The household is inferred from the folder path via `household.yaml`. Pass
    `--household <uuid>` only if you deliberately want to override.

27. **Smoke test.** Open the magic URL in a private window. Confirm: cover appears on
    the shelf, the book opens, every page renders, day mode shows art, night mode
    shows text-only. Fix anything broken and re-run `content:add` — it's idempotent.

---

## G · Delivery

28. **Send email 3** (delivery). Normal orders: the **magic URL** from step 25
    (`/read/<story-slug>/<token>`). Gift orders: no delivery email to the recipient
    directly — instead the buyer gets an email with the printable **gift certificate
    PDF** (see step 29). Install instructions are handled inside the reader (end-of-
    book prompt), so the email itself is short — "here's the book" and nothing else.

29. **Gift orders — the certificate.** The PDF carries the **gift URL** and a QR of
    the same, the child's name, "A gift from {buyer name}", the shop name, and the
    Etsy shop URL (`etsy.com/shop/LittleFablesStories`) as an anti-phishing anchor.
    See [`delivery-flow.md`](delivery-flow.md) for the full spec. **Never** put the
    buyer's `/read/<slug>/<token>` on the certificate — gift codes are the design so
    a lost/photographed certificate can be revoked and reissued. *(PDF layout is
    blocked on Heritage DS; the underlying `/gift/<code>` flow is live.)*

30. **Profile save:** if the buyer opted in on screen 17, archive `typeform.json` and
    `character-notes.md` to `~/fables-profiles/{buyer_email}/`. If they didn't,
    **delete the intake** — we promised.

---

## H · Post-delivery

31. **Day +3** — email 4, soft check-in.
32. **Day +7** — email 5, review request. Attach the coloring page. Also click Etsy's
    "request a review" button.
33. **Day +30** — email 6, second-book offer. Opted-in buyers only.

**Coloring page:** ask ChatGPT to redraw the approved cover as black line art, no
shading, printable. One prompt, near-zero cost, real perceived value.

---

## Known gaps

Small things that make orders 1–10 smoother. None block the first order except where
noted.

- [ ] Gmail canned responses saved (6 templates) — **blocks order 1**
- [ ] `orders.csv` started — **blocks order 1**
- [ ] PWA install screenshots for the delivery email — **blocks order 1**
- [ ] `apple-touch-icon.png` at 180×180 (iOS home-screen icon; SVG-only is unreliable)
- [ ] Gift certificate PDF — blocks gift orders only
- [ ] Coloring page template — needed by day +7 of order 1
- [ ] Gmail filter auto-labeling intake emails
- [ ] Automated preview page to replace email attachments (nice-to-have, post order 3)

## Reference

- Story schema: `lib/models/book.ts`
- Import script: `scripts/import-book.ts` (read the header docblock)
- Provisioning: `scripts/new-household.ts`
- Magic URL routes: `app/read/[slug]/[token]/route.ts` (readable, preferred) + `app/f/[token]/route.ts` (legacy, still works)
- Art skill: `~/.codex/skills/fable-art-custom/SKILL.md`
- Audio fallback chain: `lib/reader/page-audio-source.ts`
