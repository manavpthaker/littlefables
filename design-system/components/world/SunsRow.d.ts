/** @startingPoint section="World" subtitle="Weekly reading-day suns — earned days glow forever" viewport="700x140" */
export interface SunsRowProps {
  /** day indices (0=Mon) with an earned sun; earned never turns off */
  earned?: number[];
  /** today's index — marigold ring + breath (position + voice carry the meaning; no letter labels, no terracotta) */
  today?: number;
  /** index that just lit up — plays the bloom */
  justEarned?: number;
}
