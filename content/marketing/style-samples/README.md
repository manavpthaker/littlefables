# Style samples

Three sample spreads, each in a deliberately different medium, used to show a
buyer that the art style is built from their taste rather than picked off a
list of presets. This is the one claim that separates us from Wonderbly, and
it is much easier to show than to write.

| File | Medium | Palette | Subject |
|---|---|---|---|
| `painterly.png` | oil/gouache, heavy impasto | dusk amber, umber | boy, dog, lantern, porch |
| `cutpaper.png` | torn-paper collage, visible fibre | sky blue, butter, red | girl, kite, meadow |
| `woodcut.png` | woodcut / linocut, single-block | oxblood + cream + gilt | boy, fox, moon, snow |

`_source-strip.png` is the original three-up as delivered. The individual files
were cut from it by column-variance detection, not by hand, so recutting is
repeatable if the strip is ever regenerated.

These are **irreplaceable source art**, not build output — they came out of an
image-generation session, not a script, so they are committed rather than
gitignored. `video/public/styles/` holds copies for the film and *is* ignored;
re-copy from here if it is ever cleaned.

Resolution is ~615×460. Fine at three-up in a 1920 frame, where each lands
around 540px wide and is very slightly downscaled. Do not fill a 1080p frame
with one of them — it would be a 1.8x upscale and go soft.
