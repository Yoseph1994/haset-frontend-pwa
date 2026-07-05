import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as contractsApi from '@/api/contracts'
import { saveBlob } from '@/utils/download'

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

export function useContractTerms(id: string | undefined) {
  return useQuery({
    queryKey: ['contracts', id, 'terms'],
    queryFn: () => contractsApi.getContractTerms(id as string),
    enabled: Boolean(id),
  })
}

export function useAgreeContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => contractsApi.agreeContract(id),
    onSuccess: (contract) => {
      queryClient.setQueryData(['contracts', contract.id], contract)
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      queryClient.invalidateQueries({ queryKey: ['offers'] })
    },
  })
}

export function useDownloadContractPdf() {
  return useMutation({
    mutationFn: async (contract: { id: string; reference?: string | null }) => {
      const blob = await contractsApi.fetchContractPdf(contract.id)
      saveBlob(blob, `Contract-${contract.reference ?? contract.id}.pdf`)
    },
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
