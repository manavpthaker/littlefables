export interface BuddyProps {
  /** Drives ring color + motion; each state also has an earcon @default 'idle' */
  state?: 'idle' | 'listening' | 'thinking' | 'speaking' | 'painting';
  /** Face diameter px @default 84 */
  size?: number;
  /** Caption bubble — text is a caption to the voice, never the carrier */
  say?: string;
  utterance?: string;
}
