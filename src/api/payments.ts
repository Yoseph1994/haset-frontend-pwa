import { apiClient, unwrap } from './client'
import type { Payment } from './types'

export function getPayment(id: string) {
  return unwrap<Payment>(apiClient.get(`/payments/${id}`))
}

/** Hirer starts a platform-fee payment for an accepted offer. Returns the payment with a Chapa checkout URL. */
export function initiatePayment(offerId: string) {
  return unwrap<Payment>(apiClient.post('/payments/initiate', { offer_id: offerId }))
}

/** Synchronously re-check a payment with Chapa on return from checkout (idempotent with the webhook). */
export function verifyPayment(id: string) {
  return unwrap<Payment>(apiClient.post(`/payments/${id}/verify`))
}
