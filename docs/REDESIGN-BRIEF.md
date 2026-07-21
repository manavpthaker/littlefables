# Design & Build Brief — Reading & Comprehension (2026-07-20)

> Source of the **Redesign 2026-07-21** implementation (see `PRD.md` §3-R addendum,
> `design-system/CHANGELOG.md` "Redesign 2026-07-21"). This is the condensed
> in-repo record of the uploaded brief; where it re-states existing PRD
> requirements (A2/A9/A10/A11/B5) the PRD numbering stays authoritative.

## Product thesis

Build a voice-first early-reading app for a pre-reader (age 4): a persistent
narrator reads aloud, checks understanding **by voice**, and a parent manages
the library and sees whether the child actually comprehends. Design bar:
Khan Academy Kids / Duolingo. Two interfaces, one product — the child gets a
magical story (warm, wordless-navigable, never test-like); the parent gets an
honest developmental instrument.

**Comprehension over consumption** is the differentiator: proof of
understanding, not minutes read.

## Research grounding

1. **Dialogic reading (PEER/CROWD)** — the narrator prompts, evaluates,
   affirms, expands. Never "wrong".
2. **Rare-word exposure** — sophisticated words (vast, furious, gentle) are
   collectable targets: tappable, defined in kid language, re-encountered.
3. **Active, adaptive, meaningful feedback** — difficulty tunes to kept vs.
   skipped words + comprehension accuracy; feedback names what the child got.
4. **Parent co-use doubles the effect** — surface the hidden layer, hand the
   parent an exact "say this tomorrow" line.
5. **Spaced repetition** — kept words and strategies return on a schedule.

## The four screens

- **Home** — greeting + narrator presence, gentle reading-streak suns,
  continue-hero (biggest target), swipeable shelf with layer tags
  (Sleep / Feelings / Courage / Self), word jar. Bottom tabs: Home · Library ·
  Parent (quiet grown-ups door).
- **Library** — pick a story: cover grid of ONLY the stories a grown-up
  turned on (the link between parent control and child view).
- **Reader** — read-along word highlight; collectable words glow (tap → hear,
  syllables, kid definition, keep); illustration hotspots speak what things
  are; bedtime mode (dim night palette, slower/lower voice, auto-advance,
  resolves rather than cliffhangs).
- **Parent space** — three tabs. *Insights*: min this week / words kept / day
  streak; three comprehension meters (Literal / Inferential / Retell); this
  week's story layers; "say this tomorrow". *Stories*: per-story shelf
  toggle, what each teaches, add-a-story → Maker. *Settings*: narrator voice,
  reading level Ease/Auto/Stretch, checks on/off, bedtime default, daily
  limit, band.

## The comprehension engine

- **Ladder**: literal → inferential → predictive across a book's chapters;
  **retell** (tell-it-back with a beat-by-beat story spine) is the top rung
  at book completion. Presented as a bottom sheet — story context stays
  visible, never a full-screen quiz.
- **Answer handling**: score by intent-match, not exact words; partial credit
  is real credit; two soft retries with a gentle hint, then tap-choice
  fallback; every result persists → parent meters + adaptivity.
- **Adaptivity**: the child never sees a level; the parent sets
  Ease / Auto / Stretch; Auto follows rolling checkpoint accuracy; vocabulary
  density follows accuracy + word-keeping appetite.

## Voice stack decision

All speech input records client-side (MediaRecorder) and transcribes
server-side — `webkitSpeechRecognition` is dead in installed iOS PWAs
(`docs/voice-architecture.md`). Tap-choice fallback whenever the mic can't.

## Data contract additions (all additive, inside `books.book` jsonb)

- `vocab[]` entries gain `syllables[]` + `kidDefinition`
- `page.hotspots[]` — `{x, y (0..1), label, emoji?, spoken}`, ≤3, arted pages only
- `book.layerTag` — sleep | feelings | courage | self
- `book.beats[]` — the retell spine (3–5 short story facts in order)
- per-question `expectedConcepts[]` + `fallbackChoices[]` are generated at
  checkpoint time and held server-side in `comprehension_records.payload`

Authored by the Maker for new books; `pnpm content:backfill` for existing ones.

## Explicitly out of scope

In-app story creation UI changes (the Maker stays as-is); native shell;
"Juju vs Jujy" rename (audit found the code uniformly "Jujy" — the real fix
was the roster↔canon emoji mismatch, done in P0).
