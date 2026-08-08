'use client';

import { useCallback, useEffect, useState } from 'react';

// Add-to-home-screen, offered rather than announced.
//
// This used to surface itself as a panel the moment the last page arrived,
// which landed install instructions on top of the end of a story — the one
// beat in the whole app that should be left alone. It's opt-in now: the
// reader shows a button, and nothing appears until a parent asks for it.
//
// Two install paths, unchanged:
//   Android/Chrome — beforeinstallprompt fires; we cache the event and the
//     button triggers the native chooser directly.
//   iOS Safari — no programmatic install API exists, so the button reveals
//     the manual steps instead. Same posture as every PWA on iOS.

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

export interface AddToHomeScreen {
  /** True when there's an install path worth offering a button for. */
  available: boolean;
  /** iOS has no install API — the caller should reveal <InstallSteps/>. */
  needsManualSteps: boolean;
  /** Android/Chrome native chooser. No-op on iOS. */
  promptNative: () => Promise<void>;
}

export function useAddToHomeScreen(): AddToHomeScreen {
  const [ios, setIos] = useState(false);
  const [standalone, setStandalone] = useState(true); // assume installed until we know
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setIos(isIOSDevice());
    setStandalone(isStandaloneNow());

    const onBIP = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBIP);
    const onInstalled = () => setStandalone(true);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptNative = useCallback(async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') setStandalone(true);
    setPromptEvent(null);
  }, [promptEvent]);

  // Browsers that never fire beforeinstallprompt and aren't iOS (desktop
  // Firefox, Chrome without the criteria met) have nothing to offer and no
  // steps worth hand-holding through. Offer nothing.
  const available = !standalone && (ios || Boolean(promptEvent));

  return { available, needsManualSteps: ios && !promptEvent, promptNative };
}

/** The iOS steps. Named literally, because the parent's kid may be watching
 *  them do it. */
export function InstallSteps() {
  return (
    <ol
      style={{
        margin: 0,
        paddingLeft: '1.25em',
        textAlign: 'left',
        color: 'var(--ink-soft)',
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        lineHeight: 1.7,
        maxWidth: 320,
      }}
    >
      <li>
        Tap <strong>Share</strong> (the square with an up arrow).
      </li>
      <li>
        Scroll down and tap <strong>Add to Home Screen</strong>.
      </li>
      <li>
        Tap <strong>Add</strong>. It opens like a book after that.
      </li>
    </ol>
  );
}
