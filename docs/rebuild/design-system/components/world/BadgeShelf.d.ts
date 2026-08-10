/** @startingPoint section="World" subtitle="Badges — earned watercolor medallions, locked silhouettes with promise" viewport="700x160" */
export interface BadgeShelfProps {
  badges: { name: string; icon: string; earned: boolean; color?: string; when?: string }[];
  onTap?: (index: number) => void;
}
