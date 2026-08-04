export interface ChoiceBlocksProps {
  choices: Array<{ id: string; label: string; utterance?: string }>;
  /** Picked block fills forest */
  pickedId?: string;
  /** Mercy block warms to brass 40% — never red */
  mercyId?: string;
  onChoose?: (id: string) => void;
}
