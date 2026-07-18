# EXPERIENCE-PLAN — Execution Work Order

**For the build agent.** Every decision is pre-made. Do not enter plan mode, do not ask scope questions — execute top to bottom. If something here contradicts reality (a file moved, an API changed), make the smallest adaptation that preserves the intent, note it in the commit body, and keep going. Only stop for: a failing quality gate you cannot fix, a spend decision above $25, or a destructive operation not listed here.

**Global rules (apply to every step):**
- One step = one commit, message as given (prefix `XP-S<sprint>.<step>`). Run `pnpm typecheck && pnpm lint && pnpm test && pnpm build` before every commit; all green or fix before committing. Push after each sprint.
- PRD §4 rules hold: files ≤400 lines, DS components verbatim via `@ds/*` (extend `design-system.d.ts` in the same commit when adopting one), all AI calls through `lib/anthropic.ts` / `lib/openai.ts` / `lib/gemini.ts`, generated assets never in git.
- Never modify `content/originals/` or `reference/`. Pack-000 JSON edits in Sprint 3 are additive-only.
- `content/packs/pack-000-family-originals.json` is the book-id source of truth; enumerate ids from it, never hardcode a guessed id.

---

## Sprint 1 — It speaks (do this first, in this order)

### S1.1 — Tap-word seek fix
The one-field bug from BUILD-VERDICT. In `app/read/story/[id]/reader.tsx`, `transportPage` is built as `{ text, source }` — timestamps are never threaded, so `transport.ts` finds `page.timestamps` undefined and `seekToWord` restarts the page. Fix: have the page-audio source expose the loaded `WordTimestamp[]` (extend `lib/reader/page-audio-source.ts` to surface timestamps after fetch — a `getTimestamps()` on the source or an `onTimestamps` callback stored in reader state) and include them in `transportPage`. When timestamps are absent (speechSynth fallback), seek falls back to restart — current behavior, acceptable.
**Check:** with Bramble's Hello playing, tapping a mid-page word jumps narration to that word. Add a transport unit test: `seekToWord` with timestamps present does NOT re-speak from index 0.
**Commit:** `XP-S1.1 Thread timestamps into transportPage — tap-word seek works`

### S1.2 — Voice-slot client handler (the app speaks)
Create `lib/voice/ui-voice.ts` (client, ≤200 lines):
- `speakUtterance(text, opts?: { voiceId?: string | null })` → POST `/api/child/tts` (route exists, budget-gated) → play returned audio. Cache in the existing IndexedDB (`lib/reader/audio-cache.ts` pattern) keyed by sha-256 of `voiceId|text` so repeat utterances are free. Fallback chain: cached → `/api/child/tts` → `speechSynthesis` → silent.
- **Priority rule (hard):** maintain a module-level `narrationActive` flag; `lib/reader/transport.ts` sets it via an exported `setNarrationActive(bool)` on play/stop (2-line addition, do not otherwise touch the ported hook). `speakUtterance` no-ops (or queues one deep, latest-wins) while narration is active. UI speech NEVER talks over narration.
- One audio element at a time: a new utterance cancels the previous.
Wire it minimally, by hand, at the four places that matter (do NOT build a DOM-scanning framework):
1. `app/read/home-buddy.tsx` — speak the greeting once on mount, buddy voice (`activeBuddy.voiceId`).
2. `app/read/story/[id]/checkpoint.tsx` — speak the question when it arrives; speak hint/given lines when mercy stage changes.
3. `app/read/celebrations.tsx` — speak each celebration's utterance as it shows.
4. `lib/reader/wordbook.ts` flow — after a word tap while paused, `speakUtterance(word)` already happens via transport `speakOne`; leave it; after a star-save, speak "«word» is in your word book!".
**Check:** open `/read` with sound on → buddy greets aloud. Finish a chapter → question is spoken. Two rapid greetings don't overlap.
**Commit:** `XP-S1.2 UI voice: buddy greets aloud, checkpoints spoken (voice-slot handler)`

### S1.3 — Narrate all 9 books
`pnpm audio:generate -- --book <id> --check` for every pack-000 id missing audio, sum the dry-run estimate (expect ~$12–18 total; proceed without asking if ≤$25), then run for real, sequentially. Verify each uploads mp3 + timestamps to `page-audio`.
**Check:** every book plays ElevenLabs narration with moving word highlight; zero robot voice on any shelf book.
**Commit:** `XP-S1.3 Narration for all pack-000 books (bucket only — no assets in git)`

