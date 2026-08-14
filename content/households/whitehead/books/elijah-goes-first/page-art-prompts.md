# Art prompts — Elijah Goes First

Twenty-one images: one cover at 1:1, twenty pages at 4:3.

**This book does not use the shared watercolor anchor from
`content/ART-PROMPT.md`.** It is drawn as a vintage four-color superhero comic —
a deliberate per-book style addendum, in the same slot where `papa-moon` puts
its postcard treatment, but a bigger departure. It will not match the rest of
the shelf. That is the intent: the story is a superhero story, so the book looks
like one.

---

## The style anchor

Paste this block into **every** prompt, unchanged. Wording drift between pages
is what makes a face change between page three and page six.

```text
vintage four-color superhero comic book art, 1960s-70s newsprint printing,
heavy black ink contour lines with bold brush-inked shadows and crosshatch
modeling, flat limited-palette color separations with visible Ben-Day halftone
dot screens in the mid-tones, slight off-register color misprint at the edges,
aged yellowed newsprint paper grain, dramatic low camera angles and honest
foreshortening, one clear focal moment, single full-bleed splash panel with no
panel borders and no gutters, no lettering of any kind, no speech balloons, no
caption boxes, no sound-effect text, no logos, no watermarks, no photorealism,
no modern digital gloss, no airbrush gradients

Limited ink palette only: newsprint cream #F0E2C0, comic ink black #1B1A1F,
four-color red #B5211C, process blue #2C5FA8, gold-yellow #E8A22B. Every other
colour — skin, shadow, foliage, cloth — is mixed from those four inks and their
halftone screens. No colour enters that is not achievable in four-colour
process.
```

## The five hard rules

1. **No letterforms anywhere.** No balloons, no caption boxes, no `POW`, no
   signage, no logo on the cap, no title on the cover. This is a reading app —
   baked-in text fights the story text under the illustration and breaks
   tap-a-word. Keep the *shapes* of comic energy (radial impact lines,
   starbursts, motion streaks, speed ghosts) and drop every glyph.
2. **Single splash panel per page.** No grids, no gutters, no inset panels. A
   multi-panel page renders at phone size as unreadable confetti. The splash is
   the most period-correct format anyway.
3. **Four inks only.** If an output has a colour that could not come off a
   1968 newsprint press, reject it.
4. **Keep the lower third quiet.** The reader sets the story text and the pill
   control under the art. Busy inking at the bottom edge makes words hard to
   read — put the detail up top and let the bottom breathe.
5. **No Marvel anything.** No trademarked characters, costumes, logos, cover
   furniture, price boxes, issue numbers, or corner boxes. The look here comes
   from the *printing process and drawing idiom of the period*, described
   directly above — which is also why the prompts never name a publisher or an
   artist. Naming one mostly makes generators paste in a web-slinger.

**Do the cover first**, then attach it as a style + likeness reference
(`--sref` / `--cref`, Flux Redux, Gemini image-to-image) on every page prompt.
Per `content/bakeoff/README.md` the settled generator is **GPT Image 2 via fal**.
That reference step matters more than anything else here.

Use `character-notes.md` **verbatim** for every recurring character. Every person
in this book is a real human being — never plush, animal-like, furry, or
muzzle-faced. Heritage is context, not costume; all clothing stays modern and
everyday. Nobody wears a superhero costume at any point. Elijah's whole costume
is a plain black baseball cap.

**Reject and regenerate** any output with: lettering of any kind, a logo on the
cap, panel borders, a fifth ink, a different Elijah or Kinley, birthday
iconography (cake, candles, balloons, banners, party hats, wrapped presents), or
warm inks on pages 14–17.

Save as `cover.png` and `pages/01.png` … `pages/20.png` in this folder. These
stay local — `.gitignore` keeps PNGs out of the repo; `pnpm content:add` pushes
them to Supabase Storage.

---

## Cover — 1:1

`cover.png`: [STYLE ANCHOR] Comic splash, no title text and no cover furniture
of any kind. Elijah, a six-year-old Black boy with warm deep-brown skin, a round
open face, large dark eyes, and short dense black curls kept close to his head,
wearing a navy short-sleeve shirt with a red collar band, olive-and-tan
camouflage cargo pants, and navy sneakers with white soles, hangs in the air
about as high as a porch roof over a rain-wet Atlanta park at night, arms out,
plain black baseball cap with no text or logo sitting down near his eyebrows.
Seen from below in strong foreshortening, the classic low hero angle, with radial
speed lines behind him in process blue. Below him and to one side, Kinley, a
nine-year-old Black girl with warm brown skin, a steady watchful face, and long
dark box braids with small colorful beads at the ends, wearing a pale pink
t-shirt, cream leggings with tiny dots, and white sneakers, stands on the grass
looking straight up at him, one arm raised and pointing. The city skyline behind
them is flat gold-yellow against a process-blue night; puddles hold the light in
hard-edged shapes. Composition centers Elijah high in frame with Kinley anchoring
the lower third, bottom edge kept simple. Mood: joyful, secret, airborne.

