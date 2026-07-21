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

# CHANGELOG — Redesign 2026-07-21 (Reading & Comprehension brief)

Additive evolution of accepted v3 — no accepted spec mutated; every change below is a new token,
a new component, or an opt-in prop. Source brief: `docs/REDESIGN-BRIEF.md`.

| # | Change | Detail |
|---|--------|--------|
| 1 | Missing pigments defined | `tokens/colors.css` + `tokens.json`: `--honey #D9A653` (Bramble) and `--lilac #9B7FAE` (Dory) + washes — both were consumed by the buddy roster but undefined (resolved to nothing). Like marigold/butter they never carry text. |
| 2 | `--danger` defined | Alias to `--berry`, parent surfaces only — kid surfaces never show failure colors. Was referenced with a raw fallback in parent components. |
| 3 | Bedtime night palette | New `tokens/bedtime.css`: `[data-bedtime]` block — night surfaces `#1E1930/#2A2440/#171226`, flipped warm-light ink ramp (contrast ≥8:1 body), night word-highlight treatment, night over-art washes/scrims, plum lamplight glow, deep shadows. Imported after `lighting.css` so bedtime overrides any `data-lighting` stage while active. Kid-only; Parent Corner never renders under it. |
| 4 | TabBar (new kid component) | `components/kid/TabBar.jsx` (+ d.ts, prompt.md): persistent bottom bar — Home · Library · quiet Grown-ups door. ≥64px targets, no numerals, active = marigold ring + breath (terracotta stays action-only), per-tab utterance ('tap' class), bedtime-aware, hidden inside the reader. |
| 5 | WordJar (new kid component) | `components/kid/WordJar.jsx` (+ d.ts, prompt.md): Home face of the wordbook — glass-wash jar of recent kept words (owned = filled star), one tap target → Word Book, count spoken never shown. Replaces the WordsDoor pill in the app. |
| 6 | BookCard `tag` prop | Optional developmental-layer chip (top-left wash capsule, emoji or calm pigment dot — never terracotta). `status="new"` badge moves to top-right when both render. |
| 7 | ReaderTopBar bedtime slot | Optional `bedtime`/`onBedtime` moon capsule in the right slot; marigold ring while active (a state, not an action). |
| 8 | StorySpine (new reader component) | `components/reader/StorySpine.jsx` (+ d.ts, prompt.md): the retell checklist — authored beats fill in (sage wash + drawn check, watercolor develop) as the child recounts the arc. No numerals, no score, no red. |
| 9 | WordCapsule `owned` prop | Sage ring + "yours now" voice when a kept word was re-encountered and understood at a checkpoint (PRD B5 ownership). Default appearance unchanged. |
| 10 | ParentTabs (new parent component) | `components/parent/ParentTabs.jsx` (+ d.ts, prompt.md): Insights · Stories · Settings section tabs, terracotta underline on active (navigation is an action on parent surfaces). |
| 11 | ComprehensionProfile adopted | First app import of the accepted-but-unused meters component (Insights tab); ambient declaration added in the app's design-system.d.ts (also fixed its Field declaration to carry `hint`, matching FieldProps). |

# CHANGELOG — Mockup-fidelity pass (2026-07-21, same day)

The redesign shipped functionally but read as the old visual language; this pass matches the brief's
spec mockups (see `docs/REDESIGN-BRIEF.md` figures). Every change below is mockup-driven.

