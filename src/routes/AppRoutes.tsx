import { useEffect } from 'react'
import { useSessionStore } from '@/store/session'
import { LoadingScreen } from '@/components/LoadingScreen'
import { AuthRoutes } from './auth/AuthRoutes'
import { VerifyOtpPage } from './auth/VerifyOtpPage'
import { OnboardingGate } from './onboarding/OnboardingGate'
import { UnsupportedRolePage } from './UnsupportedRolePage'

export function AppRoutes() {
  const status = useSessionStore((s) => s.status)
  const user = useSessionStore((s) => s.user)
  const bootstrap = useSessionStore((s) => s.bootstrap)

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  if (status === 'booting') return <LoadingScreen />

  if (status === 'unauthenticated' || !user) {
    return <AuthRoutes />
  }

  if (!user.email_verified_at) {
    return <VerifyOtpPage />
  }

  if (user.role === 'employee' || user.role === 'hirer') {
    return <OnboardingGate />
  }

  return <UnsupportedRolePage />
}
