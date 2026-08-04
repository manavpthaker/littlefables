export interface ListRowProps {
  label: string;
  sub?: string;
  /** Right-aligned current value */
  value?: React.ReactNode;
  icon?: string;
  /** @default true */
  chevron?: boolean;
  onPress?: () => void;
}
