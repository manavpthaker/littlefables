# Little Fables — UI kit

A clickable pass through the product's three surface types, composed entirely from the design-system components (`_ds_bundle.js`), tokens, and the mark.

- `index.html` — shell with an ink rail: kid home → reader → checkpoint → chapter map; Parent Corner (Tonight / Orders / Settings); Outward (landing, Etsy hero, Pinterest pin, gift certificate, coloring page, five email variants).
- `kid-screens.jsx` — `KidHome`, `KidReader`, `KidCheckpoint`, `KidMap`. Kid density (default), voice-first (`data-utterance` everywhere), numerals written out.
- `parent-screens.jsx` — `ParentCorner` at `data-density="parent"`. Evidence-forward copy; never renders under bedtime.
- `outward-screens.jsx` — `Outward` at `data-density="outward"`. Static; the mark never animates here.

Placeholders, on purpose: the reader's full-bleed "illustrations" are pigment-gradient stand-ins; Etsy/pin art fields use the sunburst ornament. Real spreads from the generation pipeline replace them 1:1 — the over-art chrome (scrim/capsule/panel/sheet) is the deliverable here.
