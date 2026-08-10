/** @startingPoint section="Reader" subtitle="A / B / tell-me-YOUR-idea story choices" viewport="700x280" */
export interface ChoiceBlocksProps {
  /** the story's A/B paths; icon strongly recommended (child may not read the label) */
  options: { label: string; icon?: string }[];
  onPick?: (index: number) => void;
  /** presence adds the third path: dashed terracotta mic block in the hand font, Gochi Hand ("tell me YOUR idea") */
  onIdea?: () => void;
  /** smaller paddings for inside Checkpoint */
  compact?: boolean;
  /** over-art presentation — delegates to the standalone Sheet pattern (REQUIRED on art pages); a string value becomes the Sheet's buddy speech line */
  sheet?: boolean | string;
}
