# CHANGELOG — Saturday Drive acceptance-test revision (2026-07-16)

Each change maps to its logged finding. Nothing outside these was touched.

| # | Finding | Change |
|---|---------|--------|
| 1 | StoryText star matching (blocker) | `components/reader/StoryText.jsx`: stem normalization (strip edge punctuation + lowercase) on both sides of the starred comparison; `onStarWord` now receives the stem; display word untouched for tap/speech. Punctuated-word case ("lantern," / "shine.") added to the reader card. |
| 2 | Missing ContinueCard | New `components/kid/ContinueCard.jsx` (+ d.ts, prompt.md, card entry): cover thumb + marigold progress ribbon, display title, hand chapter caption, the screen's one terracotta primary, voice slot `Keep reading …!`, kid density only, offline-identical. |
| 3 | MicOrb echo slot | `MicOrb` gains `echo` (buddy speech line, spoken) + `transcript` (italic caption). Utterance pattern documented ("A berry by the door! What a kind idea…"). |
| 4 | Kid syncing state | `StateBanner`: kid `syncing`/`synced` render the quiet variant — wash capsule + sage pulse dot, utterance "Your new pages are flying home!" spoken once, dropped while narration/question active. Rule added to rules-of-use. |
| 5 | Two-stage mercy | `Checkpoint`: `mercy` is now `'hint' \| 'given'` (true = hint) with distinct treatments (butter ring curious vs settled given-answer) + `onMoveOn` "The story moves on" affordance so mercy never dead-ends. |
| 6a | Parent evidence | New `components/parent/CheckpointTranscript.jsx`: full exchange — question, every transcribed attempt with judge outcome, mercy outcome, signal recorded. |
| 6b | WordbookEntry density | Sizes now token-driven (`--text-hand`/`--text-body`/`--text-caption`; parent `--text-hand: 15px` added) — same primitive, adult scale inside `[data-density="parent"]`. Parent example added to world card. |
| 7 | Unicode-star violation | StoryText (and WordbookEntry's owned overlay) now use the drawn 2px star `Icon` with a new `fill` prop; ★/☆ glyphs removed. |
| 8 | Voice-slot length rule | rules-of-use: two utterance classes — UI utterances (≤12 words, interruptible) vs buddy turns (conversational, queued as one turn, checkpoint-priority interrupts). Buddy + Checkpoint d.ts updated. |
| 9 | SunsRow violations | Letter day-labels removed (position + voice carry meaning); today = marigold ring + breath, terracotta ring removed (terracotta = action only). |
| 10 | Star-save landing | New `components/kid/WordCapsule.jsx`: wash-capsule pill (filled star + word in hand font), blooms on save, lands in the reader top bar. Adopted in rules-of-use as the required visible end point. |
| 11 | ChoiceBlocks over art | `ChoiceBlocks` gains `sheet` — paper sheet rising over the bottom two-thirds (reach zone). "Sheet" added as the 4th sanctioned over-art pattern (scrim / capsule / panel / sheet). |
| 12 | Watercolor develop | `tokens/motion.css`: `--dur-develop: 1400ms`, `@keyframes lf-develop` (blur + desaturate → sharp, wet-paper-drying), packaged as `--motion-develop`; reduced-motion scope swaps it to a simple fade. Motion card updated. |
| 13 | Offline placement | Codified in rules-of-use + StateBanner d.ts: kid Home = bottom of scroll, spoken once per session; reader surfaces show nothing when offline. |

# CHANGELOG — Round 3 (post second Saturday Drive run, 2026-07-17)

| # | Finding | Change |
|---|---------|--------|
| 1 | Star target 16px (blocker) | StoryText: after a word tap the WHOLE word capsule is the star target (second tap on the armed word saves); the 16px icon is visual-only (pointer-events none). Persistence spec'd: armed until another word tap moves it or the page turns, no timeout; reduced-motion = star fades in. |
| 2 | Reader chrome (run-2 f8) | New `ReaderTopBar`: capsule back · WordCapsule landing slot (center) · quiet sync capsule + compact Buddy (right), inside the top scrim. Sync's ONLY reader placement is that right slot. Proof reader now uses it. |
| 3 | Sheet standalone | New `Sheet` component (optional Buddy + verbatim speech line + content, rising over the bottom two-thirds); `ChoiceBlocks sheet` delegates to it (string value = speech line). |
| 4 | Full-page painting (run-2 f18) | `PaintingWash fullBleed` (edge-to-edge, no radius, develop handoff documented); painting shimmer now runs on `--motion-paint`, whose reduced-motion value is a calm static two-tone with a slow opacity pulse (BookCard updated too). |
| 5 | ChapterMap large variant | `size="large"`: 128px wrapping art tiles, bigger done-checks, same you-are-here ring; wash-degrade while art generates documented as a real product state. |
| 6 | Choice evidence | New `ChoiceRecord` (parent): choice moment, options offered (picked highlighted), spoken-idea transcript, how the story used it. Same tone as CheckpointTranscript. |
| 7 | MicOrb timings (run-2 f13) | Timing contract in source + d.ts: listening max 10s, silent-timeout 6s → idle + gentle utterance, processing ≤3s then hands to buddy thinking; mercy='hint' ⇒ micState idle re-armed with the official `nudge` slot ("tap the little mic to try again"). |
| 8 | Earcon trigger map | rules-of-use: full table — earcon → trigger → priority class → ducking/yield rule vs narration & buddy speech → reduced/silent behavior. |
| 9 | Celebration queue (run-2 f3) | New `CelebrationQueue` (sun → badge → word order, one at a time, 600ms settle gap); `Celebration` gains a testable `reducedMotion` override. |
| 10 | Numerals-as-UI (run-2 f11) | Rule codified: kid position = dots/bar + voice, numerals banned; proof reader's "page 5 of 12" replaced with progress dots + spoken utterance. |
| 11 | Speech = utterance (run-2 f17) | Content rule added: bubble text and utterance are identical, verbatim. Buddy + Sheet docs updated. |
| 12 | SectionHeader (run-2 f15) | New parent primitive; hand-rolled uppercase h2s in Parent Corner screens replaced. |
| 13 | Hand-font doc drift (run-2 f16) | Remaining "Caveat" references in ChoiceBlocks.d.ts / WordbookEntry.d.ts / SystemStates.d.ts fixed to the token (Gochi Hand). |

# ACCEPTANCE — Final (2026-07-17)

v3 accepted as the Pillar F foundation after two full Saturday Drive acceptance runs plus a final mechanical audit
(reduced-motion coverage, tap-target scale, voice-slot coverage, density tokens, rule self-consistency: all pass).

Three token-hygiene nitpicks left for Phase 0 implementation:
1. `#FBF4E6` (icon-on-pigment) hardcoded in 6 components — promote to a token (e.g. `--ink-on-pigment`).
2. `ParentPrimitives.jsx` uses raw `#FFF6EA` where `--action-ink` exists.
3. `Icon.jsx` unknown-name fallback renders a `●` glyph — against the system's own no-glyph rule; draw a dot instead.
