// Split a page of story text into narrator-vs-dialogue segments, tagging
// each with the identified speaker + a reporting verb + the closing
// punctuation of the quoted content. The downstream narration pipeline
// uses those signals to route each segment to the right voice and emit
// an emotion tag when it can be reasonably inferred from context.
//
// This is pure — no ElevenLabs, no config, no side effects. Tested in
// tests/narration/segment.spec.ts.

export type EndPunct = '.' | '!' | '?' | '…' | ',' | null;

export interface Segment {
  text: string;
  /** null = narrator prose; otherwise a character name found in the
   *  provided characterNames list. */
  speaker: string | null;
  /** true if this segment sits inside a "…" quoted span. */
  quoted: boolean;
  /** Verb attributed to this quote in the surrounding prose, if any.
   *  Lowercased. Examples: 'said', 'whispered', 'cried', 'shouted'. */
  reportingVerb: string | null;
  /** Final punctuation of the quoted content (or the narrator sentence),
   *  useful for emotion inference. */
  endsWith: EndPunct;
}

const QUOTE_PAIRS: Array<[RegExp, string]> = [
  [/"([^"]+)"/g, '"'],
  [/“([^”]+)”/g, '“'], // “…”
];

const REPORTING_VERBS = new Set([
  'said',
  'says',
  'whispered',
  'whispers',
  'shouted',
  'shouts',
  'yelled',
  'yells',
  'yelped',
  'yelps',
  'cried',
  'cries',
  'called',
  'calls',
  'sighed',
  'sighs',
  'murmured',
  'murmurs',
  'exclaimed',
  'exclaims',
  'asked',
  'asks',
  'answered',
  'answers',
  'replied',
  'replies',
  'muttered',
  'mutters',
  'breathed',
  'breathes',
  'gasped',
  'gasps',
  'laughed',
  'laughs',
  'giggled',
  'giggles',
  'growled',
  'growls',
  'howled',
  'howls',
  'squeaked',
  'squeaks',
  'yipped',
  'yips',
  'grumbled',
  'grumbles',
  'thought',
  'thinks',
]);

const ADVERB_MOOD: Record<string, string> = {
  softly: 'whispered',
  quietly: 'whispered',
  gently: 'whispered',
  loudly: 'shouted',
  fiercely: 'shouted',
  proudly: 'shouted',
  sadly: 'sighed',
  bravely: 'said',
};

interface RawQuote {
  start: number;
  end: number; // exclusive
  quoteOpenChar: number; // position of the opening quote
  quoteCloseChar: number; // position of the closing quote
  text: string;
}

function findQuotes(text: string): RawQuote[] {
  const found: RawQuote[] = [];
  for (const [pattern] of QUOTE_PAIRS) {
    let m: RegExpExecArray | null;
    const re = new RegExp(pattern.source, pattern.flags);
    while ((m = re.exec(text)) !== null) {
      const start = m.index;
      const end = m.index + m[0].length;
      found.push({
        start: start + 1,
        end: end - 1,
        quoteOpenChar: start,
        quoteCloseChar: end - 1,
        text: m[1] ?? '',
      });
    }
  }
  return found.sort((a, b) => a.quoteOpenChar - b.quoteOpenChar);
}

/** Detect a reporting verb + optional named subject in a small context
 *  window around a quoted span. Handles the two main patterns:
 *    "…" said Bramble.
 *    Bramble said, "…"
 *  Returns the reporting verb (lowercased) + speaker if a name matches
 *  one of characterNames (case-insensitive first-token match).           */
