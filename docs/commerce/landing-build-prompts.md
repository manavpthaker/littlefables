# Landing Page — Build Prompts

Paste-ready prompts for a coding agent working in the little-fables repo, one per
item in `landing-demo-plan.md`. Written 2026-08-07.

## 1 · The interactive demo — `/sample` with The Lantern of Round Pond

```
Add a public sample-book route to littlefables.app so a visitor can read a real
book in the real reader before buying. This is the landing page's trust path: the
actual deliverable, handed over before purchase.

READ FIRST, BEFORE WRITING ANYTHING
- app/read/** — the reader and how a magic URL of the shape
  /read/<story-slug>/<token> authenticates and loads a book
- app/page.tsx — the landing hero, and how the existing "Start your book" and
  "Gift a book" CTAs are built and styled
- app/layout.tsx and app/register-sw.tsx — what analytics (if any) and PWA
  wiring already exist; do not assume PostHog or anything else is present
- docs/commerce/delivery-flow.md — the three arrival states and why /read is
  tokenized
- content/households/demo/books/lantern-round-pond/ and
  content/households/demo/household.yaml — the demo book source
- scripts/new-household.ts and the `pnpm content:add` flow in
  docs/commerce/README.md — how books are provisioned and imported

THE FEATURE
1. A stable public URL, littlefables.app/sample, that opens The Lantern of Round
   Pond in the real reader. No signup, no token visible in the URL a visitor
   types or shares. Implement it as the smallest change consistent with the
   reader's existing auth model — e.g. /sample resolves a server-known demo
   token (env var or a demo/is_public flag on that one book) and renders or
   internally rewrites to the reader. Constraints that are not negotiable:
   - Token auth for every real household stays exactly as strong as it is now.
     The demo path must not introduce any way to reach a non-demo book.
   - If the lantern book is not yet imported into the production DB, import it
     (`pnpm content:add content/households/demo/books/lantern-round-pond`) and
     verify narration audio actually plays in the deployed reader.
2. The reading experience is untouched while reading — no banner, no overlay,
   no persistent chrome. The product's pitch is that nothing interrupts the
   book; the sample must prove it, not contradict it.
3. After the last page, one closing card in the reader's existing visual
   language (cream ground, serif, tree mark small): 
   - Line 1: "This was Rosa's book, made for one real kid."
   - Line 2: "Yours is written fresh — about your kid."
   - One button: "Start your book" → the Etsy listing URL already used by the
     landing hero. A quiet text link beneath: "back to littlefables.app".
   - Deliberately no price on this card — the price lives on Etsy and the
     landing page, and a third surface to keep in sync is how mismatches happen.
4. Landing hero: add a secondary CTA "Read a sample book" beside "Start your
   book", styled like the existing secondary ("Gift a book") button, linking to
   /sample. Under it or in its hover/aria copy, the honesty line: "A real book
   we made for one kid — takes about two minutes."
5. Add-to-Home-Screen and offline behavior should work on /sample the same as
   for a real book — installing the sample is part of the demo.

ANALYTICS — smallest honest version
Check what the repo already has. If an analytics layer exists, fire three
events: sample_opened (landing click-through), sample_completed (closing card
reached), sample_cta_clicked (closing card → Etsy). If nothing exists, either
log the three events to a small Supabase table (events: name, ts, referrer) or
skip cleanly — do not add a third-party analytics script for this; the site's
privacy stance ("no tracking pixels") outranks the measurement.

VOICE AND CRAFT RULES
- All copy: warm, second person, no exclamation marks, no emoji, never
  "AI-powered". When in doubt, docs/commerce/positioning.md wins.
- Match the Heritage system already in globals.css — cream ground, ink serif,
  oxblood accent used once per surface, motion on the existing tokens
  (--motion-tick / --motion-wind); nothing springy.
- Mobile-first: the primary consumer of /sample is a parent on a phone tapping
  from the hero. Test the reader, the closing card, and A2HS at 390px width.
- SEO hygiene: /sample may be indexed; tokenized /read/* must remain
  non-indexable — confirm the current noindex behavior and keep it.

ACCEPTANCE
- Cold visit to littlefables.app/sample on a phone: book opens in under 3s,
  narration plays, word-tap works, night mode works, closing card appears after
  the last page, Etsy button leaves correctly.
- No route, link, or error message anywhere on /sample exposes another
  household's slug or token.
- Landing hero shows both CTAs without layout shift on mobile and desktop.
- `pnpm build` clean; no new third-party network requests on any page.
```

## 2 · "How Your Book Is Made" — per-step loops + the film at the end

