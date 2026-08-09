/** @startingPoint section="Reader" subtitle="Picture-tile chapter navigation with you-are-here ring" viewport="700x140" */
export interface ChapterMapProps {
  /** each tile is a picture, not text — title is the utterance */
  chapters: { title: string; art?: string; tint?: string }[];
  /** you-are-here: marigold ring + breath; done chapters get a sage check; future ones soften, never lock */
  current?: number;
  onPick?: (index: number) => void;
  /** row = compact strip (in-reader); large = full-screen primary navigation — 128px art tiles, wrapping, wash-degrade while art generates */
  size?: 'row' | 'large';
}
