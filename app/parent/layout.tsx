import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { admin } from '@/lib/supabase/admin';
import { getParentSession } from '@/lib/server/parent-session';

export const metadata: Metadata = { title: 'Storytime · Settings' };

// Parent surface. Gated by parent OTP session — middleware checks cookie
// presence at the edge, this is the real JWT-verification step. No pages
// beneath /parent render for an unauthed viewer.
//
// The top nav names who is signed in and offers Sign out. The full
// account panel lives on /parent/settings so this stays a thin frame.
export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const session = await getParentSession();
  if (!session) redirect('/login');

  // Parent display name for the "Signed in as" line. Cheap enough to fetch
  // per-render — one row from `parents`; getParentSession() is cache()-wrapped
  // so the JWT verification isn't repeated.
  const { data: parent } = await admin()
    .from('parents')
    .select('display_name')
    .eq('id', session.parentId)
    .maybeSingle();
  const who = parent?.display_name?.trim() || session.parentEmail;

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
          flexWrap: 'wrap',
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
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-4)',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <span
            title={session.parentEmail}
            style={{
              color: 'var(--ink-muted)',
              fontSize: 'var(--text-small-size)',
              fontFamily: 'var(--font-sc)',
              letterSpacing: 'var(--track-label)',
            }}
          >
            {who}
          </span>
          <Link
            href="/parent/intakes"
            style={{
              color: 'var(--ink-soft)',
              textDecoration: 'none',
              fontSize: 'var(--text-body-size)',
            }}
          >
            Orders
          </Link>
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
            className="lf-btn lf-btn--quiet lf-btn--compact"
            style={{ textDecoration: 'none' }}
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
