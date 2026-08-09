# Design-System Revision Prompt — Round 2 (post-acceptance)

*Paste everything below the line into Claude (design) with the existing design system attached. This is a surgical revision, not a redesign — the Saturday Drive acceptance test scored the system "revise 6 things, then ship." The foundations (tokens, state vocabulary, over-art rules, density switch, mercy tone) passed and must not change except where named.*

---

## Your role

You are revising the Little Fables design system based on findings from its acceptance test (an 8-beat "Saturday drive" flow built at 390×844 using the system as shipped, with every gap logged). Do not restyle, re-theme, or touch anything the test passed. Every change below is traceable to a logged finding; make exactly these changes, then update the affected component cards, prompt.md specs, and rules-of-use so the docs match the code.

## Required fixes (the ship blockers from the verdict)

**1. StoryText star matching — the one true blocker.** Word-to-starred-word comparison is exact lowercase string equality, so any word carrying punctuation ("burrow." / "path,") silently never matches its saved stem. Fix: normalize both sides before compare — strip leading/trailing punctuation, lowercase, and compare the stem. The tap target and spoken slice must use the display word; the wordbook stores the stem plus the original sentence. Add a "punctuated word" case to the component card so this can't regress.

**2. Add a ContinueCard component.** The single most-used surface in the product (Home's "continue where you left off") has no component; the tester had to compose one. Spec it fully: cover thumbnail, display-font title, hand-font chapter caption ("Chapter 2 · The Little Round Door"), progress indication consistent with BookCard's ribbon, one primary action (the screen's only terracotta), voice slot ("Keep reading …!"), offline behavior (works identically), kid density only.

**3. MicOrb needs an echo slot.** The heard state hard-codes "I heard you!" with no way to echo the child's idea back — but heard-you confirmation is PRD-level behavior (A4), and the echo is how a 4-year-old knows he was understood. Add: an optional `echo` slot rendered as a Buddy speech line plus an italic transcription caption (text-as-caption-to-voice, per content rules), and document the utterance pattern ("A berry by the door! What a kind idea…").

**4. Kid-density syncing state.** StateBanner falls back to the parent string "Syncing…" on kid surfaces — jargon, and too loud. Spec the quiet variant the tester improvised: a small wash capsule, sage `--state-syncing` pulse dot, utterance spoken once ("Your new pages are flying home!"), dropped entirely if narration or a question is active. This closes the last hole in the interaction-state vocabulary.

**5. Two-stage mercy in Checkpoint.** The component has one hint slot; the 2-miss flow needs two visually distinct states — first-miss hint (butter wash, curious tone) vs. answer-given-warmly (same family, more settled, the answer celebrated as *his* idea) — plus a built-in "story moves on" affordance so the flow never dead-ends inside the component. Never red, never "wrong," in either state.

**6. Parent evidence components.** Two fixes: (a) a **CheckpointTranscript** component — the full exchange (question, each attempt transcribed, mercy outcome, comprehension signal recorded), not the single Q+A that ComprehensionProfile shows; this is the evidence A11 promises parents. (b) **WordbookEntry must respect `[data-density="parent"]`** — it currently hard-codes kid sizes (30px hand font) and shouts inside dense surfaces. Same primitive, density-aware.

## Self-contradictions to resolve (the system violating its own rules)

**7. Icon rule vs. StoryText.** The system bans unicode glyphs as icons, then renders ★/☆ in StoryText. Replace with the system's drawn star icon (2px line weight family) in both states.

**8. Voice-slot length rule.** "≤12 words" is right for UI utterances but impossible for buddy conversational turns (greeting + world-memory callback is legitimately ~19 words). Amend rules-of-use: two utterance classes — **UI utterances** (≤12 words, interruptible) and **buddy turns** (conversational length, queue as one turn, follow checkpoint-priority interrupt rules). Update the voice-slot spec on Buddy and Checkpoint accordingly.

**9. SunsRow.** Two violations on one component: letter day-labels (M T W T F S S) on a pre-reader surface, and a terracotta today-ring when terracotta means "tappable action, always and only." Fix: drop the letters (position + voice carry the meaning), mark today with a marigold ring or the breath animation instead.

## Gaps the system absorbed but should now own (promote the improvisations)

**10. Star-save landing.** Spec where a starred word visibly goes: the tester's wash-capsule pill (star icon + word in hand font, blooms on save, lands top bar) worked — adopt it as the WordCapsule pattern or design a better destination, but the save moment must have a visible end point.

**11. ChoiceBlocks over art.** Resolve the rule collision (choices happen on art pages, but ChoiceBlocks isn't on the over-art allowlist) by blessing the tester's solution: choices present on a paper sheet rising over the bottom two-thirds — which also lands them in the phone reach zone. Add the sheet to the over-art allowlist as the fourth sanctioned pattern (scrim / capsule / panel / **sheet**).

**12. Watercolor-develop reveal.** "Painting this page…" resolves with a generic crossfade; the brand moment wants a watercolor bloom (edges first, color blooming inward, saturate ramp — think wet paper drying). Add it as a named motion token (`--motion-develop`) with a reduced-motion equivalent (simple fade).

**13. Offline indicator placement.** Give "visible if you look, alarming to no one" a specified home: bottom of the Home scroll, spoken once per session; on reader surfaces, offline shows nothing (offline is the default posture there). Codify the tester's choice.

## Deliverables

1. Updated tokens/components/cards/prompt-specs with the 13 changes above — and nothing else changed.
2. A one-page CHANGELOG mapping each change to its finding number.
3. Rerun readiness: the revised system will be re-tested with the same Saturday Drive prompt. It passes when the gap report contains **no blockers, no gaps — nitpicks only**, and "zero inline invention needed" flips to pass.
