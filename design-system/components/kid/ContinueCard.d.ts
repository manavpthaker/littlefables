export interface ContinueCardProps {
  title: string;
  /** e.g. "chapter three · the paper boat" */
  chapterLabel?: string;
  /** 0-1 */
  progress?: number;
  coverSrc?: string;
  utterance?: string;
  onContinue?: () => void;
}
