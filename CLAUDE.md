# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this app is

A curated storytelling reader. One household, one polished experience.
Two modes:

- **Day** — illustrated storybook, day narrator voice, tap-a-word to hear it
- **Night** — text-only pages, sleepy narrator voice, warm-dark palette,
  no interruptions

Books are authored locally by the family and uploaded via
`pnpm content:add <folder>`. No generation runtime — no story maker, no
art gen, no comprehension gates, no word saving. Just play a story.

## Repository state

Pared back on 2026-07-29 from a generative kids-reading platform to a
storytelling reader (~90 files deleted, ~21k lines removed). The current
tree is intentionally small: reader, thin parent settings, book upload
script.

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Next dev (Turbopack) on :3000 |
| `pnpm build` | Production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest |
| `pnpm content:add <folder>` | Upload a book folder |
| `pnpm db:reset` | Local Supabase reset + migrations |
| `pnpm db:types` | Regenerate `types/database.ts` |

Hosted Supabase: `fzcjwsxyaweqtvroycjm.supabase.co`.

## Binding rules

1. **No LLM calls at runtime.** No Anthropic, OpenAI, Gemini in `lib/`.
   All text is authored; all narration is either pre-generated MP3 or
   browser speech synthesis. ElevenLabs is only hit for word-tap TTS
   (via `/api/child/tts`).

2. **Books are files, not database records.** The source of truth for a
   book is its folder under `content/books/<slug>/`. The DB row is a
   deployment cache. Re-running `pnpm content:add` on an updated folder
   overwrites the row.

3. **Two voices, always.** Day = illustrated + narrator voice. Night =
   text-only + sleepy voice. The reader auto-switches on the bedtime
   window; a top-right chip flips it manually. Never combine them
   ("night with art" or "day with sleepy voice" would break the mode's
   purpose).

4. **Fail soft on joy.** Missing night audio? Fall back to day audio.
   Missing day audio? Fall back to browser TTS. Missing timestamps?
   Word-tap restarts the page instead of seeking. Nothing that can
   fail should stop a story mid-page.

5. **Multi-tenant schema stays.** Single-family posture, but the
   `households → parents → children → child_devices` chain remains so
   the app could open up later without a schema migration.

6. **Design system consumed verbatim.** `design-system/` components are
   imported into the app. Don't modify DS `.jsx` files; wrap or extend
   from `app/` if a new behavior is needed. Add types to root
   `design-system.d.ts`.

7. **No gate on the kid surface.** `/read` opens to whoever has a child
   device token. The parent surface is behind no password either
   (single-family). If this ever leaves the family, restore the gate
   from git history at `lib/server/parent-gate.ts`.

## Where to change what

- **New book** → author in `content/books/<slug>/`, run `pnpm content:add`.
- **Reader UI** → `app/read/story/[id]/reader.tsx` (orchestrator, ~200 lines)
  + `page-spread.tsx` (illustrated / text-only rendering).
- **Reader state** → `lib/reader/state.ts` (pure reducer + selectors,
  tested in `tests/reader/state.spec.ts`).
- **Transport (play/pause/prev/next)** → `lib/reader/transport.ts`.
- **Voice selection / audio pipeline** → `lib/reader/page-audio-source.ts`
  (voice-prefixed URLs, day fallback for missing night, legacy path
  fallback for pre-pare-back books) + `lib/reader/speech.ts` (layered
  TTS: IDB cache → static file → speechSynth).
- **Day/Night mode** → `lib/reader/use-bedtime.ts` + settings on
  `children.settings.bedtime`. Palette in `app/globals.css`
  `[data-mode="night"]`.
- **Parent settings** → `app/parent/settings/*` (one page) +
  `lib/models/settings.ts` (thin schema).
- **Book upload script** → `scripts/import-book.ts` — folder convention
  is documented in the file's header.
- **Migrations** → `supabase/migrations/YYYYMMDDHHMMSS_*.sql`. Types
  regenerate via `pnpm db:types` after applying.
- **Selling custom books (Etsy)** → `docs/commerce/`. Positioning, listing
  copy, buyer intake, fulfillment runbook, email templates, market
  research. Start at `docs/commerce/README.md`.
- **Custom-order books** → `content/books/custom/<slug>/`, provisioned via
  `scripts/new-household.ts` (prints a magic URL), delivered through
  `app/f/[token]/route.ts`. Art prompts come from the `fable-art-custom`
  skill at `~/.codex/skills/fable-art-custom/`.

## What's gone (don't ask to restore without checking with the user)

The following were deliberately removed on 2026-07-29 — the household
decided to focus on curated storytelling instead of a generative
platform:

- Story generation (Maker at `/parent/make`)
- Art generation + approval (Gemini pipeline)
- Comprehension checkpoints, retell judge, adaptivity ladder
- Word saving / wordbook / spaced review
- World memory (badges, streaks, greetings, buddy roster, activeBuddy)
- Parent Insights, Stories admin, Privacy pages
- Telemetry (`usage_events`)
- All three LLM SDK wrappers (`lib/anthropic.ts`, `lib/openai.ts`,
  `lib/gemini.ts`) and their `bump_usage` money guard
- Multi-tab parent navigation

Restoring any of these means restoring a whole feature, not a file.
If the user asks for "insights" or "the maker" back, confirm scope
before deleting the pared-back replacement.

## When editing

- Reader modules should stay under ~400 lines each. Extract to
  `lib/reader/use-*.ts` hooks if state grows.
- Every child API route must call `requireChildDevice()` from
  `lib/server/require-auth.ts`. Middleware only sets `x-pathname`.
- `SEED_HOUSEHOLD_ID` is a dev seed; app code resolves via
  `currentHouseholdId()`. Do not thread the seed into `app/`.
- Generated assets (audio MP3s, illustration PNGs) never enter git —
  they're uploaded to Supabase Storage by `scripts/import-book.ts`.
- Schema changes are additive migrations. Update enum lists in
  `lib/models/book.ts` in the same commit; `tests/models/schema-sync.spec.ts`
  enforces parity.
