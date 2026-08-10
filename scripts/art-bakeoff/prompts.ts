/**
 * Prompt builders for the bake-off. Ported from little-fables/lib/art/prompts.ts
 * with the substance intact, because the substance is the point: every provider
 * must receive a byte-identical prompt or the comparison measures prompt
 * variance instead of model quality.
 *
 * The two rules that carried over from the old pipeline:
 *
 *  - Reference position is stated in words. The model is told "the FIRST N
 *    images are the character sheet", which is why RefImage order is
 *    load-bearing (see providers/types.ts).
 *  - Some names trip content filters. Google's PROHIBITED_CONTENT filter
 *    rejects trademarked names outright, so display names get substituted
 *    while the identity fields that actually shape the drawing survive.
 */

export interface CastMember {
  id: string;
  name: string;
  role: string;
  species?: string;
  visualAnchors?: string[];
  /** Props that must persist across every page they appear on. The single
   *  hardest thing to hold, and therefore the sharpest scoring signal. */
  persistentProps?: string[];
}

export interface StyleAnchor {
  /** The verbatim style block appended to every prompt, unchanged, all book. */
  anchor: string;
  paletteHint: string;
  /**
   * The verbatim SETTING block, appended to every page prompt (not the sheet,
   * which is characters on plain paper). Same trick as the style anchor, aimed
   * at the other thing that drifts: props the story names but never describes.
   *
   * Run 2026-08-09T10-46-34 is why this exists. Seedream read the story's
   * "lamp" as a domestic one and drew a floor lamp with a power cord standing
   * on a zebra crossing (page 3) and a table lamp with a trailing flex (page 8).
   * Character anchors held on both pages — the object the plot turns on is what
   * broke, because nothing in the prompt ever said what it looked like.
   */
  worldAnchor?: string;
}

/**
 * Repeated verbatim in both builders. Not stylistic: a book with a word printed
 * on the art is unshippable, so this is a hard gate, and the earlier
 * "no text, no captions" wording did not hold. Seedream signed page 0 and
 * page 6 and hand-lettered "Nila" and "Pim" into the corners of page 8 — none
 * of which are captions, so none of which the old phrasing forbade. Enumerate
 * the forms; a category name is not a constraint.
 */
const NOTHING_WRITTEN = [
  'Nothing written anywhere in the image: no text, no captions, no speech',
  'bubbles, no page numbers, no character name labels, no artist signature,',
  'no monogram, no handwriting, no watermark, no logo, no borders, no frames.',
].join('\n');

/** Trademarked or filter-tripping names → safe substitutes. */
const SAFE_NAMES: Record<string, string> = {};

function safeName(name: string): string {
  return SAFE_NAMES[name] ?? name;
}

function anchorsFor(c: CastMember): string {
  const anchors = (c.visualAnchors ?? []).join(', ');
  const props = (c.persistentProps ?? []).join(', ');
  return [anchors, props ? `always carries/wears: ${props}` : ''].filter(Boolean).join('; ');
}

/**
 * Phase 1 — the character reference sheet. Generated once per provider from
 * text alone, then fed back as the character reference for every page. This
 * mirrors the manual playbook's "lock the character sheet first and reference
 * it on every page rather than re-deriving the child each time".
 */
export function characterSheetPrompt(cast: CastMember[], style: StyleAnchor): string {
  const lines = cast.map(
    (c) => `  - ${safeName(c.name)} (${c.role}${c.species ? `, ${c.species}` : ''}) — ${anchorsFor(c)}`,
  );
  return [
    "Character reference sheet for a children's picture book.",
    '',
    style.anchor,
    `Palette: ${style.paletteHint}`,
    '',
    'Characters on this sheet:',
    ...lines,
    '',
    'Lay them out side by side on one clean sheet, each shown in three poses:',
    '(1) standing three-quarter view, (2) leaning in / listening, (3) mid-motion.',
    '',
    'Plain paper background.',
    NOTHING_WRITTEN,
    'The same character must be identical between its own three poses — same',
    'silhouette, same face, same colours, same props.',
  ].join('\n');
}

/**
 * Phase 2 — one page. `characterRefCount` is stated in the prompt so the model
 * knows which leading images are identity and which are style; get this out of
 * sync with the actual RefImage array and character fidelity quietly degrades
 * into style-only conditioning.
 */
export function pagePrompt(opts: {
  pageText: string;
  prevText?: string;
  cast: CastMember[];
  present: CastMember[];
  style: StyleAnchor;
  characterRefCount: number;
  /** Scene direction from the story file — what makes this page a stress test. */
  direction?: string;
  /**
   * Suppress the world anchor for a page that leaves the anchored setting.
   * The anchor is appended verbatim to every page precisely so props the story
   * names but never describes cannot drift — but an anchor describing an
   * outdoor crossing, injected under a composition that says "interior
   * kitchen", is a contradiction the model has to resolve, and whichever way
   * it resolves it we would be scoring the prompt rather than the model.
   */
  offWorld?: boolean;
}): string {
  const { pageText, prevText, present, style, characterRefCount, direction, offWorld } = opts;

  const castLines = present.length
    ? present.map((c) => `  - ${safeName(c.name)} — ${anchorsFor(c)}`).join('\n')
    : '  - (no named characters on this page — illustrate the setting and mood)';

  const refLine =
    characterRefCount > 0
      ? `The FIRST ${characterRefCount === 1 ? 'reference image is' : `${characterRefCount} reference images are`} the CHARACTER REFERENCE SHEET. Match it exactly: same face, same silhouette, same colours, same props. Any remaining reference images show only the illustration STYLE.`
      : 'The reference images show the illustration style.';

  return [
    "Illustrate EXACTLY this moment from a children's picture book:",
    '',
    `"${pageText}"`,
    '',
    ...(prevText ? [`(The previous page read: "${prevText}")`, ''] : []),
    ...(direction ? [`Composition: ${direction}`, ''] : []),
    'Characters present:',
    castLines,
    '',
    refLine,
    '',
    style.anchor,
    `Palette: ${style.paletteHint}`,
    ...(style.worldAnchor && !offWorld ? ['', style.worldAnchor] : []),
    '',
    'Render as a single scene. Do not add any human character who is not listed',
    'above.',
    NOTHING_WRITTEN,
  ].join('\n');
}
