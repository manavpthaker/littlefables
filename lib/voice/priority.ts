// Voice priority policy (DS rules-of-use): narration > checkpoint question >
// tap feedback > ambient. Pure and framework-free so it's table-testable.
//
// Narration is not a UI tier — it's an external gate (the transport owns it).
// Among UI utterances: a checkpoint question must never be lost (it queues
// one-deep behind narration and interrupts lesser speech); tap feedback is
// instant-or-never; ambient is the politest and yields to everything.

export type UtterTier = 'checkpoint' | 'tap' | 'ambient';

export type Decision = 'play' | 'queue' | 'drop';

const RANK: Record<UtterTier, number> = { checkpoint: 2, tap: 1, ambient: 0 };

export function decide(input: {
  narrationActive: boolean;
  activeTier: UtterTier | null;
  incoming: UtterTier;
}): Decision {
  const { narrationActive, activeTier, incoming } = input;

  if (narrationActive) {
    // Only a checkpoint question survives narration — parked one-deep and
    // spoken the moment narration ends. Everything else is drop-not-delay:
    // late tap feedback is worse than none.
    return incoming === 'checkpoint' ? 'queue' : 'drop';
  }

  if (activeTier === null) return 'play';

  // A same-or-lower-rank incoming interrupts only within its own tier
  // (latest tap wins over a playing tap; latest ambient over ambient) —
  // but never talks over higher-rank speech.
  if (RANK[incoming] > RANK[activeTier]) return 'play';
  if (RANK[incoming] === RANK[activeTier]) return 'play';
  return 'drop';
}
