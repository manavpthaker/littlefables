import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="lf-state-page">
      <div className="lf-state-card">
        <span className="lf-state-emoji" aria-hidden="true">🪶</span>
        <p className="lf-state-eyebrow">A page wandered away</p>
        <h1>We couldn&rsquo;t find that story.</h1>
        <p>It may have moved, or the link might be a little old.</p>
        <Link className="lf-state-action" href="/">Back to Little Fables</Link>
      </div>
    </main>
  );
}
