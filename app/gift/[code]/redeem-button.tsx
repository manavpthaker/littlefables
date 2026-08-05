'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Client-side redeem trigger. Kept out of the RSC so the whole page
// stays server-rendered and cache-friendly — the button is the only
// interactive bit.

export function RedeemButton({ code }: { code: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function redeem() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/gift/${encodeURIComponent(code)}/redeem`, {
        method: 'POST',
      });
      if (res.status === 410) {
        setError('This gift has already been opened. Ask your gift-giver for a new code.');
        return;
      }
      if (!res.ok) throw new Error('redeem failed');
      const body = (await res.json()) as { redirect: string };
      router.push(body.redirect);
      router.refresh();
    } catch {
      setError("We couldn't open the book. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={redeem}
        disabled={busy}
        style={{
          padding: 'var(--space-3) var(--space-5)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--oxblood)',
          color: 'var(--paper)',
          border: 'none',
          fontSize: 'var(--text-body-size)',
          fontWeight: 600,
          cursor: 'pointer',
          opacity: busy ? 0.6 : 1,
          fontFamily: 'var(--font-body)',
        }}
      >
        {busy ? 'Opening…' : 'Open the book'}
      </button>
      {error && (
        <p role="alert" style={{ margin: 0, color: 'var(--oxblood)', fontSize: 'var(--text-small-size)' }}>
          {error}
        </p>
      )}
    </>
  );
}
