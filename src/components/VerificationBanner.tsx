import { IonButton, IonIcon, IonText } from '@ionic/react'
import { shieldCheckmarkOutline } from 'ionicons/icons'
import { useHistory } from 'react-router-dom'
import { useVerification } from '@/hooks/useVerification'

/**
 * Inline callout shown in place of a gated action when the account isn't
 * verified yet. `action` is a verb phrase, e.g. "apply for jobs" / "post jobs".
 * Renders nothing once the account is approved.
 */
export function VerificationBanner({ action }: { action: string }) {
  const history = useHistory()
  const { isApproved, isBlacklisted, status, isLoading, hasProfile } = useVerification()

  if (isLoading || isApproved || !hasProfile) return null

  let message: string
  if (isBlacklisted) {
    message = 'Your account has been suspended. Contact support to resolve this.'
  } else if (status === 'rejected') {
    message = `Your verification was rejected. Re-upload your documents to ${action}.`
  } else {
    message = `Verify your account to ${action}. Upload your documents — a reviewer will approve them shortly.`
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 16,
        margin: '12px 0',
        borderRadius: 12,
        background: 'rgba(var(--ion-color-warning-rgb), 0.12)',
        border: '1px solid rgba(var(--ion-color-warning-rgb), 0.4)',
      }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <IonIcon icon={shieldCheckmarkOutline} color="warning" style={{ fontSize: 22 }} />
        <IonText>
          <strong>{isBlacklisted ? 'Account suspended' : 'Verification required'}</strong>
        </IonText>
      </div>
      <IonText color="medium">
        <p style={{ margin: 0 }}>{message}</p>
      </IonText>
      {!isBlacklisted && (
        <IonButton size="small" fill="solid" color="warning" onClick={() => history.push('/app/profile')}>
          Go to documents
        </IonButton>
      )}
    </div>
  )
}
