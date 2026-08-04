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
| `src/beats.ts` | Timings, copy, asset paths, `RECORDINGS_READY` flag |
| `src/theme.ts` | Heritage tokens as plain values so they can be interpolated |
| `src/Walkthrough.tsx` | Assembles the nine beats |
| `src/fonts.ts` | Blocks rendering until IM Fell English and EB Garamond arrive |
| `src/components/` | The motion vocabulary |

### Components

| Component | Beat | What it does |
|---|---|---|
| `MarkDraw` | 1, 9 | The mark drawing itself in, then breathing. Imports the artwork straight from `design-system/components/core/markSvg.js` so it can never drift from the app. |
| `TitleCard` | 1, 3, 8, 9 | Sequenced type on aged ivory, optional fleuron separators |
| `SlowPush` | 2 | 4% zoom across a whole beat — felt, not seen |
| `Develop` | 4b | Blurred and drained resolving to sharp, like wet paper drying |
| `PageFan` | 4c | Pages arriving from a pile into reading order |
| `Bind` | 4d | Cover forming, gilt rule drawing around it |
| `DeviceFrame` | 5, 6, 7 | Recording inside an iPad or phone bezel |
| `Caption` | 2, 5, 6, 7 | Low paper capsule over footage |

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

**Book art** — already staged in `public/book/` from
`content/books/custom/lantern-round-pond/`. Re-copy if the art changes:

```bash
cp ../content/books/custom/lantern-round-pond/cover.png public/book/
cp ../content/books/custom/lantern-round-pond/pages/*.png public/book/
```

**Recordings** — seven files, not yet captured. Drop them in
`public/recordings/` with these exact names:

```
01-email.mov        delivery email on a phone
02-open.mov         tapping the link, reader opening
03-add-to-home.mov  iPad share sheet → Add to Home Screen
04-page-turn.mov    landscape, full directional flip
05-word-tap.mov     a word tapped and lighting up
06-transport.mov    thumb hitting play
07-night.mov        day → night switch, one continuous take
```

Then flip `RECORDINGS_READY` to `true` in `src/beats.ts`. Until you do, the
device beats render a labelled placeholder so the rest of the film can be
previewed without waiting on a camera.

**Recording tips.** On iOS turn on Do Not Disturb first — a notification banner
mid-take ruins it. Record at the highest resolution the device offers;
downscaling is free, upscaling is not.

## Audio

Not wired yet. The storyboard calls for soft piano or solo strings, low, with
the product's own narration coming up only during the reading beat. Add as an
`<Audio>` in `Walkthrough.tsx`, then normalise the export:

```bash
ffmpeg -i out/walkthrough.mp4 -af loudnorm=I=-14:TP=-1 out/walkthrough-normalised.mp4
```
