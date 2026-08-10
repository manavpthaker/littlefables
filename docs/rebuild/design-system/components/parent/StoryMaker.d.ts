/** @startingPoint section="Parent" subtitle="One prompt + one length question + Make It — never a wizard" viewport="700x360" */
export interface StoryMakerProps {
  placeholder?: string;
  /** default answers the one follow-up so a single tap on Make It always works */
  defaultLength?: 'quick' | 'chapter';
  onMake?: (v: { prompt: string; length: string }) => void;
  /** mic in the input — the prompt can be spoken */
  onSpeak?: () => void;
}
