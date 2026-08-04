export interface LifecycleChipProps {
  /** @default 'draft' */
  state: 'draft' | 'checking' | 'published' | 'needsReview' | 'blocked';
  label?: string;
}
