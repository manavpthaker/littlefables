export interface ArtApprovalProps {
  /** e.g. "Cover — Rosa and the lantern" */
  title: string;
  note?: string;
  imgSrc?: string;
  state?: 'draft' | 'checking' | 'published' | 'needsReview' | 'blocked';
  onApprove?: () => void;
  onRequestChange?: () => void;
}
