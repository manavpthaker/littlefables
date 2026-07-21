/** @startingPoint section="World" subtitle="Badges — earned watercolor medallions, locked silhouettes with promise" viewport="700x160" */
export interface BadgeShelfProps {
  badges: {
    name: string;
    icon: string;
    earned: boolean;
    color?: string;
    when?: string;
    /** locked-badge progression hint (Polish VI.2), e.g. "Read 3 days in a row" — replaces the bare "?" */
    hint?: string;
  }[];
  onTap?: (index: number) => void;
}
