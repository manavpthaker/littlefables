# Rules of use

## Composition over full-bleed art
- MAY sit over art — the FOUR sanctioned patterns: **scrim** (text as `--text-on-art` inside `--scrim-bottom/top`), **capsule** (capsule-variant buttons/IconButtons, `WordCapsule`, compact `Buddy`), **panel** (`StoryText` with `overArt` on `--wash-panel`), **sheet** (`ChoiceBlocks sheet` — paper rising over the bottom two-thirds, landing choices in the reach zone). Nothing else.
- MUST NOT sit over art: naked text, primary terracotta buttons outside the scrim zone, parent components, banners. Nothing ad-hoc: if it isn't a capsule, a panel, or inside a scrim, it doesn't go over art.
- Bottom scrim + transport + mic live in the bottom third (`--reach-zone`) — small hands, one-handed phone.

## Voice-slot spec
Every kid-facing component has an `utterance` (rendered as `data-utterance`). Rules:
1. Components speak when they APPEAR (greeting, question, celebration, error) or when TAPPED (buttons, words, tiles, badges).
2. UI speech NEVER talks over narration. Priority: narration > checkpoint question > tap feedback > ambient. A word tap ducks narration for the word only, then restores (A3/A9).
3. Buddy speech uses the buddy's voice; story text uses the narrator's (E2a). UI utterances are buddy-voice.
4. Interruption: a new utterance cancels a pending one of same-or-lower priority; it never cancels narration.
5. Two utterance classes:
   - **UI utterances** (buttons, words, tiles, state pills): ≤ 12 words, warm, second person, present tense, interruptible by same-or-higher priority.
   - **Buddy turns** (greetings + world-memory callbacks, checkpoint questions, echo confirmations): conversational length, queued and spoken as ONE turn, follow the checkpoint-priority interrupt rules — never chopped mid-sentence.

