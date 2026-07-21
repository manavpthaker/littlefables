/** @startingPoint section="Reader" subtitle="Word-highlight reading text: tap to hear, star to keep" viewport="700x260" */
export interface StoryTextProps {
  /** page words in order */
  words: { w: string }[];
  /** index of the word being narrated; before = spoken (full ink), after = upcoming (52%) */
  currentIndex?: number;
  /** saved STEMS (lowercase, punctuation-stripped) — matching is stem-based, so "burrow." matches "burrow"; renders the filled star icon */
  starredWords?: string[];
  /** kept words — fern-wash treatment (pixel-parity II.3) */
  keptWords?: string[];
  /** tap-any-word: speak it instantly (sliced narration audio / TTS). NEVER pauses or navigates. */
  onHearWord?: (word: string, i: number) => void;
  /** star-save — receives the STEM; wordbook stores stem + original sentence. Display word stays untouched for tap/speech.
   * Hit area: the WHOLE armed word capsule (>=44px), not the 16px star icon (visual-only).
   * Persistence: armed until another word tap moves it or the page turns; no timeout. Reduced-motion: star fades in. */
  onStarWord?: (stem: string, i: number) => void;
  /** true when text sits over full-bleed art — wraps in the wash-panel for guaranteed contrast */
  overArt?: boolean;
}
