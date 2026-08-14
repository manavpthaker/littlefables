# Art prompts — Elijah Goes First

Twenty-one images: one cover at 1:1, twenty pages at 4:3.

Generated using the common Little Fables style anchor from `content/ART-PROMPT.md`:

> hand-painted storybook illustration in layered gouache and watercolor, visible
> brushwork, the richness of a mid-century illustrated classic, aged palette
> (aged ivory #EDE3CE, walnut ink #2A1D12, oxblood #7D2E2B, tarnished brass
> #A67C3A, pre-war forest green #2E4B3B, burnished gilt #B89154, deep navy
> #233450), one clear focal moment, natural composition, gentle depth, no text,
> no logos, no watermarks, no photorealism, no harsh contrast, no screens or
> modern tech

**Do the cover first**, then attach it as a style + likeness reference
(`--sref` / `--cref`, Flux Redux, Gemini image-to-image) on every page prompt.
Per `content/bakeoff/README.md` the answered-and-settled generator is **GPT
Image 2 via fal**. That single reference step matters more than anything else
here.

Use `character-notes.md` **verbatim** for every recurring character. Every
person in this book is a real human being — never plush, animal-like, furry, or
muzzle-faced. Heritage is context, not costume; all clothing stays modern and
everyday.

**Reject and regenerate** any output with: visible text or letterforms of any
kind, a logo on the cap, a different Elijah or Kinley, birthday iconography
(cake, candles, balloons, banners, party hats, wrapped presents), a palette that
drifts pastel or neon, or warm gold light on pages 14–17.

Save as `cover.png` and `pages/01.png` … `pages/20.png` in this folder. These
stay local — `.gitignore` keeps PNGs out of the repo; `pnpm content:add` pushes
them to Supabase Storage.

---

## Cover — 1:1

`cover.png`: Book cover art for "Elijah Goes First", no title text. Elijah, a
six-year-old Black boy with warm deep-brown skin, a round open face, large dark
eyes, and short dense black curls kept close to his head, wearing a navy
short-sleeve shirt with a red collar band, olive-and-tan camouflage cargo pants,
and navy sneakers with white soles, hangs in the air about as high as a porch
roof over a rain-wet Atlanta park at night, arms out, plain black baseball cap
with no text or logo sitting down near his eyebrows. Below him and to one side,
Kinley, a nine-year-old Black girl with warm brown skin, a steady watchful face,
and long dark box braids with small colorful beads at the ends, wearing a pale
pink t-shirt, cream leggings with tiny dots, and white sneakers, stands on the
grass looking straight up at him with one arm raised and pointing. The gold
skyline glows behind them through the last of the rain; puddles hold the light.
Composition centers Elijah with Kinley anchoring the lower third and room above
for sky. Mood: joyful, secret, and a little bit airborne.

---

## Page scenes — 4:3

`pages/01.png`: A hot, still Atlanta street on the hottest afternoon of June.
Row houses and a tall old oak, heat haze over the asphalt, cicada shells on a
fence post, a fan turning in an open window. Elijah, a six-year-old Black boy
with warm deep-brown skin, a round open face, large dark eyes, and short dense
black curls kept close to his head, wearing a navy short-sleeve shirt with a red
collar band and olive-and-tan camouflage cargo pants, sits alone on a hot
concrete step with his chin in both hands. Flat white heat, hard shadows.
Composition: wide, Elijah small in a big bright quiet. Mood: waiting, sticky,
end-of-patience. No birthday decorations anywhere. No text, no logos.

`pages/02.png`: Elijah, described exactly as above, stands next to his sister on
the same front walk. Kinley, a nine-year-old Black girl with warm brown skin, a
steady watchful face, and long dark box braids falling past her shoulders with
small colorful beads threaded at the ends, wearing a pale pink t-shirt with a
soft faded graphic, cream leggings with tiny multicolored dots, and white
sneakers, reaches up easily to a high shelf on the porch while Elijah watches
from below, clearly a head shorter. Her beads swing and catch the light. Same
flat white heat and hard shadows as the previous page — identical lighting.
Composition: medium, the height difference is the whole subject. Mood: fond,
slightly outraged. No text, no logos.

`pages/03.png`: The inside of a small burrito restaurant in the evening: a deep
blue painted wall, a warm wood-plank ceiling, a stainless counter, a red drinks
cooler glowing softly. Elijah and Kinley, described exactly as above, come
through the door together. High up on the counter, alone in a pool of light,
sits a plain black baseball cap with no text or logo. Warm interior light.
Composition: wide interior, the cap small but unmistakably the brightest thing.
Mood: ordinary evening with one odd detail. No birthday decorations. No text, no
logos.

`pages/04.png`: Close on the stainless counter from a low angle, the way it
looks to somebody short. Elijah, described exactly as above, is up on his toes
with one arm stretched as far as an arm goes, fingers spread, still well below
the plain black baseball cap on the counter edge. Blue wall and wood ceiling
behind. Warm interior light. Composition: low angle, counter edge cutting high
across the frame, the cap just out of reach. Mood: strain and stubbornness. No
text, no logos.

`pages/05.png`: The same low angle, the same counter, the same reaching boy —
but Elijah's navy sneakers have left the floor by two inches, and there is a
small shadow under them where there should not be one. Nothing else in the room
has changed. Warm interior light. Composition: identical framing to the previous
page so the only difference the eye finds is the gap under his shoes. Mood: the
held-breath second. No text, no logos.

`pages/06.png`: Elijah, described exactly as above, stands flat on the floor in
the middle of the restaurant holding the plain black baseball cap in both hands,
absolutely still, staring down at it. Behind him Kinley, described exactly as
above, has stopped mid-step with her mouth slightly open; her beaded braids hang
completely motionless. Warm interior light, blue wall, wood ceiling. Composition:
medium, Elijah foreground with the cap, Kinley sharp behind him. Mood: astonished
and secret. No text, no logos.

`pages/07.png`: The service alley behind the restaurant at golden hour — cracked
asphalt, two dumpsters, a chain-link fence, weeds at the base of a brick wall.
Elijah, described exactly as above, is mid-jump about as high as a mailbox, knees
up, laughing openly, the plain black baseball cap down over his eyebrows. Low
gold sun, long shadows across the asphalt. Composition: medium-wide, the whole
unglamorous alley, one boy in the air. Mood: pure delight in a plain place. No
text, no logos.

`pages/08.png`: Kinley, described exactly as above, sits on an upturned crate in
the same golden alley, forearms on her knees, telling her brother something she
has held for a long time. Elijah stands in front of her, cap in hand, listening
hard. Her beaded braids hang dead still. Low gold sun, long shadows on asphalt —
identical light to the previous page. Composition: medium, the two of them facing
each other, alley receding behind. Mood: confiding, a weight set down. No text,
no logos.

`pages/09.png`: Close on Kinley in the same alley, described exactly as above,
looking down at her own open hands in her lap. Elijah is beside her at the edge
of frame, quiet. Golden alley light, same as before. Composition: close, hands in
the lower third, her face above them. Mood: honest and a little sad. No text, no
logos.

`pages/10.png`: Elijah, described exactly as above, turns the plain black
baseball cap over in his hands, working something out. Kinley watches him
sideways, one eyebrow up, a single bead caught mid-click. Same golden alley, sun
lower now. Composition: close-to-medium, both faces, the cap between them. Mood:
an idea arriving. No text, no logos.

`pages/11.png`: A three-part montage of small saves on ordinary Atlanta streets
in bright daylight, arranged naturally in one scene rather than as panels: a
glass tumbler tipping off a table edge with Elijah's hand already under it; a
loose brown dog trailing its leash along a sidewalk with Kinley pointing and
Elijah running; a red balloon slipping from a small girl's fist outside a
market. Both children described exactly as above. Bright ordinary daylight.
Composition: wide, three small events in one continuous street. Mood: busy,
capable, unglamorous. No text, no logos.

`pages/12.png`: Elijah and Kinley, described exactly as above, sit side by side
on their front steps in flat afternoon light, not looking at each other, arguing
comfortably. The plain black baseball cap sits on the step between them. Bright
ordinary daylight. Composition: medium, both children level in frame, cap dead
center. Mood: sibling disagreement with no heat in it. No text, no logos.

`pages/13.png`: A green city park at the moment before a summer storm. A picnic
blanket on the grass with the whole family on it: Elijah and Kinley described
exactly as above; Mama, a Black woman in her late thirties with warm brown skin,
long dark wavy hair, an open bright smile, a fine gold chain, wearing an olive
utility jacket over a black top; Daddy, a Black man in his late thirties with
warm deep-brown skin, a cleanly shaved head, a neat full dark beard, wearing a
dark navy button-down with sleeves pushed up; Uncle Manav, a modern human father
in his 40s of Indian/Gujarati heritage with warm medium-brown skin, short dark
hair with close faded sides, a neatly trimmed full beard with subtle
salt-and-pepper, dark kind eyes behind clear round frames, wearing a lightweight
denim shirt; Auntie Indira, a modern human mother in her 40s of Colombian
heritage with warm medium-brown skin, dark almond eyes, smooth shoulder-length
dark hair, delicate gold jewelry, wearing a cream-and-charcoal striped top; and
Azi, a preschool-age boy with warm medium-brown skin, soft round cheeks, large
dark expressive eyes, dense tousled black curls in a rounded halo, a small red
thread bracelet, wearing a yellow play shirt. The sky above them has gone the
color of a plum; the last green light before rain. Composition: wide, the whole
group low in frame under an enormous bruised sky. Mood: warm gathering, weather
coming. No text, no logos.

`pages/14.png`: The Atlanta skyline seen across the park as the lights go out
block by block — a diagonal line of darkness moving across the city, gold
buildings on one side of it, deep navy nothing on the other. Rain starting.
Tiny figures on the grass in the foreground. Composition: very wide, the city as
the subject, people small. Mood: enormous and strange. **No warm light anywhere
except the buildings that have not gone out yet.** No text, no logos.

`pages/15.png`: Full dark in the park, rain falling. Kinley, described exactly as
above, has both hands locked around Elijah's wrist and is speaking urgently
close to his face; her beaded braids hang absolutely still. Elijah, described
exactly as above, is already turning to look toward the water. The only light is
a distant lightning flash and a scatter of fireflies over the grass. Deep navy
and walnut only. Composition: close, two faces in near-darkness. Mood: urgent,
no panic. **No gold light.** No text, no logos.

`pages/16.png`: Elijah, described exactly as above, pulls the plain black
baseball cap down onto his head in the dark and rain, knees bending, about to
go. Kinley is behind him with one arm still out. Lightning behind the trees.
Deep navy and walnut only. Composition: medium, Elijah centered and coiled.
Mood: decided. **No gold light.** No text, no logos.

`pages/17.png`: Elijah, described exactly as above, hangs in the rainy dark about
as high as a porch roof over the edge of a park pond, coming down toward Azi,
described exactly as above, who stands at the water's edge in his yellow play
shirt with both hands cupped around nothing, looking for a light that has gone
out. Fireflies drift around them. Deep navy, walnut, and one thread of
firefly-green. Composition: wide vertical space between the boy in the air and
the boy on the ground. Mood: tender and urgent at once. **No gold light.** No
text, no logos.

`pages/18.png`: The streetlights of the whole park come back on at once. Elijah,
described exactly as above, has just landed on the picnic blanket with Azi held
against his shoulder; Azi is holding on hard. Auntie Indira is reaching for
them; Daddy has sat straight down on the wet grass; Mama has one arm around
Elijah and one around Kinley; Uncle Manav stands with both hands on his head.
All adults described exactly as above. Everything wet, everything gold, rain
still falling through the light. Composition: medium-wide, the whole group
collapsing inward toward the two boys. Mood: relief that hasn't finished
arriving. No text, no logos.

`pages/19.png`: A small bedroom at night. Elijah, described exactly as above but
in soft clean pajamas with damp hair, lies on his side under the covers looking
at the plain black baseball cap hanging on the bedpost. One warm low lamp; rain
running down the dark window. Composition: medium, boy in the lower half, cap
catching the lamplight above him. Mood: the good kind of tired. No text, no
logos.

`pages/20.png`: The same bedroom, the lamp lower still. Kinley, described exactly
as above but in pajamas, stands in the lit doorway with one hand on the frame,
looking back at her brother; her beaded braids catch the hall light. Elijah's
eyes are nearly closed. Rain soft on the glass. Composition: medium, doorway
light on the left, sleeping boy on the right, the whole room settling. Mood:
still, warm, done. No text, no logos.
