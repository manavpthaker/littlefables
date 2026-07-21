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

const KEYWORDS: Record<LayerTag, RegExp> = {
  sleep: /\b(sleep|bedtime|night|rest|dream|calm|quiet|wind[- ]?down)\b/i,
  courage: /\b(brave|courage|fear|scared|afraid|try|bold|dar(e|ing))\b/i,
  feelings: /\b(feel|feeling|emotion|sad|angry|mad|happy|worry|worried|frustrat|big feelings)\b/i,
  self: /\b(self|identity|belong|kind(ness)?|share|sharing|friend|family|who (i|you) am|confiden)\b/i,
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
