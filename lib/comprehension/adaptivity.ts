// Adaptivity (brief §IV.3, feeds PRD C2/A10): tune question band + vocabulary
// richness to the "just right" zone. Pure — table-testable. The child never
// sees a level; the parent sets Ease / Auto / Stretch (children.settings).
//
// Signals: rolling checkpoint accuracy (correct=1, partial=0.5, mercy=0,
// skipped ignored) and recent word-keeping appetite (kept words = the child
// reaching for richer language — the brief's kept-vs-skipped signal).

import { CHILD_BANDS, type ChildBand } from '@/lib/models/child';
import type { ReadingLevel } from '@/lib/models/settings';

export type VocabDensity = 'gentle' | 'standard' | 'rich';

export interface AdaptivityInput {
  baseBand: ChildBand;
  readingLevel: ReadingLevel;
  /** judged_signals, most-recent first (up to ~12) */
  recentSignals: string[];
  /** words kept in the recent window (e.g. last 14 days) */
  recentKeeps: number;
}

export interface Adaptivity {
  effectiveBand: ChildBand;
  vocabDensity: VocabDensity;
  /** null when too little signal to judge (fewer than 4 answered) */
  accuracy: number | null;
}

const MIN_SIGNAL = 4;
const STEP_UP_AT = 0.8;
const STEP_DOWN_AT = 0.4;

function stepBand(band: ChildBand, delta: -1 | 0 | 1): ChildBand {
  const idx = CHILD_BANDS.indexOf(band);
  const next = Math.min(CHILD_BANDS.length - 1, Math.max(0, idx + delta));
  return CHILD_BANDS[next] ?? band;
}

export function rollingAccuracy(signals: string[]): number | null {
  const scored = signals
    .map((s): number | null =>
      s === 'correct' ? 1 : s === 'partial' ? 0.5 : s === 'mercy_hint' || s === 'mercy_given' ? 0 : null,
    )
    .filter((v): v is number => v !== null);
  if (scored.length < MIN_SIGNAL) return null;
  return scored.reduce((a, b) => a + b, 0) / scored.length;
}

export function computeAdaptivity(input: AdaptivityInput): Adaptivity {
  const accuracy = rollingAccuracy(input.recentSignals);

  // Ease / Stretch pin one step off the base band; Auto moves on evidence.
  let delta: -1 | 0 | 1 = 0;
  if (input.readingLevel === 'ease') delta = -1;
  else if (input.readingLevel === 'stretch') delta = 1;
  else if (accuracy !== null && accuracy >= STEP_UP_AT) delta = 1;
  else if (accuracy !== null && accuracy <= STEP_DOWN_AT) delta = -1;

  let vocabDensity: VocabDensity = 'standard';
  if (input.readingLevel === 'ease') vocabDensity = 'gentle';
  else if (input.readingLevel === 'stretch') vocabDensity = 'rich';
  else if (accuracy !== null && accuracy <= STEP_DOWN_AT) vocabDensity = 'gentle';
  else if (accuracy !== null && accuracy >= STEP_UP_AT && input.recentKeeps >= 3) vocabDensity = 'rich';

  return { effectiveBand: stepBand(input.baseBand, delta), vocabDensity, accuracy };
}
