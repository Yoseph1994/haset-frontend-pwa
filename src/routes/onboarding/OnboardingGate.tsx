import { useMyProfile } from '@/hooks/useProfile'
import { useSessionStore } from '@/store/session'
import { LoadingScreen } from '@/components/LoadingScreen'
import { IonContent, IonPage } from '@ionic/react'
import { ErrorBanner } from '@/components/ErrorBanner'
import { EmployeeProfileSetupPage } from './EmployeeProfileSetupPage'
import { HirerProfileSetupPage } from './HirerProfileSetupPage'
import { AppShell } from '../AppShell'

/**
 * Binance-style gate: the ONLY hard wall is having a profile at all — a quick
 * one-time setup so the account has a role record. Once a profile exists (even
 * pending/rejected verification), the user gets full browse access to the app;
 * individual actions (apply, post job, invite, accept offer) are gated on
 * verification status at their own call sites, not here.
 */
export function OnboardingGate() {
  const role = useSessionStore((s) => s.user?.role)
  const { data: profile, isLoading, isError, refetch } = useMyProfile()

  if (isLoading) return <LoadingScreen />

  if (isError) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <ErrorBanner message="Couldn't load your profile." onRetry={() => void refetch()} />
        </IonContent>
      </IonPage>
    )
  }

  if (!profile) {
    return role === 'employee' ? <EmployeeProfileSetupPage /> : <HirerProfileSetupPage />
  }

  return <AppShell />
}
