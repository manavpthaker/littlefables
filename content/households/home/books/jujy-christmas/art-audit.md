# Jujy Christmas Art Audit

Source folder audited: `/Users/manavthaker/Little Fables Stories/Jujy Christmas Adventure/V04`

## Findings

- The old source art has a strong unified holiday-storybook direction, but the requested refresh is now locked to `pages/01.png`, `pages/02.png`, `pages/09.png`, and `pages/10.png`: richly rendered candlelit Christmas storybook gouache, dark warm interiors, golden lamps and tree light, pine green, cranberry red, and snowy blue night.
- The source package is incomplete for the app story: it has cover/back-cover/map art plus 11 scene illustrations, while `story.json` has 45 reading pages.
- `pages/11.png` was mapped from `little-fables_jujy-xmas_V04_compass-map-01.jpg`, which is decorative map/back-matter art, not story page 11. Page 11 should show Santa handing Jujy the glowing compass.
- The old source includes readable words in several places: cover title, bus sign, bakery sign, station sign, and small decorative marks. New interior pages should avoid readable text and use blank signs/panels when the story location implies signage.
- Jujy's costume drifts in the old art: some scenes add a Santa hat. New pages should keep Jujy consistent with only the red snowflake cape and small green bow after the transformation.
- The old bus-stop scene includes an extra small monkey-like side character. New pages should not include extra animal companions; Jujy is the only animal character unless the story text explicitly says otherwise.
- The old source is square print-book art. New interior pages should use consistent 4:3 landscape app-page framing while preserving the same visual style.
- Early regenerated family pages drifted into a new portrait-like family look. They do not match Azi, Mama, or Papa as established across existing books.

## Resolution

- Keep the old `V04` art as a Jujy/Christmas source reference and leave the source folder unchanged.
- Regenerate a complete `pages/01.png` through `pages/45.png` set as unified 4:3 interior illustrations.
- Use `previews/CHARACTER-CANON-existing-books.jpg` and the sampled existing pages from `word-collector`, `rain-inside`, `little-bhen`, `papa-moon`, and `midnight-train` as the visual canon for Azi, Mama, and Papa.
- Use `pages/11.png` only for Jujy/Santa/compass continuity where it does not conflict with the approved pages 01/02/09/10 style lock.
- The rejected antique-card family portrait lock was removed because the family likeness drifted.
- Do not use the map or back cover as story-page art.
- Keep the existing cover as source-derived cover art unless a separate cover refresh is requested.
