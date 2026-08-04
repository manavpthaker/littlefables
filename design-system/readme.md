# Little Fables — Heritage Design System (v4)

Little Fables makes **custom personalized children's storybooks**: a parent or grandparent buys on Etsy for a specific child; the child becomes the main character; the book is generated (written, illustrated, narrated) and delivered as a PWA saved to the kid's iPad home screen.

**The register is antique folk-craft** — an heirloom object, like something found in a grandmother's attic: a carousel horse, a music box, a first-edition Golden Book. Adults trust it because it feels like it survived; kids love it because it's clearly made for keeping. Not faux-vintage, not cottagecore-Etsy, not kids-tech-startup. Touchstones: N.C. Wyeth's Scribner's classics, Kate Greenaway, William Morris, first-generation Golden Books, carousel carving, Beatrix Potter originals, the bookbinding tradition.

**Sources provided:** brand mark uploads (`uploads/little-fables_logo-tree-01*.jpg/png`, `little-fables_logo-tree-02.jpg`) and the v4 written specification (this system's source of truth, supplied in-chat). No Figma or codebase was attached; every component here is authored from that spec.

## Audiences & densities

Four audiences (kid 3–9, parent, Etsy buyer, print recipient) across three densities set on a surface root:

- `data-density="kid"` (default) — 21px body, 64/56/44px targets, radii 10/16/24/32. Reader, library, checkpoints.
- `data-density="parent"` — 16px body, 44/36/32 targets, radii 6/12/20/28. Settings, order dashboards. WCAG AA floor.
- `data-density="outward"` — 17px body, 48/40/36 targets, radii 8/16/24/32. Etsy, PDFs, emails, marketing.

Same tokens, different scale — never a second system. Note: where the spec's density table and its Shape section disagreed on radii, the Shape section's values (above) are canonical.

## CONTENT FUNDAMENTALS

- **Kid copy** is written to be *spoken* by the buddy character: second person, present tense, warm, brief. Text is a caption to the voice, never the carrier. Sentence case. **Numerals are banned on kid surfaces** ("page four", "four suns"). Errors are in-world: *"The story kitchen is resting. Let's read one from the shelf."* — never "Error/Failed/Try again."
- **Parent copy** is plain, factual, evidence-forward: *"Signals come from checkpoint answers and retellings — evidence, not scores."* No exclamation marks. Truth over reassurance.
- **Buyer copy** is warm, second person, craft-first: *"Your kid, in their own storybook."* · *"Delivered in days. Saved to their iPad like a favorite app."* · *"No ads. No algorithm. No autoplay. Just twenty quiet minutes."* · *"We delete your intake once your book is delivered — unless you say otherwise."*
- Never: "AI-powered", "revolutionary", corporate exclamation marks, emoji, casual/handwritten register.
- **Names are data** — the child's name is always a template variable, never hardcoded.
- Every kid-facing component takes an `utterance` prop → rendered as `data-utterance`. UI utterances ≤ 12 words. Priority: narration > checkpoint > tap feedback > ambient; never talk over narration.
- Labels are lowercase small-caps (IM Fell English SC): "chapter three · the river".

## VISUAL FOUNDATIONS

- **Color**: papers `--paper #EDE3CE` / `--paper-warm #F3EBD8` / `--paper-deep #D9C7A2` (never white — except ColoringPage, since crayons want white); inks `--ink #2A1D12` / `--ink-soft #57432E` / `--ink-faint #8A7156` (never carries meaning). Pigments: `--oxblood #7D2E2B` (the **only** action color, one primary per screen), `--brass #A67C3A` (gilt moments, painting state), `--forest #2E4B3B` (trust, success, delivered), `--gilt #B89154` (borders/ornament only, never body), `--navy #233450` (focus ring 3px/2px offset, listening, frames), `--burgundy #5A2229` (rare, ceremonial; `--danger` alias on parent surfaces only, never on kid). Each pigment has a 12% `-wash`.
- **States**: listening navy, thinking sepia, speaking forest, painting brass, offline paper-deep (a rest, not an error), syncing forest 60%, **mercy brass 40% — never red, never a wrong-buzzer**. No state relies on color alone (motion + earcon pair).
- **Type**: IM Fell English (display), EB Garamond (body/reading), IM Fell English SC (ornamental labels, tracked). Google Fonts, falling back to Georgia/Cambria. Retired forever: Young Serif, Alegreya, Gochi Hand, Inter — no sans-serif, no handwriting, no script.
- **Backgrounds**: flat paper, no textures printed on top (real paper feel via color). Kid reader is full-bleed generated art with exactly four sanctioned over-art forms: **scrim** (paper-cream text in a bottom/top gradient), **capsule** (blur 14px + 1px gilt border), **panel** (`--wash-panel` 96% paper), **sheet** (paper rising over the bottom, double-rule top). Nothing else sits naked over art.
- **Elevation**: paper-on-paper. One warm sepia shadow ramp (`--shadow-card/raised/float`), cards may add a 1px 8% ink border like a bookplate; press *settles* (`--shadow-press` inset), never disappears. No glow, no colored shadows, no neumorphism. Never combine `--shadow-float` with an ornamental border.
- **Shape**: `--radius-sm/md/lg/xl` per density; `--line-weight: 2px` strokes; ornamental double-rule (1px over 2px) reserved for chapter openers, certificates, ceremony.
- **Ornament grammar**: fleuron (section break), double-rule (ceremonial frames), filigree (gilt corners, ceremonial only), sunburst (celebration, echoes the mark), rule-and-dot (fine divider), dropcap (kid chapter openers only). Restraint plus placement; always `aria-hidden`.
- **Motion**: mechanical and deliberate, like a music-box gear. `--motion-tick 200ms` / `wind 600ms` / `settle 1200ms` / `chime 1800ms` / `pulse 3200ms`, eased by `--ease-mechanical/pendulum/chime`. No wobble, spring, or bounce. Hover = wash tint; press = settle + 1px drop. Every animation has a reduced-motion fallback. **No animation on outward surfaces** (the mark may breathe on splash only).
- **The mark** has five formalized motion modes (tokens/motion.css): 1 idle halo breath, 2 cold-boot draw-in (once per session), 3 ray cascade for loading, 4 bloom on success, 5 rare leaf drift (`assets/mark-motion.js`).
- **Lighting**: `[data-lighting=morning|day|dusk|night]` tints paper only — ink and pigments never shift; no theatrical glow. `[data-bedtime]` (kid-only) flips to dark walnut `#1F1A14` with parchment ink `#F0E5CD`; pigments unchanged; Parent Corner and outward surfaces never render dark.
- **Print**: `tokens/print.css` — letter @page, 0.75in margins, exact color printing, motion/hover dead, `.screen-only`/`.print-only`.

## ICONOGRAPHY

Hand-drawn-register line icons at 2px stroke, round caps/joins, warm ink. **Interim substitution: Feather-style stand-ins embedded in `components/core/Icon.jsx`** (self-contained SVG, no CDN) — flagged for replacement by a commissioned hand-carved set. Plus a wood-cut motif set doubling as illustrated ornaments: `motif-sun, motif-moon, motif-book, motif-compass, motif-quill, motif-sheaf, motif-key`. Active/filled states pair an icon with a wash background, not a color fill. Never: emoji, unicode glyphs as icons, Material icons, colorful or gradient icons. The mark ships at `public/icons/` (`mark-ink.svg`, `mark-paper.svg`, `mark-black.svg`, `icon.svg`, PWA rasters); `assets/brand/mark-ink.png` is the recolored original art.

## The mark

The hand-painted tree with sun halo and roots (`assets/brand/mark-source.png`, from the uploads) is the anchor. Raster exports use the real art. The **SVG set is a hand-vectorized interpretation** built for animation (grouped `#mark-halo/#mark-tree/#mark-leaves/#mark-roots`, per-ray/leaf/root `--i` indices) — swap in a traced vector master for pixel-perfect fidelity when available. Lockups via the `Wordmark` component: horizontal, stacked, or mark-only (favicon/app-icon only). Treat a marked surface like a bookplate — the mark is its anchor.

## Components

Core: `Button`, `IconButton`, `Icon`, `Ornament`, `Rule`, `Wordmark`
Kid: `BookCard`, `Shelf`, `Buddy`, `Transport`, `MicOrb`, `ContinueCard`, `WordCapsule`, `TabBar`, `WordJar`
Reader: `StoryText`, `Checkpoint`, `ChoiceBlocks`, `ChapterMap`, `Sheet`, `ReaderTopBar`, `StorySpine`, `PaintingWash`
World: `SunsRow`, `BadgeShelf`, `WordbookEntry`, `Celebration`, `CelebrationQueue`
Parent: `LifecycleChip`, `QARecord`, `ComprehensionProfile`, `CheckpointTranscript`, `ChoiceRecord`, `ListRow`, `Field`, `TextInput`, `SectionHeader`, `ParentTabs`, `ArtApproval`, `RetellingPlayer`
System: `StateBanner`, `ErrorCharacter`, `LoadingMark`
Outward: `MarketingHero`, `TrustRow`, `GiftCertificate`, `ColoringPage`, `EmailShell`, `EtsyHero`, `PinterestPin`, `BuyerFooter`

Each ships `Name.jsx` + `Name.d.ts` + `Name.prompt.md`; specimen card per directory. The buddy's folk-fox drawing is a stand-in for the commissioned character.

## Sound (earcons — for implementation)

Warm wooden/bell family, never synthesized beeps: tap = soft woodblock; star-earned = ascending chime with sparkle tail; page-turn = paper whisper; checkpoint-correct = warm two-note bell; mercy = single softer bell; sync = distant wind-chime; listening-open = gentle inhale tone; celebration = small bell cascade. Duck –6dB under narration.

## Index

- `styles.css` — global entry (imports everything below)
- `tokens/` — fonts, colors, typography, spacing, elevation, motion (+ mark modes), lighting, bedtime, base, print, `tokens.json` mirror
- `guidelines/` — 15 specimen cards + `rules-of-use.md`
- `components/{core,kid,reader,world,parent,system,outward}/` — 51 components + per-group `*.css` and `*.card.html`
- `ui_kits/little-fables/` — clickable app: kid home → reader → checkpoint → map, Parent Corner, outward surfaces
- `assets/brand/` — original mark art + recolored rasters; `assets/mark-motion.js` (leaf drift)
- `public/icons/` — mark SVGs + PWA icons (apple-touch 180, 192, 512, `icon.svg`)
- `SKILL.md`, `CHANGELOG.md`

## Intentional additions

- `markSvg.js` (core) — shared inline-SVG source of the mark so `Wordmark`/`LoadingMark` can animate its parts; not a UI component.
- Icon `motif-*` set — the spec's wood-cut motifs live inside `Icon` rather than as separate files.
