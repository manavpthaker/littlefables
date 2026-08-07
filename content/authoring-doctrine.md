# Custom book authoring doctrine

**Read this whole file before drafting a `story.json` for a paid custom
order.** It is not optional. Skipping it produces the failure pattern that
prompted its existence — a "highlight reel of the child's interests
dressed as a story", which nobody would pay for and which the parent
correctly sees as generic.

The doctrine is dense on purpose. Every requirement earns its place; each
one was written after a specific failure. If a requirement seems fussy,
read the "why" — usually it names an incident.

---

## Where this fits

- **Intake** captures the child + the sticky moment (`sticky_moment` and
  optional `hoped_lesson` fields on the intakes table).
- **`content/story-patterns.md`** maps sticky moments to research-backed
  patterns and template books. **Match the intake to a pattern before
  writing a single line of story text.**
- **This file** governs what the story actually looks like once you know
  the pattern — structure, requirements, self-scoring, and the required
  `parent-guide.md` artifact.
- **`content/parent-guide-template.md`** is the shape the back-matter
  guide takes; it's a required deliverable, not optional.
- **`reference/`** is the research library. This file points at specific
  research docs by path; read them when the doctrine points you there.
- **`scripts/order-preview.ts`** enforces the artifacts (`story.json`,
  `character-notes.md`, `parent-guide.md`) exist before the preview
  bundle is emitted.
- **`scripts/import-book.ts`** enforces the 90+ rubric gate at import.

---

## Step 0 — do these before writing

1. **Read the intake row in full.** Not just the sticky moment — also
   `look`, `interests`, `traits`, `inspirations`, `companions`, `age_years`
   / `age_band`, `hoped_lesson`, and the reference photo. The
   personalization has to come from *specific* details, not vibes.

2. **Match the sticky moment to a pattern.** Open
   `content/story-patterns.md`. Find the entry that best matches the
   intake's `sticky_moment`. If there's no clean match, pick the closest
   neighbour and note the adaptation. Do not default to an adventure.
   *Nothing else in this doctrine matters if the pattern is wrong.*

3. **Read the template book named by that pattern.** If pattern §1 (big
   feelings) says "template: The Moose Who Knew About Bigness", read
   `content/originals/the_moose_who_knew_about_bigness_formatted.md` in
   full before drafting. The template shows what the pattern feels like
   when it lands. Your book is not a copy of the template — it is a
   new instance of the same pattern.

4. **Consult the age-band spec.** Read
   `reference/storyverse/docs/08-story-structure.md` for the child's age
   band, and `reference/littlefables/config/age_group_settings.json` for
   the vocabulary / sentence-structure calibration. Sentence length, page
   count, complexity, and vocabulary all come from there, not intuition.

5. **Consult the therapeutic technique doc.** For any pattern that
   references `reference/storyverse/docs/07-therapeutic-techniques.md`,
   read the specific section named by the pattern. This is where the
   *language* of the tool comes from ("still scared, but less"; darkness
   as "cozy dark, like a soft blanket"; etc.). Do not paraphrase the
   research from memory; the phrasing matters.

Only after these five steps do you begin drafting.

---

## Step 1 — the multi-layer architecture

Every custom book operates on five simultaneous layers (from
`reference/storyverse/docs/08-story-structure.md`):

- **Layer 1 — Surface (entertainment).** The story is genuinely fun to
  hear read aloud. Would a child ask for it again? If the answer is no,
  nothing else matters.
- **Layer 2 — Skills (development).** A specific future-ready skill or
  emotional-regulation strategy is demonstrated by a character. Never
  announced. Never lectured. Shown.
- **Layer 3 — Values (ethics).** What the child absorbs about kindness,
  repair, honesty, patience — through choices characters make, not
  through morals stated aloud.
- **Layer 4 — Systems (consequences).** Actions have ripple effects.
  The moose's crash-through-the-forest hurt saplings. Azi's frustration
  hurt Citie. Every action lands somewhere.
