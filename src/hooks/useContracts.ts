import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as contractsApi from '@/api/contracts'

export function useContracts() {
  return useQuery({
    queryKey: ['contracts'],
    queryFn: () => contractsApi.listContracts(),
  })
}

export function useContract(id: string) {
  return useQuery({
    queryKey: ['contracts', id],
    queryFn: () => contractsApi.getContract(id),
    enabled: Boolean(id),
  })
}

export function useContractEvents(id: string) {
  return useQuery({
    queryKey: ['contracts', id, 'events'],
    queryFn: () => contractsApi.getContractEvents(id),
    enabled: Boolean(id),
  })
}

export function useCompleteContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => contractsApi.completeContract(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      queryClient.invalidateQueries({ queryKey: ['contracts', id, 'events'] })
    },
  })
}

export function useTerminateContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => contractsApi.terminateContract(id, reason),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      queryClient.invalidateQueries({ queryKey: ['contracts', id, 'events'] })
    },
  })
}
