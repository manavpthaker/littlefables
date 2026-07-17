# UI Test-Case Prompt — Stress-Testing the Design System

*Paste everything below the line into Claude (design/build) along with two attachments: (1) the generated design system, (2) PRD.md. This is the acceptance test for the design system — run it before the system is declared done.*

---

## Your role

You are implementing one real product flow for **Little Fables** using ONLY the attached design system. This is not a design exercise — it is an acceptance test *of the system*. The rules:

1. **System-only.** Use only the tokens, components, states, and rules the design system defines. You may not invent a color, size, component, or animation. If the flow cannot be built without inventing something, that is a **finding, not a workaround** — log it and use the closest system-compliant fallback.
2. **Phone canvas.** Everything at 390×844 portrait (iPhone). No desktop or iPad layouts.
3. **Every kid-facing element gets its voice slot filled** — write the actual utterance the app speaks, per the system's voice-slot spec.
4. **Honest output.** The gap report is the most valuable deliverable. A flawless prototype with an empty gap report will be treated as suspicious, not impressive.

## The use case: "Saturday drive" — one continuous 25-minute session

Azad (4) is handed the phone in the back seat. **No network for beats 1–4** (car), network returns at beat 5. Implement each beat as a screen/state:

**Beat 1 — Cold open → Home (offline).** Buddy greets him aloud with a world-memory callback referencing a choice he made yesterday. Reading-day suns row (3 of 7 lit; today unlit). Continue card for the book mid-flight, chapter 2 of 4. Shelf peeks below. Offline is indicated the *kid-warm* way — visible if you look, alarming to no one.

**Beat 2 — Continue → chapter map.** Picture-based map, "you are here" on chapter 2, no reading required to navigate. He taps the chapter.

**Beat 3 — Reader, mid-narration.** Full-bleed watercolor page, text panel per the system's UI-over-art rules. Narration playing: show the three word states (spoken / current / upcoming). Transport in the bottom third. He taps the word **"burrow"** → narration handles it per system spec → the word speaks → star affordance appears → he stars it (show the save moment + where it visibly lands).

**Beat 4 — Choice block.** "Should Bramble knock, or wait quietly… or tell me YOUR idea!" He taps the mic and speaks. Show the full voice-input state chain: idle → listening → processing/thinking → heard-you confirmation echoing his idea back.

**Beat 5 — Network returns; a page whose art is still painting.** "Painting this page…" state → watercolor-develop reveal when it lands. A quiet sync indicator does its job somewhere non-anxious.

**Beat 6 — Chapter-end checkpoint.** The buddy asks an **inference** question that references the choice Azad made in Beat 4 (write the actual question). He answers by voice; judge it wrong twice → show the full 2-miss mercy flow (no red, no "wrong," answer given warmly, story moves on). Today's sun lights up in a way he notices.

**Beat 7 — Badge earn.** Back on Home, the pending badge routes to the celebration screen. Show it twice: full motion, and the `prefers-reduced-motion` equivalent.

**Beat 8 — Parent Corner, that evening (density test).** Parent opens the story's detail page on the same phone: lifecycle chip, the checkpoint Q&A transcript from the drive (his actual wrong answers, the mercy outcome, the comprehension signal recorded), and the starred word "burrow" in the word log. Adult density mode, same design family.

## Deliverables

1. **The prototype** — a single self-contained HTML file (inline CSS/JS, no external deps beyond system fonts/CDN fonts) with all 8 beats navigable in sequence at 390×844, interaction states clickable-through (simulated, no real APIs). If the design system shipped CSS custom properties, consume them verbatim.
2. **Voice script** — a table of every utterance spoken across the flow (element → trigger → exact words), including interrupt behavior where narration and UI speech could collide.
3. **Gap report** — the point of the exercise. A table: `# | Beat | What the system was missing / ambiguous / contradictory | What I did instead | Severity (blocker / gap / nitpick)`. Log every invention, every guess, every place two system rules conflicted, every component that lacked a state the flow needed.
4. **Verdict** — score the design system against its own five judgment criteria (child-operable without reading / zero inline invention needed / parent density trustworthy / states recognizable everywhere / beautiful with the art), each with a one-line justification, and a final recommendation: **ship the system / revise these N things first**.

## What this flow deliberately stresses

Offline-first posture; the full interaction-state vocabulary (listening, thinking, speaking, painting, offline, syncing, celebrating); word-highlight + tap-word + star-save (PRD A9); transport invariants (play never navigates, prev/next never plays); the mercy flow and conversational-not-quiz checkpoint styling (PRD A10); UI-over-arbitrary-art contrast rules; reduced-motion parity; bottom-third reachability on a phone; and the kid↔parent density switch on identical architecture. If the system survives all eight beats with only nitpicks, it's ready.