Strategy (decided 2026-08-07): don't lead the section with the click-to-play film —
single-digit engagement means most scrollers would see a static thumbnail. Instead,
each of the section's four steps gets a short muted autoplay loop cut from the
walkthrough's beats (the Remotion pipeline is JSON-per-beat, so these are config
renders, not new edits), and the full 2:14 film sits at the section's end as an
opt-in for the high-intent minority. Loops carry no burned-in captions — the page's
step copy does that job, which is exactly what distinguishes the landing cuts from
the Etsy cuts.

```
Give the landing page's "How Your Book Is Made" section motion: a short muted loop
per step, and the full walkthrough film as an opt-in at the section's end.

READ FIRST, BEFORE WRITING ANYTHING
- app/page.tsx — the How Your Book Is Made section: its four steps, their current
  static visuals, and the section's grid/layout
- video/ — the Remotion package: src/beats.ts (the film as data — timings there
  are the source of truth, per docs/commerce/walkthrough-video.md), the per-beat
  compositions, and how renders are produced
- docs/commerce/walkthrough-video.md — beat sources and reasoning
- app/globals.css — the Heritage motion tokens (--motion-tick, --motion-wind,
  --motion-settle) and palette (cream #EEE3CF, ink #241B12, oxblood #7D2E2A)
- docs/commerce/landing-build-prompts.md §1 — the /sample route being added; this
  section's last step links to it

PART A — RENDER FOUR LOOPS + THE FILM (in video/)
One loop per step, mapped to existing beats:

  Step 1 · "Tell us about your kid"  ← beat 3 excerpt (~7s): name typed, age
          tapped, interest chips chosen, at real speed
  Step 2 · "Previews in 24 hours"    ← NEW mini-composition (~7s): the
          revision-sequence art (round 1 graphite → round 2 colour → final
          night scene; panels exist in
          assets/listing/etsy-photos/_sources/preview-revision-sequence.png and
          the 05 listing image sources) crossfading on --motion-settle. This is
          the only clip with no film footage behind it; it is three stills and
          two dissolves.
  Step 3 · "We write, paint, narrate" ← beat 4b, the wet-paper-drying colour
          resolve (~8s), optionally landing on 4d's cover bind. Do not speed it
          up — this movement is the anti-slop argument made visual.
  Step 4 · "It arrives on their iPad" ← beat 5 (~8s): delivery email → tap →
          reader opens → Add-to-Home-Screen icon landing

Loop treatment, all four: a 200ms dissolve through cream (#EEE3CF) at the
restart join — the beats weren't authored as loops, and a dissolve-through-paper
reads as pagination where a jump cut reads as a glitch.

Export specs: 720p at the aspect ratio the section's visuals actually render at
(check the layout first), H.264 around CRF 23, target ≤3MB per loop, AUDIO TRACK
STRIPPED ENTIRELY (not just muted), no burned-in text or captions of any kind,
plus a poster PNG per clip (a fully-resolved frame, not the desaturated first
frame). Also produce the full film: the existing 2:14 cut, compressed to roughly
15–20MB, with a poster frame of the Rosa-and-Grandma-June spread.

PART B — THE SECTION (app/page.tsx)
1. Replace each step's static visual with its loop:
   <video muted autoplay loop playsinline preload="none" poster=...>
   - IntersectionObserver: play when ≥50% visible, pause when it leaves.
   - prefers-reduced-motion: never autoplay; show the poster image instead.
   - Reserve the box with aspect-ratio CSS — zero layout shift.
2. At the section's end, one quiet row in the Heritage register:
   "Watch the whole thing — two minutes." → expands or lightboxes the full film
   in a native <video controls> player, poster showing, nothing autoplays, and
   sound stays on for this one — the viewer opted in by clicking. No YouTube, no
   Vimeo, no third-party player or CDN beacon.
3. The section's last step ends with the funnel line: "or just read one →"
   linking to /sample (ships alongside prompt §1; if building this first, land
   the link behind the same PR).
4. Files self-hosted under the app's static assets with hashed filenames and
   long-cache headers.
5. Analytics, same rule as §1: if a layer exists, fire film_played and
   film_completed; add nothing third-party to measure this.

ACCEPTANCE
- Scrolling the section on iPhone Safari: all four loops autoplay silently,
  pause offscreen, and the page's initial load gained ~0 weight (preload="none",
  posters lazy).
- prefers-reduced-motion shows four stills and the section still reads fine.
- No CLS anywhere in the section (verify in Lighthouse).
- Film plays with controls and audio on click; closing it stops playback.
- `pnpm build` clean; zero new third-party requests.
```
