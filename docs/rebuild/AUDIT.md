# Little Fables — Codebase Audit (pre-rebuild)

**Date:** 2026-07-16 · **Scope:** full repo at commit `8f4cfc8` · **Purpose:** ground-truth assessment before rebuilding in a fresh repo. Every critical claim below was verified directly against the code, not just reported.

## Verdict

The product thinking is strong and the content is irreplaceable; the codebase is not worth carrying forward wholesale. This is really two applications in one repo (a dead v1 "creator platform" and the live `/read` kid PWA), built in ~22 prompt-driven PRs of feature-on-feature accretion. The result: a half-implemented sync engine that silently loses data today, unguarded API routes that expose real money and child-safety surface, three god-files owning most of the product, a safety pipeline whose server-side enforcement is a no-op, 205 MB of generated binaries in git, zero tests, and builds configured to ship type errors. At the same time, roughly a half-dozen modules are genuinely rebuild-quality and should be ported nearly verbatim, and the local-first architecture posture is correct and should be kept.

The rebuild is justified. Not because the code is embarrassing — because four specific defects (sync data loss, unguarded art routes, dead guardrails, schema drift) are cheaper to fix in a clean architecture than in place, and because the single-child assumption is load-bearing in 13+ files while the goal is now a polished consumer product.

---

## 1. Critical findings (live bugs / real exposure)

### C1. Cross-device sync is half-built and loses data today
- `lib/read/sync.ts:205` defines `pushState()` — **zero callsites exist anywhere** (verified by grep). Badges, wordbook, reading-day streaks, buddy choice, and world state never leave the device. A device wipe or iOS storage eviction erases them permanently.
- `pullState()` (`sync.ts:236-240`) unconditionally overwrites local `buddy` and `worldState` with the cloud blob, despite a comment claiming "we compare updated_at" — nothing does. Since `pullAll()` runs on every home mount (`app/read/page.tsx:123`), a stale cloud copy silently reverts local progress. Combined with the missing push, this is a drift-then-clobber loop the moment a second device signs in.
- Reading progress (`lf-progress-v2` / `BookProgress`) is not synced at all — "Continue" is per-device only.
- `writeJSON` swallows quota errors (`storage.ts:46-52`) and books silently truncate at 120 (`storage.ts:77`), so local-only state has no recovery path when it fails.

### C2. Schema drift silently drops books from the cloud
`types/story.ts:216` allows `BookStatus = 'complete' | 'awaiting-choice' | 'draft' | 'needs-review'` and sources including `'family'`. But `0001_reader_kid_app.sql:27-28` constrains `status in ('complete','awaiting-choice')` and `source in ('starter','generated')` — never relaxed by a later migration. `pushStory` writes these fields into those columns; every `draft`, `needs-review`, or `family` book **fails the constraint and is only `console.warn`ed**. Those books never reach Supabase. This is live data loss, verified against the migrations.

### C3. Five of six art API routes have no guard of any kind
Only `art/page` calls `sameOriginOk`/`underDailyBudget` (verified). `art/generate` (maxDuration=300, loops Gemini), `art/approve`, `art/reject`, `art/refs`, and `art/list` have neither auth, origin check, nor budget counter. An unauthenticated stranger can: burn Gemini spend in 300-second batches; **upload arbitrary base64 files into Supabase storage** via `refs` `action:'upload'`; **approve arbitrary pending images into the public bucket the child sees**; and enumerate signed candidate URLs. Cost, storage-abuse, and child-safety exposure in one gap.

### C4. The server-side safety pipeline is effectively a no-op
`app/api/story/route.ts` loads the child profile and guardrails through runtime dynamic imports (`tryLoadProfile` at :259, `safeCheckGuardrails` at :1385) with `webpackIgnore`, written when those modules "hadn't landed." The modules now exist — but they're client-oriented (they read `localStorage`), so on the server they resolve to nothing useful. Consequence: `normalizeBand` always defaults to `'4-8'`, and the `excludeTerms` deterministic gate never fires. The safety feature the generation pipeline is designed around **does not run in production**.

### C5. Circuit breakers are spoofable and fail open
`sameOriginOk` (`lib/server/guard.ts:21`) passes any request with no Origin header — every curl/script bypasses it. `underDailyBudget` fails open on Supabase errors and trusts spoofable `x-forwarded-host`. There is no per-IP limiting, so a stranger can also exhaust the child's own daily budget for free. Realistic worst-case spend if hammered: ~$15–25/day across Sonnet/ElevenLabs/Whisper/Haiku/Gemini, **plus unlimited Gemini via C3**.

