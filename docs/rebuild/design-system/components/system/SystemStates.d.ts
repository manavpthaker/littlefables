/** @startingPoint section="System" subtitle="Offline/sync banners, painting shimmer, warm error character" viewport="700x300" */
export interface StateBannerProps {
  state: 'offline' | 'syncing' | 'synced' | 'syncfail';
  /** kid = warm pictorial pill (spoken); parent = compact informative strip.
   * Kid syncing/synced renders the QUIET variant: wash capsule + sage pulse dot only, utterance
   * ("Your new pages are flying home!") spoken once per session and dropped entirely while
   * narration or a checkpoint question is active.
   * Kid offline placement: bottom of the Home scroll, spoken once per session; reader surfaces
   * show NOTHING when offline (offline is the default posture there). */
  density?: 'kid' | 'parent';
  message?: string;
}
export interface PaintingWashProps {
  /** spoken + Gochi Hand caption, default "painting this page…" */
  label?: string;
  height?: number;
}
export interface ErrorCharacterProps {
  /** in-world warm message; never jargon, never "Error" */
  message?: string;
  /** a Button offering the way onward — errors ALWAYS offer one */
  action?: React.ReactNode;
}
