# Little Fables

A reading companion for young children — built for Azad first, engineered as a polished consumer platform. A child opens the app on a phone and is greeted aloud by a buddy who remembers him; he reads picture-chapter books with word-level narration, taps words to hear and keep them, answers the buddy's questions about the story, and his world syncs across devices. Parents create stories with a single prompt and approve everything the AI produces before he sees it.

## Status

**Phase 0 complete.** A signed-in child device renders a synced shelf; CI is green.
- Next.js + Supabase scaffold; strict TypeScript, ESLint, Vitest, GitHub Actions.
- Multi-tenant schema (households → parents → children → child_devices → books → world/wordbook/badges/…) with generated `types/database.ts`.
- Parent magic-link auth + scoped child-device token (SHA-256 hash, HttpOnly cookie, 90-day TTL).
- Design tokens wired verbatim from [`design-system/`](./design-system/); JSX components imported via `@ds/*`.
- Prompt package at [`lib/prompts/`](./lib/prompts/) with canon re-converted from `reference/azi-verse/source-rtf/` (recovered ~1,600 lines the old .md conversions had dropped).
- pack-000 (8 family stories, 12 chapters, 279 pages) imported into the seed household.

**Next:** Phase 1 — the reader (transport, TTS layering + staleness, word-tap, service-worker precache).

## Quickstart

```bash
# 1) Prereqs: Node 22+, pnpm 10+, Docker Desktop (for local Supabase).
pnpm install

# 2) Local Supabase (Docker). Anon + service-role keys land in .env.local already.
pnpm db:start

# 3) Apply migrations + seed household + import pack-000.
pnpm db:reset
pnpm content:import-pack-000

# 4) Verify green.
pnpm typecheck && pnpm lint && pnpm test && pnpm build

# 5) Dev server on http://localhost:3000.
pnpm dev
```

Walkthrough after `pnpm dev`:
1. Open `http://localhost:3000` — redirects to `/parent/auth/login`.
2. Enter your email → check magic link at [Inbucket](http://127.0.0.1:54324) → click.
3. Land on `/parent` → click **Send Azad to this device** → cookie set → redirect to `/read`.
4. Kid shelf renders 9 family-original BookCards.

## Repo layout

- **[`PRD.md`](./PRD.md)** — product requirements. Pillars A–F, architecture rules (§4), phased plan (§6). Every functional requirement is numbered (A1, C3a, D4) — cite it in commit messages.
- **[`docs/AUDIT.md`](./docs/AUDIT.md)** — audit of the archived codebase. C1–C5 are the four live defects the rebuild exists to prevent.
- **[`design-system/`](./design-system/)** — accepted v3 (27 components, 9 token files). Consumed verbatim (PRD F1). `SKILL.md` for entry; `guidelines/rules-of-use.md` is binding.
- **[`reference/`](./reference/)** — Azi-Verse canon + research. Runtime code reads from `lib/prompts/canon/` (built once from the RTFs), not from here.
- **[`content/`](./content/)** — pack-000, family originals, character bible. Irreplaceable.
- **[`lib/`](./lib/)** — feature modules (auth, supabase, models, prompts, server). ~400-line file ceiling.
- **[`app/`](./app/)** — Next.js App Router routes. Composition only; no god-files.
- **[`supabase/migrations/`](./supabase/migrations/)** — linear, date-prefixed. One migration = one commit.

Previous implementation lives at `../little-fables [archive]/` — audited, retired, mined for the twelve carry-over modules PRD §5 lists.

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Next.js dev server (Turbopack) |
| `pnpm build` | Production build (fails on type errors) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint (400-line file soft ceiling) |
| `pnpm test` | Vitest — unit + integration when local Supabase is up |
| `pnpm test:watch` | Vitest watch mode |
| `pnpm db:start` / `db:stop` | Local Supabase (Docker) |
| `pnpm db:reset` | Drop + recreate + apply all migrations + seed |
| `pnpm db:types` | Regenerate `types/database.ts` from schema |
| `pnpm content:import-pack-000` | Import family originals to the seed household |
| `pnpm canon:reconvert` | Re-convert `reference/azi-verse/source-rtf/*.rtf` → `lib/prompts/canon/azi-verse/*.md` (pandoc) |

## Hosted Supabase (deferred)

`.env.hosted.example` parks the archive project credentials. Deploying to a hosted Supabase is a Phase 1+ decision — see PRD §8 open question 4. The archive DB holds 94 approved art artifacts worth preserving; a one-shot migration script will move them into the new schema when we're ready to link.

## The rules that shape everything

From PRD §4 (binding from day one):
1. Module boundaries + ~400-line file ceiling; a page is composition only.
2. One storage owner. Feature modules never touch localStorage directly.
3. **Prompts are code** — versioned package, never read from `docs/` at runtime.
4. Generated assets (audio, art, pack binaries) never enter git.
5. CI is mechanical: typecheck + lint + test + build on every PR, no bypasses.
6. **Fail closed on money, fail soft on joy.**
7. Multi-tenant from migration 0001; "Azad" is data.
