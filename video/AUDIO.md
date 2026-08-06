# Music

Scored. `public/audio/bed.mp3` is in place and the duck is wired.

## Replacing the track

```bash
node analyse-audio.mjs ~/Downloads/some-track.mp3   # find where it sits flattest
./prep-audio.sh ~/Downloads/some-track.mp3 50       # trim, level, fade
npm run render
```

`prep-audio.sh` exists because generated piano drifts louder as it goes. Both
takes we tried climbed 3-5 dB over ninety seconds — expressive on their own,
but it fights narration once it is under a film. The script trims to the
flattest stretch, flattens what remains with `dynaudnorm`, and fades the ends.

The current bed is Take 2 from 0:50, levelled to about -25 dB across the body.

## What to ask for

Whatever generator you use, this is the brief:

> Solo piano, unhurried, warm and slightly melancholy. Sparse — space between
> the notes. The feeling of an old music box or a bedtime story, not a product
> demo. No drums, no swell, no build to a drop. 95 seconds.

**Length: 95 seconds minimum.** The film is 90; the extra five gives the tail
somewhere to fade.

**Avoid:** anything with percussion, anything that builds, anything "uplifting
corporate," anything with a beat you could nod to. The entire pitch is that this
product does not shout. Music that shouts contradicts it more loudly than any
wrong word would.

If the generator offers a reference, *Comptine d'un autre été* is the register —
just far enough away not to be pastiche.

## What the mix already does

| | |
|---|---|
| 0:00–0:01.5 | Fades up from silence |
| 0:01.5–0:52 | Bed at 34% |
| 0:52–0:53 | **Ducks to 12%** for the reading beat |
| payoff | Steps down — the day narration is the only voice there |
| night | Steps down again — the bedtime voice |
| 1:15–1:16 | Back up to 34% |
| 1:26–1:30 | Fades to silence |

The duck is the important part. Beat 6 is the one place the software's own voice
should be audible, and a bed at full level fights it.

Tune in `AUDIO` in `src/beats.ts` if the track sits differently than expected.

## Narration in the reading beat

Beat 6 carries the book's real narration — page one in the day voice, "Rosa was
not a patient girl, and she knew it."

It is **not** taken from the screen recording. Playwright does not capture audio
at all, so the track is pulled straight from Supabase Storage:

```
page-audio/lantern-round-pond/day/0-0.mp3
```

Cleaner that way — no browser artifacts, and the level is ours to set. It sits
about 13 dB above the ducked bed, which makes it unambiguously the focus.

To refresh it after re-narrating:

```bash
BOOK=lantern-round-pond
BASE=https://fzcjwsxyaweqtvroycjm.supabase.co/storage/v1/object/public/page-audio
curl -o public/audio/narration.mp3       "$BASE/$BOOK/day/0-0.mp3"
curl -o public/audio/narration-night.mp3 "$BASE/$BOOK/night/0-0.mp3"
```

Both are page one. The night file is the same words in the bedtime voice, and
the film plays it at 0.9 — the rate the reader applies at bedtime — so what you
hear is what a child hears. It runs about eleven seconds as a result, which is
why the night beat is twelve.

The two voices are genuinely different recordings; page one happens to come out
the same length in both, which is only a coincidence of MP3 frame counts. Page
three differs by a quarter of a second.

The book is already narrated. `pnpm content:narrate` skips everything unless you
pass `--force`.

## Loudness

Platforms normalise anyway, but exporting at broadcast level avoids surprises:

```bash
ffmpeg -i out/walkthrough.mp4 -af loudnorm=I=-14:TP=-1:LRA=11 \
  -c:v copy out/walkthrough-final.mp4
```

`-14 LUFS` is the standard target for web video.
