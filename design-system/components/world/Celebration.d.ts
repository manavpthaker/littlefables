/** @startingPoint section="World" subtitle="Badge/book/word celebration — watercolor-petal confetti, bloom medallion" viewport="700x380" */
export interface CelebrationProps {
  kind?: 'badge' | 'book' | 'word';
  /** spoken by the buddy as it appears */
  title: string;
  subtitle?: string;
  icon?: string;
  color?: string;
  /** e.g. a continue Button */
  children?: React.ReactNode;
  /** testable override of prefers-reduced-motion; undefined = media query */
  reducedMotion?: boolean;
}
export interface CelebrationQueueProps {
  /** CelebrationProps items; queue enforces order sun -> badge/book -> word, one at a time */
  items: CelebrationProps[];
  /** ms between one settling and the next blooming (default 600) */
  gap?: number;
  onEmpty?: () => void;
  reducedMotion?: boolean;
}
