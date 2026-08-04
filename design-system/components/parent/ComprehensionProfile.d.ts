export interface ComprehensionProfileProps {
  skills: Array<{ label: string; /** 0-1 */ level: number; /** plain word: "steady", "growing" */ word?: string }>;
}
