import { IonBadge } from '@ionic/react'

type BadgeColor = 'success' | 'warning' | 'danger' | 'medium' | 'primary'

// Color convention: green = active/approved, yellow = pending/waiting,
// red = rejected/terminated, grey = completed/closed/inactive.
const STATUS_COLORS: Record<string, BadgeColor> = {
  approved: 'success',
  accepted: 'success',
  active: 'success',
  open: 'success',
  available: 'success',
  assigned: 'primary',
  pending: 'warning',
  under_review: 'warning',
  awaiting_payment: 'warning',
  on_leave: 'warning',
  rejected: 'danger',
  terminated: 'danger',
  completed: 'medium',
  cancelled: 'medium',
  withdrawn: 'medium',
  expired: 'medium',
  closed: 'medium',
  filled: 'medium',
  draft: 'medium',
  inactive: 'medium',
}

function labelize(status: string) {
  return status.replaceAll('_', ' ').replace(/^\w/, (c) => c.toUpperCase())
}

export function StatusBadge({ status }: { status: string }) {
  return <IonBadge color={STATUS_COLORS[status] ?? 'medium'}>{labelize(status)}</IonBadge>
}
