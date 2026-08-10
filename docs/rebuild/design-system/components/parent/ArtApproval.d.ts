/** @startingPoint section="Parent" subtitle="Candidate vs approved art, side-by-side, approve/reject" viewport="700x420" */
export interface ArtApprovalProps {
  /** e.g. "Chapter 2 · Page 5" */
  pageLabel: string;
  /** candidate image URL (private bucket) */
  candidate?: string;
  /** currently-approved image URL (public bucket); empty well if none */
  approved?: string;
  onApprove?: () => void;
  onReject?: () => void;
}
