export interface SheetProps {
  buddyColor?: string;
  buddyState?: 'idle' | 'speaking' | 'listening' | 'thinking';
  /** buddy speech line — visible text and utterance are IDENTICAL (text is a caption to the voice, verbatim) */
  speech?: string;
  /** content: ChoiceBlocks, mic moment, etc */
  children?: React.ReactNode;
}
// Placement: rises over the bottom two-thirds of an art page (reach zone). Never mid-screen, never over the top scrim.
