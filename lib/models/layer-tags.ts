// Developmental layer tags (redesign brief): every book carries one, shown as
// a chip on covers and used to group the shelf. Authored (backfill / Maker);
// deriveLayerTag is the keyword fallback for books that predate authoring.

export const LAYER_TAGS = ['sleep', 'feelings', 'courage', 'self'] as const;
export type LayerTag = (typeof LAYER_TAGS)[number];

export const LAYER_TAG_LABELS: Record<LayerTag, string> = {
  sleep: 'Sleep',
  feelings: 'Feelings',
  courage: 'Courage',
  self: 'Self',
};

export const LAYER_TAG_EMOJI: Record<LayerTag, string> = {
  sleep: '🌙',
  feelings: '🎵',
  courage: '🌱',
  self: '🫂',
};

// Chip pigments per DS rules-of-use: terracotta is action-only, so tags use
// the calm pigments. Values are CSS custom-property names from tokens/colors.css.
export const LAYER_TAG_PIGMENT: Record<LayerTag, string> = {
  sleep: '--dusk',
  feelings: '--berry',
  courage: '--marigold',
  self: '--teal',
};

// Stem-anchored (leading \b, no trailing \b) so plurals / inflections match:
// `feeling` matches "feelings"; `fear` matches "fears"/"fearful"; `emotion`
// matches "emotional". Prior form used \bstem\b and missed every inflected
// form in pack-000 teaching goals — silently collapsing the 4-tag palette
// to 2 in practice. Rely on PRIORITY order + curated stems to avoid overlap.
const KEYWORDS: Record<LayerTag, RegExp> = {
  sleep: /\b(sleep|bedtime|night|rest|dream|calm|quiet|wind[- ]?down|drowsy|snuggle|lullab)/i,
  courage: /\b(brave|bravery|courage|fear|scared|afraid|try|bold|dar[ei]|risk|new thing|first time)/i,
  feelings: /\b(feel|felt|emotion|sad|angry|anger|mad|happy|joy|worry|worried|frustrat|upset|cry|tear|big feeling)/i,
  self: /\b(self|identity|belong|kind|share|sharing|friend|family|who (i|you) am|confiden|proud|pride|grow|becom)/i,
};

// Order matters: sleep and courage are the most specific signals; feelings is
// broad; self is the gentle default for teaching-goal books.
const PRIORITY: LayerTag[] = ['sleep', 'courage', 'feelings', 'self'];

export function deriveLayerTag(teachingGoals: string[], originNote?: string | null): LayerTag {
  const haystack = [...teachingGoals, originNote ?? ''].join(' ');
  for (const tag of PRIORITY) {
    if (KEYWORDS[tag].test(haystack)) return tag;
  }
  return 'self';
}
