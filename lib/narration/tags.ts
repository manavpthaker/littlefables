// Emotion-tag inference. Given a segment produced by segmentPage(), decide
// which ElevenLabs v3 audio tag (if any) to prepend before sending to the
// model. Tags are only emitted when the caller says v3-style brackets are
// supported (v3 model); on multilingual_v2 we return '' so the text goes
// through unadorned and the voice reads punctuation naturally.
//
// The heuristic is deliberately conservative — tagging too aggressively
// makes narration feel theatrical. Most quotes stay untagged; only strong
// signals (whispered/shouted verbs, ! in dialogue) get a tag.

import type { Segment } from './segment';

const WHISPER_VERBS = new Set([
  'whispered',
  'whispers',
  'murmured',
  'murmurs',
  'muttered',
  'mutters',
  'breathed',
  'breathes',
  'sighed',
  'sighs',
]);

const LOUD_VERBS = new Set([
  'shouted',
  'shouts',
  'yelled',
  'yells',
  'cried',
  'cries',
  'called',
  'calls',
  'exclaimed',
  'exclaims',
  'howled',
  'howls',
  'growled',
  'growls',
]);

const LAUGH_VERBS = new Set([
  'laughed',
  'laughs',
  'giggled',
  'giggles',
  'squeaked',
  'squeaks',
]);

export interface TagContext {
  /** When false, return '' — bracket tags only work on ElevenLabs v3. */
  supportsBrackets: boolean;
}

/** Return a v3 tag prefix (with trailing space) to prepend, or ''. */
export function tagsFor(seg: Segment, ctx: TagContext): string {
  if (!ctx.supportsBrackets) return '';
  if (!seg.quoted) {
    // Narrator: leave alone. A calm narrator over a heavy tag is worse
    // than no tag at all.
    return '';
  }
  const verb = (seg.reportingVerb ?? '').toLowerCase();
  if (verb && WHISPER_VERBS.has(verb)) return '[whispers] ';
  if (verb && LAUGH_VERBS.has(verb)) return '[laughing] ';
  if (verb && LOUD_VERBS.has(verb)) return seg.endsWith === '!' ? '[shouting] ' : '[louder] ';
  if (seg.endsWith === '!') return '[excited] ';
  if (seg.endsWith === '?') return ''; // v3 handles question intonation natively
  return '';
}
