export interface ErrorCharacterProps {
  /** In-world voice — never "Error/Failed/Try again" @default "The story kitchen is resting. Let's read one from the shelf." */
  message?: string;
  utterance?: string;
  /** Recovery action slot */
  children?: React.ReactNode;
}
