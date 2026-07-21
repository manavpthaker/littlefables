export interface TabBarItem {
  /** stable key, also passed to onSelect */
  key: string;
  /** emoji face for the tab (mockup style), e.g. "🏠" — preferred over icon */
  emoji?: string;
  /** Lucide kebab-case fallback when no emoji is given */
  icon?: string;
  /** visible hand-font label — kept short, spoken via utterance */
  label: string;
  /** spoken on tap ('tap' voice class); defaults to label */
  utterance?: string;
  /** the Grown-ups door: reads quiet via the inactive treatment */
  quiet?: boolean;
}

export interface TabBarProps {
  items: TabBarItem[];
  /** key of the current surface; active tab gets the marigold label + full-color emoji */
  activeKey: string;
  /** navigation is the app's job — the bar never navigates by itself */
  onSelect?: (key: string) => void;
}