- **Layer 5 — Future (possibilities).** The story shows more than one
  path was available. The child sees that choice matters.

For a 3-to-6 age band you'll lean heavily on Layers 1, 2, and 3. Layers 4
and 5 are lighter touches — one moment each, not the whole book. For 7+
you can push all five harder.

---

## Step 2 — the arc

Universal arc (per `08-story-structure.md`), scaled to age band:

- **Act 1 (setup).** Establish the child in their world. Introduce the
  sticky-moment situation *as it actually shows up in their life*.
  Present the emotional state (not just the plot situation).
- **Act 2 (journey).** The character encounters a mentor / a metaphor /
  a moment that hands them the tool. The tool is *offered*, not
  imposed. The character tries it.
- **Act 3 (resolution).** The tool works — imperfectly. Feeling smaller,
  not gone. "Still scared, but less." Grace for imperfection is a
  feature, not a bug. Perfect resolution reads as false.
- **Coda (closing ritual).** A comfort element (food, hug, song,
  moon-watching) grounds the ending in the child's real world. Safety
  and love affirmed without being stated. For bedtime books: explicit
  sleep cues.

---

## Step 3 — non-negotiables

These are the rules that already existed as memories or past bug-fixes.
They apply to every custom book. Violating any one of them kills the
story regardless of rubric score.

1. **Cast rule.** The only real humans in the art and text are (a) the
   child, and (b) any people the buyer explicitly named in the intake's
   `companions` field. Do not invent parents, siblings, coaches, or
   grandparents just because the arc suggests one. See
   `feedback-no-fabricated-humans.md`. If the arc needs an adult voice,
   assign it to an object, an animal, or nature.

2. **No compliment loops.** "Strong! Focused! Brave!" repeated across
   pages is decoration, not character work. Compliments must be
   *evidenced* — a specific past small kindness the character actually
   did — to count. Cheerleading is disqualifying.

3. **No teaching voice.** No "and the lesson is", no "always remember
   to", no direct-to-camera moral. If the child could paraphrase your
   moral as a lecture, rewrite. The lesson comes from watching the
   character use the tool.

4. **Named tool, always.** The story must hand the family a specific
   named practice they can invoke in the actual next moment. *The
   Gentle Giant's Secret. The Handoff. The three-things list. The
   wouldn't-have-found.* Unnamed advice is not a tool.

