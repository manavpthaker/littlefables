export interface CheckpointProps {
  /** Spoken by the buddy; checkpoint priority interrupts ambient */
  question: string;
  buddyState?: 'idle' | 'listening' | 'thinking' | 'speaking';
  utterance?: string;
  /** Usually a ChoiceBlocks */
  children?: React.ReactNode;
}
