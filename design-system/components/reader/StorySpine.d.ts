export interface StorySpineProps {
  /** 0-1 through the book */
  progress?: number;
  /** Chapter marks along the spine */
  ticks?: Array<{ at: number; done?: boolean }>;
  /** px @default 280 */
  height?: number;
}
