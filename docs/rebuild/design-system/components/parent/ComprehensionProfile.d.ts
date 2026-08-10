/** @startingPoint section="Parent" subtitle="Strong on prediction, working on inference — with real transcripts" viewport="700x300" */
export interface ComprehensionProfileProps {
  /** plain-language line, e.g. "Strong on prediction, working on inference." */
  summary?: string;
  /** 0–1 per question type */
  levels?: { recall?: number; inference?: number; prediction?: number; connection?: number };
  /** actual Q&A evidence rows */
  transcripts?: { type: 'recall' | 'inference' | 'prediction' | 'connection'; q: string; a: string; when?: string }[];
}
