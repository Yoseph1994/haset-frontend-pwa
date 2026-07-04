import { apiClient, unwrap, unwrapPaginated } from './client'
import type { Offer } from './types'

export function listOffers(page = 1) {
  return unwrapPaginated<Offer>(apiClient.get('/offers', { params: { page } }))
}

export function getOffer(id: string) {
  return unwrap<Offer>(apiClient.get(`/offers/${id}`))
}

export function acceptOffer(id: string) {
  return unwrap<Offer>(apiClient.put(`/offers/${id}/accept`))
}

export function rejectOffer(id: string, rejected_reason?: string) {
  return unwrap<Offer>(apiClient.put(`/offers/${id}/reject`, { rejected_reason }))
}
