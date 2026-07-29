'use client';

import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="lf-state-page">
      <div className="lf-state-card" role="alert">
        <span className="lf-state-emoji" aria-hidden="true">🌧️</span>
        <p className="lf-state-eyebrow">A small cloud rolled in</p>
        <h1>Little Fables needs another try.</h1>
        <p>Your reading progress is safe. Try opening this page again.</p>
        <button className="lf-state-action" onClick={reset}>Try again</button>
      </div>
    </main>
  );
}
