'use client';

import { usePathname, useRouter } from 'next/navigation';
import { TabBar } from '@ds/components/kid/TabBar.jsx';
import { speakUtterance } from '@/lib/voice/ui-voice';

// Kid bottom navigation (redesign brief §III). Hidden inside the reader —
// the story stays immersive; everywhere else it's the persistent way around.
const TAB_ROUTES: Record<string, string> = {
  home: '/read',
  library: '/read/library',
  parent: '/parent',
};

const TAB_ITEMS = [
  { key: 'home', icon: 'home', label: 'Home', utterance: 'Home!' },
  { key: 'library', icon: 'library', label: 'Library', utterance: 'Pick a story!' },
  { key: 'parent', icon: 'lock', label: 'Grown-ups', utterance: 'The grown-up door.', quiet: true },
];

export function KidTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname.startsWith('/read/story/')) return null;

  const activeKey = pathname.startsWith('/read/library') ? 'library' : 'home';

  return (
    <>
      {/* in-flow spacer so scrolled content clears the fixed bar */}
      <div aria-hidden style={{ height: 'calc(76px + env(safe-area-inset-bottom, 0px))' }} />
      <TabBar
        items={TAB_ITEMS}
        activeKey={activeKey}
        onSelect={(key) => {
          const route = TAB_ROUTES[key];
          if (!route || route === pathname) return;
          const item = TAB_ITEMS.find((t) => t.key === key);
          if (item?.utterance) void speakUtterance(item.utterance, { voice: 'buddy', priority: 'tap' });
          router.push(route);
        }}
      />
    </>
  );
}
