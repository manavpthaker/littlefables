/** @startingPoint section="Kid" subtitle="Play/prev/next — play never navigates, prev/next never auto-play" viewport="700x160" */
export interface TransportProps {
  playing: boolean;
  /** toggles narration ONLY — never changes page */
  onPlay: () => void;
  /** navigates ONLY — never starts audio */
  onPrev: () => void;
  onNext: () => void;
  /** at-edge pages soften (0.4 opacity), never disappear or gray-disable */
  canPrev?: boolean;
  canNext?: boolean;
}
