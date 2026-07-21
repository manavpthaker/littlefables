export interface TabBarItem {
  /** stable key, also passed to onSelect */
  key: string;
  /** Lucide kebab-case icon name (e.g. "home", "library", "lock") */
  icon: string;
  /** visible hand-font label — kept short, spoken via utterance */
  label: string;
  /** spoken on tap ('tap' voice class); defaults to label */
  utterance?: string;
  /** the Grown-ups door: visually quiet (ink-faint, smaller) — never a pigment */
  quiet?: boolean;
}

export interface TabBarProps {
  items: TabBarItem[];
  /** key of the current surface; active tab gets the marigold ring + breath */
  activeKey: string;
  /** navigation is the app's job — the bar never navigates by itself */
  onSelect?: (key: string) => void;
}
