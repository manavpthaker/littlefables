# Flow / Veo Prompt — the first-hand home video

Written 2026-08-07. Companion to `flow-video-prompt.md`, opposite register: that one
is cinema cut into the walkthrough; this one has to look like **a parent filmed it on
their phone without thinking about it**, for the Etsy listing's second video slot.

## Why the grandmother clip reads fake

Three tells, all fixable in the prompt:

1. **The geometry.** An over-the-shoulder crane angle is a shot no family member can
   physically hold. Real parent videos come from where a person stands: above the
   kids on the floor, across the kitchen, from the doorway.
2. **The speed.** Everything moves at 80% — the AI-video signature. Real home video
   runs at real time, and kids in it move *fast* and a little randomly.
3. **The optics.** Shallow focus, warm grade, soft grain — that's a film look. Phones
   shoot deep focus, flat-ish contrast, neutral white balance, and they render
   tablet screens slightly overbright. The imperfections *are* the authenticity.

## Source image

**Primary: the two-kids-on-the-rug still** (image 2 on the live listing). Its angle
is already a parent standing over the kids — the one composition that's natively
first-hand — and both faces angle down at the tablet, which is where AI face
animation is least likely to break. The kitchen and couch stills work as coverage
variants below.

## The main prompt

```
SHOT
A single continuous six-second take that looks like a parent filmed it on their
phone, standing over the children, without planning the shot. The attached image is
frame one and defines everything — the children, the room, the rug, the tablet and
what is on its screen. This is casual handheld home video, not cinematography.

SUBJECTS
Two children lying on the rug with a tablet between them, exactly as in frame one —
same faces, same hair, same clothes, same positions. No one else enters. No hands or
feet of the person filming ever appear.

THE BEAT — six seconds, real time, in this order
0.0–1.5  The girl's finger moves along a line of text on the screen. The boy is
         propped on his elbows, chin in hands, watching the page. Small natural
         fidgets — a foot swaying, weight shifting.
1.5–3.0  The boy leans in closer and points at the illustration side of the page.
         The girl nods slightly without looking up.
3.0–4.5  The girl glances up toward the camera for half a second — the quick
         "are you filming" look kids give — then goes straight back to the page.
4.5–6.0  Both settle back into reading. The boy's foot keeps idly swaying.

CAMERA
A phone held in one hand at standing adult height, angled down at the children.
Real handheld: a constant small sway, one slight reframing correction around the
midpoint as if the filmer shifted their weight. No gimbal glide, no drift, no push
in, no pan, no tilt, no zoom. EVERYTHING HAPPENS AT REAL SPEED — no slow motion, no
speed ramp, no dreamy drift. Six seconds of footage covers six seconds of life.

PHONE OPTICS
Deep depth of field — the rug, the children and the room edge all acceptably sharp,
the way a phone shoots. Neutral daylight white balance, ordinary indoor light,
slightly flat consumer contrast. No film grain, no warm grade, no vignette, no
cinematic bokeh. The tablet screen may read a touch overbright against the room,
the way phone cameras render screens.

THE SCREEN
The tablet shows the same open storybook spread as frame one for the entire take —
illustration on one side, text on the other. It may sit slightly bright or soft as
phone footage does, but the layout, the words and the illustration never change,
morph, scroll, page-turn, redraw or re-typeset. Treat the content as a printed page
glued to the device: if the tablet shifts, the image shifts with it as one rigid
object.

AUDIO
Quiet room tone only. No dialogue, no narration, no music, no foley.

DO NOT
No slow motion — this is the single most important exclusion. No locked-off tripod
steadiness, no gimbal smoothness, no orbit, no dolly. No shallow focus, no golden
grade, no grain overlay, no lens flare. No perfect composition — slight imperfect
headroom is correct. No text, captions, watermarks or UI overlays. No extra people,
no pets. Neither child ever turns fully to camera; the girl's glance is half a
second and returns. No morphing faces, no changing clothes, no screen content
changes.
```

## The kitchen prompt

Feed the kitchen-table still (live image 3 — father with daughter on his lap, tablet
up, mugs and cereal bowl on the table). Different authenticity beat from the rug
prompt on purpose: no glance at the camera here — this one sells the *filmer's*
presence instead, through the near-foreground counter edge and one weight-shift
reframe. Two prompts from the same session shouldn't share their best beat.

