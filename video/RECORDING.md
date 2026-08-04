# Recording guide

Seven shots, about fifteen minutes. Everything else in the film is built from
the book's art.

---

## Before you start

**1 · Dev server on the network.** The iPad needs to reach your Mac, so bind to
all interfaces rather than localhost:

```bash
pnpm exec next dev --turbopack -H 0.0.0.0
```

**2 · Get your LAN IP** (it changes between networks):

```bash
ipconfig getifaddr en0
```

**3 · The URL.** Mac and iPad must be on the same wifi.

```
http://<LAN-IP>:3000/f/LwqpyUrSllZubYbWmMCUgDwbaRL3vlWu06YuuYgx7fU
```

If that token has expired, mint a fresh one:

```bash
pnpm exec tsx scripts/new-household.ts \
  --name "Rosa Demo Family" --child "Rosa" --band 4-6 \
  --base-url "http://<LAN-IP>:3000"
pnpm content:add content/books/custom/lantern-round-pond --household <uuid>
```

**4 · Turn on Do Not Disturb.** On both devices. A notification banner
mid-take ruins the shot and you will not notice until you are compositing.

**5 · Set up capture.**
- **iPad/iPhone:** Settings → Control Center → add Screen Recording. Swipe down,
  tap the record button, wait for the countdown.
- **Mac:** `Cmd+Shift+5`, choose "Record Selected Portion".

Record at the highest resolution the device offers. Downscaling is free.

---

## The shots

Leave two seconds of stillness at the head and tail of every take. It gives the
edit room to breathe and costs nothing.

### 01 · `01-email.mov` — phone, ~6 seconds

**Setup:** send yourself the delivery email first. Copy the body from
[`docs/commerce/email-templates.md`](../docs/commerce/email-templates.md) §3,
subject `Rosa's book is ready`, and paste the LAN URL as the link.

**Record:** the email open on your phone, thumb resting. Scroll slowly once so
the link comes into view. Stop.

**Watching for:** the subject line and the link both legible. This is the shot
that says "it arrived."

### 02 · `02-open.mov` — phone, ~5 seconds

**Record:** one continuous take — tap the link in the email, let the reader load,
let the shelf appear with the cover on it. Do not cut.

**Watching for:** no white flash, and the cover fully loaded before you stop.
Wait a beat longer than feels necessary.

### 03 · `03-add-to-home.mov` — iPad, ~12 seconds

The grandparent shot. Worth doing twice.

**Record:** open the URL in Safari → tap the share button → scroll to **Add to
Home Screen** → tap it → tap **Add** → land on the home screen with the Little
Fables icon among the other apps.

**Watching for:** the tree-mark icon clearly visible on the home screen at the
end. Hold on it for two full seconds before stopping.

### 04 · `04-page-turn.mov` — iPad landscape, ~6 seconds

**Record:** open the book, then turn one page forward with the full directional
flip animation. Then one more.

**Watching for:** the whole flip, start to finish. If you clip the beginning the
motion reads as a glitch.

### 05 · `05-word-tap.mov` — iPad, ~6 seconds

**Record:** on a text page, tap a single word and let it light up and speak.
Try `lantern` or `patient` — both are in the vocab list, and both are words a
five-year-old would actually stop on.

**Watching for:** the highlight clearly visible. Frame close enough that the
word is readable at video size.

### 06 · `06-transport.mov` — iPad, ~5 seconds

**Record:** thumb moving to the play button, pressing it, narration starting,
words beginning to highlight in sequence.

**Watching for:** the moment of contact between thumb and button. That is the
frame that sells "a child can do this."

### 07 · `07-night.mov` — iPad, ~8 seconds

**Record:** one continuous take. Book open in day mode with illustration
visible → tap the mode chip in the top right → night mode arrives, text-only,
warm-dark. Hold.

**Watching for:** do not cut mid-transition. The switch *is* the shot.

---

## When you're done

```bash
# drop the files in, then:
cd video
# flip RECORDINGS_READY to true in src/beats.ts
npm run studio     # scrub and check the cuts
npm run render     # out/walkthrough.mp4
```

If a take is slightly long, trim it in the composition rather than re-recording
— `DeviceFrame` takes a `startFrom` prop in seconds.

---

## If something looks wrong

**Book does not appear on the iPad** — check both devices are on the same wifi,
and that the dev server was started with `-H 0.0.0.0` rather than plain
`pnpm dev`.

**Cover is missing but the title shows** — Supabase Storage is still serving;
give it a moment and reload.

**Narration sounds robotic** — expected. There is no pre-generated audio for
this book, so the reader is falling back to browser speech synthesis. Fine for
the demo; if it grates on camera, run `pnpm content:narrate` first.

**Token rejected** — it expired, or the household was deleted. Re-mint per the
setup section above.
