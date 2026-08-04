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
| 0:53–1:15 | Stays down — the product's narration is the only voice here |
| 1:15–1:16 | Back up to 34% |
| 1:26–1:30 | Fades to silence |

The duck is the important part. Beat 6 is the one place the software's own voice
should be audible, and a bed at full level fights it.

Tune in `AUDIO` in `src/beats.ts` if the track sits differently than expected.

## Narration in the reading beat

The captured footage has **no audio** — `capture.mjs` strips it with `-an`,
because headless Chrome's speech synthesis is not what you want on camera.

For real narration under beat 6, generate it properly first:

```bash
pnpm content:narrate content/books/custom/lantern-round-pond
```

Needs `ELEVENLABS_API_KEY`, `DAY_VOICE_ID` and `NIGHT_VOICE_ID` in `.env.local`.
Then re-run `node capture.mjs transport` with the `-an` flag removed from the
ffmpeg call, and the page audio comes through in the clip.

## Loudness

Platforms normalise anyway, but exporting at broadcast level avoids surprises:

```bash
ffmpeg -i out/walkthrough.mp4 -af loudnorm=I=-14:TP=-1:LRA=11 \
  -c:v copy out/walkthrough-final.mp4
```

`-14 LUFS` is the standard target for web video.
