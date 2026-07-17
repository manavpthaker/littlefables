# Little Fables

A reading companion for young children — built for Azad first, engineered as a polished consumer platform. A child opens the app on a phone and is greeted aloud by a buddy who remembers him; he reads picture-chapter books with word-level narration, taps words to hear and keep them, answers the buddy's questions about the story, and his world syncs across devices. Parents create stories with a single prompt and approve everything the AI produces before he sees it.

## Status

**Phase 1 complete.** A signed-in child device reads a family book offline in the car with word highlighting, taps a word to hear it, stars it; progress appears on a second device.

- Multi-tenant schema (households → parents → children → child_devices → books → world/wordbook/badges/…) with generated `types/database.ts`.
- Scoped child-device token (SHA-256 hash, HttpOnly cookie, 90-day TTL) gates every `/api/child/*` route.
- `/read/story/[id]` renders quick + chapter books via the design-system components (`StoryText`, `ChapterMap`, `ReaderTopBar`, `Transport`, `Buddy`, `WordCapsule`, `ContinueCard`) consumed verbatim from `@ds/*`.
- `useReaderTransport` ported verbatim from the archive: play never navigates, prev/next never plays, 1.5s breath auto-turn, iOS autoplay refusal preserves intent.
- ElevenLabs pre-generated audio + word-level timestamps for **Bramble's Hello** in Supabase Storage `page-audio` bucket, cached in IndexedDB with staleness guard. Other 8 books fall through to device speechSynth.
- Tap-any-word: mid-narration = seek, paused = speak-alone; second tap saves to wordbook.
- Progress syncs across devices via debounced write-through to `book_progress`.
- Service worker registered post-build with git-sha-stamped cache name; cache-first for immutable content, network-first for HTML, offline fallback shell.

**Next:** Phase 2 — Buddy, world memory, comprehension checkpoints, full D2 sync merge engine.

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