function attributeQuote(
  text: string,
  quote: RawQuote,
  characterNames: string[],
): { verb: string | null; speaker: string | null } {
  const namesLower = new Set(characterNames.map((n) => n.toLowerCase()));

  const before = text.slice(Math.max(0, quote.quoteOpenChar - 80), quote.quoteOpenChar);
  const after = text.slice(quote.quoteCloseChar + 1, Math.min(text.length, quote.quoteCloseChar + 81));

  // After-window: pull the first ~4 word-ish tokens and scan for a
  // reporting verb. The speaker (if any) is the nearest listed character
  // name adjacent to the verb — either the token immediately before
  // ("Bramble said", "the grizzly said") or immediately after
  // ("said Bramble"). Anything beyond that is prose, not attribution.
  const afterTokens = Array.from(
    after.matchAll(/[A-Za-z][A-Za-z'\-]*/g),
    (m) => m[0],
  ).slice(0, 4);
  const lowered = afterTokens.map((t) => t.toLowerCase());

  const isVerb = (w: string) => Boolean(w && (REPORTING_VERBS.has(w) || ADVERB_MOOD[w]));
  const normalize = (w: string) => ADVERB_MOOD[w] ?? w;

  for (let i = 0; i < lowered.length; i++) {
    const w = lowered[i] ?? '';
    if (!isVerb(w)) continue;
    // Speaker: prefer the token BEFORE the verb (subject-first: "Bramble
    // said" or "the grizzly said"); fall back to the token AFTER
    // (inverted: "said Bramble").
    const prev = lowered[i - 1] ?? '';
    const next = lowered[i + 1] ?? '';
    let speaker: string | null = null;
    if (prev && namesLower.has(prev)) speaker = capitalize(prev);
    else if (next && namesLower.has(next)) speaker = capitalize(next);
    return { verb: normalize(w), speaker };
  }

  // X said, "…" — scan the before-window from the RIGHT for a verb, and further left for a name.
  const beforeReverse = before.split(/\s+/).reverse();
  for (let i = 0; i < beforeReverse.length; i++) {
    const tok = (beforeReverse[i] ?? '').toLowerCase().replace(/[^a-z]/g, '');
    if (!tok) continue;
    if (REPORTING_VERBS.has(tok) || ADVERB_MOOD[tok]) {
      const verb = ADVERB_MOOD[tok] ?? tok;
      // Name is usually just before the verb (before + subject).
      const nameTok = (beforeReverse[i + 1] ?? '').toLowerCase().replace(/[^a-z]/g, '');
      const speaker = nameTok && namesLower.has(nameTok) ? capitalize(nameTok) : null;
      return { verb, speaker };
    }
    // If we hit a proper-noun name early with no verb, still record the speaker.
    if (namesLower.has(tok)) {
      return { verb: null, speaker: capitalize(tok) };
    }
  }

  return { verb: null, speaker: null };
}

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function endPunctOf(text: string): EndPunct {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const last = trimmed[trimmed.length - 1];
  if (last === '.' || last === '!' || last === '?' || last === ',') return last;
  if (trimmed.endsWith('...') || trimmed.endsWith('…')) return '…';
  return null;
}

/** Segment a page. Returns an interleaved list of narrator + character
 *  segments in reading order. Preserves whitespace/punctuation between
 *  segments so re-joining reproduces the original text minus quotes. */
export function segmentPage(text: string, characterNames: string[] = []): Segment[] {
  if (!text.trim()) return [];
  const quotes = findQuotes(text);
  if (quotes.length === 0) {
    return [
      {
        text: text.trim(),
        speaker: null,
        quoted: false,
        reportingVerb: null,
        endsWith: endPunctOf(text),
      },
    ];
  }

  const out: Segment[] = [];
  let cursor = 0;
  for (const q of quotes) {
    // Narrator span before this quote
    if (q.quoteOpenChar > cursor) {
      const chunk = text.slice(cursor, q.quoteOpenChar).trim();
      if (chunk) {
        out.push({
          text: chunk,
          speaker: null,
          quoted: false,
          reportingVerb: null,
          endsWith: endPunctOf(chunk),
        });
      }
    }
    const { verb, speaker } = attributeQuote(text, q, characterNames);
    out.push({
      text: q.text.trim(),
      speaker,
      quoted: true,
      reportingVerb: verb,
      endsWith: endPunctOf(q.text),
    });
    cursor = q.quoteCloseChar + 1;
  }
  // Trailing narrator prose
  if (cursor < text.length) {
    const chunk = text.slice(cursor).trim();
    if (chunk) {
      out.push({
        text: chunk,
        speaker: null,
        quoted: false,
        reportingVerb: null,
        endsWith: endPunctOf(chunk),
      });
    }
  }
  return out;
}
