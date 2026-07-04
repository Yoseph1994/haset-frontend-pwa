import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as authApi from '@/api/auth'
import { useSessionStore } from '@/store/session'

export function useRegister() {
  const setSession = useSessionStore((s) => s.setSession)

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: async (result) => {
      await setSession(result.user, result.token)
    },
  })
}

export function useLogin() {
  const setSession = useSessionStore((s) => s.setSession)

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (result) => {
      await setSession(result.user, result.token)
    },
  })
}

export function useLogout() {
  const clearSession = useSessionStore((s) => s.clearSession)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: async () => {
      await clearSession()
      queryClient.clear()
    },
  })
}

export function useSendEmailOtp() {
  return useMutation({ mutationFn: authApi.sendEmailVerificationOtp })
}

export function useVerifyEmailOtp() {
  const refreshUser = useSessionStore((s) => s.refreshUser)

  return useMutation({
    mutationFn: authApi.verifyEmailOtp,
    onSuccess: async () => {
      await refreshUser()
    },
  })
}

export function useForgotPassword() {
  return useMutation({ mutationFn: authApi.forgotPassword })
}

export function useResetPassword() {
  const setSession = useSessionStore((s) => s.setSession)

  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: async (result) => {
      await setSession(result.user, result.token)
    },
  })
}

export function useChangePassword() {
  return useMutation({ mutationFn: authApi.changePassword })
}
