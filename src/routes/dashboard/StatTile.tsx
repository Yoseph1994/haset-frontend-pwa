interface StatTileProps {
  value: string
  label: string
}

/** One cell in the dashboard quick-stats row. */
export function StatTile({ value, label }: StatTileProps) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        textAlign: 'center',
        padding: '12px 8px',
        borderRadius: 12,
        background: 'var(--ion-color-step-50, rgba(0,0,0,0.03))',
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--ion-color-medium)', marginTop: 2 }}>{label}</div>
    </div>
  )
}
