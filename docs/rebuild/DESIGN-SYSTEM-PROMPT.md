# Design-System Generation Prompt — Little Fables

*Paste everything below the line into Claude (design) along with [PRD.md](./PRD.md). Attach `app/read/read.css` from the old repo as reference material if possible.*

---

## Your role

You are designing a complete design system, from scratch, for **Little Fables** — a reading companion app for young children. You are not decorating screens; you are building the foundations + component library + interaction language that a small team will implement once and never rebuild. The previous app went through **three full visual rebuilds** because it had beautiful tokens but no component system — every screen reinvented its own UI (616 inline style objects in the final codebase). Your output must make a fourth rebuild impossible.

## The product in one paragraph

A child (first user: Azad, 4 years old, reads at a 5–6 level) opens the app on an iPhone — usually handed to him in the car or during quiet time — and is greeted aloud by a buddy character who remembers him. He picks a picture-chapter book from a shelf, and the app reads it to him with word-by-word highlighting over full-bleed watercolor art. He can tap any word to hear it, star it to keep it, answer the buddy's spoken questions about the story, make choices (including "tell me YOUR idea" by voice), earn badges and reading-day suns, and collect words. His parents create new stories with a single prompt, review everything the AI writes, and approve every image before he sees it. Full PRD is attached — treat its Pillar F (design system), Pillar A (reader), and Pillar B (buddy/world) as binding requirements.

## The two users, and the ergonomic truth about each

**The child (4–8) is the primary user and cannot be assumed to read UI text.**
- Every actionable element must be identifiable by shape, color, position, and **voice** — the app speaks its interface. Design every component with an "utterance" slot: what it says when it appears or is tapped.
- Motor reality of a 4-year-old: primary touch targets ≥ 56px, minimum 44px, generous spacing between adjacent targets, no gestures more complex than tap and swipe, no time-pressured interactions, forgiving hit areas.
- Cognitive reality: one primary action per screen; progressive disclosure; state changes always animated (things never teleport); sound + motion carry meaning that text carries for adults.
- Emotional reality: **no dead ends, no failure states.** Errors are warm characters ("the story kitchen is resting"), never dialogs. Wrong answers get mercy, not red. Nothing is ever locked, grayed out, or punitive — locked badges are silhouettes with promise, not padlocks.

**The parent is the secondary user with opposite needs.**
- Dense, legible, information-forward: story lifecycle states, QA records, comprehension transcripts, art approval queues. The old app bolted parent screens onto kid tokens and shipped 24px labels and low-contrast ink on paper — parents need a proper adult density mode. This was retrofitted last time ("Parent Corner legibility" was a whole PR); design it as a first-class **density theme** from day one, same token architecture, different scale.

## Heritage: what to honor, and what to fix

The previous system's **token vocabulary is worth keeping as a starting point** — not its implementation. Its language:

- Surfaces: warm paper (`#F4EBD8` / bright `#F9F2E3` / deep `#EADCC0`) — a storybook, not a screen.
- Ink: warm browns (`#46362A` / soft / faint), never pure black.
- Ten "pigments" (marigold, butter, terracotta, sage, river, teal, berry, dusk, bark, plum) — watercolor-derived accents; terracotta = action.
- Colored shadows (cool `rgba(93,106,138,.28)` / warm) — nothing casts gray.
- **Clock-driven lighting**: the app's ambient light shifts with time of day (morning sky → lamplight pools at dusk). Keep this idea; it made the app feel alive.
- Type: display serif (Young Serif), body serif (Alegreya), a child-handwriting accent (Caveat), Inter for parent surfaces. Reading text 28–32px / 1.52.
- Motion named by feeling: breath (2600ms), wobble, bloom, page-turn (700ms).

**What was broken — your actual assignment:**
1. **Tokens without components.** There was no component library at all: no specified button, card, list row, sheet, or dialog. Every screen hand-rolled UI; the parent screen invented its own `PCard`/`PButton` primitives. Deliver a full component inventory with anatomy, states, and usage rules — this is the core deliverable.
2. **No interaction-state language.** Listening (mic open), thinking (LLM working), speaking (buddy talking), painting (art generating), offline, syncing — each screen improvised these. Design them **once** as a system-wide state vocabulary (visual + motion + sound cue per state).
3. **Density had no system.** Kid screens and parent screens fought over one scale; "density outlier" fixes recurred across PRs. Deliver explicit kid/parent density modes.
4. **UI vs. full-bleed art was never resolved.** Reader pages are edge-to-edge watercolor; controls floated over art with ad-hoc washes. Define the overlay system: scrims/washes, safe areas, contrast guarantees for word-highlight text over arbitrary art.
5. **Navigation depended on reading.** Some flows still needed text comprehension. Every kid-facing navigation decision must work purely on icon + color + position + spoken cue.

