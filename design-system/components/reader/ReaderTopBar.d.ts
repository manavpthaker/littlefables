export interface ReaderTopBarProps {
  onBack?: () => void;
  /** most recently starred word — the WordCapsule landing slot (center) */
  savedWord?: string;
  /** true right after a save — plays the capsule bloom */
  justSaved?: boolean;
  onWordTap?: () => void;
  /** quiet sync capsule's ONLY reader placement is this top-bar right slot; omit = shows nothing */
  syncing?: boolean;
  buddyColor?: string;
  /** buddy's animal face, e.g. "🐱" */
  buddyEmoji?: string;
  buddyState?: 'idle' | 'speaking' | 'listening' | 'thinking';
  /** bedtime mode active — the moon capsule shows a marigold ring */
  bedtime?: boolean;
  /** toggle bedtime; omit = no moon capsule rendered */
  onBedtime?: () => void;
}
// The reader's persistent chrome, always inside the top scrim. Offline shows NOTHING here (default posture).
