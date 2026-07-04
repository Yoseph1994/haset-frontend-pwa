import { apiClient, unwrap, unwrapPaginated } from './client'
import type { Rating } from './types'

export function createRating(payload: { contract_id: string; rating: number; comment?: string }) {
  return unwrap<Rating>(apiClient.post('/ratings', payload))
}

export function getUserRatings(userId: string, page = 1) {
  return unwrapPaginated<Rating>(apiClient.get(`/ratings/user/${userId}`, { params: { page } }))
}
