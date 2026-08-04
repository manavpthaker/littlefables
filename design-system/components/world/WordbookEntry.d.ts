export interface WordbookEntryProps {
  word: string;
  /** Syllable split, e.g. "be·neath" */
  syllables?: string;
  /** Kid-friendly, spoken-first */
  definition: string;
  /** The sentence it was saved from */
  example?: string;
  utterance?: string;
}
