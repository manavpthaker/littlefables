'use client';

import { useEffect, useState } from 'react';

// End-of-book install prompt. Renders only when:
//   - the reader signals `visible` (i.e. lastPage reached)
//   - the app is not already installed (display-mode: standalone / iOS)
//   - the parent hasn't recently dismissed it
//
// Two rendering paths:
//   Android/Chrome — beforeinstallprompt fires; we cache the event and let
//     the parent tap "Add to home screen" to trigger the native chooser.
//   iOS Safari — no such event. We render a compact set of steps
//     ("Tap Share → Add to Home Screen") since iOS has no programmatic
//     install API. Same posture as every PWA on iOS.
//
// Dismissal is remembered per-device for DISMISS_TTL_DAYS. Not synced across
// devices — this is a per-iPad UX choice, not household state.

const DISMISS_KEY = 'lf_install_dismissed_at';
const DISMISS_TTL_DAYS = 30;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandaloneNow(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  // iOS-specific — Safari sets navigator.standalone on home-screen launches.
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  // MSStream check filters out old IE-on-Windows-Phone UA quirk (still worth it).
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
}

function recentlyDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  const raw = window.localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const at = Number.parseInt(raw, 10);
  if (Number.isNaN(at)) return false;
  return Date.now() - at < DISMISS_TTL_DAYS * 24 * 60 * 60 * 1000;
}

export function InstallPrompt({ visible }: { visible: boolean }) {
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [ios, setIos] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setIos(isIOSDevice());
    setStandalone(isStandaloneNow());
    setDismissed(recentlyDismissed());
    setReady(true);

    const onBIP = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBIP);
    // If the app is installed mid-session, remove the prompt.
    const onInstalled = () => setStandalone(true);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!ready || !visible || standalone || dismissed) return null;

  const androidCanPrompt = Boolean(promptEvent);

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      setStandalone(true);
    } else {
      dismiss();
    }
    setPromptEvent(null);
  }

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  }

  // On non-iOS browsers that never fire beforeinstallprompt (Firefox on
  // desktop, Chrome without the criteria met, DuckDuckGo, etc.) there's
  // nothing to prompt for and no useful steps to hand-hold on. Hide.
  if (!ios && !androidCanPrompt) return null;

  return (
    <aside
      role="dialog"
      aria-live="polite"
      aria-label="Save this book to the home screen"
      style={{
        position: 'absolute',
        left: 'clamp(12px, 3vw, 24px)',
        right: 'clamp(12px, 3vw, 24px)',
        bottom: 'clamp(12px, 3vw, 24px)',
        maxWidth: 460,
        marginLeft: 'auto',
        marginRight: 'auto',
        background: 'var(--paper-warm)',
        border: 'var(--border-soft)',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.16)',
        padding: 'clamp(14px, 3vw, 20px)',
        fontFamily: 'var(--font-body)',
        color: 'var(--ink)',
        display: 'grid',
        gap: 'var(--space-2)',
        zIndex: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
          Save this book to the home screen
        </strong>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Not now"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--ink-muted)',
            cursor: 'pointer',
            fontSize: '1.4rem',
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>
      </div>
      <p style={{ margin: 0, color: 'var(--ink-muted)', fontSize: 'var(--text-small-size)', lineHeight: 1.5 }}>
        Opens like a book on the shelf — one tap, no app store.
      </p>

      {androidCanPrompt ? (
        <button
          type="button"
          onClick={install}
          style={{
            marginTop: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--oxblood)',
            color: 'var(--paper)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-body-size)',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
            justifySelf: 'start',
          }}
        >
          Add to home screen
        </button>
      ) : (
        // iOS steps. Referred to by name because iOS names the icons literally
        // and the parent's kid may be watching them do it.
        <ol
          style={{
            margin: 'var(--space-2) 0 0',
            paddingLeft: '1.25em',
            color: 'var(--ink)',
            fontSize: 'var(--text-small-size)',
            lineHeight: 1.6,
          }}
        >
          <li>Tap <strong>Share</strong> (the square with an up arrow).</li>
          <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
          <li>Tap <strong>Add</strong>. It opens like an app after that.</li>
        </ol>
      )}
    </aside>
  );
}
