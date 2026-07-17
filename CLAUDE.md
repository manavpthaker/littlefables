# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

**Phase 2 complete (2026-07-17).** On top of Phase 1's reader, the world now remembers Azad and asks him about what he read:
- Home surface: Buddy (from roster of 5 — Bramble default, Jujy, Dory, Miko, Rocky; living/nonliving mix per §B1) with computed world-memory greeting (welcome / callback / word / streak / default tones); SunsRow for the week.
- Reading days auto-mark on reader mount; `world_states` growth counters (booksOpened, wordsSaved, daysRead, checkpointsAsked/Correct) drive greetings and badges.
- Badge auto-earn on wordbook save + reading day + checkpoint-correct → CelebrationQueue blooms in the reader.
- Comprehension checkpoints at chapter end (PRD A10/A11): Anthropic Haiku generates a warm story-specific question rotating recall/inference/prediction/connection; Whisper transcribes the child's spoken answer; Anthropic judges with mercy semantics (never "wrong"). Records saved to `comprehension_records`.
- Parent Corner extended: CheckpointTranscript per record, WordbookEntry grid, SunsRow, BuddyPicker. All inside `[data-density="parent"]`.
- D2 sync engine: `lib/sync/outbox.ts` — IndexedDB queue for offline-tolerant mutations. saveWord + pushProgress route through the outbox. Background flush on online + 30s timer. StateBanner surfaces sync state on the reader.
- `lib/anthropic.ts` + `lib/openai.ts` wrappers call `bump_usage` BEFORE every external call — PRD §4.6 fail-closed on money.

**Next:** Phase 3 — Maker + QA pipeline (PRD C). Generated stories with real branching choices (A4 ask/choice/breathe), C3a status contract, three-stage QA. See PRD §6.

The previous implementation is at `../little-fables [archive]/` — audited in `docs/AUDIT.md`, mined for the twelve modules worth porting (listed in PRD §5), and retired. Do not extend it. Do not port whole files without checking against the audit's "leave behind" list.

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Next.js dev (Turbopack) on :3000 |
| `pnpm build` | Prod build (fails on type errors). Runs `prebuild` (stamp SW) + `postbuild` (restore placeholder). |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint (400-line soft ceiling) |
| `pnpm test` | Vitest (unit + integration if Supabase reachable) |
| `pnpm audio:generate -- --book <id>` | Pre-generate ElevenLabs audio for a book (`--check` for dry-run) |
| `pnpm content:import-pack-000` | Upsert family originals into seed household |
| `pnpm canon:reconvert` | RTF → `lib/prompts/canon/azi-verse/*.md` (pandoc) |
| `pnpm db:reset` | Drop + recreate + apply migrations + seed |
| `pnpm db:types` | Regenerate `types/database.ts` from linked hosted schema |

Hosted Supabase: `fzcjwsxyaweqtvroycjm.supabase.co` (Canada Central).

## The source-of-truth documents

- **`PRD.md`** — product requirements. Pillars A–F, architecture rules (§4), phased plan (§6), carry-over inventory (§5). Every functional requirement is numbered (A1, C3a, D4, …) for citation. When writing code, cite the requirement it implements.
- **`docs/AUDIT.md`** — what broke in the archive and why. C1–C5 are the live-bug findings the rebuild is designed to prevent; S1–S10 are architectural anti-patterns to avoid. Section 4 lists what to port near-verbatim.
- **`design-system/`** — accepted v3 design system. Consumed **verbatim** per PRD F1. `SKILL.md` is the entry point; `guidelines/rules-of-use.md` is the binding composition + voice spec; `tokens/` is the token package (also mirrored in `tokens/tokens.json`); `components/*/**.jsx` are reference implementations (design prototypes, not the runtime library). `CHANGELOG.md` logs three token-hygiene nitpicks scheduled for Phase 0.
- **`reference/`** — Azi-Verse canon and research. This becomes the versioned in-repo prompt package (PRD §4.3 — "prompts are code"). **Re-convert from `reference/azi-verse/source-rtf/`**; the existing `.md` conversions are lossy (e.g. `story-creation-instructions.md` dropped the Project overview). Never read canon from `docs/` at runtime — that was archive anti-pattern S9.
- **`content/`** — irreplaceable family originals, `pack-000-family-originals.json` (7 stories, 12 chapters, 279 pages), character bible, and `CONVERSION-NOTES.md` documenting the additive schema fields (`parentGuide`, `breathe: true`, `originNote`) the reader must support.

## Binding rules (PRD §4)

These are non-negotiable and predate any code:

