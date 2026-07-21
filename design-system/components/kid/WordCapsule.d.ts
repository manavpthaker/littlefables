export interface WordCapsuleProps {
  /** the saved stem, hand font */
  word: string;
  /** true right after star-save — plays the bloom as it lands in the top bar */
  justSaved?: boolean;
  /** re-encountered + understood at a checkpoint (PRD B5) — sage ring, "yours now" voice */
  owned?: boolean;
  /** tap replays word + meaning (wordbook shortcut) */
  onTap?: () => void;
}
