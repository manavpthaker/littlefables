import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { ParentTabs } from '@ds/components/parent/ParentTabs.jsx';
import { KidTabBar } from '@/app/read/tab-bar';

const TAB_ITEMS = [
  { key: 'insights', label: 'Insights', href: '/parent' },
  { key: 'stories', label: 'Stories', href: '/parent/stories' },
  { key: 'settings', label: 'Settings', href: '/parent/settings' },
];

function activeTab(pathname: string): string {
  // Every parent surface belongs to one of the three tabs — none should
  // render with all-dimmed tabs (which reads as broken). `/parent/make` is
  // a Stories action; `/parent/privacy` is a Settings surface.
  if (pathname.startsWith('/parent/stories') || pathname.startsWith('/parent/make'))
    return 'stories';
  if (pathname.startsWith('/parent/settings') || pathname.startsWith('/parent/privacy'))
    return 'settings';
  return 'insights';
}

export const metadata: Metadata = { title: 'Parent Corner · Little Fables' };

// Parent Corner: adult-density surfaces (WCAG-scalable, no viewport lock).
// UNGATED by household decision 2026-07-21 — see lib/server/parent-gate.ts
// for what that means and how to restore the password gate.
export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();
  // `x-pathname` is set by middleware.ts and is the reliable source; the
  // `x-invoke-path` fallback is a legacy Next internal that isn't always present.
  const pathname = hdrs.get('x-pathname') ?? hdrs.get('x-invoke-path') ?? '';
  return (
    <div
      data-density="parent"
      style={{
        minHeight: '100dvh',
        background: 'var(--surface-page)',
        fontFamily: 'var(--font-ui)',
        color: 'var(--text-body)',
      }}
    >
      {/* Nav collapse: the previous layout ran two rows with 'Home' and
          'Insights' pointing at the same URL, and 'Privacy' as a peer of the
          wordmark — orientation-101 confusion on every parent visit. The
          wordmark now covers Home; only "+ Make a story" stays in the header
          as the primary action. Privacy is reached via Settings (see
          activeTab mapping above). */}
      <nav
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 5,
            background: 'var(--surface-card)',
            borderBottom: 'var(--border-soft)',
            padding: 'var(--space-3) clamp(14px, 3.5vw, 24px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
          }}
        >
          <Link
            href="/parent"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-title)',
              color: 'var(--text-strong)',
              textDecoration: 'none',
            }}
          >
            Little Fables
          </Link>
          <Link
            href="/parent/make"
            style={{
              color: 'var(--action)',
              textDecoration: 'none',
              fontSize: 'var(--text-body)',
              fontWeight: 600,
            }}
          >
            + Make a story
          </Link>
      </nav>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(14px, 3.5vw, 24px)' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <ParentTabs items={TAB_ITEMS} activeKey={activeTab(pathname)} />
        </div>
        {children}
        <KidTabBar />
      </div>
    </div>
  );
}
