/** @startingPoint section="Core" subtitle="Pill button — terracotta action, voice slot, press settles" viewport="700x160" */
export interface ButtonProps {
  /** primary = terracotta fill (the ONE main action) · soft = terracotta wash · ghost = outline · capsule = paper wash for over-art */
  variant?: 'primary' | 'soft' | 'ghost' | 'capsule';
  /** primary 64px · standard 56px · small 44px (kid); parent density scales down via tokens */
  size?: 'primary' | 'standard' | 'small';
  /** lucide icon name — kid buttons should ALWAYS have one */
  icon?: string;
  /** voice slot: what the buddy says when this is tapped/appears */
  utterance?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export interface IconButtonProps {
  name: string;
  /** accessible label; doubles as utterance fallback */
  label: string;
  utterance?: string;
  size?: 'primary' | 'standard' | 'small';
  variant?: 'primary' | 'soft' | 'ghost' | 'capsule';
  onClick?: () => void;
  style?: React.CSSProperties;
}
