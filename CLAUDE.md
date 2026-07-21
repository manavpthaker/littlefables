# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

**All 5 PRD phases + all 4 EXPERIENCE-PLAN sprints shipped (2026-07-18), then the Reading & Comprehension redesign (2026-07-21).**

The redesign (brief: [`docs/REDESIGN-BRIEF.md`](./docs/REDESIGN-BRIEF.md), spec deltas: PRD §3-R) rebuilt the experience around **comprehension over consumption** in four phases:
- **P0 foundations** — migration `20260721000012` (shelf_enabled, children.settings, encounter fields, comprehension payload + `retell` type, reading_sessions, parent_insights), night/bedtime tokens, kid TabBar (Home · Library · Grown-ups), 4-tier voice priority (`lib/voice/priority.ts`), roster↔canon buddy identity fix.
- **P1 active reader** — `/read/library`, Home word jar + layer-tagged shelf rail, teaching word-saves (syllables + kid definitions, meanings populated from vocab), illustration hotspots (Gemini-vision authored at art approval), bedtime mode (`use-bedtime` + `[data-bedtime]`, slower/lower narration, resolving chapter ends).
- **P2 comprehension engine** — ladder policy (`lib/comprehension/ladder.ts`), checkpoint as bottom sheet with expectedConcepts-grounded PEER judging + deterministic tap fallback, retell story-spine at book completion (`lib/comprehension/spine.ts` ∪ `retell-judge`, audio → retells bucket), B5 word-ownership loop (`word-scheduler` 2d/7d/21d, `owned_at` from understood answers, due-word greeting).
- **P3 parent + adaptivity** — Parent space tabs (Insights meters via `lib/comprehension/meters.ts` + weekly cached bridge line, Stories with per-book shelf toggles, Settings with Ease/Auto/Stretch · checks · bedtime · soft daily limit · narrator voice), minutes heartbeat → reading_sessions, adaptivity (`lib/comprehension/adaptivity.ts`) wired into checkpoint + story generation, `pnpm content:backfill`.

**Post-redesign runbook:** apply migration `20260721000012` to the hosted project, re-run `pnpm db:types` (the checked-in types were hand-synced), run `pnpm content:backfill -- --check` then for real (~1 Anthropic call/book vs the 40/day respond limit), and walk the phone acceptance script in the plan.

Phase timeline:
- **P0** scaffold + schema + prompt package + pack-000
- **P1** reader with transport port, tap-any-word, ElevenLabs (Bramble only), progress sync, SW
- **P2** world memory, comprehension checkpoints, Parent Corner, D2 outbox
- **P3** Maker + three-stage QA + C3a contract
- **P4** Gemini art candidates → approve → live, per-book provenance
- **P5** Multi-child + new-household provisioning script

Then the four **EXPERIENCE-PLAN sprints** closed the gap between "runs" and "feels like a product":
- **S1 (It speaks)** — tap-word seek fix (timestamps threaded into transportPage), `lib/voice/ui-voice.ts` speaks buddy/checkpoint/celebration/save utterances with narration-priority, narration for all 9 books, silent-reader chapter-end affordance.
- **S2 (It's painted)** — batch cover candidates for every book, DS `ArtApproval` grid in Parent Corner, per-page scene pipeline + Bramble fully painted end-to-end, real progress + no gradient placeholders.
- **S3 (It feels alive)** — page-turn motion, watercolor-develop reveal, clock-driven paper temperature, authored breathe (moose) + choice (coocoo) pages, DS Home hierarchy (buddy speech bubble + suns + badge shelf).
- **S4 (It's a product)** — `PARENT_PASSWORD` env-gate on every parent surface + `/api/parent/*` route, `SEED_HOUSEHOLD_ID` removed from all `app/` code (routes resolve via `currentHouseholdId()`), CI runs integration tests against a local Supabase container, canon version stamped in `qa_records`, privacy truth-pass, per-book provenance line.

**Deferred and honest:** cast per-buddy voice IDs in ElevenLabs; approve pending art candidates (script exists: `pnpm exec tsx scripts/art-approve-book.ts --all --kind cover`); wire the word-save confirmation to use the active buddy's voice_id (last-mile); native shell (E3 Capacitor). Full V2 vision at [`docs/V2-VISION.md`](./docs/V2-VISION.md).

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
- Every CHILD route handler in `app/api/child/*` MUST call `requireChildDevice()` from `lib/server/require-auth.ts` — no route is guarded by middleware alone (audit C3 fix). The parent surface + `/api/parent/*` run UNGATED by explicit household decision (2026-07-21): `requireParentPassword()` is an always-allow stub — keep calling it in new parent routes so the gate can be restored from git history as a one-file change. Do not expose this deployment beyond the family.
- Schema changes are additive migrations under `supabase/migrations/YYYYMMDDHHMMSS_*.sql`. Update the enum lists in `lib/models/book.ts` in the same commit — `tests/models/schema-sync.spec.ts` will fail if they drift (audit C2 fix).
- Reader modules under `lib/reader/` must stay under ~400 lines each (PRD §4.1 vs archive's 2,094-line reader page — audit S1). State + selectors live in `state.ts` (pure, testable); the client orchestrator (`app/read/story/[id]/reader.tsx`) is composition only.
- Do not add another design-system component without extending `design-system.d.ts` in the same commit.
- Audio pipeline: `pnpm audio:generate -- --book <id>` uploads to Supabase Storage. Generated MP3s + timestamps never enter git (PRD §4.4).
- Every Anthropic / OpenAI call MUST go through `lib/anthropic.ts` or `lib/openai.ts` (they call `bump_usage` before the external call — audit §4.6 fail-closed on money). Direct SDK usage in routes is a lint-time smell.
- Client mutations that need to survive offline use the sync outbox (`lib/sync/outbox.ts`), not direct `fetch`. The outbox retries, backs off, and surfaces failures via `subscribe()` — the StateBanner reads that.
