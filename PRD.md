# Little Fables — Product Requirements (fresh-repo rebuild)

**Date:** 2026-07-16 · **Status:** Draft for review · **Companion:** [AUDIT.md](./docs/AUDIT.md)

## 1. Product definition

Little Fables is a reading companion for young children (first user: Azad, 4, reading at a 5–6 level). It gives a child a shelf of beautiful picture-chapter books — family originals and AI-generated stories — read aloud with word-level highlighting by a buddy who greets them, remembers their choices across sessions, and celebrates their reading days. Parents create new stories through a guided maker, review everything the AI produces, and approve every image before the child sees it.

**Positioning for the rebuild:** built *for Azad first*, engineered *as a polished commercial consumer platform*. Concretely: one household in production on day one, but the data model, safety posture, auth, and copy are multi-child/multi-household from the first migration — "Azad" is data, never code. (Today he's hardcoded in 13 files; that's the single-child assumption the rebuild removes.)

**This is a daytime and car-ride app, not a bedtime app.** Weekend mornings, quiet time, and drives — which is why offline-first and audio-forward behavior are primary, not nice-to-haves.

**Primary device: iPhone.** The main UI is designed for a phone in portrait — handed to the child in the car, pulled from a parent's pocket. iPad is the secondary, larger-canvas experience and must never be the layout the phone adapts *from*: design phone-first, expand up. (The previous app was implicitly iPad-first.)

### North star
A child opens the app with no adult help, and within 10 seconds is inside a story they care about — spoken to, read to, listened to — whether or not there's a network. A parent trusts every word and image in it without having to check.

### Goals (in priority order)
1. **Joyful independent reading** — the child navigates, reads, listens, answers, and chooses entirely on their own.
2. **Trust** — nothing AI-generated reaches the child without passing safety gates and (for art) explicit parent approval. No data loss, ever: what the child earns (badges, words, streaks, retellings) is durable.
3. **Memory** — the world remembers choices, ideas, and milestones across sessions and devices.
4. **Word memory & comprehension** — the child can grab any word the moment it's interesting (hear it, keep it) and the app continuously understands *his* understanding: dynamic, context-aware questions at natural checkpoints build a live comprehension picture that shapes future questions and stories. Words he saves come back — in the wordbook, in buddy callbacks, in new stories — until they're his.
5. **Sustainable cost** — hard ceilings on AI spend; a stranger can never spend the family's money.
6. **Productizable** — a second household can be onboarded without schema changes or code forks.

### Explicit non-goals (v1 of the rebuild)
Billing/subscriptions; teacher/classroom features; Android native; social/sharing features; a public story marketplace; in-app parent-to-parent chat. The v1 "creator platform" (dashboard, visual canvas, workspace/chat components) is dead and stays dead.

## 2. Users

**The child (4–8).** Pre-reader to early reader. Cannot be assumed to read UI text — every actionable element voices itself. No dead screens, no error jargon, no unrecoverable states. Never sees unapproved art or an unreviewed generated story flagged by gates.

**The parent.** Creates stories, reviews generated content, approves art, records the family universe (interests, teaching goals, family words in Spanish/Gujarati/Hindi/Creole), listens to retellings. Needs the truth about QA outcomes, not reassurance.

**The household** (the tenant). One subscription-shaped unit owning N children and M parent accounts. All data is scoped `household → child`.

## 3. Product pillars & functional requirements

