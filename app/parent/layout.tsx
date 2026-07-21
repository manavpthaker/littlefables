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

function activeTab(pathname: string): string | null {
  if (pathname.startsWith('/parent/stories')) return 'stories';
  if (pathname.startsWith('/parent/settings')) return 'settings';
  if (pathname === '/parent' || pathname === '/parent/') return 'insights';
  return null; // make / privacy — no tab highlighted
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
      <nav
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 5,
            background: 'var(--surface-card)',
            borderBottom: 'var(--border-soft)',
            padding: 'var(--space-3) clamp(14px, 3.5vw, 24px)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-2) var(--space-4)',
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
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <Link
              href="/parent"
              style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 'var(--text-body)' }}
            >
              Home
            </Link>
            <Link
              href="/parent/make"
              style={{ color: 'var(--action)', textDecoration: 'none', fontSize: 'var(--text-body)', fontWeight: 600 }}
            >
              + Make a story
            </Link>
            <Link
              href="/parent/privacy"
              style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 'var(--text-body)' }}
            >
              Privacy
            </Link>
          </div>
      </nav>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(14px, 3.5vw, 24px)' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <ParentTabs items={TAB_ITEMS} activeKey={activeTab(pathname) ?? ''} />
        </div>
        {children}
        <KidTabBar />
      </div>
    </div>
  );
}