---

## Page scenes — 4:3

Each prompt below is complete. Paste `[STYLE ANCHOR]` from the top of this file,
then the prompt body.

`pages/01.png`: [STYLE ANCHOR] A hot, still Atlanta street at the flattest hour
of a June afternoon. Row houses and a tall old oak inked in heavy black contour,
heat shimmer drawn as thin wavering ink lines, a fan turning in an open window.
Elijah, a six-year-old Black boy with warm deep-brown skin, a round open face,
large dark eyes, and short dense black curls kept close to his head, wearing a
navy short-sleeve shirt with a red collar band and olive-and-tan camouflage cargo
pants, sits alone on a concrete step with his chin in both hands. Blazing
gold-yellow flat field for the sunlight, hard black cast shadows, minimal
halftone. Composition: wide, Elijah small in a big bright quiet, lower third
kept open. Mood: waiting, sticky, end-of-patience. No birthday decorations. No
lettering.

`pages/02.png`: [STYLE ANCHOR] Elijah, described exactly as above, stands beside
his sister on the same front walk. Kinley, a nine-year-old Black girl with warm
brown skin, a steady watchful face, and long dark box braids falling past her
shoulders with small colorful beads threaded at the ends, wearing a pale pink
t-shirt with a soft faded graphic, cream leggings with tiny multicolored dots,
and white sneakers, reaches up easily to a high porch shelf while Elijah watches
from below, clearly a head shorter. Her beads swing, drawn with small motion
arcs. Identical gold-yellow light and hard black shadows to the previous page.
Composition: medium, camera low so the height difference reads as the subject.
Mood: fond, slightly outraged. No lettering.

`pages/03.png`: [STYLE ANCHOR] The interior of a small burrito restaurant in the
evening: a flat process-blue painted wall, a wood-plank ceiling inked in dense
parallel lines, a stainless counter, a drinks cooler glowing flat gold-yellow.
Elijah and Kinley, described exactly as above, come through the door together.
High on the counter, alone in a hard-edged pool of yellow, sits a plain black
baseball cap with no text or logo. Composition: wide interior in one-point
perspective, the cap small but the brightest shape in frame. Mood: ordinary
evening with one odd detail. No birthday decorations. No lettering.

`pages/04.png`: [STYLE ANCHOR] Extreme low angle on the stainless counter, the
way it looks to somebody short — the counter edge cutting high across frame in
heavy black. Elijah, described exactly as above, is up on his toes with one arm
stretched as far as an arm goes, fingers spread in strong foreshortening, still
well below the plain black baseball cap on the counter edge. Process-blue wall
and inked wood ceiling behind. Composition: dramatic worm's-eye angle, the gap
between hand and cap dead center. Mood: strain and stubbornness. No lettering.

`pages/05.png`: [STYLE ANCHOR] The identical low angle, counter, and reaching boy
as the previous page — but Elijah's navy sneakers have left the floor by two
inches, with a small hard black shadow under them where there should not be one,
and three short speed ticks at his heels. Nothing else in the room has changed.
Composition: identical framing to the previous page so the only difference the
eye finds is the gap under his shoes. Mood: the held-breath second. No lettering.

`pages/06.png`: [STYLE ANCHOR] Elijah, described exactly as above, stands flat on
the floor mid-restaurant holding the plain black baseball cap in both hands,
absolutely still, staring down at it, lit hard from above. Behind him Kinley,
described exactly as above, has stopped mid-step with her mouth slightly open;
her beaded braids hang completely motionless. Heavy black rim inking on both
figures, flat process-blue wall behind. Composition: medium, Elijah foreground
with the cap, Kinley sharp and smaller behind him. Mood: astonished and secret.
No lettering.

