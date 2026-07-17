/** @startingPoint section="World" subtitle="A kept word: hand-font headline, meaning, source sentence, owned star" viewport="700x160" */
// Density-aware: sizes come from tokens, so inside [data-density="parent"] it renders at adult scale.
export interface WordbookEntryProps {
  word: string;
  /** age-banded meaning, spoken with the word */
  meaning: string;
  /** the sentence it was starred in (context stored with the word) */
  sentence?: string;
  /** true once re-encountered & understood at a checkpoint — star fills in */
  owned?: boolean;
  onPlay?: () => void;
}
