/** @startingPoint section="Kid" subtitle="Buddy avatar with speaking/listening/thinking state ring + speech bubble" viewport="700x260" */
export interface BuddyProps {
  name?: string;
  /** buddy's pigment, e.g. "var(--teal)" — each buddy owns one */
  color?: string;
  /** buddy's animal face, e.g. "🐱" — rendered large in the avatar; falls back to the two-dot face when absent */
  emoji?: string;
  /** the system-wide state vocabulary, shown as ring + micro-motion */
  state?: 'idle' | 'speaking' | 'listening' | 'thinking';
  /** avatar px; 96 home header, 56 in-reader compact */
  size?: number;
  /** avatar only (in-reader corner form) */
  compact?: boolean;
  /** speech bubble text (the words currently being spoken aloud) */
  speech?: React.ReactNode;
  /** voice slot — the greeting/callback actually spoken on mount. This is a BUDDY TURN: conversational length allowed (a greeting + world-memory callback is legitimately ~19 words), queued as ONE turn, follows checkpoint-priority interrupt rules. */
  utterance?: string;
}