| # | Change | Detail |
|---|--------|--------|
| 1 | Brighter cards + action gradient | `--paper-bright` #F9F2E3→#FCF7EA (mockup card white); new `--ember #E06A45` pigment + `--action-grad` (marigold→ember) for hero CTAs/mic — terracotta stays the flat action token elsewhere. |
| 2 | TabBar emoji restyle | Emoji faces (🏠 📚 🔒) over hand labels, marigold active label, inner row constrained to the 520px phone frame; now rendered on the parent surface too (mockup shows it app-wide). |
| 3 | ContinueCard hero rewrite | Art block on top (cover or night wash), white panel with caps eyebrow + serif title + "📖 Keep reading" gradient pill. |
| 4 | BookCard square covers | 1:1 rounded-24 cover (art or the book's own `bg` wash), serif title BELOW, thin sage progress line under the title (ribbon overlay removed). `width` accepts strings. |
| 5 | ReaderTopBar in-flow | X close · caps book/chapter label · page segments (marigold current / sage read) · buddy — normal flow, no top scrim (art is a card now); moon toggle moved to a Bedtime capsule beside the Transport. |
| 6 | Reader portrait layout | Art = rounded card above the prose; text never renders over art; collectable (starred) words show as bold butter pills in StoryText. |
| 7 | Sheet chrome (checkpoint/retell) | Shared bottom-sheet: chapter segments, gradient buddy circle, caps eyebrow, centered serif question, 88px MicOrb + "Tap to talk", quiet "Skip for now". |
| 8 | StorySpine numbered beats | Mockup-driven exception to the kid numerals rule: beat circles show 1·2·3 (list order, not a score); sage fill when told. |
| 9 | ParentTabs segmented control | Deep-paper pill track, active segment lifts as a bright pill (replaces underline tabs). |

# CHANGELOG — Polish 3.0 pass (2026-07-21, same day)

Craft pass per the "3.0 Polish Spec": motion, texture, and spell-breaker removal. Art coverage and
voice casting remain parent-run steps (scripts/roster wiring are ready).

| # | Change | Detail |
|---|--------|--------|
| 1 | Sheet spring + spine cascade | New `lf-sheet-up` keyframe (rise, overshoot, settle) on the checkpoint/retell sheet; StorySpine beats develop with a 140ms stagger so a correct retell cascades. |
| 2 | MicOrb listening ripple | Two warm river rings breathe outward while listening (`lf-ripple`); idle/state colors unchanged. |
| 3 | PaintingWash as a feature | Slower shimmer, soft watercolor blooms behind, breathing brush, default copy "this one's still being painted for you…". |
| 4 | Cover craft | BookCard covers get a 1px warm inner border + inner vignette + ~5% paper grain so art meets the rounded edge cleanly. |
| 5 | Paper you can feel | Kid surfaces get a fixed ~3.5% fiber-grain overlay + faint edge vignette; clock-lighting background shifts cross-fade over 400ms (reduced-motion: off). |
| 6 | Locked badges say what they want | BadgeShelf locked items show a progression hint ("Read 3 days in a row") instead of the bare "?" (badge item `hint` prop). |

# CHANGELOG — Pixel-parity pass (2026-07-21, same day)

The prototype's exact values became the source of truth ("Match-the-Prototype Build Spec"). Where a
number is given there, that number ships — no reinterpretation. Token values snapped; `tokens.json`
re-synced to the CSS package.

| # | Change | Detail |
|---|--------|--------|
| 1 | Token value snap | `--paper #F4ECDA`, `--paper-bright #FFFCF5`, new `--sand-line #E0CFAD`; ink ramp deepened `#2B2016/#7A6A55/#9C8B75`; `--marigold #F2A03D` + new `--marigold-deep #D9822B`, new `--glow #FBD98A`; `--sage #6E9A57` + new `--sage-deep #4F7A3E`; `--teal #4E9A9E`; `--plum #8367A6`. Contrast note updated (ink/paper 8.9:1). |
| 2 | Warm shadow scale | All elevations recast on `rgba(43,32,22,…)` at .09/.13/.17/.22 — one shadow hue, four strengths; `--inset-well` kept for the jar. |
| 3 | Kid radius scale | 12/18/26/34 (was 10/16/24/32) — cards 26, hero 34, matching the prototype's corner language. |
| 4 | Reading text = display serif | `--text-reading 21px/1.6` rendered in `--font-display` (StoryText); word-current highlight moves to the `--glow` pill. |
| 5 | StoryText treatments | Collectable words: 600-weight + glow underline (gradient 62%→bottom); kept words: fern wash `rgba(110,154,87,.32)` (`keptWords` prop, d.ts updated). Butter-pill treatment retired. |
| 6 | Transport exact-size | Prev/next 44px `--paper-deep` circles; play 58px marigold→marigold-deep gradient with warm `rgba(217,130,43,.45)` shadow. |
| 7 | ReaderTopBar spec | Kicker hand 10.5px uppercase `--marigold-deep`; dots 6px, active 18px marigold pill, read = sage; buddy 42px. |
| 8 | BookCard `artRatio` prop | Cover aspect override (Home rail passes `126/158`); chip 9.5px uppercase; progress line 4px sage; shelf rail gap 13. |
| 9 | ContinueCard spec | Radius 34, art 172px `center 30%`, kicker 11px, title 21px, `--marigold-deep` white-text pill. |
| 10 | TabBar hand labels | 12.5px, 700 active, `.06em` tracking (was 16px) — matches the prototype's small hand labels under the emoji faces. |

# CHANGELOG — UX repair pass (2026-07-21, same day)

Phone-testing feedback: the Home rail wouldn't scroll, idle reader pages looked disabled, the sync
banner never left. Mechanical fixes, no visual-language changes.

| # | Change | Detail |
|---|--------|--------|
| 1 | Shelf rail actually scrolls | `Shelf` rail gains `contain: inline-size` — its cards can no longer inflate an ancestor's intrinsically-sized grid track (which left the rail wider than the screen with nothing to scroll and the tail cards unreachable behind the page's overflow clip). Plus momentum scrolling + `scroll-snap-type: x proximity`; `BookCard` gains `flex: none` + `scroll-snap-align: start` so cards neither squash nor land half-cut. |
| 2 | StoryText `dimUpcoming` prop | The upcoming-word dim (50% ink) now only applies while narration is moving. Idle/paused pages render full ink — a plain book page, not a disabled screen. Default `true` keeps prototype behavior. |
| 3 | BookCard crop bias | Covers crop `center 30%` (was `center`) — square crops favor the subject like ContinueCard, instead of fur/midsections. |