Requirements are numbered for traceability (the current codebase's §-citation habit is worth keeping). **MUST** = v1 launch; **SHOULD** = fast-follow; **MAY** = later.

### Pillar A — The Reader
- **A1 (MUST)** Page-based picture-book reader: full-bleed art spreads, chapter map entry for chapter books, straight-in for quick stories.
- **A2 (MUST)** Narration with word-level highlight from pre-generated timestamped audio; layered source fallback (local cache → bundled/static → live TTS → device speechSynthesis → text-only), with per-layer staleness verification of timestamps against current page text. *Port the existing solution.*
- **A3 (MUST)** Transport invariants: play never navigates; prev/next never auto-plays. *Port `useReaderTransport` verbatim.*
- **A4 (MUST)** Interactions inside pages: judged asks (2-miss mercy, then accept with hint), wonder questions, breathe pages, choices with three paths — A, B, or "tell me YOUR idea" (spoken idea feeds continuation as `childIdea`).
- **A5 (MUST)** Chapter end: comprehension checkpoint (A10), next-chapter hook, Next/All-done. Book complete: celebration, vocab stars (tap = hear word + meaning), tell-it-back recording with transcription, badge handoff.
- **A6 (MUST)** Ask-the-story mic available throughout, bounded to ≤2 exchanges then gentle return.
- **A7 (MUST)** Progress autosaves every page turn **and syncs** (see D2 — the current app never syncs progress).
- **A8 (SHOULD)** Generate-while-reading art: pages illustrate themselves and fade in ("painting this page…" state).
- **A9 (MUST)** Tap-any-word: every word on a page is tappable. Tap ⇒ hear the word spoken immediately (sliced from the page's existing timestamped narration audio where available; device TTS fallback), with the word visually pulsing. A small star affordance appears after the tap; tapping the star saves the word to the wordbook with an age-banded meaning and the sentence it appeared in (context is stored with the word). Hearing is instant and unlimited; saving is one optional gesture; neither interrupts narration state (transport invariants A3 apply — a word tap never navigates or pauses the story without resuming where it was). Meanings are generated once per word/band and cached server-side (D10 pattern), so repeat taps cost nothing.
- **A10 (MUST)** Comprehension checkpoints: at chapter ends (and MAY mid-chapter at natural beats), the buddy asks a **dynamically generated, context-specific question** about the story so far — grounded in the actual pages read, the child's choices from the choice log, and his `childIdea` contributions, not canned recall. Question types rotate: recall ("why did X…"), inference ("how do you think Y felt when…"), prediction ("what might happen if…"), and connection ("this is like when you chose…"). Spoken answers are judged with the existing mercy semantics (2-miss ⇒ accept with hint, echo-praise, ≤1 follow-up). **Checkpoints gate pacing, never access** — a child is never locked out of the next chapter; misses adjust difficulty, they don't punish.
- **A11 (MUST)** Comprehension profile: every checkpoint answer (question, transcript, judged signal, question type) is recorded per child into a durable, synced comprehension record. The profile drives three things: (1) next-question difficulty and type selection within a book, (2) band calibration for future story generation (feeds C2), and (3) a plain-language Parent Corner view ("strong on prediction, working on inference") with the actual Q&A transcripts — parents see evidence, not scores.

### Pillar B — Buddy & World Memory
- **B1 (MUST)** Buddy roster (living/nonliving mix preserved); spoken greeting or world-memory callback on Home; free switching; milestone arrivals with the three-beat reveal.
- **B2 (MUST)** World state: choice log with summaries, `latestCallback`, star-word book, reading-day set, badges (recognize, never gate). All device-durable and cloud-durable (D2).
- **B3 (MUST)** Reading-day suns for the week; days never turn off once earned.
- **B4 (SHOULD)** Badge shelf with locked silhouettes; celebration screen routed on next mount after earn.
- **B5 (MUST)** Word re-encounter loop: saved words (A9) don't just sit in the wordbook. The buddy occasionally uses a saved word in a Home greeting; the wordbook lets him replay word + meaning + the original sentence; and saved words are passed to story generation (C2) so they reappear naturally in new stories — a lightweight spaced-repetition loop disguised as the world remembering him. A word re-encountered and understood at a checkpoint gets its star "filled in" (owned).

### Pillar C — Story creation & QA
- **C1 (MUST)** Prompt-first creation — modeled on the Azi's Storyverse Claude project, not a wizard. One input: "What should this story be about?" — typed or spoken, a theme, topic, or moment ("Azad was scared of the car wash today"). At most one lightweight follow-up before generating: length/time ("Quick story or chapter book?" / "5 minutes or a longer one?"), with a default so a single tap on **Make it** always works. Everything else — hero, setting, cultural elements, skill targets, band, tone — is the *system's* job, inferred from the universe canon, the child profile, and the creation instruction set (that's what the canon docs are for; the parent should never fill in what the model already knows). Generation begins immediately after; per-chapter progress and success screens stay.
  - **C1a (MUST NOT)** No multi-step intake wizard. The current five-step chip flow (hero/setting/teaching goal/cultural/emotional theme) is explicitly retired.
  - **C1b (SHOULD)** A collapsed "more control" affordance for the rare case a parent wants to pin a hero, setting, or teaching goal — optional, never in the main path.
  - **C1c (MAY)** The model may ask **one** clarifying question when the prompt is genuinely ambiguous, then generates regardless — it never interrogates.
- **C2 (MUST)** Generation modes: start, chapter (with prior chapters + world state + optional childIdea), continue (branch resolution). Generation context additionally includes the child's comprehension profile (A11) for band/complexity calibration and a rotation of saved words (B5) to weave in naturally. Prompt assembly is the 7-step labeled contract with prompt caching — ported, but reading canon from a **versioned in-repo prompt package** (`lib/prompts/` or `content/canon/`), never from `docs/` at runtime.
- **C3 (MUST)** Three-stage QA, fixed from the audit's findings:
  - Stage 0 deterministic checks (free) — including the child's `excludeTerms` and band, **passed explicitly in the request/server context**, never loaded via client-oriented modules (audit C4).
  - Stage 1 hard gates (cheap judge) with violations fed back into regeneration.
  - Stage 2 soft scoring, **server-persisted** (never fire-and-forget from the client), one source of truth for rubric/weights shared by generation and scoring.
  - **C3a (MUST)** A story that exhausts attempts with failing hard gates is `blocked`, not shipped-as-needs-review. Judge unavailable ⇒ `unverified`, never `passed: true` (audit S2).
- **C4 (MUST)** Parent Corner lifecycle: Draft → Checking → Published → Needs review / Blocked, with the real QA record visible.
- **C5 (SHOULD)** Pack pipeline for batch content: brief rotation → generate → gate → dedupe → emit pack. **One pagination authority** shared by every entry path (the current repo has two that fight; pack-000 was rewritten 8 times).
- **C6 (MAY)** Seasonal/quiet story variants; parent guide notes per book.

### Pillar D — Platform: sync, auth, safety, cost
- **D1 (MUST)** Local-first: the child app is fully functional offline against local storage for all cached books; reads never block on network.
- **D2 (MUST)** Real bidirectional sync: every mutation (stories, progress, world state, badges, wordbook, comprehension records, reading days, buddy, retells) writes through to the backend; pull merges by `updated_at` per record — never blind clobber (audit C1). Sync failures are queued and retried, surfaced in Parent Corner, never silently dropped (audit C2's `console.warn` data loss is the anti-pattern).
- **D3 (MUST)** Auth: parents via magic link; the **child device holds a scoped household session** (long-lived signed token issued from a parent's device). Every API route requires it — nothing rides on Origin headers (audit C5). Math gate stays as the child-deterrent for Parent Corner UI, backed by real server auth for every privileged action (audit C3).
- **D4 (MUST)** Cost controls: per-household daily budgets on every AI route (atomic counter, `bump_usage` pattern), fail-**closed** for generation routes, per-IP rate limits at the edge, spend alerting. A stranger without a household token gets nothing at all.
- **D5 (MUST)** Art safety: generated images land in a private candidates bucket; only parent-approved images reach the public bucket the child reads from. Approve/reject/upload/list are authenticated parent actions (audit C3).
- **D6 (MUST)** Input validation (zod or equivalent) on every route; typed, schema-derived client; no verbatim interpolation of unvalidated client strings into prompts (audit S8).
- **D7 (MUST)** Schema as source of truth: DB constraints and TS types generated from one definition so drift like `BookStatus` vs check constraints (audit C2) is impossible. Migrations linear and numbered once.
- **D8 (MUST)** Observability: structured logs with request IDs on API routes; a counter/alert when fallback content is served to the child (today provider outages are invisible); QA records queryable.
- **D9 (SHOULD)** Privacy/compliance posture written down (COPPA-shaped even pre-commercial): child audio recordings are parent-visible, deletable, never used beyond transcription; data export/delete per household.
- **D10 (SHOULD)** Server-side TTS cache keyed by content hash so a cleared device doesn't re-pay for synthesis.

### Pillar E — Voice, offline & app shell
- **E0 (MUST)** Device targets: **iPhone-first** — every kid surface fully usable one-handed on a portrait phone (reader text scale, touch targets, transport controls reachable in the bottom third); iPad secondary (expanded layouts, e.g. spread view in the reader, side-by-side art approval in Parent Corner); nothing ships that works on iPad but degrades on iPhone.
- **E1 (MUST)** Service worker precache is **manifest-driven** (generated from content, never hand-edited; audit S6), versioned automatically per deploy, with a size-capped runtime cache and content-type-aware offline fallbacks.
- **E2 (MUST)** Voice identity system — voice is a character property, not a rendering detail:
  - **E2a** Distinct persistent voices per role: the narrator has one voice; **each buddy has (or can have) its own voice** — today's build already separates `NARRATOR_VOICE_ID` / `BUDDY_VOICE_ID`; the rebuild makes voice an attribute of the buddy/character record (data, not env var) so new buddies arrive with their own voice and the child hears *who* is talking. Word taps (A9), meanings, greetings, and checkpoint questions (A10) speak in the buddy's voice; story pages speak in the narrator's.
  - **E2b** Timestamped synthesis is the contract: all narration audio is generated via alignment-capable synthesis (ElevenLabs `with-timestamps` today); word-level alignment data is stored alongside every audio asset and is what drives highlighting, tap-to-hear slicing (A9), and staleness verification (A2). Any future provider must supply alignment or is fallback-only.
  - **E2c** Publish-time pre-generation: narration for published books is synthesized once at publish (pipeline + backfill script), stored in object storage keyed by content hash, served from cache — live synthesis is only for just-generated pages and dynamic buddy speech.
  - **E2d** STT is provider-pluggable (OpenAI transcribe / ElevenLabs Scribe today) behind one interface; provider choice is config, with automatic failover between them.
  - **E2e** Abstraction seams preserved: provider-agnostic `TranscriptionProvider` / `TtsSource` / `AudioSession` interfaces, feature-detected native bridge.
  - **E2f (MAY)** Voice-cloned family narration ("Papa reads it") — via ElevenLabs voice clone or Apple Personal Voice in the native shell (E3); parent-gated, per-book opt-in.
- **E3 (SHOULD)** Native iOS shell (Capacitor) fast-follow: offline STT (SFSpeechRecognizer), background audio for drive mode, Personal Voice ("Papa's voice") — per the existing voice-architecture plan.

### Pillar F — Design system
- **F1 (MUST)** One design system: **final and accepted** — lives at [`design-system/`](./design-system/) (v3, accepted 2026-07-17 after two Saturday Drive acceptance runs + mechanical audit; 27 components, 9 token files, full rules-of-use). It evolves the old `read.css` vocabulary (paper/ink/pigments/colored shadows/clock-driven lighting) and adds what the old app never had: a component library, a system-wide interaction-state language (listening/thinking/speaking/painting/offline/syncing/mercy), kid/parent density modes, and the four sanctioned over-art patterns (scrim/capsule/panel/sheet). The rebuild consumes these tokens and specs verbatim; three logged token-hygiene nitpicks fix in Phase 0 (see the changelog's ACCEPTANCE note). No parallel shadcn layer, no 600 inline style objects (audit S5). Parent Corner uses the same primitives with an adult density variant.
- **F2 (MUST)** Accessibility: alt text on all images; `userScalable` restriction only on child surfaces, never Parent Corner; keep the existing reduced-motion and aria discipline.
- **F3 (MUST)** Kid-safe failure design carried over: warm error boundary, mercy fallbacks, no dead screens.

### §3-R — Redesign addendum (2026-07-20 brief, shipped 2026-07-21)

Source: [`docs/REDESIGN-BRIEF.md`](./docs/REDESIGN-BRIEF.md). These deltas extend the pillars above; where a brief item restated an existing requirement (A2 highlight, A9 tap-word, A10 checkpoints, A11 profile, B5 re-encounter), the original number stays authoritative. Downstream impact: Reader (A), Buddy/World (B), generation context (C2), platform (D), design system (F) — no architecture rule changes.

- **A9-R (MUST, shipped)** Collectable-word depth: vocab entries carry `syllables[]` + `kidDefinition`; star-saves speak word → syllables → kid definition; `wordbook_entries.meaning` populated at save from authored vocab; Home shows the word jar (recent kept words, owned stars).
- **A10-R (MUST, shipped)** Comprehension ladder: checkpoint rung follows chapter position (literal → inferential → predictive; `connection` as cruising bonus), two recent misses step down. Checkpoints render as a bottom sheet over the page; each question generates `expectedConcepts[]` (server-held judge grounding) + tap `fallbackChoices[]` (shown on mic-denied or after both mercy stages; judged deterministically, never "wrong"). Judge instruction is explicit PEER: affirm what the child said, then expand with one new idea.
- **A11-R (MUST, shipped)** Parent Insights: minutes-read (visibility-aware session heartbeat → `reading_sessions`, greatest() idempotent), day streak, comprehension meters (correct=1/partial=0.5/mercy=0, skipped excluded, null="not enough yet"), weekly "story layers" + "say this tomorrow" bridge line (generated once per child-week, cached in `parent_insights`, fail-soft).
- **A12 (MUST, shipped)** Retell story-spine: at book completion the buddy asks for the whole story; authored `beats[]` light up as the child recounts (keyword prematch ∪ semantic judge, multi-turn, generous); audio + transcript persist to `retells` (D9) and a `comprehension_records` row with `question_type='retell'`. Skipping is always one tap — retell gates nothing.
- **A13 (MUST, shipped)** Illustration hotspots: ≤3 authored tappable points over approved scene art (`page.hotspots[]`, normalized coords), each speaks what it is at the 'tap' voice tier. Authored by vision model at art-approve time + backfill; fail-soft to none.
- **A14 (MUST, shipped)** Bedtime mode: `[data-bedtime]` night palette (F1 addendum), narration at rate 0.9 / volume 0.85 (timestamps stay aligned), chapter ends resolve with one settling line instead of a question. Manual moon toggle + parent-set auto window.
- **A15 (MUST, shipped)** Kid navigation: persistent bottom TabBar (Home · Library · quiet Grown-ups door), hidden inside the reader; dedicated `/read/library` cover grid showing only parent-enabled stories.
- **B5-R (MUST, shipped)** Re-encounter mechanics: spaced scheduler (2d fresh / 7d met / 21d owned, stalest first) feeds checkpoint generation, story generation, and a due-word Home greeting slot; `owned_at` set when a due word appears in an understood answer; encounters tracked on re-taps/replays.
- **C2-R (MUST, shipped)** Adaptivity: effective band from rolling checkpoint accuracy (≥4 answered; ≥0.8 up, ≤0.4 down) pinned by parent Ease/Auto/Stretch; vocabulary density gentle/standard/rich (needs accuracy AND word-keeping appetite). Maker authors `layerTag`, enriched vocab, `beats[]`, `retellPrompts` for new books; `pnpm content:backfill` for existing.
- **D11 (MUST, shipped)** Parent controls: `children.settings` jsonb (reading level, checks on/off, bedtime window, soft daily limit, narrator voice) via `/api/parent/settings`; per-story shelf visibility `books.shelf_enabled` (orthogonal to lifecycle status) via `/api/parent/story/visibility`, enforced in every kid-facing book query including the reader route.
- **F1-R (shipped)** DS additive evolution, all changelog'd: night/bedtime token block, missing `--honey`/`--lilac`/`--danger` defined, TabBar / WordJar / StorySpine / ParentTabs components, BookCard `tag`, ReaderTopBar moon slot, WordCapsule `owned`, ComprehensionProfile adopted. Voice priority upgraded to the spec'd four tiers (narration > checkpoint > tap > ambient).

## 4. Architecture requirements (lessons encoded, stack-agnostic)

The stack is open. Recommendation: **keep Next.js + Supabase + Vercel** for the web/PWA core — the local-first + RLS + storage-bucket model is proven here and the team velocity is in TypeScript — with the Capacitor shell (E3) as the native path, revisiting fully-native only if E3 can't hit drive-mode requirements. Whatever the stack, these are binding:

1. **Module boundaries over pages.** Feature modules (`reader/`, `buddy/`, `world/`, `maker/`, `parent/`, `sync/`, `qa/`) with a soft 400-line file ceiling; a page is composition only. No file ever again does what `parent/page.tsx` (3,517 lines) does.
2. **One storage owner.** A single client persistence module owns every key/schema/migration; sync and features go through it (audit S4). Keep versioned keys + migration discipline.
3. **Prompts are code.** Canon/rubric/templates live in a versioned package imported by the engine and the pack pipeline — not read from `docs/` at runtime (audit S9). Docs describe; they are never load-bearing.
4. **Generated assets never enter git.** Audio, art, packs' binary outputs go to object storage/CDN with a manifest (audit S7). The repo carries source prose, canon, and code.
5. **Quality is mechanical.** CI runs typecheck (no `ignoreBuildErrors`), lint, and tests on every PR. Minimum test floor: sync merge logic, QA gate outcomes (incl. C3a), storage migrations, pagination, prompt-assembly snapshots, route validation.
6. **Fail closed on money, fail soft on joy.** Generation/spend paths fail closed (D4); child-facing rendering fails soft (F3). Never confuse the two directions again (audit C5 vs the good kid-UX fallbacks).
7. **Multi-tenant from migration 0001.** `households`, `parents`, `children`, all content and state keyed by child/household; RLS per-operation as today. UUIDs from `crypto.randomUUID()`, not `Math.random()`.

## 5. Carry-over inventory (from the old repo)

**Port nearly verbatim:** `useReaderTransport.ts`; layered TTS + staleness verification; `lib/read/intents.ts` whitelist dispatcher; `read.css` tokens; storage migration pattern; 7-step prompt assembly; `bump_usage` counter; RLS policy patterns; kid-safe error surfaces.

**Port as content:** all of `content/` (originals, pack-000, character bible, conversion notes); `docs/reference/` canon (azi-verse, storyverse, littlefables — relocated into the prompt package, **re-converted from the source RTFs**: the existing .md conversions are lossy, e.g. `story-creation-instructions.md` dropped the entire Project overview section); `voice-architecture.md`, `content-pipeline.md`, `art-production-setup.md` after a truth-pass; the maintained scripts (`convert_family_stories.py` *or* `add-book.ts` — pick one paginator — plus `generate-audio.ts`, `generate-story-pack.ts`, `art-*.ts`).

**Leave behind:** the v1 creator app and `components/` tail; unused deps; `design/` handoffs (archive the two PRDs + research synthesis); `public/audio/` and `art-preview/` binaries; the five Supabase debug scripts; `backfill-pack-000.ts`; the stale `README.md`; both halves of the broken sync implementation.

## 6. Phased plan

- **Phase 0 — Foundation.** New repo, CI with type/lint/test gates, schema (multi-tenant, generated types), household auth + child-device token, design tokens, prompt package with canon imported, content import of pack-000. *Exit: a signed-in child device renders a synced shelf; zero red CI.*
- **Phase 1 — Reader.** Pillars A1–A7 + A9 (tap-any-word) + E1 against pack-000 with pre-generated audio. *Exit: Azad reads a family book offline in the car with word highlighting, taps a word to hear it, stars it; progress appears on a second device.*
- **Phase 2 — Buddy, world & comprehension.** Pillar B incl. B5; A10–A11 comprehension checkpoints + profile; sync of all world/badge/word/streak/comprehension state (D2 complete). *Exit: buddy callback references yesterday's choice made on a different device; a chapter-end question cites something Azad actually chose, and the Q&A shows up in Parent Corner.*
- **Phase 3 — Maker & QA.** Pillar C with C3a semantics, server-persisted QA, Parent Corner lifecycle. *Exit: a gate-failing story is visibly `blocked`; a passing one publishes with audio.*
- **Phase 4 — Art & polish.** D5 art pipeline, A8 generate-while-reading, F-pillar sweep, D8 observability, D9 privacy page. *Exit: stranger with the URL can spend $0 and see nothing unapproved.*
- **Phase 5 — Productize.** Second-household onboarding flow, multi-child switching, E3 native shell. *Exit: a non-family household onboards with no code changes.*

## 7. Success metrics

Child: time-to-first-page < 10s from cold open; ≥3 reading days/week sustained; tell-it-back completion rate; zero dead-screen incidents. Comprehension & words: words saved/week and share re-encountered within 2 weeks; checkpoint answer rate (he keeps answering — the signal that questions feel like conversation, not quizzes); inference/prediction trend over time in the comprehension profile. Trust: 0 unapproved images shown; 0 hard-gate-failing stories shipped; 0 data-loss events (measured: cloud state age vs local). Cost: AI spend per active reading day under an agreed ceiling with alerting; $0 spend attributable to unauthenticated traffic. Engineering: p95 file size under ceiling; CI green streak; sync-conflict test suite passing.

## 8. Open questions

1. Household token UX: how does a parent bless a new child device — QR from Parent Corner? (Recommended: QR + 6-digit fallback.)
2. Does drive mode (background audio, screen-off) block on E3 native shell, or is PWA audio acceptable for v1?
3. Retention policy for child voice recordings (retellings, ideas): keep forever, or auto-expire after transcription + N days?
4. Pack-000 audio: regenerate fresh in the new voice pipeline, or migrate the existing ~114 MB into object storage as-is?
5. When productizing (Phase 5): is the azi-verse canon a template each household forks, or does the maker build a per-family universe from scratch?
