export interface OrnamentProps {
  /** @default 'fleuron' */
  kind: 'fleuron' | 'double-rule' | 'filigree' | 'sunburst' | 'rule-and-dot' | 'dropcap';
  /** Dropcap letter @default 'A' */
  letter?: string;
  /** Pixel size for svg kinds / dropcap box */
  size?: number;
  /** Override pigment (defaults: fleuron ink-soft, filigree gilt, sunburst brass, rules ink-faint) */
  color?: string;
  className?: string;
}
