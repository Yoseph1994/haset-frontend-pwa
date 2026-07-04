import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as offersApi from '@/api/offers'

export function useOffers() {
  return useQuery({
    queryKey: ['offers'],
    queryFn: () => offersApi.listOffers(),
  })
}

export function useOffer(id: string) {
  return useQuery({
    queryKey: ['offers', id],
    queryFn: () => offersApi.getOffer(id),
    enabled: Boolean(id),
  })
}

export function useAcceptOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => offersApi.acceptOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] })
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useRejectOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => offersApi.rejectOffer(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
