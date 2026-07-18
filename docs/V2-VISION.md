# Little Fables 2.0 — from polished to stellar

**Status:** vision + sequencing draft · **Prerequisite:** the [EXPERIENCE-PLAN](./EXPERIENCE-PLAN.md) sprints complete (v1 = every book painted and narrated, the app speaks, Saturday Drive passes on a phone). V2 is not more polish — it's the set of ideas that make Little Fables something no other kids' app is. Every feature below is grounded in infrastructure that already exists; nothing here requires a rearchitecture.

## What "stellar" means (four tests)

1. **Alive** — the world notices him. Nothing feels like a menu; everything feels like a friend who was waiting.
2. **His** — his words, his ideas, his voice visibly shape the world. He is not a user; he's a co-author.
3. **Family-woven** — the app is a thread between Azad and the people who love him, across languages and distance. That's the moat no content library can copy.
4. **Effortless** — in the car, at breakfast, screen-off, network-off. It meets the family where they are.

---

## Pillar V2-A · The Living World (stories that remember each other)

Today each book is an island. V2 makes the Azi-Verse an actual universe with continuity — the thing the canon was always for.

- **A1 · Cross-book memory.** Choices, starred words, and his freeform ideas persist *into future generation*: the berry he left for Sable Mole in book 3 is on the windowsill in book 7. Mechanically: a curated `canonEvents` log feeding generation — but **this is retrieval-hard, not append-hard**: naively feeding everything makes every book reference everything and continuity collapses. The engine needs selection + ranking (which 2–3 past events matter for *this* story's theme/characters), a cap per book, and a QA gate that checks continuity claims against the log. **The wave-2.0 prototype is a gate, not a side quest:** if retrieval can't produce clean continuity on a single book, A2 seasons doesn't work and A3 is cosmetic. Wave 2.0's second deliverable is the explicit verdict — ship the pattern / rework it / demote continuity to light-touch callbacks — before anything downstream depends on it.
- **A2 · Seasons.** Stories arrive as gentle serialized arcs (4–6 books) with a season finale that weaves in *his* recorded retellings and choices from the whole arc. Season art evolves with real seasons (the clock-lighting system, extended to a calendar).
- **A3 · The buddy lives in the stories.** His current buddy appears as a minor character in generated books (character bible + refs make this a prompt-assembly change, not new tech). Switching buddies changes who walks beside the hero.
- **A4 · A world he can watch grow.** Replace abstract badge-counting with a persistent, visible place — a garden/treehouse scene on Home that gains a lantern per reading day, a flower per owned word, a painted stone per finished book. Same data, rendered as a *place*. (One new Home scene + the existing world state; the design system's lighting makes it live.)

## Pillar V2-B · The Child's Voice (he reads, he tells, he authors)

- **B1 · Read-to-me → read-along.** Follow-along mode: he reads aloud, speech recognition tracks position, words light as *he* says them; when he stalls 3+ seconds, the buddy whispers the word. All mercy, zero test-feel. This quietly yields oral-reading-fluency signal into the comprehension profile — band calibration becomes automatic and evidence-based. **Ships in two steps:** a PWA version first using browser SpeechRecognition (accepting iOS quirks — the same trade-off the recorder already makes), then the native upgrade (SFSpeechRecognizer, offline) when the E3 shell lands. Don't gate the feature on the shell.
- **B2 · Azad the author.** "Tell me a story" — he dictates into the mic; the engine (existing childIdea path, extended) structures it into a real illustrated book *with him credited as author*, his cover voice-note plays before page one, and it sits on the shelf like any other book. Parent approves like any generated story. This is the single highest-magic feature per unit of engineering in the entire plan.
- **B3 · Retellings become keepsakes.** His tell-it-backs get gentle audio cleanup and a painted title card — a growing "Azad tells it" shelf parents can share to grandparents.

## Pillar V2-C · Family Constellation (the moat)

- **C1 · Papa reads it.** Voice-cloned family narration (PRD E2f, parent-gated, per-book opt-in): a parent records ~2 minutes, any book can be read in their voice — including while they're traveling. Extend to grandparents: Lito reads the Colombian stories, Dadi the Gujarati words. The multilingual family-words feature stops being flashcards and becomes *voices of real people*.
- **C2 · The long-distance loop.** Grandparents get a lightweight web view: hear his retellings, record a 20-second reaction ("¡Qué buena historia, mi amor!") that plays next time he opens the app. Asymmetric, safe, no social feed — just family audio passing through parent review. **This is where identity stops being deferrable:** grandparent-scoped access is the product's first real security surface beyond the household, so parent auth + role-scoped invitations (the wave-2.2 groundwork below) are a hard prerequisite, not a polish item.
- **C3 · Print bridge.** One tap in Parent Corner: any finished book (especially B2 author books) becomes a print-on-demand hardcover via Lulu/Blurb API. The app that produces *physical heirlooms* is in a different category from every subscription content app — and it's the natural gift/referral engine.

## Pillar V2-D · Sensory Depth (the app you can close your eyes in)

- **D1 · Drive Mode.** Screen-off, audio-first reading: narration continues in background audio (native shell), choices and checkpoints happen entirely by voice, progress syncs home. The car — already the primary context — becomes a first-class surface instead of a constrained one.
- **D2 · Scene soundscapes.** Per-scene ambient beds (rain on the burrow roof, the train's rhythm) generated/curated per art brief, mixed at −18dB under narration with the earcon ducking rules. ~30 loops cover the whole pack; audio pipeline already handles per-page assets.
- **D3 · Pages that breathe.** Two-layer parallax on scene art (foreground character / background wash — Gemini can emit layers from the same brief), breath-synced Breathe pages using the `--motion-breath` token, and page-turn sound tied to turn velocity. Subtle, reduced-motion-safe, all within existing motion tokens.

## Pillar V2-E · Stellar for Strangers (the commercial layer)

- **E1 · Onboarding as story.** A new family's first five minutes IS a story: the buddy interviews the child (name, loves, fears — the existing interview recipe), and by minute five a first tiny personalized story *about them* is generating while they pick a buddy. Activation = magic moment, not form-filling.
- **E2 · Universe builder.** The Azi-Verse becomes the flagship instance of a general capability: each family's canon (their cultures, their words, their grandparents' names) assembled by the same interview → canon-package pipeline that built Azi's. "Every family gets a universe" is the pitch; the prompt-package architecture was built for it.
- **E3 · The library economy (curated, not social).** Families can publish a QA-gated, human-reviewed story to a shared library; other families can add it to their shelf (with *their* child's name substituted where the canon allows). No comments, no feeds, no metrics visible to kids.
- **E4 · Trust surface.** Public safety page, per-story provenance ("written with your family's universe, checked by 3-stage QA, art approved by Papa on May 3"), COPPA-clean data posture, family data export. Trust is the conversion feature for this category.
- **E5 · Business shape.** Free: 3 family books + 1 buddy. Subscription (~$8–12/mo): unlimited generation, all buddies, seasons, Drive Mode, family voices. One-time purchases: printed books (C3), season packs. Referral: every printed/shared book carries "Made in [family]'s Little Fables."

---

## Sequencing (each wave ships a feelable jump)

Each wave lists its **done-signal** — not a metric, the emotional tell that the wave actually landed. If the signal doesn't show, the wave isn't done, whatever shipped.

| Wave | Theme | Contents | Done when (the signal) |
|---|---|---|---|
| **2.0** | He's an author | **B2 author mode** + **A1 cross-book-memory prototype (one book — a GATE, see below)** | Azad asks to make a story unprompted; he shows someone "his" book |
| **2.1** | The world is alive | A4 garden-home, A3 buddy-in-stories, B3 keepsakes, E1 onboarding-as-story | He checks the garden without being told; he notices his buddy inside a story |
| **2.2a** | Identity | Parent auth for real, SEED_HOUSEHOLD_ID removed from all 8 files, role-scoped invitations | A stranger with every URL can see and spend nothing; an invite link works |
| **2.2b** | Family voices | C1 cloned narration + C2 grandparent loop (they share the invitation UX) | He replays grandma's clip a second time on his own |
| **2.2c** | Print bridge | C3 print-on-demand (independent — rides on finished art, can slide either way) | A physical book exists in the house and gets gifted |
| **2.3** | Eyes-closed (the native wave) | E3 shell → D1 Drive Mode, B1 read-along (PWA version can land earlier in 2.1 if desired; native STT upgrade here), D2 soundscapes, D3 parallax/breath | A full car ride, screen off, no parent touch after handoff |
| **2.4** | Product spine | Moderation + review tooling, billing infrastructure, abuse/rate posture, data export, trust surface (E4) | You'd hand the app to a stranger's family without a caveat list |
| **2.5** | Other families | E2 universe builder, E3 library, E5 pricing live | A non-family household onboards, builds their universe, and comes back the next week |

**The A1 gate:** the cross-book-memory prototype in 2.0 is a go/no-go gate, not a side quest. If retrieval + ranking (which 2–3 past events matter for *this* story) can't be made reliable on one book, then A2 seasons is blocked and A3 continuity gets rescoped to shallow cameos — decide that consciously at the gate, not three waves later. B2 does not depend on A1, which is why 2.0 stays shippable even if the gate fails.

**Costs stay hobby-scale until 2.5**: soundscapes ~$0 (curated loops), author-mode books cost the same as generated stories (~$0.10 incl. art), voice clones ~$5/voice one-time, print at cost-plus. The native shell (2.3) is the one real engineering investment — everything else is the existing engine pointed at better ideas.

## What V2 still refuses to do

No feeds, no gamified streaks-with-loss (suns never turn off), no ads ever, no third-party data sale, no open-ended chatbot (the buddy stays inside story context with the intent whitelist), no screen-time guilt mechanics aimed at kids. The product's calm is a feature; V2 makes it deeper, not louder.
