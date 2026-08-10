/** @startingPoint section="Reader" subtitle="Buddy asks a story question — voice-first, mercy not red" viewport="700x340" */
export interface CheckpointProps {
  buddyName?: string;
  buddyColor?: string;
  /** question type tints the bubble: recall river · inference plum · prediction marigold · connection sage */
  type?: 'recall' | 'inference' | 'prediction' | 'connection';
  /** the spoken question (voice slot = this text, in the buddy's voice). This is a BUDDY TURN: conversational length allowed, queued as one turn (see rules-of-use voice-slot classes). */
  question: string;
  /** optional tappable answers for non-verbal moments */
  options?: { label: string; icon?: string }[];
  micState?: 'idle' | 'listening' | 'processing' | 'heard';
  /** two-stage mercy, never red, never "wrong":
   * 'hint' (or true) = first-miss hint — butter wash + butter ring, curious tone;
   * 'given' = answer given warmly after 2 misses — same butter family, settled (no ring), the answer celebrated as his idea. */
  mercy?: boolean | 'hint' | 'given';
  /** first-miss hint text */
  hint?: string;
  /** the warmly-given answer, e.g. "It was the lantern! You remembered the cave part." */
  given?: string;
  /** renders "The story moves on" — REQUIRED in real flows so mercy never dead-ends inside the component */
  onMoveOn?: () => void;
  onMic?: () => void;
  onPick?: (i: number) => void;
}
