export interface TransportProps {
  playing?: boolean;
  /** e.g. "page four" — words, not numerals, on kid surfaces */
  label?: string;
  onPlay?: () => void;
  onBack?: () => void;
  onForward?: () => void;
  utterance?: string;
}
