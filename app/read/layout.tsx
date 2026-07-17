import type { Viewport } from 'next';
import { redirect } from 'next/navigation';
import { requireChildDevice } from '@/lib/server/require-auth';
import { NextResponse } from 'next/server';

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
  if (ctx instanceof NextResponse) redirect('/parent/auth/login');

  return <div data-density="kid">{children}</div>;
}
