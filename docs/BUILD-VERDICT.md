# Build Verdict — Foundation or Scaffold? (2026-07-17)

Two independent deep audits (kid-facing experience; backend rigor) plus direct measurement, run against the working tree at `53a4ae0`. Question on the table: is the 5-phase build "barely a scaffold" that warrants a from-zero restart?

## Verdict

**It is a foundation with an unfinished sensory layer — and the unfinished layer is the one the child lives in.** That is why it *feels* like a scaffold while measuring like a real product underneath.

The numbers: ~6,150 LOC of app/lib code, largest file 359 lines (ceiling honored), 15 test files / 71 real assertions, CI gating typecheck+lint+test+build with no bypasses, zero TODO/FIXME/HACK, one `any`, zero direct `localStorage` calls. Three of the four archive defects are verifiably fixed in code with tests on the scariest ones (C1 sync push+outbox+retry exists; C2 schema-sync test parses the migration's CHECK constraints and asserts equality with the TS enums; C4 excludeTerms/band passed explicitly server-side). C3 is fixed on the child surface (all 10 child routes authenticate via hashed scoped token) and consciously open on the parent surface. C3a QA semantics (`blocked` on final hard-gate fail, `unverified` when judge down) are literally in code and unit-tested.

What makes it feel thin — all verified, all real:

1. **1 of 9 books has real narration.** The other 8 fall back to robotic device speechSynthesis. The pipeline exists; it was run once.
2. **Nothing in the UI speaks.** The entire voice-slot system renders inert `data-utterance` attributes; no client handler exists. The buddy "greets aloud" only in the README. Checkpoint questions are *displayed* to a pre-reader who can't read them.
3. **Tap-word seek is broken by one missing wire** — timestamps never threaded into `transportPage` (reader.tsx:75-85), so seek restarts the page. The plumbing on both sides is finished.
4. **Covers are gradient placeholders** unless art was approved; shelf cards hardcode `progress={0}`.
5. **Parent Corner ignored its own design system** — 8 of 27 accepted components (QARecord, LifecycleChip, ArtApproval, StoryMaker, ChoiceRecord, ComprehensionProfile, Sheet, BadgeShelf) are never imported; parent UI is tokens-on-plain-HTML.
6. **Parent surface is unauthenticated** with `SEED_HOUSEHOLD_ID` in 5 routes (8 files) — fine on localhost, disqualifying for deploy, and it means multi-child (Phase 5) is cosmetic: the dashboard always shows the first child.
7. Checkpoint fires only when narration finishes the last page (silent readers can't complete a chapter), and completing it doesn't advance the chapter.
8. Pack-000 contains zero choice/breathe/ask pages, so the interactive-page path never triggers with shipped content.

## Why a from-zero restart is the wrong fix

Every item above is *experience-layer completion*, not architecture. A restart discards the verified parts (auth, sync outbox, QA gates, schema safety, prompt package, cost rails — the things that took three codebases to get right) and then must rebuild them before it even reaches the layer that disappointed. The archive audit's S10 finding was exactly this loop: three presentation rebuilds because dissatisfaction with the surface kept triggering resets of the core. The surface is cheap to finish; the core is expensive to re-earn.

## The "make it feel real" punch list (days, not phases)

1. Voice-slot client handler (~50 lines; `/api/child/tts` already exists and is budget-gated) — the buddy actually greets, checkpoint questions are spoken, buttons speak on tap.
2. Thread `timestamps` into `transportPage` — one field; tap-word seek works.
3. `pnpm audio:generate` for the other 8 books (~$5–10 one-time).
4. Checkpoint: speak the question; allow completion without narration; advance chapter on completion.
5. Generate + approve covers for all 9 books; wire the real `progress` prop.
6. Rebuild Parent Corner screens *with* the 8 designed parent components.
7. `PARENT_PASSWORD` gate + remove `SEED_HOUSEHOLD_ID` from routes (resolve household from session).
8. CI: un-skip integration tests; add route-level HTTP tests; stamp `CANON_VERSION` into qa_records.
9. Author choice/breathe/ask pages into 2–3 pack-000 stories so interactive pages exist in shipped content.

Ship bar: hand the phone to Azad. If he can hear his buddy say good morning, open Bramble, tap a word and hear it, answer a spoken question, and see his sun light up — the feeling this build was missing exists.

**Scope note:** this punch list makes the build *function*. The full distance to a polished commercial app — the art library (260 pages + 9 covers), complete narration, earcons, motion/lighting, and the Parent Corner rebuilt on the designed components — is planned in [EXPERIENCE-PLAN.md](./EXPERIENCE-PLAN.md), sequenced as four sprints with the Saturday Drive flow as the acceptance bar.