`pages/07.png`: [STYLE ANCHOR] The service alley behind the restaurant at low
sun — cracked asphalt, two dumpsters, chain-link fence inked as a fine black
grid, weeds at a brick wall. Elijah, described exactly as above, is caught
mid-jump about as high as a mailbox, knees up, laughing openly, the plain black
baseball cap down over his eyebrows, with a burst of radial gold-yellow speed
lines behind him and a faint speed-ghost of his own outline below. Long hard
black shadows across the asphalt. Composition: medium-wide, the whole unglamorous
alley, one boy in the air, bottom edge simple. Mood: pure delight in a plain
place. No lettering.

`pages/08.png`: [STYLE ANCHOR] Kinley, described exactly as above, sits on an
upturned crate in the same alley, forearms on her knees, telling her brother
something she has held for a long time. Elijah stands facing her, cap in hand,
listening hard. Her beaded braids hang dead still. Identical low-sun light and
long black shadows to the previous page. Composition: medium two-shot, camera at
their level for once, quiet inking with fewer speed lines than the pages around
it. Mood: confiding, a weight set down. No lettering.

`pages/09.png`: [STYLE ANCHOR] Tight on Kinley in the same alley, described
exactly as above, looking down at her own open hands in her lap, drawn large in
the lower foreground with heavy brush-inked shadow. Elijah is beside her at the
edge of frame, quiet. Same low-sun alley light. Composition: close, hands
dominating the lower third, her face above them, deep black background falloff.
Mood: honest and a little sad. No lettering.

`pages/10.png`: [STYLE ANCHOR] Elijah, described exactly as above, turns the plain
black baseball cap over in his hands, working something out; Kinley watches him
sideways, one eyebrow up, a single bead caught mid-swing with a small motion arc.
Same alley, sun lower, longer shadows. Composition: close two-shot, both faces in
three-quarter, the cap between them as the focal object. Mood: an idea arriving.
No lettering.

`pages/11.png`: [STYLE ANCHOR] Three small saves on bright Atlanta streets,
arranged as one continuous splash scene rather than separate panels, connected by
sweeping gold-yellow motion streaks that lead the eye from one to the next: a
glass tumbler tipping off a table edge with Elijah's hand already under it; a
loose brown dog trailing its leash with Kinley pointing and Elijah running in
foreshortened mid-stride; a red balloon slipping from a small girl's fist outside
a market. Both children described exactly as above. Flat daylight, hard shadows.
Composition: wide, three beats in one street, no panel borders or gutters
anywhere. Mood: busy, capable, unglamorous. No lettering.

`pages/12.png`: [STYLE ANCHOR] Elijah and Kinley, described exactly as above, sit
side by side on their front steps in flat afternoon light, not looking at each
other, arguing comfortably. The plain black baseball cap sits on the step between
them. Calm inking, no speed lines, large flat colour fields. Composition: medium,
both children level in frame, cap dead center. Mood: sibling disagreement with no
heat in it. No lettering.

`pages/13.png`: [STYLE ANCHOR] A green city park at the moment before a summer
storm. A picnic blanket on the grass with the whole family on it: Elijah and
Kinley described exactly as above; Mama, a Black woman in her late thirties with
warm brown skin, long dark wavy hair, an open bright smile, a fine gold chain,
wearing an olive utility jacket over a black top; Daddy, a Black man in his late
thirties with warm deep-brown skin, a cleanly shaved head, a neat full dark
beard, wearing a dark navy button-down with sleeves pushed up; Uncle Manav, a
modern human father in his 40s of Indian/Gujarati heritage with warm medium-brown
skin, short dark hair with close faded sides, a neatly trimmed full beard with
subtle salt-and-pepper, dark kind eyes behind clear round frames, wearing a
lightweight denim shirt; Auntie Indira, a modern human mother in her 40s of
Colombian heritage with warm medium-brown skin, dark almond eyes, smooth
shoulder-length dark hair, delicate gold jewelry, wearing a cream-and-charcoal
striped top; and Azi, a preschool-age boy with warm medium-brown skin, soft round
cheeks, large dark expressive eyes, dense tousled black curls in a rounded halo,
a small red thread bracelet, wearing a yellow play shirt. The sky above them is a
massive flat field of process blue overprinted with red into a bruised purple,
inked storm clouds rolling in from one corner. Composition: wide, the whole group
low in frame under an enormous sky. Mood: warm gathering, weather coming. No
lettering.

`pages/14.png`: [STYLE ANCHOR] The Atlanta skyline across the park as the lights
go out block by block — a hard diagonal edge of darkness crossing the city, flat
gold-yellow buildings on one side of it, solid black and process blue on the
other, rain beginning as fine ink hatching. Tiny inked figures on the grass in
the foreground. Composition: very wide, the city as the subject, people small.
Mood: enormous and strange. **From here through page 17 the gold-yellow and red
inks are withheld — process blue and black only, with newsprint cream showing
through.** The only yellow permitted on this page is in the buildings that have
not gone out yet. No lettering.