### S1.4 — Checkpoint flow fixes
In the reader: (a) on the last page of a chapter, if narration is NOT playing, show a "Done with this chapter" affordance (DS Button, primary) that opens the checkpoint — silent readers can currently never finish a chapter; (b) when the checkpoint completes (`onDone`), if the book has a next chapter, advance into it (`enterChapter(chapterIdx+1)` at page 0) instead of dropping back to the same page; last chapter → back to ChapterMap (or Home for quick books).
**Check:** read a chapter fully silent → can finish it → lands in next chapter.
**Commit:** `XP-S1.4 Checkpoint: silent-reader completion + chapter advance`

**Sprint 1 exit signal:** the buddy actually greeted him aloud when he opened it; all 9 books narrate; tap-word seeks. Push.

---

## Sprint 2 — It's painted

### S2.1 — Batch cover generation
Extend `app/api/parent/art/generate/route.ts` (or add a script `scripts/art-covers.ts` if the 300s route ceiling is a problem — script preferred) to generate cover candidates for ALL books lacking an approved cover, 2 candidates each, sequentially, using the character bible + book title + first-page text in the prompt. ~18 images ≈ $1. Portrait composition (9:19.5-safe) per PRD E0 — put it in the prompt text.
**Commit:** `XP-S2.1 Batch cover candidates for all books`

### S2.2 — Batch approval UI on the DS component
Replace the hand-rolled art section in Parent Corner with the design-system `ArtApproval` component (`@ds/components/parent/ArtApproval.jsx`): grid of candidates grouped by book, approve/reject per candidate, approve-all-for-book. Rejecting with a reason string stores it in the `art_artifacts` row (add nullable `reject_reason` column, migration `..._art_reject_reason.sql`).
**Check:** approve 9 covers in under 5 minutes of clicking. Shelf shows real covers.
**Commit:** `XP-S2.2 ArtApproval batch review — approve covers at grid speed`

### S2.3 — Scene art for Bramble's Hello + 2 more books
Add `scripts/art-scenes.ts`: per page of a target book → brief from page text + character bible + book palette note → 1 candidate per page into `art-candidates` with `kind='scene'`, chapter/page indexes set. Run for Bramble's Hello first (21 pages ≈ $1), then the 2 shortest remaining books. Approve via S2.2 UI. Reader already renders `page.img` — add a small post-approval step that stitches approved scene URLs into the book jsonb (`book.chapters[c].pages[p].img`), mirroring the cover-approve pattern.
Un-approved/un-generated pages: render the DS `PaintingWash` full-bleed variant instead of plain paper (component exists; wire it where `page.img` is absent for books that have ≥1 approved scene, so partially-painted books look intentional).
**Check:** Bramble's Hello reads as a painted picture book end to end.
**Commit:** `XP-S2.3 Scene art pipeline + Bramble fully painted + PaintingWash fallback`

### S2.4 — Shelf truth
Fix `progress={0}` on shelf cards: pass real per-book progress (query exists for ContinueCard; extend to all cards). Remove any remaining gradient-blob fallback in favor of cover art or a DS-tokened placeholder.
**Commit:** `XP-S2.4 Shelf shows real progress + no gradient placeholders`

**Sprint 2 exit signal:** he picks a book because of its cover; no gradient blobs anywhere. Push.

---

## Sprint 3 — It feels alive

### S3.1 — Motion: page-turn + watercolor develop
Apply the DS motion tokens: page transitions use `--dur-page`/page-turn choreography (crossfade + slight slide is fine; respect `prefers-reduced-motion`); scene art arriving (first load of `page.img`) plays `--motion-develop`. Both are CSS-class applications of tokens that already exist in `design-system/tokens/motion.css`.
**Commit:** `XP-S3.1 Page-turn + watercolor develop motion`

### S3.2 — Clock lighting
Wire `design-system/tokens/lighting.css` layers: a small client component in the kid layout sets `data-lighting="morning|day|dusk|night"` on the kid subtree from local time (boundaries: 5–11 morning, 11–17 day, 17–20 dusk, 20–5 night). No new colors — the token file defines the layers.
**Commit:** `XP-S3.2 Clock-driven lighting on kid surfaces`

