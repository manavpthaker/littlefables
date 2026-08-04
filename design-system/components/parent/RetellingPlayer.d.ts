export interface RetellingPlayerProps {
  playing?: boolean;
  /** 0-1 */
  progress?: number;
  /** e.g. "1:12" */
  duration?: string;
  /** @default 24 */
  bars?: number;
  onToggle?: () => void;
}
