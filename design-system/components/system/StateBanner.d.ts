export interface StateBannerProps {
  /** offline = paper-deep rest; syncing = quiet forest @default 'notice' */
  kind?: 'offline' | 'syncing' | 'success' | 'notice';
  /** Override the default icon */
  icon?: string;
  message: string;
  utterance?: string;
  /** Optional action slot */
  children?: React.ReactNode;
}
