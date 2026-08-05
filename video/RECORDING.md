# Recording guide

**Six of the seven shots are automated.** `capture.mjs` drives the real reader
in a real browser with Playwright and records while it does — more precisely
than a hand, and repeatable.

```bash
pnpm exec next dev --turbopack     # in the repo root
cd video && node capture.mjs       # ~90 seconds
```

Writes `02-open`, `03-intake`, `04-page-turn`, `05-word-tap`, `06-transport`
and `07-night` straight into `public/recordings/` as H.264 mp4, at iPad Pro
11" landscape. Follow it with `node check-clips.mjs`: a recording shorter than
its beat freezes the film on its last frame and the render never says so.

Re-run any single shot while tuning:

```bash
node capture.mjs night
```

## What still needs a phone

**`03-add-to-home.mov`** — the iOS share sheet. Not our software, so nothing can
drive it. Record it by hand:

1. Turn on Do Not Disturb.
2. Settings → Control Center → add Screen Recording.
3. Open the magic URL in Safari on the iPad.
4. Share button → scroll to **Add to Home Screen** → **Add**.
5. Land on the home screen. **Hold two full seconds on the tree-mark icon** —
   that frame is what sells grandparents on "not complicated."

Drop it in `public/recordings/` and add the path to `READY` in `src/beats.ts`.

The delivery email needs nothing: it renders from the design system's
`EmailShell` via `scripts/render-assets.sh email`, so beat 5 shows our actual
email rather than a photograph of Gmail.

## Setup notes

The capture script needs the dev server and a valid token. Defaults are in the
file; override with env vars:

```bash
LF_BASE=http://192.168.1.109:3000 LF_TOKEN=<token> node capture.mjs
```

If the token has expired, mint a fresh one — and note the book must be imported
**to that household**, or the shelf comes up empty:

```bash
pnpm exec tsx scripts/new-household.ts --name "Rosa Demo Family" --child "Rosa" --band 4-6
pnpm content:add content/households/demo/books/lantern-round-pond --household <uuid>
```

Re-running `pnpm content:add` *without* `--household` silently moves the book
back to the seed household. That is the most likely reason a shelf that worked
yesterday is empty today.

## Render

```bash
npm run studio      # scrub the timeline
npm run render      # out/walkthrough.mp4
```

Takes about four minutes at 1920x1080.
