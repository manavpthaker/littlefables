# Mini migration — phase 3

Little Fables is the **third and last** repo promoted to the Mac mini. Full plan
and phasing: `brownbot/docs/MINI-MIGRATION.md`. Sequence is
operator-economy → observe a week → content-os → observe a week → here. Do not
start before phase 2 has run for a week.

## Which repo

**This one — `littlefables`, no hyphen.** `little-fables` is the archived
predecessor (the generative platform pared back on 2026-07-29) and is not
promoted.

## The image-generation question, answered

The operating model flags Little Fables as the one repo that needs a hardware
check before moving, because a local diffusion model would have to be weighed
against the mini's chip and unified RAM.

**There is no local model. There never was.** No hardware comparison is needed.

- In this repo, image generation is **not automated at all**.
  `scripts/order-preview.ts` and `scripts/order-full-book.ts` emit *prompt
  bundles* that a human pastes into a fresh ChatGPT session with the
  `fable-art-custom` skill, then saves the returned PNGs into the book folder.
  Those scripts do Supabase reads, prompt assembly, and file writes.
- The only generative dependency in `scripts/`, `lib/`, and `app/` is
  **ElevenLabs**, for narration, over HTTPS.
- The predecessor repo did automate art, via `lib/art/gemini.ts` — a small
  `fetch` wrapper around Google's hosted Generative Language API
  (`gemini-3-pro-image`), ~$0.03–0.05 per candidate. Hosted, not local.

So the mini carries this comfortably. The real constraints are ordinary:

- **Disk, not RAM.** MP3s and PNGs go to Supabase Storage and never enter git,
  but the working folders accumulate. Watch free space.
- **Chrome contention.** `scripts/render-assets.sh` drives headless Chrome, and so
  do brownbot's growth/funnel browser legs. Give it `src/lib/browser-lock.ts`
  before the two ever run on the same machine.
- **A human in the loop.** The art step cannot be scheduled in its current form.
  What moves to the mini is the orchestration around it.

## The split

| Runs (→ mini) | Develops (stays MacBook) |
|---|---|
| Order watcher: poll `intakes` for a paid order → `order:new` → DM Manav | Reader UI, `lib/reader/*`, the design system |
| `content:narrate` — ElevenLabs, on demand, never on a cron | Story authoring (`story.json`, via the `fable` skill) |
| `content:add` / `content:publish` | The ChatGPT art sessions |
| `order:preview` / `order:full-book` / `order:publish` | `docs/commerce/` positioning and listing copy |
| `render-assets.sh` — Etsy/Pinterest marketing renders | |

The Next.js app is not a mini service — it deploys to Vercel.

## Order of work when phase 3 starts

1. Clone into `~/Documents/GitHub/littlefables`; uncomment it in
   `MOTION_REPOS` in `brownbot/scripts/sync-repos.sh`.
2. `pnpm install` (pnpm 10.11.0, per `packageManager`).
3. **Order watcher first** — it is the piece with real money attached. A launchd
   KeepAlive daemon on the `brownbot/scripts/imessage-daemon.ts` model. Stamp
   `<name>_last_tick` into brownbot's `memory` table so `runHealthCheck` flags it
   when the process dies, like every other daemon.
4. **Then narration**, as a brownbot tool rather than a cron — it spends
   ElevenLabs credits per book.
5. **Then `render-assets.sh`**, after it takes the browser lock.

## Env on the mini — names only, copied by hand over SSH

`.env.local` is gitignored and secrets never ride git.

```
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SECRET_KEY
ELEVENLABS_API_KEY
DAY_VOICE_ID
NIGHT_VOICE_ID
ELEVENLABS_MODEL_ID
```
