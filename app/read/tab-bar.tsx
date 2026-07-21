'use client';

import { usePathname, useRouter } from 'next/navigation';
import { TabBar } from '@ds/components/kid/TabBar.jsx';
import { speakUtterance } from '@/lib/voice/ui-voice';

// Persistent bottom navigation (redesign brief §III) — rendered on the kid
// surfaces AND the parent surface (mockup shows it everywhere); hidden only
// inside the reader, which stays immersive.
const TAB_ROUTES: Record<string, string> = {
  home: '/read',
  library: '/read/library',
  parent: '/parent',
};

const TAB_ITEMS = [
  { key: 'home', emoji: '🏠', label: 'Home', utterance: 'Home!' },
  { key: 'library', emoji: '📚', label: 'Library', utterance: 'Pick a story!' },
  { key: 'parent', emoji: '🔒', label: 'Parent', utterance: 'The grown-up door.', quiet: true },
];

export function KidTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname.startsWith('/read/story/')) return null;

  const activeKey = pathname.startsWith('/parent')
    ? 'parent'
    : pathname.startsWith('/read/library')
      ? 'library'
      : 'home';

  return (
    <>
      {/* in-flow spacer so scrolled content clears the fixed bar */}
      <div aria-hidden style={{ height: 'calc(84px + env(safe-area-inset-bottom, 0px))' }} />
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