## Do / don't (per component family)
- **Button**: DO one `variant="primary"` per screen; DO icon+label; DON'T gray-disable on kid surfaces (soften to 0.4 opacity only for at-edge transport); DON'T use pigments other than terracotta for actions.
- **BookCard**: DO show `painting` shimmer while art generates; DON'T show drafts/blocked stories on the kid shelf — they simply don't exist there.
- **Buddy**: DO make it the sole state indicator when present (don't add a second orb); DON'T show two buddies at once.
- **Transport**: play NEVER navigates; prev/next NEVER auto-play. Non-negotiable behavioral contract.
- **MicOrb**: DO the full cycle idle→listening→processing→heard; DO use the `echo` slot on heard — the buddy repeats the idea back with the transcription as italic caption (that's how a 4-year-old knows he was understood); DON'T time-out visibly — return to idle silently.
- **Checkpoint**: DO tint by question type; DO use the two-stage mercy — `mercy="hint"` (butter ring, curious) then `mercy="given"` (settled, the answer celebrated as his idea) with `onMoveOn` so the flow never dead-ends; DON'T style as a quiz (no numbering, no score, no timer); NEVER red, never "wrong".
- **ChoiceBlocks**: "tell me YOUR idea" is ALWAYS last, always dashed terracotta + mic. On art pages ALWAYS `sheet` — never bare blocks over art.
- **WordCapsule**: the star-save landing point — on save it blooms and lands in the reader top bar; every save gesture MUST have this visible end point.
- **Celebration**: petals in pigments only; reduced-motion = glow without particles; DON'T stack celebrations — queue them.
- **BadgeShelf/SunsRow**: locked = silhouette + "?", earned never turns off; DON'T use padlocks or checkmark clutter. SunsRow carries NO letter labels (pre-reader — position + voice carry meaning) and today is a marigold ring + breath, never terracotta (terracotta = tappable action only).
- **Parent components**: ALWAYS inside `[data-density="parent"]`; DO show the true QA record incl. `blocked`/`unverified`; DON'T soften failures ("needs a little love") — parents get facts.
- **StateBanner**: offline is a state, not an error — kid pill is warm and spoken once; parent strip is factual. Sync failures NEVER silently disappear on parent surfaces.
- **Kid syncing**: the quiet variant only — wash capsule + sage pulse dot, utterance ("Your new pages are flying home!") spoken once per session, dropped entirely while narration or a question is active. Never the parent "Syncing…" string on a kid surface. Its ONLY reader placement is the ReaderTopBar right slot.
- **Reader chrome**: the persistent top bar is the `ReaderTopBar` pattern — capsule back · WordCapsule landing slot · quiet sync capsule + compact Buddy — always inside the top scrim.
- **Sheet**: the standalone over-art pattern (buddy speech + content) — `ChoiceBlocks sheet` delegates to it; never invent another over-art container.
- **Celebrations queue**: sun → badge → word order, one at a time, next after previous settles + 600ms — use `CelebrationQueue`, never stack.
- **Offline placement**: kid Home = bottom of the scroll, spoken once per session ("visible if you look, alarming to no one"); reader surfaces show NOTHING when offline — offline is the reader's default posture.
- **ErrorCharacter**: always offers a way onward (a Button); never a modal, never "retry" jargon.

## Sound: earcon trigger map
Earcons stay prose-described (assets later); the RULES are system-level now. Priority classes: narration > buddy turn > UI feedback > ambient. "Duck" = lower other audio ~6dB for the earcon's length; "yield" = wait until the current class finishes.

| Earcon | Character | Trigger | Class | vs narration / buddy | Reduced/silent mode |
|---|---|---|---|---|---|
| tap | soft woodblock | any Button/word/tile press | UI feedback | plays over (no duck) | haptic-only / off |
| star-earned | ascending chime, sparkle tail | star-save lands in WordCapsule | UI feedback | ducks narration briefly | single soft tick |
| page-turn | paper whisper | page navigation | UI feedback | between pages (never mid-word) | off |
| checkpoint-correct | warm two-note bell | judged correct/accepted | buddy turn | yields to buddy speech, then plays | single note |
| mercy | one soft bell (same family, gentler) | mercy hint/given | buddy turn | yields | off |
| sync | distant wind-chime | quiet sync capsule appears | ambient | never over narration or buddy — drops | off |
| listening-open | gentle inhale tone | MicOrb enters listening | UI feedback | narration already paused | off |
| celebration | small bell cascade | Celebration blooms | buddy turn | yields to title utterance | single note |

## Accessibility floor
- Parent surfaces: WCAG AA (ink on paper 8.9:1; ink-soft 5.0:1 minimum body); never lock `userScalable`.
- Kid surfaces: reading text over art always on `--wash-panel` (guaranteed contrast on arbitrary art); `--text-on-art` only inside scrims; `--ink-faint` never carries meaning.
- Alt text on every image: describe the scene for the child ("Rosa holds a glowing lantern by the dark river").
- `prefers-reduced-motion`: durations collapse (see `tokens/motion.css`); equivalents — breath→static, wobble→none, bloom→fade, page-turn→crossfade, listening→steady ring, confetti→single glow, develop→simple fade.
- **Watercolor develop**: art reveals (A8 "painting this page…" resolving) use `animation: var(--motion-develop)` — edges first, color blooming inward like wet paper drying; the token swaps to a simple fade under reduced motion.
- Focus ring: 3px river, 2px offset, everywhere.

## Position indicators on kid surfaces
Numerals never appear as UI on kid surfaces ("page 5 of 12" is banned). Position is shown visually — progress dots or a thin marigold progress bar — and spoken on request ("You're on page five!"). Parent surfaces use numerals freely.

## Speech = utterance, verbatim
Wherever a Buddy (or Sheet) shows a speech bubble AND speaks, the visible text and the utterance are IDENTICAL — text is a caption to the voice, verbatim. Never paraphrase one against the other.

## Density
- One system, two densities. Set `data-density="parent"` on the surface root — tokens rescale (type, targets, radii, spacing). NEVER hand-tune a kid component to look "parent" or vice versa.
- Kid targets: 64/56/44px + 12px gaps. Parent: 44/36/32px + 8px gaps.

## PWA chrome
- App icon: buddy blob on `--paper` (no text). Splash: paper + centered wordmark in Young Serif + breathing buddy. Home-screen name: "Little Fables".
