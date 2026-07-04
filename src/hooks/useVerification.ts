import { useMyProfile } from './useProfile'
import type { HirerProfile, VerificationStatus } from '@/api/types'

interface VerificationState {
  isApproved: boolean
  isBlacklisted: boolean
  status: VerificationStatus | undefined
  hasProfile: boolean
  isLoading: boolean
}

/**
 * Whether the current user is cleared to perform gated actions (apply, post a
 * job, invite, accept an offer). Mirrors the backend `verified.profile`
 * middleware: profile must exist and be `approved`, and hirers must not be
 * blacklisted.
 */
export function useVerification(): VerificationState {
  const { data: profile, isLoading } = useMyProfile()
  const status = profile?.verification_status
  const isBlacklisted = Boolean(profile && (profile as HirerProfile).is_blacklisted)

  return {
    isApproved: status === 'approved' && !isBlacklisted,
    isBlacklisted,
    status,
    hasProfile: Boolean(profile),
    isLoading,
  }
}