## What to design (deliverables)

### 1. Foundations
Color (paper/ink/pigments evolved as you see fit — justify changes; include the clock-lighting system as ambient theme layers; contrast-checked pairs), typography (kid reading scale + parent density scale, with word-highlight treatment specified: current word, spoken-so-far, upcoming), spacing/radius/line-weight, elevation via colored shadow, motion (named durations/easings, page-turn choreography, reduced-motion equivalents for every animation), sound (earcon palette: tap, star-earned, page-turn, checkpoint-correct/mercy, sync — describe character, not waveforms), iconography direction (hand-drawn line weight matching `--line-weight: 2px`).

### 2. Component library (anatomy + states + voice slot + density variants for each)
- **Shelf & book cards** (cover, progress, "art still painting" state, NEW/draft states)
- **Buddy presence** (home header with spoken greeting, in-reader compact form, speaking/listening/thinking states, milestone-arrival moment)
- **Reader page** (full-bleed art + text panel relationship, word-highlight states, tappable-word affordance + star-save gesture per PRD A9, page-turn)
- **Transport controls** (play/pause, prev/next — invariants: play never navigates, prev/next never auto-plays)
- **Mic & voice input** (idle/listening/processing/heard-you confirmation; the 2-miss mercy flow visualized)
- **Checkpoint dialog** (buddy asks, child answers by voice or taps options; recall/inference/prediction/connection variants; never quiz-styled — conversational, per PRD A10)
- **Choice blocks** (A / B / "tell me YOUR idea")
- **Chapter map** (non-reader navigation: pictures + position, "you are here")
- **Celebration moments** (badge earn, book complete, star-word collect — confetti language, restrained enough for reduced-motion)
- **Suns row, badge shelf, wordbook entries** (earned/locked-silhouette/filled-star "owned" states per PRD B5)
- **Parent components**: prompt-first story maker (one big input + one length question + Make It, per PRD C1), lifecycle chips (Draft/Checking/Published/Needs review/Blocked), QA record display, comprehension profile view ("strong on prediction, working on inference" + transcripts), art approval queue (candidate vs approved, side-by-side), retelling player, tables/list rows/forms at adult density
- **System states**: offline banner (kid-warm vs parent-informative), sync status, loading ("painting this page…"), error character
- **PWA chrome**: app icon, splash, home-screen presence

### 3. Rules of use
Do/don't examples per component; composition rules (what may sit over art, what may not); the voice-slot spec (when components speak, interrupt rules — UI speech never talks over narration); accessibility floor (WCAG AA on parent surfaces; kid surfaces: contrast for reading text over art, alt text conventions, `prefers-reduced-motion` behavior for every animation, no `userScalable` lock on parent surfaces).

### 4. Proof screens
Apply the system to five screens end-to-end: **Home** (buddy greeting + suns + continue + shelf), **Reader page** (mid-narration, word highlighted, one word starred), **Checkpoint** (buddy asking an inference question), **Story Maker** (the one-prompt flow), **Parent Corner — story detail** (lifecycle + QA + comprehension). These validate the system; if a screen needs a one-off, the system failed — fix the system.

### 5. Handoff format
Tokens as CSS custom properties (single `:root` + `[data-density="parent"]` + lighting-theme layers) and a JSON mirror; component specs as markdown (anatomy diagram, props/variants/states table, voice slot, do/don't); no framework assumptions beyond web/React.

## Constraints
Web/PWA first. **iPhone portrait is the primary canvas** — design every component and proof screen at phone size first (assume ~390×844), then define how it expands to iPad (secondary: reader spread view, side-by-side parent layouts). A 4-year-old's fingers on a phone screen make target sizes and spacing *harder*, not easier — the ≥56px primary target rule is phone-derived, and transport/mic controls must sit in the bottom third where small hands reach. Full-bleed art on a tall narrow screen changes the reader's art/text relationship — solve portrait first, don't crop a landscape spread. Full-bleed generated watercolor art is the visual center — the UI is the quiet frame, never competing. Offline is a first-class state, not an error. One system, two densities — never two systems. Every animation has a reduced-motion equivalent. Every kid-facing element has a spoken utterance defined.

## Judge yourself by
(1) Could a 4-year-old who cannot read operate every kid screen alone? (2) Could a developer build a brand-new screen using only components and rules, zero inline styles? (3) Does a parent screen feel like a trustworthy adult tool, same family, different density? (4) Would the child recognize "the app is listening / thinking / painting" anywhere it happens? (5) Is it beautiful *with* the watercolor art, not despite it?
