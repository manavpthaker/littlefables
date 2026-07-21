/** @startingPoint section="Kid" subtitle="Shelf book cover with progress ribbon + painting/new states" viewport="700x300" */
export interface BookCardProps {
  title: string;
  /** cover image URL; omit = watercolor placeholder wash */
  cover?: string;
  /** CSS background (color/gradient) when there's no cover art — the book's own wash */
  bg?: string;
  /** 0–1 reading progress, marigold ribbon along bottom */
  progress?: number;
  /** painting = art still generating (shimmer); new = hand-written badge. Drafts/blocked NEVER appear on kid shelf. */
  status?: 'painting' | 'new';
  /** e.g. "3 chapters" */
  chapters?: string;
  /** developmental layer chip (top-left capsule). pigment = CSS var name, e.g. "--dusk"; calm pigments only, never terracotta */
  tag?: { label: string; emoji?: string; pigment?: string };
  /** voice slot — spoken on tap; defaults to the title */
  utterance?: string;
  onOpen?: () => void;
  /** cover aspect, e.g. '126/158' for the Home rail (parity III) */
  artRatio?: string;
  width?: number | string;
}
export interface ShelfProps {
  label?: string;
  children: React.ReactNode;
}