```
SHOT
A single continuous six-second take that looks like the other parent filmed it on a
phone from across the kitchen, pausing mid-task because the moment was worth
keeping. The attached image is frame one and defines everything — the father, the
child on his lap, the table, the mugs, the window light, the tablet and what is on
its screen. Casual handheld home video, not cinematography. A sliver of counter
edge, out of focus, crosses the bottom corner of the frame — the camera is shooting
past it.

SUBJECTS
A father seated at the kitchen table with his young daughter on his lap, both
looking at a tablet he holds up, exactly as in frame one — same faces, same hair,
same clothes, same positions, same breakfast clutter. No one else enters. The
person filming never appears, casts no shadow into frame, and is never reflected.

THE BEAT — six seconds, real time, in this order
0.0–1.5  The father's finger moves slowly under a line of text. The daughter's
         hand rests on the tablet's edge. Her feet swing gently below the table,
         out of rhythm with anything.
1.5–3.0  The filmer shifts their weight — the frame makes one small, imperfect
         correction — while the father tilts his head down toward the top of the
         daughter's hair for a moment, then back to the page.
3.0–4.5  The daughter points at the illustration side of the screen. The father
         nods slightly and reaches his far hand to his mug, taking an unhurried
         sip while his eyes stay on the page.
4.5–6.0  He sets the mug down softly. Both settle back into the book. Her feet
         keep swinging.

CAMERA
A phone held in one hand at standing adult height, across the table from the
subjects, angled slightly down at them. Real handheld: a constant small sway, and
exactly one slight reframing correction at the weight shift around 1.5 seconds. No
gimbal glide, no drift, no push in, no pan, no tilt, no zoom. EVERYTHING HAPPENS AT
REAL SPEED — no slow motion, no speed ramp, no dreamy drift. Six seconds of footage
covers six seconds of life.

PHONE OPTICS
Deep depth of field — father, child, table and far cabinets all acceptably sharp;
only the near counter edge in the corner is soft from proximity. Neutral daylight
white balance, ordinary morning light, slightly flat consumer contrast. The window
behind them may clip a touch overexposed the way phone footage does, and the tablet
screen may read slightly bright against the room. No film grain, no warm grade, no
vignette, no cinematic bokeh.

THE SCREEN
The tablet shows the same open storybook spread as frame one for the entire take —
illustration on one side, text on the other. It may sit slightly bright or soft as
phone footage does, but the layout, the words and the illustration never change,
morph, scroll, page-turn, redraw or re-typeset. The daughter's pointing finger
touches the glass without changing anything. Treat the content as a printed page
glued to the device: if the tablet moves, the image moves with it as one rigid
object.

AUDIO
Quiet kitchen room tone — a refrigerator hum, distant house sounds. No dialogue,
no narration, no music, no foley.

DO NOT
No slow motion — the single most important exclusion. No locked-off steadiness, no
gimbal smoothness, no orbit, no dolly, no push in. No shallow focus beyond the near
counter edge, no golden-hour grade, no grain overlay, no lens flare, no bloom on
the window. No steam curling from the mug. No perfect composition — slightly
imperfect headroom and a not-quite-level horizon are correct. No text, captions,
watermarks or UI overlays. No extra people, no pets, no hands of the filmer. Neither
subject looks at the camera at any point. No morphing faces, no changing clothes,
no screen content changes, no new props appearing on the table.
```

**The guaranteed take.** Feed the couch-from-behind still (`01A`). Camera behind and
above the sofa, both subjects from behind, screen partly occluded by heads. No faces
visible → nothing to break. Use this if the rug takes keep failing on faces.

## Run notes

- **Six seconds, trim from eight if the generator insists.** Etsy needs ≥5s, so
  unlike the four-second cinema clip, don't go shorter.
- **Four takes, judge in this order:** slow-mo feel first (watch the kids' fidgets —
  do they move like real time?), then the last frame's screen, then the glance.
- **The half-second glance at the camera is the strongest authenticity beat in the
  prompt.** A take that nails it earns tolerance on everything else.
- **Handheld breaks the static-patch trick** from `flow-video-prompt.md` — you can't
  pin a still over a swaying screen without tracking. Prefer takes where the screen
  is angled or partly occluded; legible-ish beats pixel-perfect in this register
  anyway, because pixel-perfect UI is itself a fake tell in home video.
- **Strip the audio before upload** (Etsy mutes regardless).
- **Slot it second, after the demo video.** Mechanics first, warmth second.
- Generator: Flow/Veo image-to-video first since the stills anchor it. If takes keep
  coming back glidey and slow despite the exclusions, the same prompt runs on Kling
  or Runway — both are known for more literal handheld compliance.

## One honesty note

This is still a staged vignette with AI-generated people — same footing as the
lifestyle stills, covered by the shop's AI disclosure. Don't caption or frame it as
a real customer's video; it's product-context imagery, not testimony.
