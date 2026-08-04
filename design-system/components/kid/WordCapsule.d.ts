export interface WordCapsuleProps {
  word: string;
  /** Star filled when saved */
  saved?: boolean;
  utterance?: string;
  onStar?: () => void;
}
