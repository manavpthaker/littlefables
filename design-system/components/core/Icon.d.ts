export interface IconProps {
  /** Feather stand-in names (play, pause, mic, star, gift, …) or wood-cut motifs: motif-sun, motif-moon, motif-book, motif-compass, motif-quill, motif-sheaf, motif-key */
  name: string;
  /** @default 24 */
  size?: number;
  /** @default 'currentColor' */
  color?: string;
  /** @default 2 */
  strokeWidth?: number;
  /** Accessible title; omit for decorative icons (aria-hidden) */
  title?: string;
  className?: string;
}
