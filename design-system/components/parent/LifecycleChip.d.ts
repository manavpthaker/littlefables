/** @startingPoint section="Parent" subtitle="Story lifecycle: Draft / Checking / Published / Needs review / Blocked" viewport="700x120" */
export interface LifecycleChipProps {
  /** unverified = judge unavailable — never shown as passed */
  status: 'draft' | 'checking' | 'published' | 'review' | 'blocked' | 'unverified';
  /** e.g. "attempt 3 of 3" */
  detail?: string;
}
