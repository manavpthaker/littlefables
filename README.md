# Little Fables

A curated storytelling app. Books are authored and illustrated locally,
uploaded through the terminal. The app is the reader — polished, intuitive,
and quiet about itself.

Two modes:

- **Day** — illustrated storybook, full audio narration, tap-a-word to hear
  it, warm palette.
- **Night** — sleepy-voice narrator, text-only pages, warm-dark palette. No
  interruptions. The story that helps the transition to sleep.

The reader auto-switches at the bedtime hour set per child; a sun/moon
chip at the top of the reader flips it manually.

## Quickstart

```bash
# Prereqs: Node 22+, pnpm 10+
pnpm install
cp .env.example .env.local  # fill in Supabase + ElevenLabs values
pnpm dev                    # http://localhost:3000
```

Environment variables you'll need in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SECRET_KEY=...
SUPABASE_PUBLISHABLE_KEY=...
ELEVENLABS_API_KEY=...
DAY_VOICE_ID=...            # ElevenLabs voice id for day narration
NIGHT_VOICE_ID=...          # sleepy voice for bedtime narration
```

## Adding a book

Books live under the household they belong to:
`content/households/<household-slug>/books/<slug>/`. `home/` is us; `demo/`
is the public demo; buyer households get their own slug (usually a family
name). See `content/households/README.md` for the full pattern.

```
content/households/home/books/hedgehog-goodnight/
  story.json         # authored story text (see format below)
  cover.png          # book cover (also used as per-page fallback art)
  pages/             # optional day-mode illustrations, one PNG per page
    01.png
    02.png
    ...
  audio/             # optional pre-generated narration (else runtime TTS)
    day-01.mp3
    day-01.json      # word timestamps: [{word,start,end}, ...]
    night-01.mp3
    night-01.json
    ...
```

`story.json`:

```jsonc
{
  "id": "hedgehog-goodnight",         // stable kebab-case id (the row id)
  "title": "Hedgehog's Goodnight",
  "by": "Papa",                        // optional attribution
  "kind": "chapter",                   // "chapter" (map first) or "quick"
  "chapters": [
    {
      "title": "Snug in the leaves",
      "pages": [
        { "text": "The forest was quiet…" },
        { "text": "Hedgehog curled up small." }
      ]
    }
  ],
  "vocab": [                            // optional — words the reader can speak
    { "word": "burrow", "syllables": ["bur","row"], "kidDefinition": "a cozy hole in the ground" }
  ]
}
```

Upload:

```bash
pnpm content:add content/households/home/books/hedgehog-goodnight            # for real
pnpm content:add content/households/home/books/hedgehog-goodnight --check    # dry run
```

The script uploads cover + pages to the `book-art` bucket, audio to
`page-audio`, and upserts the `books` row. Re-runs are idempotent —
edit the folder and re-import to update.

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Next dev (Turbopack) on :3000 |
| `pnpm build` | Production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint (400-line soft ceiling) |
| `pnpm test` | Vitest |
| `pnpm content:add <folder>` | Upload a book folder |
| `pnpm db:reset` | Drop + recreate local Supabase + apply migrations |
| `pnpm db:types` | Regenerate `types/database.ts` from linked hosted schema |

## Repo layout

- **`app/`** — Next.js App Router. Kid subtree under `/read`, parent
  settings under `/parent/settings`. Both are thin — state lives in `lib/`.
- **`lib/reader/`** — reader modules: `state.ts` (reducer), `transport.ts`
  (play/pause), `speech.ts` (TTS layers), `page-audio-source.ts`
  (pre-generated MP3 fetch with day/night voice selection),
  `audio-cache.ts` (IndexedDB).
- **`lib/models/`** — `bookSchema`, child settings, seed constants.
- **`lib/server/`** — Supabase auth guards, child settings loader.
- **`lib/sync/`** — offline outbox for progress writes.
- **`lib/voice/`** — voice priority + tap-to-hear.
- **`design-system/`** — accepted DS, consumed verbatim.
- **`supabase/migrations/`** — linear, date-prefixed.
- **`content/households/<slug>/books/`** — books scoped to that household
  (uploaded via `pnpm content:add`). `home/` for us, `demo/` for the public
  demo, `<lastname>/` for buyers.
- **`scripts/`** — `import-book.ts` (book uploader), `new-household.ts`
  (provision a new household), `build-precache-manifest.ts` (SW stamp).

## The shape

Single-family deployment by design. One household. No gates on the kid
mode. The parent surface is one Settings page (bedtime window, voice
overrides, child roster). Everything else is the reader.

No LLMs are called at runtime — no story generation, no comprehension
question generation, no on-tap word definition. All text is authored;
all narration is either pre-generated MP3 or a fallback to browser
speech synthesis. ElevenLabs is called on-demand for word-tap speech
only.
