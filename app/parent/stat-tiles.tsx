// Parent stat tiles — shared by Insights (and any future parent surface).
export function StatTiles({
  tiles,
}: {
  tiles: Array<{ label: string; value: number | string; sublabel?: string }>;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 'var(--space-3)',
        marginTop: 'var(--space-3)',
      }}
    >
      {tiles.map((t) => (
        <div
          key={t.label}
          style={{
            background: 'var(--surface-card)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--elev-rest)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--plum)' }}>{t.value}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-caption)' }}>{t.label}</div>
          {t.sublabel && <div style={{ color: 'var(--text-hint)', fontSize: 'var(--text-caption)' }}>{t.sublabel}</div>}
        </div>
      ))}
    </div>
  );
}
