export interface IconButtonProps {
  /** Icon name from the Icon set */
  name: string;
  /** Required accessible label */
  label: string;
  /** @default 'plain' */
  variant?: 'plain' | 'outline' | 'filled' | 'primary';
  /** @default 'standard' */
  size?: 'hero' | 'standard' | 'compact';
  utterance?: string;
  disabled?: boolean;
  onClick?: () => void;
}
