export interface StoryTextProps {
  /** The page's prose. Speech must match this text verbatim. */
  text: string;
  /** Index of the word being spoken; earlier = full ink, later = 55% */
  currentIndex?: number;
  /** Renders on --wash-panel for guaranteed contrast over any art */
  overArt?: boolean;
  /** Chapter opener drop cap (reader only) */
  dropcap?: boolean;
  onWordTap?: (word: string, index: number) => void;
  utterance?: string;
}
