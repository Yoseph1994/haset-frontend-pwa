import { IonButton, IonIcon, IonText } from '@ionic/react'
import { alertCircleOutline } from 'ionicons/icons'

interface ErrorBannerProps {
  message: string
  onRetry?: () => void
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '32px 24px',
        textAlign: 'center',
      }}
    >
      <IonIcon icon={alertCircleOutline} color="danger" style={{ fontSize: 36 }} />
      <IonText color="danger">{message}</IonText>
      {onRetry && (
        <IonButton fill="outline" size="small" onClick={onRetry}>
          Retry
        </IonButton>
      )}
    </div>
  )
}
