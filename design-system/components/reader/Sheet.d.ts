export interface SheetProps {
  title?: string;
  /** Ornamental double-rule header mark @default true */
  doubleRule?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
