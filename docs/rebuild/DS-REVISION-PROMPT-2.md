# Design-System Revision Prompt — Round 3 (post second acceptance run)

*Paste everything below the line into Claude (design) with the v2 design system attached. Second Saturday Drive run confirmed all 13 round-2 fixes landed with no regressions — the state vocabulary, mercy flow, transport invariants, and density switch passed twice. What remains is a different kind of gap: v2 has sound parts but missing assemblies. This round adds the screen-level patterns the flow exposed, plus one blocker. Nothing that passed may change.*

---

## The blocker

**1. Star affordance tap target (16px).** The star icon at a tapped word is 16px — against the system's own 44px kid floor, and physically unhittable for a 4-year-old in a moving car. Fix per the tester's recommendation: after a word tap, the **entire word capsule becomes the star target** (word + star as one ≥44px hit area); the 16px icon stays visual-only. Specify persistence while you're in there (finding 12): how long the affordance stays armed, what dismisses it (next word tap moves it — fine, but say so), and the reduced-motion treatment of its appearance.

## Missing assemblies (the 9 gaps — mostly screen-level patterns, not components)

**2. Reader chrome.** Define the reader's persistent top bar as a spec'd pattern: capsule back button · **WordCapsule landing slot** · compact Buddy, inside the sanctioned top scrim. This also answers finding 8: the quiet sync capsule's reader placement is the top-bar right slot (or explicitly nowhere — decide and write it down).

**3. Sheet as a standalone pattern.** The sheet is currently a ChoiceBlocks prop; the buddy's question had nowhere sanctioned to live over art, forcing inline invention. Promote **Sheet** to its own component/pattern with slots: optional Buddy + speech line, content (ChoiceBlocks, or future uses), rising over the bottom two-thirds. ChoiceBlocks' sheet prop delegates to it.

**4. Full-page painting state.** PaintingWash is a rounded card; a page mid-generation needs an edge-to-edge full-bleed variant (no card radius) with the shimmer, the utterance, and a defined handoff into `--motion-develop` when art arrives. Also add `lf-paint` to the reduced-motion equivalence list explicitly (finding 18) — a calm static two-tone with a slow opacity pulse, not the global kill-all fallback.

**5. ChapterMap large-tile variant.** Primary navigation for a pre-reader needs a full-screen map variant: large art tiles (≥ the primary 56px target by a wide margin), "you are here" marking, done/current/ahead states, designed to hold real art *and* to degrade gracefully to tinted washes when art hasn't generated yet (that degradation is a real product state, not a placeholder).

**6. Choice-evidence component for Parent Corner.** A child's spoken idea ("leave a berry by the door") woven into the story is A11-grade evidence, same standing as checkpoint answers. Add **ChoiceRecord**: the choice moment (page/chapter), options offered, what he chose or said (transcript), and how the story used it. Same density and factual tone as CheckpointTranscript.

**7. MicOrb timing spec.** Define the state-machine timings the tester had to guess: max listening duration, silent-timeout and its behavior (returns to idle + gentle utterance), processing expectations, and the micState value during `mercy='hint'` with the re-arm rule (finding 13 — include the "tap the little mic to try again" nudge as an official slot, not an invention).

**8. Earcon trigger map.** Keep earcons as prose descriptions (assets come later) but add the missing system layer: a table of every earcon → trigger → priority class → ducking rule relative to narration and buddy speech → reduced/silent-mode behavior. Sound must have the same rule-governed structure as color and motion.

**9. Celebration queue primitive.** "Don't stack celebrations" needs a mechanism: a specified queue (sun-moment → badge → wordbook-milestone ordering, one at a time, next starts after previous settles + gap), and Celebration (and any matchMedia reader) gets a **reduced-motion prop/context override** so the preference is testable and token-driven (finding 3).

## Rule cleanups (nitpick sweep — cheap, do them all)

**10. Numerals-as-UI contradiction (finding 11).** The kit's own proof reader shows "page 5 of 12" while content rules forbid numerals on kid surfaces. Resolve: position indicators on kid surfaces are visual (dots/progress) + voice; amend the rule or the precedent so they agree.

**11. Speech = utterance rule (finding 17).** Where a Buddy shows a speech bubble and speaks, the visible text and the utterance MUST be identical — add as a content rule ("text is a caption to the voice, verbatim").

**12. Parent section header (finding 15).** The hand-rolled uppercase h2 used across parent surfaces becomes a `SectionHeader` primitive.

**13. Hand-font doc drift (finding 16).** Tokens say Gochi Hand; ChoiceBlocks and WordbookEntry docs say Caveat. Fix the docs to the token.

## Deliverables

1. Updated system with the 13 items above and nothing else changed.
2. CHANGELOG mapping each change to its run-2 finding number.
3. Same exit bar, third run: the Saturday Drive test will be rerun against this revision. Ship when the gap report is **nitpicks only** — with particular attention to "zero inline invention," which scored 2.5/5 on run 2 because the assemblies above didn't exist. If run 3 still surfaces new *pattern-level* gaps (not nitpicks), the response is one more targeted round, never a rethink — two consecutive runs have confirmed the foundations.
