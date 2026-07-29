import type { Viewport } from 'next';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { requireChildDevice } from '@/lib/server/require-auth';

// Kid subtree. Viewport locked (one-handed portrait phone is the shape).
// No tab bar — the app is one polished reader; navigation is Home → book → back.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f2e7d3',
};

export default async function ReadLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) redirect('/parent');
  return (
    <div data-density="kid" style={{ minHeight: '100dvh', background: 'var(--surface-page)' }}>
      {children}
    </div>
  );
}
