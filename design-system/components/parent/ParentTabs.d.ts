export interface ParentTabItem {
  key: string;
  label: string;
  href: string;
}

export interface ParentTabsProps {
  items: ParentTabItem[];
  activeKey: string;
}