---

## 2. Significant findings (architecture & maintainability)

### S1. Three god-files own the product
`app/read/parent/page.tsx` — **3,517 lines**, 52 `useState`, ~40 inline components including an entire art-approval CMS. `app/read/story/[id]/page.tsx` — **2,094 lines**, 27 `useState`, 10 `useEffect`, three separate `listen()` call sites; per-page state reset lives in one `useEffect` under an `eslint-disable exhaustive-deps`, so adding page state breaks silently. `app/api/story/route.ts` — **1,695 lines** doing prompt assembly, wire client, JSON coercion, three QA stages, wildcard detection, and routing; its soft-scoring logic is dead in-file and duplicated wholesale into `story-score/route.ts`, guaranteeing drift.

### S2. QA gate has a "ships anyway" hole and a lying pass flag
`MAX_GEN_ATTEMPTS = 2` is shared across parse failures, deterministic failures, and hard-gate failures; a story that fails hard gates on the final attempt ships anyway (`story = candidate; break` at ~:1572) as `needs-review`. When the judge is unavailable, the QA record is written as `hardGates: { passed: true }` (:1617) — a pass that never ran. Deferred soft-scoring is fire-and-forget from the client: close the tab and the book sits at `needs-review` with score 0 forever; QA records are never persisted server-side.

