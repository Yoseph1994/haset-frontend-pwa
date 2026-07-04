import { IonButton, IonContent, IonPage } from '@ionic/react'
import { useSessionStore } from '@/store/session'
import { EmptyState } from '@/components/EmptyState'

/** admin/verifier accounts are managed entirely through the Filament back-office, not this app. */
export function UnsupportedRolePage() {
  const clearSession = useSessionStore((s) => s.clearSession)

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <EmptyState
          message="This account type is managed through the admin dashboard, not the mobile app."
          action={
            <IonButton fill="outline" onClick={() => void clearSession()}>
              Log out
            </IonButton>
          }
        />
      </IonContent>
    </IonPage>
  )
}
