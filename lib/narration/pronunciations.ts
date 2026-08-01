// Pronunciation dictionary — word-boundary text substitution before
// text goes to ElevenLabs. Keys match case-insensitively; the substitute
// is what the model actually receives ("Ah-zee" instead of "Azi"). The
// reader displays the original text — this only affects narration.
//
// Two layers merge: content/pronunciations.json is the global (Azi, Dada,
// Lito, family names) + optional per-book overrides in story.json.
// Per-book wins on conflicts.

export type PronunciationMap = Record<string, string>;

/** Merge multiple maps, later wins. Keys keyed by lowercase for the
 *  case-insensitive lookup that applyPronunciations performs. */
export function mergePronunciations(...layers: (PronunciationMap | undefined | null)[]): PronunciationMap {
  const out: PronunciationMap = {};
  for (const layer of layers) {
    if (!layer) continue;
    for (const [k, v] of Object.entries(layer)) {
      if (k.startsWith('_')) continue; // convention: keys starting with _ are comments
      out[k.toLowerCase()] = v;
    }
  }
  return out;
}

/** Substitute pronounced-differently words in-place using word boundaries.
 *  Case-preserving heuristic: if the source token is Titlecase, we
 *  Titlecase the replacement (Azi → Ah-zee); if ALL CAPS, we ALL CAPS
 *  the replacement; if lowercase, lowercase. This keeps the model's
 *  cadence expectations aligned with the original text's capitalization. */
export function applyPronunciations(text: string, dict: PronunciationMap): string {
  if (!text || Object.keys(dict).length === 0) return text;

  // Build one big alternation regex so we walk the text once.
  const keys = Object.keys(dict)
    .filter((k) => k.length > 0)
    .sort((a, b) => b.length - a.length); // longer first — greedy match
  if (keys.length === 0) return text;

  const escaped = keys.map(escapeRegex).join('|');
  const re = new RegExp(`\\b(${escaped})\\b`, 'giu');

  return text.replace(re, (match) => {
    const lower = match.toLowerCase();
    const replacement = dict[lower];
    if (!replacement) return match;
    if (match === match.toUpperCase()) return replacement.toUpperCase();
    if (match[0] === match[0]?.toUpperCase()) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    return replacement.toLowerCase();
  });
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