### S3.3 — Author interactive pages into pack-000
Additive edit to `content/packs/pack-000-family-originals.json`: add ONE choice page and ONE breathe page to two chapter books (pick the two longest), written in the story's own voice, at natural beats — text stands alone if interaction is skipped (schema fields `choice`/`breathe` already exist). Update `content/CONVERSION-NOTES.md` with what was added and why. Re-run `pnpm content:import-pack-000`.
**Check:** hitting the choice page gates transport, shows ChoiceBlocks sheet, choice lands in world `choiceLog`, next Home greeting references it aloud (S1.2 makes it audible).
**Commit:** `XP-S3.3 Authored choice/breathe pages in two family books`

### S3.4 — Home hierarchy per DS
Kid Home final pass: Buddy per DS spec with speech bubble = utterance verbatim, SunsRow with no letters (verify — the DS component is correct; confirm no local wrapper regressed it), BadgeShelf strip (`@ds/components/world/BadgeShelf.jsx`) showing earned + next locked silhouette.
**Commit:** `XP-S3.4 Kid Home to DS spec (buddy, suns, badge shelf)`

**Sprint 3 exit signal:** "it's nighttime in there too"; a page turn gets a reaction. Push.

---

## Sprint 4 — It's a product

### S4.1 — PARENT_PASSWORD gate
Add `PARENT_PASSWORD` to env (generate a strong default into `.env.local`, placeholder in `.env.example`). New `lib/server/parent-gate.ts`: `requireParentPassword()` checks an HttpOnly cookie `lf_parent` (sha-256 of the password) and every `/api/parent/*` route calls it; `/parent` layout redirects to a minimal password page when absent. Math-gate-style UI is NOT needed — plain password field, adult density.
**Commit:** `XP-S4.1 PARENT_PASSWORD gate on parent surface + routes`

### S4.2 — De-seed the routes
Replace `SEED_HOUSEHOLD_ID`/`SEED_CHILD_ID` imports in all `app/api/parent/*` routes and `app/parent/*` pages with household resolution from the parent-gate cookie session (single-household mode: the gate cookie maps to the one household row — store `household_id` in the cookie payload at gate time; the seed constants remain ONLY in `supabase/migrations/` and `scripts/`). Multi-child pages take `child_id` as an explicit param with a household-membership check.
**Check:** `grep -rn "SEED_" app/` returns zero.
**Commit:** `XP-S4.2 Routes resolve household from session — SEED_ constants out of app/`

### S4.3 — CI truth
`.github/workflows/ci.yml`: add `supabase/setup-cli` + `supabase start` + `supabase db reset` + `pnpm content:import-pack-000` before tests so integration specs run instead of `describe.skipIf`-skipping. Stamp `CANON_VERSION` into `qa_records` (fix `canonVersion: 'unknown'` in `lib/qa/pipeline.ts` — import from `lib/prompts/version`). Add one route-level HTTP test (boot `next start` against the CI Supabase, hit `/api/child/shelf` 401 + 200 paths).
**Commit:** `XP-S4.3 CI runs integration tests + canon version stamped in QA records`

### S4.4 — Trust surface truth-pass
`/parent/privacy` page: verify every claim against the code as it now exists (recordings parent-visible/deletable, buckets private/public, budgets). Fix drift. Add per-book provenance line in Parent Corner book detail: "written with your universe · QA: <status> · art approved <date>".
**Commit:** `XP-S4.4 Privacy truth-pass + per-book provenance`

**Sprint 4 exit signal:** a stranger with every URL sees nothing and spends nothing; you'd screen-share Parent Corner without wincing. Push.

---

## Final acceptance (do not skip)

Run the Saturday Drive flow on a phone-sized viewport (390×844), sound on, as a user — not as curl: cold open → greeting aloud → chapter map → narrated painted page → tap-word seek → star to WordCapsule → choice page spoken + chosen → checkpoint spoken, answered, mercy path checked → sun + badge celebration → Parent Corner shows the transcript, the choice, the word. Screenshot each beat. Anything that fails becomes a fix-forward commit, then re-run. When all beats pass: update README status + CLAUDE.md, final push, and report against the **top-level done-signal** — "a stranger's kid rides all 8 beats and nothing feels like a demo" — with an honest list of anything that still does.
