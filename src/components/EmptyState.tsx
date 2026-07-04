import { IonIcon, IonText } from '@ionic/react'
import { fileTrayOutline } from 'ionicons/icons'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  message: string
  icon?: string
  action?: ReactNode
}

export function EmptyState({ message, icon = fileTrayOutline, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        gap: 12,
        textAlign: 'center',
      }}
    >
      <IonIcon icon={icon} style={{ fontSize: 48, color: 'var(--ion-color-medium)' }} />
      <IonText color="medium">{message}</IonText>
      {action}
    </div>
  )
}
