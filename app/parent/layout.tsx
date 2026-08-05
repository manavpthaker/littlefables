import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getParentSession } from '@/lib/server/parent-session';

export const metadata: Metadata = { title: 'Storytime · Settings' };

// Parent surface. Gated by parent OTP session — middleware checks cookie
// presence at the edge, this is the real JWT-verification step. No pages
// beneath /parent render for an unauthed viewer.
export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const session = await getParentSession();
  if (!session) redirect('/login');
  return (
    <div
      data-density="parent"
      style={{
        minHeight: '100dvh',
        background: 'var(--surface-page)',
        fontFamily: 'var(--font-body)',
        color: 'var(--ink)',
      }}
    >
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          background: 'var(--paper-warm)',
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
            fontSize: 'var(--text-title-size)',
            color: 'var(--ink)',
            textDecoration: 'none',
          }}
        >
          Little Fables
        </Link>
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
          <Link
            href="/read"
            style={{
              color: 'var(--oxblood)',
              textDecoration: 'none',
              fontSize: 'var(--text-body-size)',
              fontWeight: 600,
            }}
          >
            Open storytime →
          </Link>
          <a
            href="/api/parent/logout"
            style={{
              color: 'var(--ink-muted)',
              textDecoration: 'none',
              fontSize: 'var(--text-small-size)',
            }}
          >
            Sign out
          </a>
        </div>
      </nav>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(14px, 3.5vw, 24px)' }}>
        {children}
      </div>
    </div>
  );
}
