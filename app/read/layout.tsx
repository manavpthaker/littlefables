import type { Viewport } from 'next';
import { redirect } from 'next/navigation';
import { requireChildDevice } from '@/lib/server/require-auth';
import { NextResponse } from 'next/server';
import { ClockLighting } from './clock-lighting';
import { KidTabBar } from './tab-bar';

// Kid subtree only: viewport locked (PRD F2 exception — never on parent).
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f2e7d3',
};

export default async function ReadLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireChildDevice();
  // requireChildDevice returns a NextResponse when auth fails; convert to redirect for RSC.
  if (ctx instanceof NextResponse) redirect('/parent');

  return (
    <div data-density="kid" style={{ minHeight: '100dvh', background: 'var(--surface-page)', position: 'relative' }}>
      <ClockLighting />
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(120% 80% at 50% -10%, var(--light-glow), transparent 60%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
        <KidTabBar />
      </div>
    </div>
  );
}
