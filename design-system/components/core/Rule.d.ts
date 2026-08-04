export interface RuleProps {
  /** soft = 1px 10% ink; faint = ink-faint; double = ornamental thin-over-thick; dot = rule-and-dot @default 'soft' */
  kind?: 'soft' | 'faint' | 'double' | 'dot';
  className?: string;
  style?: React.CSSProperties;
}
