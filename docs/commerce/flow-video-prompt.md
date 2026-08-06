# Flow / Veo Prompt — "The child shows the adult"

Image-to-video from `06-child-shows-adult`. Four seconds, cut in before the end
card of `walkthroughfinal`.

## The main prompt

```
SHOT
A single continuous four-second take, locked off and intimate. The attached image
is frame one and defines everything — faces, wardrobe, room, lens, palette, grain.
Nothing about the framing, the people, or the light may change. This is one quiet
moment inside an existing photograph, not a new scene.

SUBJECTS
A five-year-old boy stands beside a seated adult, holding a tablet up with both arms
to show them. The adult is turned toward him, leaning in slightly. Both faces stay
exactly as they appear in frame one — same features, same hair, same clothing, same
skin, same age. No one enters or leaves. No one changes position in the room.

THE BEAT — four seconds, in this order
0.0–1.0  The boy's arms settle a fraction under the weight of the tablet. He is
         still looking at the screen. The adult is already watching him.
1.0–2.0  The boy lifts his eyes from the screen to the adult's face and holds
         there, waiting. Small, expectant, slightly impatient.
2.0–3.2  The adult's expression opens — a small catch of breath, eyebrows lifting,
         then a warm smile spreading unhurriedly. Their eyes stay on the boy the
         entire time and never move to the screen.
3.2–4.0  The boy's shoulders rise a fraction with pride and he almost smiles,
         trying not to. He keeps the tablet up.

CAMERA
Handheld but barely — a slow organic drift of one or two percent, the kind of
movement a person makes standing still with a camera. A very slow push in, no more
than two percent over the whole take. Focal length, focus distance and depth of
field are unchanged from frame one. No pan, no tilt, no zoom, no rack focus, no
orbit, no dolly, no whip, no handheld shake, no camera shake at all.

THE SCREEN — the most important instruction
The image displayed on the tablet screen must remain completely static, pixel-stable
and identical to frame one for every frame of the take. Do not animate it. Do not
redraw, re-render, re-typeset, re-illustrate, scroll, page-turn, fade, flicker,
brighten, dim, reflect, or reinterpret any part of it. Every word of text stays the
same word. The illustration stays the same illustration. Treat the screen as a
printed page glued to the device, not as a display. If the tablet moves at all, the
image on it moves with it as one rigid object and its content does not change.

LIGHT AND AIR
Late afternoon window light, warm and directional, unchanged in colour and intensity
throughout. The room stays brighter than the screen at all times. Fine dust turning
slowly in the light beam. Soft film grain, consistent, matching frame one. No
flicker, no light shift, no lens flare, no bloom, no colour grade change mid-take.

AUDIO
Room tone only — a quiet house, faint distant traffic. No dialogue, no voices, no
speech, no laughter, no music, no score, no foley, no sound effects.

DO NOT
No text overlays, no captions, no subtitles, no titles, no watermarks, no logos.
No UI animation, no cursor, no touch ripple, no loading spinner, no notification.
No slow motion, no speed ramp, no time lapse, no cut, no transition, no fade.
No extra people, no pets, no hands entering frame. No morphing faces, no changing
ages, no shifting clothing. No cool or blue colour cast. No glossy commercial
lighting. Nothing dramatic — the whole take is one small ordinary moment.
```

## How to run it

**Four seconds, not eight.** Screen drift compounds with every frame. Eight seconds
of this will not hold, and you only need the beat.

**Generate four takes and pick.** Even with the screen instruction, integrity is a
lottery. Judge each one by scrubbing to the last frame and checking the screen
first — that is where it fails.

**The near-zero camera motion is your insurance.** If the screen degrades in the
take with the best performance, mask it: hold a still of the real screenshot over
that rectangle. A static patch only works if the camera barely moves, which is why
the prompt asks for one to two percent rather than a nice slow push. You already
have Remotion in the repo, so it's a positioned `<Img>` over the clip — no tracking.

## Two more takes worth having

Coverage gives the edit somewhere to go if the hero take is unusable.

**A closer variant.** Same prompt, but replace the SHOT block's first line with:
*"A tighter framing on the adult's face and the boy's shoulder, the tablet only
partly in frame at the edge."* If the screen is barely visible, it cannot break —
and the adult's reaction is the actual content of the shot.

**A reverse.** *"Framed from beside the adult, over their shoulder, so we see the
boy's face fully and the tablet from behind."* The screen is not visible at all.
This is your guaranteed-usable take.

## Cutting it in

Place it **immediately before the end card.** Everything else in the film is
mechanism — intake, delivery email, reader, night mode. This is the only shot that
is the *result*, and putting it against "$29 · previews in 24 hours" makes the price
land on a feeling rather than a feature list.

Opening on it instead is the stronger hook but spends your best emotional beat
before anyone knows what the product is.

Two craft notes. The film is currently all screen recordings and typographic cards
on cream, so live action is a real register change — **dissolve in and out rather
than cutting**, around 12 frames each side. And **grade it warmer toward the cream**
so it belongs to the same film rather than sitting in it as stock footage.

Mute the generated audio and let the existing bed carry through the cut.