5. **Callbacks from intake specifics.** At least three moments in the
   story call back to details from the intake (an interest, a trait, a
   look detail, a companion's name, a piece of the sticky moment).
   These callbacks are the reason the buyer thinks "this is *my* kid".

6. **Sensory language.** Every emotional moment is grounded in body.
   Warm, cold, heavy, light, tight, loose, buzzy, still. Never
   abstract-only.

7. **Bedtime-safe ending.** The story ends soft. No cliffhangers, no
   punchlines that require a reaction. The final page is stillness or
   comfort.

---

## Step 4 — age-band structural specs

From `reference/storyverse/docs/08-story-structure.md` and
`reference/littlefables/config/age_group_settings.json`. Deviating from
these ranges without a stated reason is disqualifying.

| Age band | Words | Pages | Sentence length | Chapters |
|---|---|---|---|---|
| 3–4 | 100–300 | 8–10 | 3–7 words, mostly | 1 (kind: `quick`) |
| 4–6 | 300–500 | 10–14 | 5–10 words | 1 (kind: `quick`) |
| 6–8 | 500–900 | 14–22 | 8–14 words | 1–3 (kind: `quick` or `chapter`) |
| 8+ | 900–2500+ | 22+ | descriptive | 3+ (kind: `chapter`) |

Vocabulary suggestions per band are in `age_group_settings.json` — treat
them as calibration, not a required word list.

---

## Step 5 — parent guide (required)

Every custom book folder ships with a `parent-guide.md` file. Its shape
is defined in `content/parent-guide-template.md`. Sections required:

1. **The named tool** — 3-step (or 1-technique) with sensory
   scaffolding. Same tool the story teaches, spelled out for adults.
2. **Key phrases** — the vocabulary that becomes shared family language
   after several readings. Two or three phrases, no more.
3. **In-the-moment scripts** — 3–5 short scripts the parent can invoke
   during the actual sticky moment.
4. **Preventive-use scripts** — 2–3 scripts for right before the sticky
   moment tends to happen (bedtime routine, leaving the playground).
5. **After-the-storm scripts** — 2–3 scripts for repair after the sticky
   moment blew through.

If the parent guide is missing or lacks any of these five sections,
`pnpm order:publish` refuses to import. This is on purpose — the parent
guide is *the product*. The book without it is greeting-card
personalization.

---

## Step 6 — self-score against the custom-book rubric

Fill in a `rubric` block in `story.json` before saving. Every dimension
0–20, total 0–100, ship gate 90+.

```json
"rubric": {
  "story_core": { "score": 18, "notes": "Pattern §1 (big feelings) fully applied — externalization as 'the buzzy', body-based tool teaches 'plant, breathe, name'." },
  "age_fit": { "score": 17, "notes": "8 pages, avg 5-word sentences, vocab within 3-4 band. One word ('overwhelm') is a stretch — check with parent." },
  "personalization": { "score": 19, "notes": "Callbacks: soccer boot moment, curly hair breeze, red bracelet as tell. Sticky moment (hitting brother) is the arc, not decoration." },
  "craft": { "score": 18, "notes": "Sensory throughout. No compliment loops. Ending lands on hush + hand-on-heart, not a moral." },
  "family_tool": { "score": 19, "notes": "parent-guide.md complete: The Plant-Breathe-Name secret, key phrases, in-moment/preventive/after all present." },
  "total": 91,
  "pattern_used": "story-patterns.md §1 — Big feelings that come out as hitting",
  "notes": "Adaptation: 3-year-old sibling angle woven into the moose analogue."
}
```

The `pnpm content:add` importer parses this block and refuses import at
`total < 90`. If the score is close to 90 and you're the author, ask
yourself: *would I hand this to a parent whose kid is in this exact
sticky moment?* If not, keep working.

---

## Step 7 — final walkthrough before handing back

Before ending the authoring session and letting the operator run
`pnpm order:preview`, do this pass:

1. **Read the story aloud.** Not silently, out loud. Anything that
   trips a read-aloud tongue gets rewritten.
2. **Check every callback.** Does each intake specific appear at least
   once in a way that would only make sense for *this child*?
3. **Check every mentor voice.** Is any adult voice fabricated (§3.1)?
   If so, reassign to object/animal/nature.
4. **Check the ending.** Would this be safe to read at bedtime?
5. **Read `parent-guide.md`.** Is the tool actually usable, or is it
   inspirational-quote territory? Would a parent under stress at 7pm
   remember it?
6. **Read the rubric self-score.** Are the notes honest, or are they
   flattering? A 91 that's really an 82 will bite you at the buyer's
   first read-aloud.

---

## When in doubt

- **The pattern is unclear.** Ask the buyer via the operator before
  writing. A 15-minute email exchange is cheaper than a rewrite.
- **The sticky moment is heavy** (loss, divorce, illness). Escalate to
  the operator — pattern §8 explicitly says these should be co-written
  with the parent, not drafted from the intake alone.
- **The buyer wants pure celebration** (birthday, milestone, no sticky
  moment). Do write it — but the pattern shifts to "witnessing" rather
  than "healing". Use `hoped_lesson` as the spine instead of
  `sticky_moment`. Keep the rubric gate; celebration books can hit 90+
  by nailing personalization and craft.
- **The doctrine and the buyer disagree.** Buyer wins. Log the
  disagreement in `story.json` `rubric.notes` so it's not forgotten.
