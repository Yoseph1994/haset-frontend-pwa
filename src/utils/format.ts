export function formatSalaryRange(
  min: string | number | null | undefined,
  max: string | number | null | undefined,
  currency?: string | null,
): string {
  const unit = currency ?? 'ETB'

  if (!min && !max) return 'Salary not specified'
  if (min && max && min !== max) return `${Number(min).toLocaleString()} - ${Number(max).toLocaleString()} ${unit}`

  const value = Number(min ?? max)
  return `${value.toLocaleString()} ${unit}`
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
