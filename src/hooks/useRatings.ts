import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as ratingsApi from '@/api/ratings'

export function useUserRatings(userId: string) {
  return useQuery({
    queryKey: ['ratings', 'user', userId],
    queryFn: () => ratingsApi.getUserRatings(userId),
    enabled: Boolean(userId),
  })
}

export function useCreateRating() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ratingsApi.createRating,
    onSuccess: (rating) => {
      queryClient.invalidateQueries({ queryKey: ['ratings', 'user', rating.reviewed_user_id] })
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
    },
  })
}
