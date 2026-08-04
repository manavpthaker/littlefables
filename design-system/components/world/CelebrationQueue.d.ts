export interface CelebrationQueueProps {
  items: Array<{ title: string; message?: string; ceremonial?: boolean; utterance?: string }>;
  /** @default 0 */
  activeIndex?: number;
  /** e.g. "one more surprise" */
  nextLabel?: string;
  children?: React.ReactNode;
}
