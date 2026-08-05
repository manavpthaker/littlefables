# Walkthrough film

Remotion project for the "how it works" video. Its own package so the app's
dependency tree stays small — nothing here is imported by the Next app.

Storyboard and shot list: [`docs/commerce/walkthrough-video.md`](../docs/commerce/walkthrough-video.md).

## Run

```bash
cd video
npm install          # once
npm run studio       # scrub the timeline in a browser
npm run render       # 1920x1080 → out/walkthrough.mp4
npm run render:square # 1080x1080 for Etsy's video slot
```

Render a single frame while iterating — much faster than the whole film:

```bash
npx remotion still Walkthrough out/check.png --frame=990
```

## How it's wired

`src/beats.ts` is the film as data — timings, copy, asset paths. Changing a
headline or a duration means editing that file, not a component.

| File | Role |
|---|---|
| `src/beats.ts` | Timings, copy, asset paths, the `READY` set of captured shots |
| `src/theme.ts` | Heritage tokens as plain values so they can be interpolated |
| `src/Walkthrough.tsx` | Assembles the nine beats |
| `capture.mjs` | Drives the real reader and records five of the app shots |
| `check-clips.mjs` | Verifies each recording outlasts the beat that uses it |
| `src/fonts.ts` | Blocks rendering until IM Fell English and EB Garamond arrive |
| `src/components/` | The motion vocabulary |

### Components

| Component | Beat | What it does |
|---|---|---|
| `MarkAnim` | 9 | The mark drawing itself on, as a PNG sequence photographed from the design harness |
| `CornerMark` | all but 9 | The small mark in the corner, tinted per beat so it survives paper and full-bleed art alike |
| `TitleCard` | 3a, 8 | Sequenced type on aged ivory, optional fleuron separators |
| `SlowPush` | 1 | 4% zoom across a whole beat — felt, not seen |
| `Develop` | 3b | Blurred and drained resolving to sharp, like wet paper drying |
| `PageFan` | 3c | Pages arriving from a pile into reading order |
| `Bind` | 3d | Cover forming, gilt rule drawing around it |
| `StyleRange` | 7 | Three sample spreads side by side |
| `DeviceFrame` | 2, 4, 5, 6 | Recording or still inside an iPad bezel |
| `Caption` | 1, 2, 4, 5, 6 | Low paper capsule over footage |

## Assets

**Logomark animation** — the open and close play PNG sequences from
`public/mark/`, photographed from the design team's CSS harness rather than
reimplemented as Remotion interpolations. Two sources of truth for one
animation drift apart on every edit.

```bash
node capture-mark.mjs   # → public/mark/grow (78f), public/mark/breathe (225f)
```

It reads `~/Downloads/littlefables-mark-animations.html` by default; set
`MARK_HARNESS` if the file moves. CSS animations are wall-clock based and
cannot simply be "played" by a frame-by-frame renderer, so the script pauses
every animation and sets `currentTime` per frame through the Web Animations
API — same input, same pixels, every run. Frame counts are declared in
`MarkAnim.tsx`, so changing a shot's length here means updating `LENGTH` there.

**Book art** — staged in `public/book/` from the demo book. Re-copy if the art
changes:

```bash
cp ../content/households/demo/books/lantern-round-pond/cover.png public/book/
cp ../content/households/demo/books/lantern-round-pond/pages/*.png public/book/
```

**Style samples** — `public/styles/`, copied from
`content/marketing/style-samples/`. Ignored here; that folder is the original.

**Recordings** — five of the six the film uses are captured automatically:

```bash
node capture.mjs                 # all of them
node capture.mjs transport       # or just one
node check-clips.mjs             # then always this
```

Re-run after any reader change, or the film shows a UI that no longer exists.
Only the iOS share sheet still needs a phone; the delivery email is rendered
from the design system's `EmailShell` instead of photographed.

Readiness is per-shot, not a single flag: add the file's path to the `READY`
set in `src/beats.ts` and that beat starts using it. Anything absent renders a
labelled placeholder, so the film stays previewable while shots are missing.

Run `node check-clips.mjs` afterwards. A recording shorter than the beat that
uses it makes the film hold its last frame, and the render says nothing.

**Recording tips.** On iOS turn on Do Not Disturb first — a notification banner
mid-take ruins it. Record at the highest resolution the device offers;
downscaling is free, upscaling is not.

## Audio

A music bed at `public/audio/bed.mp3` and the book's own narration at
`public/audio/narration.mp3`. The bed ducks under the reading beat so the
product's voice is the only one competing for attention there. Both are
gitignored — see `AUDIO.md` for the brief and `prep-audio.sh` for levelling.

Normalise the export:

```bash
ffmpeg -i out/walkthrough.mp4 -af loudnorm=I=-14:TP=-1.5:LRA=11 \
  -c:v copy -c:a aac -b:a 192k out/walkthrough-final.mp4
```
