import type { Viewport } from 'next';
import { redirect } from 'next/navigation';
import { requireChildDevice } from '@/lib/server/require-auth';
import { NextResponse } from 'next/server';
import { activeBuddy } from '@/lib/world/buddy-roster';
import { loadWorldState } from '@/lib/world/state';
import { ClockLighting } from './clock-lighting';
import { KidTabBar } from './tab-bar';
import { BuddyVoiceBinder, UtteranceTapListener } from './voice-binder';

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

  // Active buddy → bind its voiceId at the module level so every
  // `speakUtterance({ voice: 'buddy' })` in the kid subtree (checkpoint,
  // retell, tab-tap, word-save) speaks in the child's picked buddy voice
  // instead of falling back to the default narrator.
  const world = await loadWorldState(ctx.childId);
  const buddy = activeBuddy(world.activeBuddyId);

  return (
    <div data-density="kid" style={{ minHeight: '100dvh', background: 'var(--surface-page)', position: 'relative' }}>
      <ClockLighting />
      <BuddyVoiceBinder voiceId={buddy.voiceId ?? null} />
      <UtteranceTapListener />
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
