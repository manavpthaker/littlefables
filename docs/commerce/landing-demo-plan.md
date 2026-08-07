# Landing Page — Demo & Video Plan

Written 2026-08-07 after inspecting the live littlefables.app and the repo. The page
is polished and complete; what it's missing is *proof in motion* — nothing on it
moves, and nothing on it lets a visitor touch the actual product. Both are cheap to
add because every asset already exists.

## 0 · First, a live conflict to fix: the price

The landing page says **$48 one-time**. The Etsy listing says **$69** (→ $58.65 once
the launch sale renders). The walkthrough film's end card says **$69**. A buyer who
checks both places sees a shop that can't keep its own price straight — the exact
doubt a zero-review shop can't afford. Align everything to the Etsy framing:
**$69 · launch price on Etsy** (the strikethrough lives on Etsy, where checkout is).
One number, three surfaces.

## 1 · The real interactive demo: a sample book (highest value, lowest build)

You own the reader — so the strongest "walkthrough" isn't a simulation, it's an
actual book. The demo book already exists in the repo
(`content/households/demo/books/lantern-round-pond/`, *The Lantern of Round Pond* —
the same book the film uses).

- Add a stable public route — `littlefables.app/sample` — that opens the demo book
  in the real reader (a long-lived token or a tokenless demo path; import the book
  via `pnpm content:add` if it isn't in the DB yet).
- Hero gets a **secondary CTA**: `Read a sample book` next to `Start your book`.
  Primary stays the Etsy funnel; the sample is the trust path for the undecided.
- On a phone this *is* the product — narration, word-tap, night mode, even
  Add-to-Home-Screen works. No competitor can hand a shopper the deliverable
  before purchase; Wonderbly can't, and Etsy's own listing can't host it.
- Label it honestly: "A real book we made for a real kid — yours is written fresh."
- Instrument the click (one analytics event) — sample-opens vs Etsy-clicks becomes
  the first real funnel signal the shop has.

## 2 · Motion in the hero: the 15-second demo cut as a living screenshot

The brand rule is "silence is a feature," so no autoplay film with a soundbar. But a
**muted, looping, playsinline 15s clip** inside the existing hero device mockup —
the intake→previews→page-turn demo cut built for Etsy — reads as a screenshot that
happens to be alive. Motion without noise. Poster frame for no-JS/reduced-motion.

## 3 · The full film where it narrates: "How Your Book Is Made"

`walkthrough-video.md` built the 2:14 film for this page. Put it at the top of the
How Your Book Is Made section as click-to-play (poster: the Rosa spread), not
autoplay — the section's four steps then become the film's chapters. Self-host the
mp4 (compressed ~15–20MB H.264) to keep the no-third-party privacy stance intact;
no YouTube embed, no tracking pixels.

## 4 · The first-hand lifestyle clips: optional, and not next to testimonials

The rug/kitchen UGC-register clips (`ugc-video-prompt.md`) can loop quietly in the
"Not a PDF — A Quiet Little App" section. Do **not** place AI-generated home video
beside "Notes From Families" — pairing synthetic footage with testimonial copy is
exactly where authenticity questions start. Related caution while in there: the
three parent testimonials on a shop with zero public sales should be real,
attributable quotes (family beta readers, named with permission) or should come out
until real ones exist.

## Build order

| Priority | Item | Effort |
|---|---|---|
| P0 | Price alignment ($48 → Etsy framing) | minutes |
| P1 | `/sample` route + hero CTA + event | small |
| P2 | 15s loop in hero mockup | small (asset exists once the Etsy cut renders) |
| P2 | Film click-to-play in How It's Made | small |
| P3 | Lifestyle loops in the app section | whenever the takes land |
