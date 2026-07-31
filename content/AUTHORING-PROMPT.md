# Authoring prompt

Paste this into Claude.ai / ChatGPT / any LLM, then attach or paste your
source story. The model returns a `story.json` you can drop straight into a
`content/books/<slug>/` folder and upload with `pnpm content:add`.

---

## Prompt

> You are formatting a children's story for a bedtime storytelling app called
> Little Fables. Take the source story I'll paste after this prompt and
> reshape it into the app's `story.json` format.
>
> **Output rules — read carefully:**
>
> 1. Return **only** a single JSON object. No prose before or after. No
>    markdown code fences. Just the JSON.
> 2. The JSON must match this shape exactly:
>
> ```json
> {
>   "id": "kebab-case-slug",
>   "title": "Story Title",
>   "by": "Author or attribution (optional)",
>   "kind": "quick",
>   "chapters": [
>     {
>       "title": "Chapter title (or the story title again if there's only one)",
>       "pages": [
>         { "text": "One page of narration." },
>         { "text": "Another page." }
>       ]
>     }
>   ],
>   "vocab": [
>     { "word": "burrow", "syllables": ["bur","row"], "kidDefinition": "a cozy hole in the ground" }
>   ],
>   "theme": {
>     "paper": "#efe5cf",
>     "ink": "#3a2617",
>     "accent": "#c96b2e",
>     "hush": "#7b6448"
>   }
> }
> ```
>
> **Field guidance:**
>
> - `id` — lowercase, hyphenated, no spaces. Derive from the title
>   (e.g. `"Hedgehog's Goodnight"` → `hedgehog-goodnight`). Keep it short
>   and stable — this becomes the row id and folder name.
> - `title` — the display title, as the child would hear it.
> - `by` — optional attribution ("Papa", "Grandma", "Adapted from…"). Omit
>   if you don't have one.
> - `kind` — `"quick"` for a single-sitting story (one chapter, up to
>   ~15 pages). `"chapter"` for anything longer that should show a chapter
>   map first.
> - `chapters` — always an array of at least one chapter. If the source is a
>   single continuous story, wrap it in one chapter using the story title.
>   For chapter books, break at natural scene / arc boundaries (usually
>   marked in the source).
> - `pages` — split the narration into **page-sized chunks: 2–4 sentences
>   or ~25–60 words**. A page is what fits on one screen when a young
>   child looks at it. Do NOT put a whole scene on one page. Break at
>   natural pauses — the end of a beat, a change of scene, a moment of
>   quiet. If a page ends on a cliffhanger word, that's fine — the next
>   page will pick it up.
> - `vocab` — pick **4–8 words** in the story that are:
>   - worth teaching a 3–6 year old (mildly unfamiliar, evocative, useful),
>   - AND actually appear in the story text,
>   - AND not proper nouns.
>   For each word, include `syllables` (split by sound, like
>   `["hedge","hog"]`) and `kidDefinition` (one warm sentence a young
>   child would understand — NOT dictionary-speak, no "of or relating
>   to", no using the word to define itself). Only include these two
>   fields per entry; do NOT emit `meaning`. Skip the whole `vocab`
>   array if the source has no words worth flagging.
> - `theme` — OPTIONAL palette that re-tints the reader chrome to match
>   the story's atmosphere. Skip entirely if the story is atmospherically
>   neutral. Include when the story has a clear mood (bedtime navy,
>   sunset gold, forest green, storm slate). Four hex values, each
>   optional:
>     - `paper` — the page background. Warm cream for daytime stories,
>       deep navy/plum for nocturnes.
>     - `ink` — the story text color. Must have ≥4.5:1 contrast against
>       `paper` (the reader will silently drop the whole theme otherwise
>       and warn in the console).
>     - `accent` — the eyebrow, current-word highlight, and play button.
>       Pick a color that actually appears in the illustration —
>       a lantern glow, a sunset streak, a leaf.
>     - `hush` — upcoming-word dim and captions. Something between ink
>       and paper on the value scale.
>   Example: `"theme": { "paper": "#1c1830", "ink": "#f2e6d0",
>   "accent": "#e9b64c", "hush": "#a89476" }` (a nocturnal story like
>   The Midnight Train).
>
> **Text handling:**
>
> - Keep the source's voice. Don't rewrite for reading level unless I
>   explicitly ask.
> - Preserve punctuation, contractions, and any hand-crafted rhythm.
> - Strip any illustrations, page markers ("Illustration:", "[picture of…]",
>   scene notes), and editor notes. Keep only the words a narrator would
>   speak.
> - Straight quotes and apostrophes only (`"` and `'`), never curly.
>
> **If the source is ambiguous** (e.g. is it one chapter or four?), pick
> the interpretation that produces a calmer, more page-turnable read.
> Small chapters are better than one long block.
>
> Here is the source story:
>
> [PASTE YOUR STORY HERE]

---

## After you have the JSON

1. Create the folder: `content/books/<slug>/`
2. Save the JSON as `story.json` inside it.
3. Drop in `cover.png` (any size, roughly square looks best on the shelf).
4. Optional: `pages/01.png`, `pages/02.png`, … per-page illustrations.
5. Optional: `audio/day-01.mp3` + `audio/day-01.json` (word timestamps) if
   you've pre-recorded narration. Same for `night-01.*`. See the reader's
   `page-audio-source.ts` for the exact timestamp shape.
6. Dry-run: `pnpm content:add content/books/<slug> --check` — validates
   `story.json` and lists what would upload.
7. For real: `pnpm content:add content/books/<slug>`

Re-running on the same folder updates the existing book row (idempotent).

## Handy variations of the prompt

- **"Split this book into chapters yourself"**: append to the prompt:
  > If the source doesn't have chapter breaks, invent 3–6 chapter breaks
  > at natural arc transitions and give each a short evocative title.

- **"Rewrite for a younger audience"**: append:
  > Rewrite the source at a reading level appropriate for a 3–5 year old:
  > shorter sentences, concrete nouns, present tense where natural, avoid
  > compound subordinate clauses. Preserve the plot beats and the mood.

- **"Bedtime-ify"**: append:
  > Slow the pacing — split pages more aggressively (1–2 sentences per
  > page), lean into descriptive quiet moments, and let the story resolve
  > softly. This will be read in Night mode; no cliffhangers on the final
  > page.
