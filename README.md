# Little Fables

A reading companion for young children — built for Azad first, engineered as a polished consumer platform. A child opens the app on a phone and is greeted aloud by a buddy who remembers him; he reads picture-chapter books with word-level narration, taps words to hear and keep them, answers the buddy's questions about the story, and his world syncs across devices. Parents create stories with a single prompt and approve everything the AI produces before he sees it.

## Status

**Phase 5 + EXPERIENCE-PLAN complete.** All PRD phases shipped, then the four XP sprints (S1 It speaks · S2 It's painted · S3 It feels alive · S4 It's a product) closed the distance from "works" to "feels like a real consumer app."

- **Reader (Phases 0–1):** multi-tenant schema, scoped child-device token, `/read/story/[id]` with word-level highlight from ElevenLabs — **every book narrates** (all 9 pack-000 books, ~$23 ElevenLabs spend), tap-any-word seeks to the real audio offset, star save into wordbook, cross-device progress, offline via service worker.
- **World memory (Phase 2):** buddy roster (5 to start; living/nonliving mix), reading days, badges, comprehension checkpoints. Anthropic Haiku generates story-specific questions rotating recall/inference/prediction/connection; Whisper transcribes; judge applies mercy semantics.
- **Maker + QA (Phase 3):** prompt-first `/parent/make`. Anthropic Sonnet writes the story; three-stage QA (deterministic → hard-gate judge → soft rubric) runs server-side (audit S2 fix). C3a contract enforced. Per-book provenance line in the Books section.
- **Art (Phase 4 + S2):** Gemini Nano Banana Pro generates covers + scenes into `art-candidates` (private). Batch approval via the DS `ArtApproval` grid moves candidates to `art-live` and stitches URLs into the book jsonb. **Every book has an approved cover; Bramble's Hello is fully painted end-to-end (21 pages).** PaintingWash fallback for pages still developing.
- **The app speaks (S1):** `lib/voice/ui-voice.ts` funnels every buddy greeting, checkpoint question, mercy line, celebration, and word-save confirmation through the live `/api/child/tts` route with per-buddy voice_id + narration-priority guard. Narration always wins.
- **It feels alive (S3):** page-turn animation, watercolor-develop reveal on scene art, clock-driven paper temperature (morning/day/dusk/night), authored breathe + choice pages inside `moose-bigness` and `coocoo`.
- **Product spine (S4):** `PARENT_PASSWORD` env-gated cookie protects every `/api/parent/*` route and the parent surface. `SEED_HOUSEHOLD_ID` / `SEED_CHILD_ID` removed from all `app/` code — routes resolve household via `currentHouseholdId()`. CI runs the integration tests against a local Supabase container. `qa_records.canonVersion` stamped from `lib/prompts/version`.
- **Cost guardrails throughout:** every Anthropic / OpenAI / Gemini / ElevenLabs call bumps `usage_counters` BEFORE the external call. Rough per-transaction cost: $0.02 checkpoint, $0.05 story attempt, $0.05 per art image, ~$1 per narrated book.

**Honest remaining gaps** (nothing here is a blocker for you and Azad; all are follow-ups toward V2):
- Cast per-buddy voice IDs in ElevenLabs Voice Library and paste them into `lib/world/buddy-roster.ts` — data layer is ready, voices themselves aren't cast yet.
- Approve the pending covers (candidate art awaits Papa in the ArtApproval grid) — `pnpm exec tsx scripts/art-approve-book.ts --all --kind cover` will auto-approve the first candidate per book.
- Approve or regenerate scenes for the remaining 8 books.
- The saved-word confirmation utterance is voiced by the fallback voice, not the child's buddy (the wire path exists — needs one more `voiceId` prop hop).
- Full V2 vision at [`docs/V2-VISION.md`](./docs/V2-VISION.md).

## Quickstart

```bash
# Prereqs: Node 22+, pnpm 10+
pnpm install

# Verify quality gate green
pnpm typecheck && pnpm lint && pnpm test && pnpm build

# Dev server on http://localhost:3000
pnpm dev
```

