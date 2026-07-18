# Experience Plan — from "works" to "feels like a product" (2026-07-17)

Companion to [BUILD-VERDICT.md](./BUILD-VERDICT.md). That doc's punch list makes the build *function*; this plan closes the distance to a **polished commercial consumer app**. The honest framing: what's missing is not architecture — it's (1) an art library that doesn't exist yet, (2) an audio library that's 1/9th produced, and (3) the motion/sound/light layer the design system specifies but the app never implemented. The code slots for all three exist (scene-art rendering, per-buddy TTS, and PaintingWash landed in the last three commits). This is a production plan, not a refactor plan.

## The acceptance bar (already written)

The design system was accepted against the 8-beat **Saturday Drive** flow. That is now the product bar: the real app, on a real iPhone, must deliver every beat with real assets — spoken buddy greeting with callback, chapter map with art tiles, full-bleed painted page with word highlight, tap-word star into WordCapsule, choice sheet with a spoken idea, painting-state → watercolor develop, spoken checkpoint with two-stage mercy, sun + badge celebration queue, and the parent transcript that evening.

**Top-level done-signal:** a stranger's kid rides all 8 beats and nothing feels like a demo. That sentence is the exit gate to V2 wave 2.0 — B2 does not start until it's true. Each workstream below carries its own sub-signal: the emotional tell that the work landed, checked by handing Azad the phone, not by reading a diff.

## Workstream 1 — Art (the biggest visible gap)

**Sub-signal:** he picks a book because of its cover; not one gradient blob is visible anywhere in the app.

**Scope:** 9 books · 36 chapters · 260 pages. Target: full-bleed portrait (9:19.5-safe) watercolor scene art for every page, one cover per book, chapter-map tiles (can crop from page art).

**Pipeline (exists, needs scale-up):** character bible + approved refs (`content/art/characters.json`, archive refs) → per-scene art briefs → Gemini into `art-candidates` (private) → parent approve → `art-live` (public) → stitched into book jsonb. What's missing to run it at 260-page scale:

1. **Art briefs per page** — generate mechanically from page text + character bible + a per-book palette note (the archive's `art-director.ts` pattern; port it into the new repo's scripts). Brief quality is what keeps 260 images feeling like one illustrator.
2. **Character consistency** — every generation call includes the character reference images (archive's `character references` approach), not text descriptions alone. Without this the buddy looks different on every page; this is the single biggest "feels cheap" risk.
3. **Batch approval UX** — approving 260 images one-at-a-time is parent torture. Parent Corner needs a review grid: approve-all-in-chapter, reject-with-reason (feeds regeneration), compare-candidates. Use the design system's ArtApproval component (built, never imported).
4. **Portrait-native composition** — briefs specify 9:19.5 safe-area composition per the PRD's iPhone-first rule; no landscape spreads cropped down.
5. **Fallback states** — un-generated/unapproved pages render PaintingWash full-bleed (now wired) with the develop reveal on arrival, so a partially-arted book still feels intentional, never broken.

**Cost reality:** ~270 images × ~$0.05 ≈ **$13.50 per full pass**; assume 2–3 candidates/page for choice → **$30–45 total**, hours not weeks. The expensive part is your approval time — the batch UX is what makes it tractable (est. 2–3 evenings at grid speed).

## Workstream 2 — Voice & audio (the app must speak)

**Sub-signal:** the buddy actually greeted him aloud when he opened it — and he answered back. No robot voice on any book; the parent falls silent while narration flows because there's nothing left to read *for* him.

1. Voice-slot client handler (the BUILD-VERDICT item) — everything with a `data-utterance` actually speaks, through the priority rules (narration > checkpoint > tap > ambient).
2. **Narrate all 9 books** — `pnpm audio:generate` per book (~$5–10 total, one-time), timestamps into the bucket, IndexedDB warm on first read.
3. **Checkpoint questions spoken** in the buddy's voice (route exists; per-buddy `voice_id` just landed).
4. **Earcons** — produce the 7-sound palette the design system specs (tap, star, page-turn, correct/mercy bell, sun chime, celebration). Short, quiet, mixed under voice per the ducking table. A single afternoon with a sound library.
5. Tap-word seek fix (the one unthreaded field).

## Workstream 3 — Motion, light, polish (the design system's unimplemented layer)

**Sub-signal:** he notices the app changed with the evening ("it's nighttime in there too"); a page turn gets a reaction the first time; nothing ever teleports.

1. **Page-turn choreography** and the **watercolor develop** (`--motion-develop`) on art arrival — both are token-spec'd, neither is felt in-app yet.
2. **Clock-driven lighting** — the ambient morning/dusk shift from the DS lighting tokens, wired to real time of day. This is the "feels alive" feature; it's ~a day.
3. **Celebration queue** — sun → badge → word order with the DS CelebrationQueue (built, unused).
4. **Home hierarchy pass** — buddy presence with real art, suns row per DS spec (no letters), shelf with real covers and true progress; kill every remaining gradient placeholder and `progress={0}`.
5. **Parent Corner rebuilt on the 8 designed parent components** (QARecord, LifecycleChip, ArtApproval, StoryMaker, ComprehensionProfile, ChoiceRecord, Sheet, SectionHeader) — same evidence, real product surface.
6. **App presence** — icon, splash, installed-PWA chrome, launch straight to Home.

## Workstream 4 — Commercial hardening (from BUILD-VERDICT, unchanged)

**Sub-signal:** a stranger with every URL sees nothing, spends nothing; you'd screen-share Parent Corner on a call without wincing.

PARENT_PASSWORD gate; de-seed the 5 parent routes; un-skip integration tests; route-level HTTP tests; canon version into qa_records; privacy page truth-pass.

## Sequence & sizing (nights-and-weekends realistic)

| Sprint | Contents | Exit test |
|---|---|---|
| **S1 — It speaks** (2–4 sessions) | WS2 items 1,2,3,5 + verdict punch list | Azad hears his buddy greet him; all 9 books narrate; tap-word seeks |
| **S2 — It's painted** (3–5 sessions + approval evenings) | WS1 fully; covers first, then pages book-by-book | Shelf shows 9 real covers; Bramble + 2 more books fully painted; rest show intentional painting states |
| **S3 — It feels alive** (2–3 sessions) | WS3 | Saturday Drive beats 1–7 pass on a phone with real assets |
| **S4 — It's a product** (2 sessions) | WS4 + remaining books' art | Beat 8 passes; a non-family household could onboard; nothing placeholder anywhere |

Total: roughly 10–14 focused sessions. Zero of it is rebuild; all of it is finishing — and each sprint ends with something Azad can feel that he couldn't the week before.
