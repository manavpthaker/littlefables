/** @startingPoint section="Kid" subtitle="Voice-input orb: idle / listening / processing / heard-you" viewport="700x180" */
export interface MicOrbProps {
  /** idle (river outline) → listening (river fill, breathing ring) → processing (dusk pulse) → heard (sage bloom + check) */
  state?: 'idle' | 'listening' | 'processing' | 'heard';
  size?: number;
  onTap?: () => void;
  /** voice slot; defaults to state label ("I'm listening…") */
  utterance?: string;
  /** heard-you echo (A4): the buddy repeats the child's idea back, spoken — "A berry by the door! What a kind idea…" */
  echo?: string;
  /** the raw transcription, shown as an italic caption under the echo (text-as-caption-to-voice) */
  transcript?: string;
  /** re-arm nudge, shown (and spoken) under an IDLE orb — e.g. "tap the little mic to try again" (mercy='hint' re-arm) */
  nudge?: string;
  // Timings: listening max 10s; silent-timeout 6s -> idle + gentle utterance; processing <=3s before handing off to buddy thinking.
}