Walkthrough after `pnpm dev`:
1. Open `http://localhost:3000` — redirects to `/parent`.
2. `/parent` opens unauthenticated (single-household mode; add PARENT_PASSWORD before deploying) → click **Send Azad to this device** → cookie set → redirect to `/read`.
3. Kid shelf renders 9 family originals. If you've read something before, a ContinueCard shows at the top.
4. Click **Bramble's Hello** → tap play → narration streams with word-level highlighting from real ElevenLabs timestamps.
5. Tap a word mid-narration → narration seeks to that word. Tap a word while paused → hear the word alone. A star appears; tap again to save (blooms into the top-bar WordCapsule).
6. Turn 3 pages → close tab → return → resumes at the same page. Open in an incognito tab (fresh minted token) → ContinueCard shows Bramble at the same page.
7. Airplane mode after a first-online visit → reload → still reads (SW cache), audio still plays (IndexedDB cache).

## Repo layout

- **[`PRD.md`](./PRD.md)** — product requirements. Pillars A–F, architecture rules (§4), phased plan (§6). Every requirement is numbered (A1, C3a, D4) — cite in commits.
- **[`docs/AUDIT.md`](./docs/AUDIT.md)** — audit of the archived codebase. C1–C5 are the four defects the rebuild exists to prevent.
- **[`design-system/`](./design-system/)** — accepted v3 (27 components, 9 token files). Consumed verbatim (PRD F1). `SKILL.md` entry; `guidelines/rules-of-use.md` binding.
- **[`reference/`](./reference/)** — Azi-Verse canon + research. Runtime reads from `lib/prompts/canon/` (built from the RTFs), not from here.
- **[`content/`](./content/)** — pack-000, family originals, character bible. Irreplaceable.
- **[`lib/reader/`](./lib/reader/)** — reader modules: `state.ts` (reducer + selectors), `transport.ts` (ported hook), `speech.ts` (layered TTS), `audio-cache.ts` (IndexedDB), `page-audio-source.ts`, `wordbook.ts`, `progress.ts`. All under ~400 lines.
- **[`lib/`](./lib/)** — auth, supabase, models, prompts, server helpers.
- **[`app/`](./app/)** — Next.js App Router. Pages are composition; state and side-effects live in `lib/`.
- **[`supabase/migrations/`](./supabase/migrations/)** — linear, date-prefixed.
- **[`public/sw.js`](./public/sw.js)** — service worker. Git holds the placeholder version; `pnpm build` stamps it with the git SHA, `postbuild` restores the placeholder for a clean working tree.

Previous implementation lives at `../little-fables [archive]/` — audited, retired, mined for the twelve carry-over modules PRD §5 lists.

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Next dev (Turbopack) on :3000 |
| `pnpm build` | Prod build. Runs `prebuild` (stamp SW) and `postbuild` (restore placeholder) automatically. |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint (400-line soft ceiling) |
| `pnpm test` | Vitest — unit + integration when Supabase is reachable |
| `pnpm audio:generate -- --book <id>` | Pre-generate ElevenLabs audio + timestamps for a book, upload to page-audio bucket. `--check` for dry-run cost estimate. |
| `pnpm content:import-pack-000` | Upsert family originals into the seed household |
| `pnpm canon:reconvert` | Re-convert `reference/azi-verse/source-rtf/*.rtf` → `lib/prompts/canon/azi-verse/*.md` |
| `pnpm db:reset` | Drop + recreate local Supabase + all migrations + seed |
| `pnpm db:types` | Regenerate `types/database.ts` from the linked hosted schema |

## Supabase

Hosted at `fzcjwsxyaweqtvroycjm.supabase.co` (Canada Central). Env vars in `.env.local` (gitignored) use the new Supabase naming (`SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWKS_URL`).

## The rules that shape everything

From PRD §4 (binding from day one):
1. Module boundaries + ~400-line file ceiling; a page is composition only.
2. One storage owner. Feature modules never touch localStorage directly.
3. **Prompts are code** — versioned package, never read from `docs/` at runtime.
4. Generated assets (audio, art, pack binaries) never enter git.
5. CI is mechanical: typecheck + lint + test + build on every PR, no bypasses.
6. **Fail closed on money, fail soft on joy.**
7. Multi-tenant from migration 0001; "Azad" is data.