`pages/15.png`: [STYLE ANCHOR] Full dark in the park, rain in dense diagonal ink
hatching. Kinley, described exactly as above, has both hands locked around
Elijah's wrist and is speaking urgently close to his face; her beaded braids hang
absolutely still. Elijah, described exactly as above, is already turning toward
the water. Lit only by a distant lightning flash — hard white newsprint cream
against solid black — and a scatter of fireflies as tiny cream dots.
Composition: close, two faces carved out of near-solid black. Mood: urgent, no
panic. **Process blue and black only. No gold-yellow, no red.** No lettering.

`pages/16.png`: [STYLE ANCHOR] Elijah, described exactly as above, pulls the plain
black baseball cap down onto his head in the dark and rain, knees bending, about
to go. Kinley is behind him with one arm still out. A lightning fork behind the
trees throws him into stark silhouette with a hard cream rim. Low angle, strong
foreshortening. Composition: medium, Elijah centered and coiled, the most
classically heroic pose in the book. Mood: decided. **Process blue and black
only.** No lettering.

`pages/17.png`: [STYLE ANCHOR] Elijah, described exactly as above, hangs in the
rainy dark about as high as a porch roof over the edge of a park pond, coming
down toward Azi, described exactly as above, who stands at the water's edge in
his yellow play shirt with both hands cupped around nothing, looking for a light
that has gone out. Fireflies drift around them as small cream dots. Radial speed
lines behind Elijah in process blue. Composition: tall vertical space between the
boy in the air and the boy on the ground, seen from the side. Mood: tender and
urgent at once. **Process blue and black only — Azi's shirt reads as pale cream
here, not yellow, because the light is gone.** No lettering.

`pages/18.png`: [STYLE ANCHOR] The streetlights of the whole park slam back on at
once — full-strength gold-yellow and red flooding the frame after four dark
pages, radiating from the lamps in hard-edged rays. Elijah, described exactly as
above, has just landed on the picnic blanket with Azi held against his shoulder;
Azi is holding on hard, his shirt yellow again. Auntie Indira is reaching for
them; Daddy has sat straight down on the wet grass; Mama has one arm around
Elijah and one around Kinley; Uncle Manav stands with both hands on his head. All
adults described exactly as above. Everything wet and hard-edged, rain still
falling through the light. Composition: medium-wide, the whole group collapsing
inward toward the two boys. Mood: relief that hasn't finished arriving. This is
the brightest page in the book. No lettering.

`pages/19.png`: [STYLE ANCHOR] A small bedroom at night. Elijah, described exactly
as above but in soft clean pajamas with damp hair, lies on his side under the
covers looking at the plain black baseball cap hanging on the bedpost. One warm
gold-yellow lamp; rain running down the dark window in fine ink lines.
Composition: medium, boy in the lower half, cap catching lamplight above him.
**Quiet inking — no speed lines, no radial bursts, no dramatic angle. Camera at
his eye level, large calm flat colour fields, minimal halftone.** Mood: the good
kind of tired. No lettering.

`pages/20.png`: [STYLE ANCHOR] The same bedroom, lamp lower still. Kinley,
described exactly as above but in pajamas, stands in the lit doorway with one
hand on the frame, looking back at her brother; her beaded braids catch the hall
light. Elijah's eyes are nearly closed. Rain soft on the glass. **The quietest
page in the book — flattest inking, almost no halftone, no motion lines
anywhere, camera level and still.** Composition: medium, doorway light on the
left, sleeping boy on the right, the room settling. Mood: still, warm, done. No
lettering.

---

## Pacing note

The comic idiom peaks and releases on purpose:

- **Pages 1–6** — ordinary world, moderate inking, one worm's-eye angle held
  across pages 4 and 5 so the two-inch difference is the only change.
- **Pages 7–12** — the power pages. Speed lines, radial bursts, foreshortening.
- **Pages 13–17** — the storm. Colour drains to two inks, angles get steeper,
  page 16 is the most heroic composition in the book.
- **Page 18** — the release. Full four-colour, brightest page, every ink back.
- **Pages 19–20** — the comic vocabulary is deliberately switched off. Level
  camera, flat calm colour, no motion lines. A superhero comic that keeps
  shouting through the last two pages is not a bedtime book.
