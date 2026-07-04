import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/client'
import * as employeeApi from '@/api/employeeProfile'
import * as hirerApi from '@/api/hirerProfile'
import { useSessionStore } from '@/store/session'
import type { EmployeeProfile, HirerProfile } from '@/api/types'

/** Fetches the current user's role-appropriate profile. Returns `null` (not an error) when none exists yet. */
export function useMyProfile() {
  const user = useSessionStore((s) => s.user)
  const role = user?.role

  return useQuery({
    queryKey: ['my-profile', role],
    enabled: role === 'employee' || role === 'hirer',
    queryFn: async (): Promise<EmployeeProfile | HirerProfile | null> => {
      try {
        return role === 'employee' ? await employeeApi.getMyEmployeeProfile() : await hirerApi.getMyHirerProfile()
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null
        throw err
      }
    },
  })
}

export function useCreateEmployeeProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: employeeApi.createEmployeeProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-profile'] }),
  })
}

export function useUpdateEmployeeProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: employeeApi.updateEmployeeProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-profile'] }),
  })
}

export function useCreateHirerProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: hirerApi.createHirerProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-profile'] }),
  })
}

export function useUpdateHirerProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: hirerApi.updateHirerProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-profile'] }),
  })
}

export function useUpdateProfilePhoto() {
  const queryClient = useQueryClient()
  const user = useSessionStore((s) => s.user)
  const refreshUser = useSessionStore((s) => s.refreshUser)

  return useMutation({
    mutationFn: (file: File | Blob) =>
      user?.role === 'employee' ? employeeApi.updateEmployeePhoto(file) : hirerApi.updateHirerPhoto(file),
    onSuccess: async () => {
      await refreshUser()
      queryClient.invalidateQueries({ queryKey: ['my-profile'] })
    },
  })
}

export function usePublicEmployeeProfile(id: string) {
  return useQuery({
    queryKey: ['employee-profile', id],
    queryFn: () => employeeApi.getPublicEmployeeProfile(id),
    enabled: Boolean(id),
  })
}
