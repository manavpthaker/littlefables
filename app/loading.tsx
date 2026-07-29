export default function Loading() {
  return (
    <main className="lf-state-page" aria-busy="true" aria-label="Loading Little Fables">
      <div className="lf-loading-mark" aria-hidden="true">✦</div>
      <p>Opening your storybook…</p>
    </main>
  );
}
