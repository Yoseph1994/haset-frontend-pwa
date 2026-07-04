import { Preferences } from '@capacitor/preferences'
import type { Payment } from '@/api/types'

export const PENDING_PAYMENT_KEY = 'mams_pending_payment'

/**
 * Stash the payment id so the return page can find it, then send the browser to
 * Chapa's hosted checkout. On the web/PWA this is a full-page redirect; Chapa
 * returns the user to FRONTEND_URL/payments/success afterwards.
 */
export async function launchChapaCheckout(payment: Payment): Promise<void> {
  if (!payment.chapa_checkout_url) {
    throw new Error('Chapa did not return a checkout URL. Please try again.')
  }
  await Preferences.set({ key: PENDING_PAYMENT_KEY, value: payment.id })
  window.location.href = payment.chapa_checkout_url
}

export async function readPendingPaymentId(): Promise<string | null> {
  const { value } = await Preferences.get({ key: PENDING_PAYMENT_KEY })
  return value
}

export async function clearPendingPayment(): Promise<void> {
  await Preferences.remove({ key: PENDING_PAYMENT_KEY })
}
