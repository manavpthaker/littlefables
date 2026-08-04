# Fulfillment Playbook

Per-order runbook, intake to delivery. Written for manual execution on orders 1–10.
Human-in-the-loop everywhere; automate later once the shape is proven.

**Target timeline:** previews within 24h · final book 3–4 days after approval.

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

7. **Author the story.** Open ChatGPT or Claude. Paste the intake and ask for a
   `story.json` following the schema in `lib/models/book.ts`. Attach an existing book's
   `story.json` as a shape reference.

   Prompt shape:
   > Author a Little Fables story.json. `kind: "quick"`, 1 chapter, 6–10 pages, each
   > page 1–3 sentences, gentle arc addressing `{help_with}`. Include the kid's name,
   > the cast, and the occasion. Return JSON only.

8. **Read it yourself.** Fix names. Remove any modern tech or screens. Make sure the
   "help with" resolves warmly rather than didactically. Set
   `by: "Little Fables, for {kid}"`.

9. **Save and validate:**
   ```bash
   # save to content/books/custom/<slug>/story.json
   pnpm content:add content/books/custom/<slug> --check
   ```
   Must pass `bookSchema.parse` before any art work starts.

10. **Write `character-notes.md`** in the same folder — a 15–25 word character block
    per the `fable-art-custom` skill. This block gets pasted verbatim into every
    prompt. If the buyer sent a photo, drop it at
    `content/books/custom/<slug>/reference/child-photo.jpg` (already gitignored).

---

## C · Preview generation (6–24h)

11. **Open ChatGPT with the `fable-art-custom` skill.** Upload `story.json`,
    `character-notes.md`, and `typeform.json`.

    Ask for **preview mode**: one character block plus three cover prompts (Style A,
    B, C) varying only the style anchor.

12. **Generate the three covers** in your image tab. Reject anything with text
    artifacts, photorealism, or content-policy issues. Regenerate as needed.

13. **Save previews:**
    ```
    ~/fables-orders/<slug>/previews/v1-cover-A.png
    ~/fables-orders/<slug>/previews/v1-cover-B.png
    ~/fables-orders/<slug>/previews/v1-cover-C.png
    ```

14. **Send email 2** (preview delivery) with the three images attached and a one-line
    description of each style.

---

## D · Approval and revisions

15. **Buyer replies with a letter.** Log the choice in `orders.csv`, move stage to
    `STYLE_LOCKED`. Save:
    - `previews/APPROVED-cover.png`
    - `previews/APPROVED-prompt.txt` ← the exact style anchor, reused for every page

16. **Revision requested?** Update `character-notes.md` with the correction,
    regenerate all three variations, resend. **Soft cap: 3 rounds.** The listing
    promises unlimited; operationally, past round 3 the fit usually isn't there.

17. **Refund triggers:**
    - Buyer still unhappy after round 3
    - Buyer non-responsive for 5 days after one gentle nudge
    - Buyer wants something outside the content policy

    Issue the Etsy refund, keep the files, close the order.

---

## E · Full book art (24–72h after approval)

18. **Back to `fable-art-custom`, full-book mode.** Feed it `story.json`,
    `character-notes.md`, and `APPROVED-prompt.txt`. Ask for one prompt per page in
    reading order, each ending with the character block and style anchor verbatim.

19. **Generate every page in the same tab and model as the approved cover.** Switching
    generators mid-book causes visible style drift.

20. **Check consistency every 3 pages** — hair silhouette, palette, props, lighting
    continuity within a scene. Regenerate anything off-model before moving on.

21. **Save into the book folder:**
    ```
    content/books/custom/<slug>/cover.png
    content/books/custom/<slug>/pages/01.png … NN.png
    ```
    Pages are numbered globally across chapters: `01` = ch1p1, `02` = ch1p2,
    `03` = ch2p1 if chapter 1 has two pages.

22. **Narration:** skip for orders 1–10. The reader falls back to browser speech
    synthesis, which is decent. If narration is ever sold as an upsell:
    ```bash
    pnpm content:narrate content/books/custom/<slug>
    ```
    Requires `ELEVENLABS_API_KEY`, `DAY_VOICE_ID`, `NIGHT_VOICE_ID` in `.env.local`.

---

## F · Assembly

23. **Confirm folder shape:**

    | File | Required |
    |---|---|
    | `story.json` | yes |
    | `cover.png` | yes — also the per-page fallback |
    | `pages/NN.png` | optional per page; missing pages fall back to cover |
    | `character-notes.md` | authoring only, ignored by import |
    | `reference/` | gitignored, buyer photos |

24. **Provision the household:**
    ```bash
    pnpm exec tsx scripts/new-household.ts \
      --name "{Kid} Family" \
      --child "{Kid}" \
      --band 4-8 \
      --email {buyer_email} \
      --parent "{Buyer Name}" \
      --device-label "{Kid}'s iPad"
    ```
    Prints the household uuid, child uuid, device token, and **the magic URL**. Save
    all of it to `orders.csv` — the raw token is only shown once.

25. **Import the book:**
    ```bash
    pnpm content:add content/books/custom/<slug> --household <uuid>
    ```

26. **Smoke test.** Open the magic URL in a private window. Confirm: cover appears on
    the shelf, the book opens, every page renders, day mode shows art, night mode
    shows text-only. Fix anything broken and re-run `content:add` — it's idempotent.

---

## G · Delivery

27. **Send email 3** (delivery) with the magic URL and install instructions.

28. **Gift orders:** also send the printable gift certificate PDF with the same URL
    and a QR code. *(Blocked on Heritage DS.)*

29. **Profile save:** if the buyer opted in on screen 17, archive `typeform.json` and
    `character-notes.md` to `~/fables-profiles/{buyer_email}/`. If they didn't,
    **delete the intake** — we promised.

---

## H · Post-delivery

30. **Day +3** — email 4, soft check-in.
31. **Day +7** — email 5, review request. Attach the coloring page. Also click Etsy's
    "request a review" button.
32. **Day +30** — email 6, second-book offer. Opted-in buyers only.

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
- Magic URL route: `app/f/[token]/route.ts`
- Art skill: `~/.codex/skills/fable-art-custom/SKILL.md`
- Audio fallback chain: `lib/reader/page-audio-source.ts`
