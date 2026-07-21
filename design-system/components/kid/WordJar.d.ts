export interface WordJarWord {
  word: string;
  /** owned = re-encountered + understood (filled star, full ink) */
  owned?: boolean;
}

export interface WordJarProps {
  /** most recent kept words; the jar renders up to 4 and hides itself when empty */
  words: WordJarWord[];
  /** total kept — never shown as a numeral, only implied by the trailing ellipsis */
  count?: number;
  /** voice slot — spoken on tap; e.g. "Seven words in your jar!" */
  utterance?: string;
  /** navigate to the Word Book */
  onOpen?: () => void;
}
