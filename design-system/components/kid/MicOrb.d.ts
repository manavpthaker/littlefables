export interface MicOrbProps {
  /** listening fills navy with slow rings @default 'idle' */
  state?: 'idle' | 'listening' | 'thinking' | 'speaking';
  utterance?: string;
  onPress?: () => void;
}
