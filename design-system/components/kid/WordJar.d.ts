export interface WordJarProps {
  /** Saved words, newest first (up to six visible) */
  words?: string[];
  /** Words, not numerals: "eleven words" */
  countLabel?: string;
  utterance?: string;
}
