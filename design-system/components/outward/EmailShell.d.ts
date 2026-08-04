export interface EmailShellProps {
  /** Five canned bodies in the buyer voice @default 'delivery' */
  variant?: 'intake-ack' | 'preview-delivery' | 'delivery' | 'checkin' | 'review-request';
  /** Names are data @default 'Rosa' */
  childName?: string;
  /** Absolute URL in production @default relative preview path */
  markSrc?: string;
  href?: string;
  preheader?: string;
}
