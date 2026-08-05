import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getParentSession } from '@/lib/server/parent-session';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Parent sign-in · Little Fables' };

// Parent sign-in. Email-only + 6-digit OTP. Invite-only — only
// pre-provisioned parent emails receive a code.
//
// Not the reader entry point. Kid iPads use /f/<token> today
// (soon /read/<slug>-<token>); recipients use /gift/<code>. This page
// is only for parents managing their household.
export default async function LoginPage() {
  const session = await getParentSession();
  if (session) redirect('/parent');
  return (
    <main
      data-density="outward"
      style={{
        minHeight: '100dvh',
        background: 'var(--paper)',
        display: 'grid',
        placeItems: 'center',
        padding: 'clamp(24px, 6vw, 64px) 20px',
      }}
    >
      <LoginForm />
    </main>
  );
}
