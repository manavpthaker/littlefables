// Comprehension ladder (redesign brief §IV, extends PRD A10): a story climbs
// literal → inferential → predictive across its chapters; retell is the top
// rung, fired separately at book completion. Pure — table-testable.
//
// Mapping to question types: literal=recall, inferential=inference,
// predictive=prediction. 'connection' stays as an occasional bonus rung when
// the child is cruising (it's the dialogic-reading "distancing" prompt).

import type { QuestionType } from '@/lib/models/checkpoint';

export interface LadderInput {
  /** chapter just finished (0-based) */
  chapterIdx: number;
  /** total chapters in the book */
  chapterCount: number;
  /** recent judged_signals, most-recent first (any book) */
  recentSignals: string[];
  /** recent question types asked, most-recent first */
  recentTypes: QuestionType[];
}

const STEP_DOWN: Record<QuestionType, QuestionType> = {
  recall: 'recall',
  inference: 'recall',
  prediction: 'inference',
  connection: 'inference',
};

function positionRung(chapterIdx: number, chapterCount: number): QuestionType {
  if (chapterCount <= 1) return 'recall';
  const p = chapterIdx / (chapterCount - 1);
  if (p < 0.34) return 'recall';
  if (p < 0.67) return 'inference';
  return 'prediction';
}

function isMiss(signal: string): boolean {
  return signal === 'mercy_hint' || signal === 'mercy_given' || signal === 'skipped';
}

function isHit(signal: string): boolean {
  return signal === 'correct' || signal === 'partial';
}

export function pickRung(input: LadderInput): QuestionType {
  const base = positionRung(input.chapterIdx, input.chapterCount);

  // Two consecutive recent misses → step one rung down. Checkpoints gate
  // pacing, never access (PRD A10) — misses soften, they don't punish.
  const [s0, s1] = input.recentSignals;
  if (s0 && s1 && isMiss(s0) && isMiss(s1)) return STEP_DOWN[base];

  // Cruising bonus: mid-book, recent answers landing, and no recent
  // connection question → ask the distancing prompt ("does that ever happen
  // to you?") instead of the scheduled rung.
  const recentFour = input.recentSignals.slice(0, 4);
  const cruising = recentFour.length >= 3 && recentFour.every(isHit);
  if (base === 'inference' && cruising && !input.recentTypes.slice(0, 4).includes('connection')) {
    return 'connection';
  }

  return base;
}
