'use client';

import { useEffect, useState } from 'react';
import { SectionHeader } from '@ds/components/parent/ParentPrimitives.jsx';

export interface ShareableBook {
  id: string;
  title: string;
}

// Share management. One row per book: "Share" mints a new token; the URL
// is copied to the clipboard. Optional per-share password; expiring shares
// are a follow-up (schema supports it, UI doesn't wire it yet).

interface ShareRow {
  id: string;
  hasPassword: boolean;
  expiresAt: string | null;
  viewCount: number;
  createdAt: string;
}

export function SharesSection({ books }: { books: ShareableBook[] }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <SectionHeader>Share a story</SectionHeader>
      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-body)' }}>
        Each share is a link to one story. Anyone with the link opens it directly
        — no household password. Add a password if the link will travel.
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--space-2)' }}>
        {books.map((book) => (
          <BookShareRow key={book.id} book={book} />
        ))}
      </ul>
    </section>
  );
}

function BookShareRow({ book }: { book: ShareableBook }) {
  const [shares, setShares] = useState<ShareRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justCopied, setJustCopied] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    void loadShares();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book.id]);

  async function loadShares() {
    setLoading(true);
    try {
      const res = await fetch(`/api/parent/share?bookId=${encodeURIComponent(book.id)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { shares: ShareRow[] };
      setShares(data.shares ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function mint() {
    setError(null);
    setMinting(true);
    try {
      const body: { bookId: string; password?: string } = { bookId: book.id };
      if (showPassword && password.trim().length > 0) body.password = password.trim();
      const res = await fetch('/api/parent/share', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { path: string; shareId: string };
      const url = `${window.location.origin}${data.path}`;
      await navigator.clipboard.writeText(url).catch(() => undefined);
      setJustCopied(url);
      setShowPassword(false);
      setPassword('');
      await loadShares();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setMinting(false);
    }
  }

  async function revoke(shareId: string) {
    if (!confirm('Revoke this share link? Anyone with it will lose access.')) return;
    try {
      const res = await fetch('/api/parent/share', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ shareId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadShares();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <li
      style={{
        padding: 'var(--space-3)',
        background: 'var(--wash-panel)',
        borderRadius: 'var(--radius-md)',
        display: 'grid',
        gap: 'var(--space-2)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>{book.title}</span>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--ink-soft)' }}>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Password-protect
          </label>
          <button
            type="button"
            onClick={mint}
            disabled={minting || (showPassword && password.trim().length === 0)}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              background: 'var(--action)',
              color: 'var(--paper)',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              cursor: minting ? 'wait' : 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {minting ? 'Creating…' : 'Create share link'}
          </button>
        </div>
      </div>
      {showPassword && (
        <input
          type="text"
          placeholder="Password for this share"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 14,
            border: '1px solid var(--ink-faint)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'inherit',
            background: 'var(--surface-card)',
          }}
        />
      )}
      {justCopied && (
        <p style={{ margin: 0, color: 'var(--sage)', fontSize: 13 }}>
          ✓ Copied to clipboard: <code style={{ fontSize: 12 }}>{justCopied}</code>
        </p>
      )}
      {loading ? (
        <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 13 }}>Loading shares…</p>
      ) : shares && shares.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 4 }}>
          {shares.map((s) => (
            <li key={s.id} style={{ fontSize: 12, color: 'var(--ink-soft)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
              <span>
                {new Date(s.createdAt).toLocaleDateString()} · {s.viewCount} view{s.viewCount === 1 ? '' : 's'}
                {s.hasPassword && ' · 🔒 password'}
              </span>
              <button
                type="button"
                onClick={() => revoke(s.id)}
                style={{
                  padding: '2px 8px',
                  background: 'transparent',
                  color: 'var(--danger, #c94a3b)',
                  border: '1px solid var(--danger, #c94a3b)',
                  borderRadius: 'var(--radius-pill)',
                  cursor: 'pointer',
                  fontSize: 11,
                }}
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {error && (
        <p style={{ margin: 0, color: 'var(--danger, #c94a3b)', fontSize: 12 }}>Error: {error}</p>
      )}
    </li>
  );
}
