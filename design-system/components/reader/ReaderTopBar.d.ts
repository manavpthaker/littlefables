export interface ReaderTopBarProps {
  onBack?: () => void;
  /** caps label, e.g. "Ember's Little Light · Ch. 1" */
  title?: string;
  /** page position dots — current stretches marigold, read pages sage (no numerals) */
  segments?: { current: number; total: number };
  /** most recently starred word — takes over the center slot while it blooms */
  savedWord?: string;
  /** true right after a save — plays the capsule bloom */
  justSaved?: boolean;
  onWordTap?: () => void;
  /** quiet sync capsule's ONLY reader placement is this top-bar right slot; omit = shows nothing */
  syncing?: boolean;
  buddyColor?: string;
  /** buddy's animal face, e.g. "🐈" */
  buddyEmoji?: string;
  buddyState?: 'idle' | 'speaking' | 'listening' | 'thinking';
}
// The reader's persistent chrome, now in normal flow above the art card.
