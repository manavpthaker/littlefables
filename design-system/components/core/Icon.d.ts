/** @startingPoint section="Core" subtitle="2px-stroke line icon (Lucide stand-in)" viewport="700x120" */
export interface IconProps {
  /** lucide kebab-case name, e.g. "play", "mic", "star" */
  name: string;
  /** px, default 24 */
  size?: number;
  color?: string;
  /** always 2 to match --line-weight unless decorative */
  strokeWidth?: number;
  /** 'currentColor' for a filled (owned/saved) glyph; default 'none' */
  fill?: string;
  style?: React.CSSProperties;
}
