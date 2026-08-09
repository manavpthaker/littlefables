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
}

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
    'Plain paper background. No text, no labels, no captions, no borders, no frames.',
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
}): string {
  const { pageText, prevText, present, style, characterRefCount, direction } = opts;

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
    '',
    'Render as a single scene. No text, no captions, no speech bubbles, no page',
    'numbers, no borders, no frames. Do not add any human character who is not',
    'listed above.',
  ].join('\n');
}
