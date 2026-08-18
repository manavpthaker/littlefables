# Art prompts — Elijah Goes First

Twenty-one images: one cover at 1:1, twenty pages at 4:3.

**This book does not use the shared watercolor anchor from
`content/ART-PROMPT.md`.** It is drawn as a vintage four-color superhero comic —
a deliberate per-book style addendum. It will not match the rest of the shelf.
That is the intent: the story is a superhero origin, so the book looks like one.

**Panel format changed this pass.** The earlier "single splash panel per page"
rule is reversed at the buyer's request. The cover may stay a splash, but every
interior page now carries **2 to 3 real comic panels** with hard black borders
and thin cream gutters. Full rules in `character-notes.md` -> "Panel format".
Per-page layout is called out inline in each prompt below.

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
foreshortening, paneled kids' graphic-novel composition when the page layout
calls for it, hard black inked panel borders with thin newsprint-cream gutters,
clear left-to-right and top-to-bottom reading flow, no lettering of any kind, no
speech balloons, no caption boxes, no sound-effect text, no logos, no
watermarks, no photorealism, no modern digital gloss, no airbrush gradients

Limited ink palette only: newsprint cream #F0E2C0, comic ink black #1B1A1F,
four-color red #B5211C, process blue #2C5FA8, gold-yellow #E8A22B. Every other
colour — skin, shadow, foliage, cloth — is mixed from those four inks and their
halftone screens. No colour enters that is not achievable in four-colour
process.
```

## The six hard rules

1. **No letterforms anywhere.** No balloons, no caption boxes, no `POW`, no
   signage, no logo on the cap, no title on the cover. This is a reading app —
   baked-in text fights the story text under the illustration and breaks
   tap-a-word. Keep the *shapes* of comic energy (radial impact lines,
   starbursts, motion streaks, speed ghosts) and drop every glyph.
2. **Panel layouts follow this pass's rules.** Cover only may be a single
   splash. Every interior page has 2-3 panels, hard black inked borders, and
   thin cream gutters between. Layouts allowed: two horizontal panels stacked,
   two vertical panels side by side, one wide panel over two smaller panels, and
   three horizontal panels stacked. Nothing else — no irregular grids.
3. **Four inks only.** If an output has a colour that could not come off a
   1968 newsprint press, reject it.
4. **Keep the lower third quiet.** The reader sets the story text and the pill
   control under the art. Busy inking at the bottom edge of the bottom-most
   panel makes words hard to read — put the detail up top and let the bottom
   breathe.
5. **No Marvel anything.** No trademarked characters, costumes, logos, cover
   furniture, price boxes, issue numbers, or corner boxes. The look here comes
   from the *printing process and drawing idiom of the period*, described
   directly above — which is also why the prompts never name a publisher or an
   artist. Naming one mostly makes generators paste in a web-slinger.
6. **Nobody wears a costume.** Everyone stays in the modern everyday clothes
   described in `character-notes.md`. Elijah's whole costume is the plain
   black baseball cap.

**Do the cover first**, then attach it as a style + likeness reference
(`--sref` / `--cref`, Flux Redux, Gemini image-to-image) on every page prompt.
Per `content/bakeoff/README.md` the settled generator is **GPT Image 2 via fal**.
That reference step matters more than anything else here.

Use `character-notes.md` **verbatim** for every recurring character. Every person
in this book is a real human being — never plush, animal-like, furry, or
muzzle-faced. The tabby is a real domestic cat, not a mascot. Heritage is
context, not costume; all clothing stays modern and everyday. Nobody wears a
superhero costume at any point.

**Reject and regenerate** any interior-page output with: lettering of any kind,
a logo on the cap, fewer than 2 panels, more than 3 panels, irregular panel
grids, a fifth ink, a different Elijah or Kinley, birthday iconography (cake,
candles, balloons, banners, party hats, wrapped presents), or warm inks on
pages 15–18.

Save as `cover.png` and `pages/01.png` … `pages/20.png` in this folder. These
stay local — `.gitignore` keeps PNGs out of the repo; `pnpm content:add` pushes
them to Supabase Storage.

---

## Cover — 1:1

**Layout: single splash.** Cover pages are always splash.

`cover.png`: [STYLE ANCHOR] Comic splash, no title text and no cover furniture
of any kind. Elijah, a young Black boy with warm deep-brown skin, a round open
face, large dark eyes, and short dense black curls kept close to his head,
wearing a navy short-sleeve shirt with a red collar band, olive-and-tan
camouflage cargo pants, and navy sneakers with white soles, hangs in the air
about as high as a porch roof over a rain-wet Atlanta park at night, arms out,
plain black baseball cap with no text or logo sitting down near his eyebrows.
Under one arm he carries a wet ginger-and-brown tabby cat with a small green
collar. Seen from below in strong foreshortening, the classic low hero angle,
with radial speed lines behind him in process blue. Below him and to one side,
Kinley, a nine-year-old Black girl with warm brown skin, a steady watchful
face, and long dark box braids with small colorful beads at the ends, wearing
a pale pink t-shirt, cream leggings with tiny dots, and white sneakers, stands
on the wet grass looking straight up at him, one arm raised and pointing. The
city skyline behind them is flat gold-yellow against a process-blue night;
puddles hold the light in hard-edged shapes. Composition centers Elijah high in
frame with Kinley and the cat anchoring the lower third; bottom edge kept
simple. Mood: joyful, secret, airborne, sibling. No lettering.

---

## Page scenes — 4:3

Each prompt below is complete. Paste `[STYLE ANCHOR]` from the top of this file,
then the panel-layout note, then the prompt body.

`pages/01.png`: **Layout: two horizontal panels stacked, equal height, thin
cream gutter, hard black borders.** [STYLE ANCHOR] TOP PANEL: A hot, still
Atlanta street at the flattest hour of an August afternoon. Row houses, a tall
old oak inked in heavy black contour, heat shimmer drawn as thin wavering ink
lines, and a fan turning in an open window. Blazing gold-yellow flat field for
the sunlight, hard black cast shadows, minimal halftone. BOTTOM PANEL: Elijah,
a young Black boy with warm deep-brown skin, a round open face, large dark eyes,
and short dense black curls kept close to his head, wearing a navy short-sleeve
shirt with a red collar band and olive-and-tan camouflage cargo pants, sits on
a concrete step with his chin in both hands, already leaned forward like the
next thing he sees will get him up. Composition: top panel establishes the hot
quiet street; bottom panel tightens to Elijah's waiting body. Mood: waiting,
sticky, coiled. No birthday decorations. No lettering.

`pages/02.png`: **Layout: two vertical panels side by side, equal width, thin
cream gutter, hard black borders.** [STYLE ANCHOR] LEFT PANEL: Elijah,
described exactly as above, bare-headed with no cap yet, is already up and
moving — mid-stride down the front walk toward the sidewalk, chin up, one arm
swinging, the classic small-boy-with-a-mission stance. RIGHT PANEL: Kinley, a
nine-year-old Black girl with warm brown skin, a steady watchful face, and long
dark box braids falling past her shoulders with small colorful beads threaded
at the ends, wearing a pale pink t-shirt with a soft faded graphic, cream
leggings with tiny multicolored dots, and white sneakers, sits on the top porch
step with a plain open book on her knees, looking up from it to watch her
brother go. Her beaded braids catch small motion arcs. Identical gold-yellow
light and hard black shadows to the previous page. Mood: the sibling engine
already running — one goes, one watches. No lettering.

`pages/03.png`: **Layout: two horizontal panels stacked, top panel larger than
bottom, thin cream gutter, hard black borders.** [STYLE ANCHOR] TOP PANEL: A
wide shot of a residential Atlanta street corner where a big old oak leans over
the sidewalk. A small crowd of five or six neighborhood adults in Atlanta summer
clothes — light t-shirts, sundresses, short-sleeve button-downs, one holding up
a phone — looks up into the oak and points. A worried-looking Black woman in
her thirties in a sun-yellow sundress stands closest to the trunk with her hands
pressed together at her mouth. Elijah and Kinley, described exactly as above,
approach from the right, small in the crowd; Elijah is bare-headed with no cap
yet. BOTTOM PANEL: A tight up-angle view of the tabby — an ordinary domestic
tabby cat with a warm ginger-and-brown striped coat, the classic soft dark
M-shape on her forehead, pale cream chest and paws, amber-green eyes, and a
small green fabric collar with a plain round brass tag — crouched on the highest
branch of the oak, ears back, mouth open crying. All four inks, low golden-hour
sun, long hard black shadows. Mood: neighborhood commotion. No lettering.

`pages/04.png`: **Layout: two vertical panels side by side, equal width, thin
cream gutter, hard black borders.** [STYLE ANCHOR] LEFT PANEL: Low camera on
Elijah, described exactly as above, standing at the base of the oak looking
straight up into the branches. His face is set with the goes-first look, chin
up, one hand already touching the lowest branch. Behind him a woman in the
crowd has both hands out reaching for him, mouth open mid-word. Warm oak-leaf
greens (process blue over gold-yellow), long black shadows. RIGHT PANEL: A few
seconds later, Elijah three branches up the same oak, knees bent, one arm
reaching for the next branch, camera pulled back a little to show the crowd
below him small and looking up in surprise. Bark inked in heavy black
crosshatch. Same warm greens, same hard shadows. Composition of both panels:
Elijah on the vertical axis, growing higher in frame from left to right. Mood:
he was already going while everyone else was still talking. No lettering.

`pages/05.png`: **Layout: one wide top panel over two smaller bottom panels,
thin cream gutters, hard black borders.** [STYLE ANCHOR] TOP PANEL: High up in
the oak, Elijah, described exactly as above and still bare-headed, balances on a
high branch with one hand gripping the trunk while holding the tabby — described
exactly as above — against his shoulder with his other arm. Her small green
collar shows, her face is pressed into his neck, one paw over his shoulder.
BOTTOM LEFT PANEL: A close view of Elijah turning his head and noticing
something tucked deeper in the branch fork. BOTTOM RIGHT PANEL: The plain black
baseball cap with no text or logo, dusty with dry oak leaves, wedged deep in
the branch fork and clearly older than a day. Sunlight cuts through the canopy
in hard-edged gold-yellow shafts; the world below is small, hazy, and
process-blue with distance. Mood: the moment he sees the second thing. No
lettering.

`pages/06.png`: **Layout: two horizontal panels stacked, equal height, thin
cream gutter, hard black borders.** [STYLE ANCHOR] TOP PANEL: Elijah,
described exactly as above, coming down the oak, mid-descent, the tabby
tucked under one arm and the plain black baseball cap held in his other hand.
Bark and branches inked in heavy black crosshatch, sunlight falling across
his shoulders in flat gold-yellow. Composition: medium, Elijah centred, still
inside the tree canopy. BOTTOM PANEL: On the sidewalk, the worried-looking
Black woman in the sun-yellow sundress cradles the tabby against her chest,
mouth open in a small relieved cry; her eyes are wet. Elijah stands a step
away, holding the cap up in both hands and looking down at it, a slow smile
starting. The crowd has begun to disperse in the soft background. Warm
late-afternoon light, hard black shadows. Composition: medium two-shot,
neither figure central — the cap between them is the true focal object. Mood:
one thing returned, another kept. No lettering.

`pages/07.png`: **Layout: two horizontal panels stacked, equal height, thin
cream gutter, hard black borders.** [STYLE ANCHOR] TOP PANEL: Backyard by a
wooden fence at low sun — patchy grass, one folded lawn chair, a garden hose
coiled on a hook. Elijah, described exactly as above, lifts the now-clean plain
black baseball cap toward his head, face expectant. BOTTOM PANEL: Elijah stands
with feet apart and knees just bending, the cap settled down over his eyebrows,
both hands slightly out for balance, the long hard black shadow across the grass
behind him. Mood: the second before something new. No lettering.

`pages/08.png`: **Layout: two horizontal panels stacked, top panel larger than
bottom, thin cream gutter, hard black borders.** [STYLE ANCHOR] TOP PANEL: Same
backyard, low sun. Elijah, described exactly as above, is in the air about as
high as a mailbox — feet clearly above the fence line — laughing openly, arms
out, the cap sitting down over his eyebrows. Radial gold-yellow speed lines
burst behind him; a faint speed-ghost of his own outline shows below him. BOTTOM
PANEL: Elijah lands on his heels, out of breath and still laughing, already
turning toward the house to run inside and tell Kinley. Long hard black shadows
on the grass. Mood: pure delight in a plain place. No lettering.

`pages/09.png`: **Layout: two vertical panels side by side, equal width.**
[STYLE ANCHOR] LEFT PANEL: Elijah, described exactly as above but with the
cap now sitting down over his eyebrows, bursts through an interior doorway
mid-stride, out of breath, one hand still on the doorframe, mouth open to
speak. Warm interior lamp light, wood-slat wall behind, halftone soft.
RIGHT PANEL: Kinley, a nine-year-old Black girl with warm brown skin, a
steady watchful face, and long dark box braids falling past her shoulders
with small colorful beads at the ends, wearing a pale pink t-shirt with a
soft faded graphic, cream leggings with tiny multicolored dots, and white
sneakers, is on a soft old couch with an open book resting on her knees. She
is looking straight at her brother, calm, unsurprised, one arm just
beginning to lift her braided hand toward him. Composition of both panels:
match camera height so his motion left and her stillness right read as a
single beat. Mood: run-in meets already-knew. No lettering.

`pages/10.png`: **Layout: one wide top panel over two smaller bottom panels,
thin cream gutters, hard black borders.** [STYLE ANCHOR] TOP PANEL: Same couch,
medium two-shot. Kinley, described exactly as above, holds one of her braids out
toward Elijah, described exactly as above, her steady face full-front to camera,
mouth midway through a soft sentence. Elijah is beside her, cap down over his
eyebrows, leaned in and looking at her hand. BOTTOM LEFT PANEL: Extreme close-up
of the end of that braid — three colorful beads and one absolutely still bead,
framed to make the stillness visible. BOTTOM RIGHT PANEL: Elijah looking from
the still bead back to Kinley, beginning to understand. Warm indoor light,
halftone soft. Mood: reveal, quiet, sibling gift. No lettering.

`pages/11.png`: **Layout: two vertical panels side by side, equal width, thin
cream gutter, hard black borders.** [STYLE ANCHOR] LEFT PANEL: Same couch and
lamp. Elijah, described exactly as above, sits thinking hard, the plain black
cap on the cushion between him and Kinley. RIGHT PANEL: Kinley and Elijah,
described exactly as above, are turned to face each other in a close two-shot,
foreheads not quite touching, both hands relaxed, Kinley's beads clicking with
small motion arcs. Warm indoor light, tight framing, minimal halftone. Mood: the
pact spoken. No lettering.

`pages/12.png`: **Layout: three horizontal panels stacked, equal height,
thin cream gutters, hard black borders.** [STYLE ANCHOR] Three small saves in
one week, one per panel, arranged top to bottom as a short montage. TOP
PANEL: a kitchen table interior, a glass tumbler tipping off the edge, Elijah
in mid-stride with his hand already cupped under it; Kinley in the back of
frame, one hand raised, one bead visibly still. MIDDLE PANEL: a bright
Atlanta street, palm-sized shot of a loose brown dog trailing its leash
along the sidewalk with Kinley pointing from a stoop and Elijah running in
foreshortened mid-stride, the cap on. BOTTOM PANEL: outside a corner
market, a red balloon slipping upward from a small girl's fist; Elijah
leaping, one arm at full stretch with the balloon's string just brushing his
fingers; Kinley stopped mid-step with her braids caught mid-swing in the
foreground. All three panels flat daylight, hard shadows, calm inking, no
motion speed lines. Composition: three even bands; every panel keeps its
lower edge quiet. Mood: capable, unglamorous, ordinary. No lettering.

`pages/13.png`: **Layout: two horizontal panels stacked, top panel larger than
bottom, thin cream gutter, hard black borders.** [STYLE ANCHOR] TOP PANEL: A
green city park at the moment before a summer storm, a picnic blanket on the
grass with the whole family on it: Elijah and Kinley described exactly as above
(Elijah with the cap folded next to him, not on his head); Mama, Dada, Uncle
Manav, Auntie Indira, and Azi, all described exactly as above in modern everyday
clothes. BOTTOM PANEL: The sky above Piedmont Park turns the color of a plum,
a massive flat field of process blue overprinted with red into bruised purple,
inked storm clouds rolling in from one corner over the picnic blanket. Keep the
family smaller in the lower edge of this panel so the weather takes over. Mood:
warm gathering, weather coming. No lettering.

`pages/14.png`: **Layout: two horizontal panels stacked, equal height, thin
cream gutter, hard black borders.** [STYLE ANCHOR] TOP PANEL: Thunder walks
across the park, slow and enormous — storm clouds and rain hatching over tiny
inked figures on the grass. BOTTOM PANEL: The Atlanta skyline across the park as
the lights go out block by block — a hard diagonal edge of darkness crossing the
city, flat gold-yellow buildings on one side of it, solid black and process blue
on the other. Mood: enormous and strange. **From here through page 18 the
gold-yellow and red inks are withheld — process blue and black only, with
newsprint cream showing through.** The only yellow permitted on this page is in
the buildings that have not gone out yet. No lettering.

`pages/15.png`: **Layout: two horizontal panels stacked, equal height, thin
cream gutter, hard black borders.** [STYLE ANCHOR] TOP PANEL: Full dark by a
different oak in the park. Silhouette from behind of a small girl of around
three or four, of any background, in bright summer clothes damp from rain,
dark hair in two small pigtails, both fists pressed under her chin, looking up
into the dark canopy with her mouth open in a cry. A distant lightning flash
throws her outline in hard cream against solid black. BOTTOM PANEL: Kinley,
described exactly as above but hair now damp and clinging, is a step or two
from the base of the same oak, both hands lifting one of her braids toward
her face and staring down at the beads. The beads catch the lightning cream but
hang with ordinary rain-weight and no stillness. Elijah stands just behind her
at the edge of frame, cap already in his hand. Composition: top panel wide and
lonely; bottom panel tighter on Kinley's confusion. Mood: her power stopped
working. **Process blue and black only, newsprint cream for the lightning. No
gold-yellow, no red.** No lettering.

`pages/16.png`: **Layout: two vertical panels side by side, equal width, thin
cream gutter, hard black borders.** [STYLE ANCHOR] LEFT PANEL: Kinley,
described exactly as above, starts climbing the oak in the full dark and rain,
reaching for the first big branch, braids dark and dripping. RIGHT PANEL:
Kinley is on the lowest big branch — one foot slipped off and hanging in air,
the other foot wedged against the trunk, both hands clamped around the bark,
cheek pressed to the trunk. Her eyes are closed and her jaw is set with the
effort of holding still, not with fear. A lightning flash behind the trees
throws her into hard cream silhouette. Mood: stuck, holding, quiet. **Process
blue and black only.** No lettering.

`pages/17.png`: **Layout: two horizontal panels stacked, equal height, thin
cream gutter, hard black borders.** [STYLE ANCHOR] TOP PANEL: Elijah,
described exactly as above, pulls the plain black baseball cap down onto his
head in the full dark and rain, knees bending, decision on his face. BOTTOM
PANEL: Elijah launches upward from the wet grass, low angle and strong
foreshortening, a lightning fork behind the trees throwing him into stark
silhouette with a hard cream rim along his shoulders and the brim of the cap.
Mood: decided. **Process blue and black only.** No lettering.

`pages/18.png`: **Layout: two vertical panels side by side, equal width, thin
cream gutter, hard black borders.** [STYLE ANCHOR] LEFT PANEL: Elijah,
described exactly as above with cap on, hangs in the rainy dark beside
Kinley's low branch, one arm around her waist, the other supporting her
elbow, easing her downward. Kinley's feet are inches off the branch. Radial
speed lines behind him in process blue. RIGHT PANEL: A few seconds later,
Elijah alone in the air higher up the oak, about as high as a porch roof.
The tabby — described exactly as above, but her ginger coat reading as pale
cream in the dark — is tucked inside his shirt so her face and one paw
show at the collar. He is already beginning to come down. Rain in dense
diagonal hatching. Composition: both panels vertical action, Elijah as the
constant, Kinley on left and the cat on right, tree bark textured behind
both. Mood: two rescues, one after the other. **Process blue and black
only — the tabby's coat reads cream, not ginger, because the light is
gone.** No lettering.

`pages/19.png`: **Layout: one wide top panel over two smaller bottom panels,
thin cream gutters, hard black borders.** [STYLE ANCHOR] TOP PANEL: The
streetlights of the whole park slam back on at once — full-strength
gold-yellow and red flooding the frame after five dark pages, radiating from
the lamps in hard-edged rays over the dripping park. BOTTOM LEFT PANEL: Elijah,
described exactly as above, has just landed on the picnic blanket with Kinley
beside him; Mama has one arm around Elijah and one around Kinley, and Dada is
sitting down flat on the wet grass. BOTTOM RIGHT PANEL: The small girl from
page 15 kneels on the wet grass hugging the tabby against her chest, mouth open
in a relieved cry, the tabby's ginger coat now reading fully warm again, while
Auntie Indira, Uncle Manav, and Azi lean in from the blanket. All adults
described exactly as above. Mood: relief that hasn't finished arriving. This is
the brightest page in the book. No lettering.

`pages/20.png`: **Layout: one wide top panel over two smaller bottom panels,
thin cream gutters, hard black borders.** [STYLE ANCHOR] TOP PANEL: A small
bedroom at night. Elijah, described exactly as above but in soft clean pajamas
with damp hair, lies on his side under the covers looking at the plain black
baseball cap hanging on the bedpost. One warm gold-yellow lamp on the bedside
table; rain running down the dark window in fine ink lines. BOTTOM LEFT PANEL:
Kinley, described exactly as above but in pajamas, stands in the lit doorway
with one hand on the frame, looking back at her brother; her beaded braids catch
the hall light and hang quiet with only the smallest motion arc on one bead.
BOTTOM RIGHT PANEL: A pulled-back view through the doorway, Elijah small and
sleepy in bed, cap on the bedpost, rain on the window. **Quiet inking — no speed
lines, no radial bursts, no dramatic angle. Camera at Elijah's eye level, large
calm flat colour fields, minimal halftone.** Mood: still, warm, done. No
lettering.

---

## Pacing note

The comic idiom peaks and releases on purpose:

- **Pages 1–2** — ordinary world before the call, two-panel pages, moderate
  inking, warm gold flat fields.
- **Pages 3–6** — the earning arc. Panels carry the crowd reveal, climb, top-of-
  tree discovery, and return.
- **Pages 7–8** — powers awaken. Two-panel pages show the before/after of the
  cap and the first jump.
- **Pages 9–11** — Kinley's reveal, told through boxes: run-in, bead reveal,
  understanding, pact.
- **Page 12** — the practice montage. Three horizontal panels.
- **Pages 13–14** — the storm sets in through paired panels: family/weather,
  thunder/blackout.
- **Pages 15–18** — the rescue. Colour drains to two inks, with panels for the
  stuck branch, the decision, and the two-part rescue.
- **Page 19** — the release. The brightest page, but still paneled: lights,
  family embrace, child and cat.
- **Page 20** — the comic vocabulary softens but stays boxed. Level camera, flat
  calm colour, no motion lines, two quiet panels.
