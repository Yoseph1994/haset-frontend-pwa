import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as paymentsApi from '@/api/payments'

export function usePayment(id: string | null | undefined, options?: { poll?: boolean }) {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: () => paymentsApi.getPayment(id as string),
    enabled: Boolean(id),
    // While awaiting webhook confirmation, poll until the payment resolves.
    refetchInterval: (query) => {
      if (!options?.poll) return false
      const status = query.state.data?.status
      return status === 'completed' || status === 'failed' ? false : 3000
    },
  })
}

export function useInitiatePayment() {
  return useMutation({
    mutationFn: (offerId: string) => paymentsApi.initiatePayment(offerId),
  })
}

export function useVerifyPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => paymentsApi.verifyPayment(id),
    onSuccess: (payment) => {
      queryClient.setQueryData(['payments', payment.id], payment)
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      queryClient.invalidateQueries({ queryKey: ['offers'] })
    },
  })
}
