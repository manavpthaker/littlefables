export interface ChoiceRecordProps {
  /** the choice moment, e.g. "Chapter 2 · Page 6 — the round door" */
  where: string;
  /** options offered (A / B; "tell me YOUR idea" shows as its own option label) */
  options?: string[];
  /** which option he picked (highlighted terracotta); omit if he spoke his own idea */
  chose?: string;
  /** transcript of a spoken idea (childIdea) */
  saidTranscript?: string;
  /** how the story used it, e.g. "ch. 3 opens with the berry by the door" */
  usedAs?: string;
  when?: string;
}
