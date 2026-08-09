/** @startingPoint section="Parent" subtitle="Adult-density list rows, form fields, retelling player" viewport="700x320" */
export interface ListRowProps {
  icon?: string;
  title: string;
  meta?: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
}
export interface FieldProps { label: string; hint?: string; children: React.ReactNode; }
export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
export interface SectionHeaderProps { children: React.ReactNode; trailing?: React.ReactNode; }
export interface RetellingPlayerProps {
  title: string;
  duration?: string;
  /** transcription shown under the audio */
  transcript?: string;
  playing?: boolean;
  onToggle?: () => void;
}
