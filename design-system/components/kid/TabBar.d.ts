export interface TabBarProps {
  items: Array<{ id: string; label: string; icon: string; utterance?: string }>;
  activeId?: string;
  onSelect?: (id: string) => void;
}
