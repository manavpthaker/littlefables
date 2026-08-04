export interface ButtonProps {
  /** 'primary' is oxblood — always and only the action color. One primary per screen. @default 'primary' */
  variant?: 'primary' | 'secondary' | 'quiet';
  /** hero = --tap-primary height, compact = --tap-min @default 'standard' */
  size?: 'hero' | 'standard' | 'compact';
  /** Icon name rendered before the label */
  icon?: string;
  /** Spoken line for kid surfaces; rendered as data-utterance (≤ 12 words) */
  utterance?: string;
  disabled?: boolean;
  /** Renders an <a> when set */
  href?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  children?: React.ReactNode;
}
