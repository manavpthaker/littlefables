export interface ReaderTopBarProps {
  /** e.g. "chapter three · the river" */
  chapterLabel?: string;
  /** e.g. "four suns" — words, not numerals */
  sunsLabel?: string;
  /** Renders on the top scrim @default true */
  overArt?: boolean;
  onBack?: () => void;
  onSettings?: () => void;
}
