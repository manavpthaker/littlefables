export interface ParentTabsProps {
  tabs: Array<{ id: string; label: string }>;
  activeId?: string;
  onSelect?: (id: string) => void;
}