### S3. A dead second application and its dependency tail
`app/page.tsx`, `app/dashboard/`, `app/story/create/`, `app/auth/*`, and all of `components/` (~3,200 lines: `relume/`, `workspace/`, `chat/`, `shared/`) belong to the abandoned v1 creator platform; nothing in `/read` imports them. `zod`, `@hookform/resolvers`, `relume-icons`, `@supabase/auth-helpers-nextjs` have zero imports anywhere; `react-hook-form` and most Radix packages are reachable only from dead pages. `stores/` and `hooks/` are empty directories. The stale v1 `README.md` is what GitHub renders (it references an `.env.local.example` that isn't even tracked — the `.env*` gitignore swallows it).

### S4. No single owner of client storage
`storage.ts` treats its localStorage keys as private constants, but `sync.ts:238-256` writes `'lf-badges-v2'` etc. as raw string literals via `localStorage.setItem`, and five more modules (`kid-creations.ts`, `lighting.ts`, `profile.ts`, `azad-verse.ts`) touch localStorage independently. A key rename in one file forks the data.

### S5. Two parallel design systems, one dead
The kid app runs on the hand-rolled `read.css` token system (466 lines; genuinely good) with essentially zero Tailwind, while `tailwind.config.ts` + `globals.css` define a full shadcn HSL token set used only by dead pages. Meanwhile there are **616 inline `style={{}}` objects** under `app/read` (282 in the parent page alone), and the parent page reinvents its own `PCard`/`PButton`/`PInput` primitives instead of using anything shared.

### S6. Service worker precache is hand-maintained content
`public/sw.js` hardcodes every book's JPGs and a manually bumped `lf-read-v5` (README still says v3). Adding a book means editing the SW; forgetting the bump serves stale shells. Runtime cache has no size cap; the offline fallback returns the `/read` HTML document for any missed request, including images and audio.

### S7. Repo weight and asset sprawl
~205 MiB of git objects. `public/audio/` holds **1,810 tracked files** (~114 MB of per-page MP3s + timestamp JSONs), already regenerated wholesale once (1,798-file commit) — superseded blobs live in history forever. `design/` (20 MB, 334 files) holds four generations of design handoffs; `Inter[opsz,wght].ttf` is committed four times. Generated audio/art belongs in object storage — a model the repo itself already proved with the Supabase art pipeline.

### S8. No validation, no types at the boundary, no tests, no enforcement
No zod/schema validation on any route; `body.universe`, `idea`, `childIdea`, and interview recipes are interpolated into system prompts verbatim (fine for one family, fatal for a consumer product). `extractJSON` slices first-`{`-to-last-`}`. Zero test files exist. `next.config.ts` sets both `eslint.ignoreDuringBuilds` and `typescript.ignoreBuildErrors`, so type errors ship to prod. Observability is ~27 `console.warn` calls; model failures in `/api/respond` degrade to canned lines invisibly, so an outage would never be noticed.

### S9. Docs are a runtime dependency, and they drift
`app/api/story/route.ts` and `scripts/generate-story-pack.ts` `readFileSync` prompt material from `docs/reference/azi-verse/` at request time; copying code without docs silently degrades generation (only a warn). Sampled drift: README cache version wrong (v3 vs v5), two migrations both numbered `0001`, `docs/art-pipeline.md` references a script that doesn't exist (`generate-art.ts` vs `art-generate.ts`) and an `ART_PROVIDER` env var that appears nowhere, and it contradicts the newer `art-production-setup.md`. Two independent paginators (`convert_family_stories.py` and `add-book.ts`) both write pack-000 with different merging rules — the pack has been rewritten 8 times partly because of this.

### S10. Git history confirms the rework pattern
55 commits, ~22 PRs, 13 explicit fix commits. Pagination reworked at least three times (#5, #18, #21). Audio regenerated wholesale, then a staleness guard added after (#17). Three full presentation rebuilds (v2 → v3 "Drawn Room" → v4 reskin), each deleting the last. This is the signature of building without a stable spec — which is exactly what the fresh PRD is for.

---

## 3. Minor findings

`userScalable: false` on the shared layout is a WCAG 1.4.4 violation for the adult-facing Parent Corner; 4 of 10 `<img>` in `/read` lack `alt` (a11y is otherwise decent — 189 aria/role usages, reduced-motion respected). `uid()` is `Math.random()`-based but used as a **global** text primary key in `reader_stories` (cross-user collision fails RLS silently). The Parent Corner math gate is a child-deterrent, not security — fine, except server routes behind it are unprotected (C3). No timeouts/AbortController on upstream fetches — a hung provider call rides the full 300s. `/api/tts` has no server-side cache, so a cleared client cache pays for re-synthesis. `arrival/page.tsx` bypasses the shared speech module with a raw utterance (audio can overlap). Debug backdoor `?clock=` in `lighting.ts` is undocumented. A committed `.pyc` in `scripts/__pycache__/`. "Azad" is hardcoded across 13 files including the manifest.

---

## 4. What is genuinely good — port these

1. **Layered TTS with staleness self-healing** (`story/[id]/page.tsx:80-140`): IndexedDB cache → static file → live API, each layer's word timestamps verified against current page text so stale audio degrades instead of desyncing highlights. The hardest problem in the app, solved well.
2. **`useReaderTransport.ts`** (215 lines) — a clean media-transport brain with documented invariants ("play never navigates; prev/next never plays"). Already rebuild-quality.
3. **The closed intent whitelist** (`lib/read/intents.ts` + `/api/respond`): server coercion plus client re-validation, miss-counter with tap fallback. Exactly right for voice UI aimed at a 4-year-old.
4. **Local-first, zero-config posture**: the kid app runs with no env vars; sync is optional write-through; the reader never blocks on network. Keep the architecture, fix the push/pull symmetry.
5. **The three-stage QA design** (free deterministic checks → cheap Haiku hard gates with violations fed back into regeneration → deferred soft scoring off the hot path) — the pattern is right even though the implementation leaks (S2).
6. **`bump_usage()`** (migration 0003): atomic insert-on-conflict usage counter — a clean breaker primitive that just needs to guard every route and pair with real auth.
7. **RLS discipline** in 0001: per-operation policies, storage paths scoped by `auth.uid()`, private-candidates/public-live bucket split.
8. **The `read.css` token language** (paper/ink/pigments/colored shadows/clock-driven lighting) — coherent and ownable; make it *the* system.
9. **Versioned storage keys + `lib/read/migrate.ts`** — real migration discipline.
10. **The 7-step labeled prompt assembly** with prompt caching, band specs, and the interview→recipe traceability contract.
11. **Kid-safe failure design everywhere**: warm error boundary, 2-miss mercy, "never a dead screen."
12. **All of `content/`** (originals, pack-000, character bible) and **`docs/reference/`** (azi-verse canon, ~136 KB of plain text, coupled to code at exactly two points) — the irreplaceable family assets, trivially portable.

---

## 5. Root causes (why it got this way)

Feature-on-feature prompting without an architectural owner: each PR added capability into whatever file was already open, so pages became apps (S1). Specs lived in docs that code read at runtime but no process kept true (S9). Sync, guardrails, and scoring were each built to "landing soon" seams that never closed (C1, C4, S2). Nothing enforced quality mechanically — no tests, no type gate in CI, lint off (S8) — so regressions surfaced as fix-train commits (S10). None of these are skill failures; they're the predictable result of iterating fast on a moving target. The rebuild's job is to make the target stationary first — which is the PRD.

*Companion document: [PRD.md](./PRD.md) — the fresh product requirements for the new repo.*
