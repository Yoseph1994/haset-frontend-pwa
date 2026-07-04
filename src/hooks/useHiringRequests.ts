import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as hiringRequestsApi from '@/api/hiringRequests'

export function useHiringRequests() {
  return useQuery({
    queryKey: ['hiring-requests'],
    queryFn: () => hiringRequestsApi.listHiringRequests(),
  })
}

export function useHiringRequest(id: string) {
  return useQuery({
    queryKey: ['hiring-requests', id],
    queryFn: () => hiringRequestsApi.getHiringRequest(id),
    enabled: Boolean(id),
  })
}

export function useCreateHiringRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: hiringRequestsApi.createHiringRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hiring-requests'] }),
  })
}

export function useAcceptHiringRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => hiringRequestsApi.acceptHiringRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hiring-requests'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useRejectHiringRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      hiringRequestsApi.rejectHiringRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hiring-requests'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useCancelHiringRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => hiringRequestsApi.cancelHiringRequest(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hiring-requests'] }),
  })
}
