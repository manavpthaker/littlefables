export interface CelebrationProps {
  /** e.g. "A sun for your sky" */
  title: string;
  message?: string;
  /** Gilt filigree corners for the big moments only */
  ceremonial?: boolean;
  utterance?: string;
  /** CTA slot, usually one Button */
  children?: React.ReactNode;
}
