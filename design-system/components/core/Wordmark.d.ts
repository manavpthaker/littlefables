export interface WordmarkProps {
  /** @default 'horizontal' */
  layout?: 'horizontal' | 'stacked' | 'mark-only';
  /** Mark height in px; wordmark text scales from it @default 44 */
  markSize?: number;
  /** @default true */
  text?: boolean;
  /** Mode 1 idle halo breath @default false */
  animated?: boolean;
  /** Mode 2 cold-boot draw-in (once per session) @default false */
  drawIn?: boolean;
  /** Defaults to var(--ink); pass var(--paper) on ink/night surfaces */
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}