1. **Module boundaries, ~400-line soft file ceiling.** Feature modules (`reader/`, `buddy/`, `world/`, `maker/`, `parent/`, `sync/`, `qa/`); pages are composition only. Never repeat the archive's 3,517-line `parent/page.tsx`.
2. **One storage owner.** A single client persistence module owns every key/schema/migration. Never scatter `localStorage.setItem` across features (audit S4).
3. **Prompts are code.** Canon/rubric/templates live in a versioned package imported by the engine and pack pipeline. Docs describe; they are never load-bearing.
4. **Generated assets never enter git.** Audio, art, pack binaries → object storage/CDN with a manifest. The repo carries source prose, canon, code (audit S7 shipped 205 MB of git objects, do not repeat).
5. **Quality is mechanical.** CI runs typecheck (no `ignoreBuildErrors` — that was archive S8), lint, tests on every PR. Minimum test floor: sync merge logic, QA gate outcomes (incl. C3a), storage migrations, pagination, prompt-assembly snapshots, route validation.
6. **Fail closed on money, fail soft on joy.** Generation/spend paths fail closed (PRD D4). Child-facing rendering fails soft (PRD F3). Do not confuse the two directions.
7. **Multi-tenant from migration 0001.** `households → parents → children`; RLS per-operation. "Azad" is data, never code (archive hardcoded him in 13 files). UUIDs from `crypto.randomUUID()`, not `Math.random()`.

## The four defects the rebuild exists to prevent

When designing anything sync-, auth-, safety-, or schema-adjacent, verify against these archive failures (AUDIT C1–C4):

- **Sync must be bidirectional and merge by `updated_at`** — no missing `pushState`, no blind cloud-clobber of local state. Failures queue and surface in Parent Corner, never silently drop.
- **Schema drift is impossible** — DB constraints and TS types generated from one definition (PRD D7). No repeating archive's `BookStatus` enum vs check-constraint mismatch that dropped drafts on the floor.
- **Every AI/mutation route authenticates** — parent magic link + child-device scoped household token (PRD D3). Nothing rides on Origin headers. Every route has zod validation (PRD D6).
- **Server-side safety pipeline actually runs on the server** — `excludeTerms`, band, guardrails are passed explicitly in request/server context, not lazy-imported from client-oriented modules (audit C4).

## Design system usage (non-negotiable when building UI)

From `design-system/guidelines/rules-of-use.md` — enforce mechanically:

- **Terracotta = tappable action only.** Never for status, decoration, or non-interactive elements.
- **Over-art content uses exactly one of four patterns**: scrim, capsule, panel, sheet. Nothing ad-hoc goes over art.
- **Voice-slot spec**: every kid-facing component has an `utterance` prop; components speak when they appear or when tapped; UI speech never talks over narration (priority: narration > checkpoint question > tap feedback > ambient).
- **Reader transport contract**: play never navigates; prev/next never auto-play. Port `useReaderTransport` verbatim (PRD A3).
- **Parent surfaces**: always inside `[data-density="parent"]`; show the true QA record including `blocked`/`unverified`; never soften failures for parents.
- **Kid surfaces**: no numerals for position (dots + voice); reading text over art always on `--wash-panel`; `userScalable: false` only on kid surfaces, never Parent Corner.
- **iPhone-first**: every kid surface must be usable one-handed on portrait phone; iPad is expansion, never the layout phones adapt down from (archive was implicitly iPad-first).

## Phase 0 exit criteria

A signed-in child device renders a synced shelf; zero red CI. Prerequisites: repo scaffolded, CI with type/lint/test gates, multi-tenant schema with generated types, household auth + child-device token, design tokens wired in, prompt package built from `reference/`, pack-000 imported. See PRD §6 for full phase breakdown.

## When editing

- Edits to `PRD.md` are spec changes — treat them like breaking API changes and mention downstream impact (which pillar/phase moves).
- Edits to `design-system/` require a `CHANGELOG.md` entry; the system was accepted 2026-07-17 after two Saturday Drive acceptance runs — don't silently mutate accepted specs. Do not modify the JSX components; add ambient types in the root `design-system.d.ts` instead.
- Content in `content/originals/` and `reference/azi-verse/source-rtf/` is irreplaceable source material. Never overwrite; convert into derived files under `lib/prompts/canon/`.
- Every route handler in `app/api/*` MUST call `requireChildDevice()` from `lib/server/require-auth.ts` — no route is guarded by middleware alone (audit C3 fix). Parent auth was removed (single-user mode); add a `PARENT_PASSWORD` gate before deploying to Vercel.
- Schema changes are additive migrations under `supabase/migrations/YYYYMMDDHHMMSS_*.sql`. Update the enum lists in `lib/models/book.ts` in the same commit — `tests/models/schema-sync.spec.ts` will fail if they drift (audit C2 fix).
- Reader modules under `lib/reader/` must stay under ~400 lines each (PRD §4.1 vs archive's 2,094-line reader page — audit S1). State + selectors live in `state.ts` (pure, testable); the client orchestrator (`app/read/story/[id]/reader.tsx`) is composition only.
- Do not add another design-system component without extending `design-system.d.ts` in the same commit.
- Audio pipeline: `pnpm audio:generate -- --book <id>` uploads to Supabase Storage. Generated MP3s + timestamps never enter git (PRD §4.4).
- Every Anthropic / OpenAI call MUST go through `lib/anthropic.ts` or `lib/openai.ts` (they call `bump_usage` before the external call — audit §4.6 fail-closed on money). Direct SDK usage in routes is a lint-time smell.
- Client mutations that need to survive offline use the sync outbox (`lib/sync/outbox.ts`), not direct `fetch`. The outbox retries, backs off, and surfaces failures via `subscribe()` — the StateBanner reads that.
