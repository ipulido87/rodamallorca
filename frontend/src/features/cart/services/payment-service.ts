import { API } from '@/shared/api'

export interface CheckoutSessionData {
  sessionId: string
  url: string
}

/**
 * Crea una sesión de Stripe Checkout para productos
 */
export async function createProductCheckoutSession(workshopId: string, items: any[]) {
  const response = await API.post<CheckoutSessionData>('/payments/checkout', {
    workshopId,
    items,
  })
  return response.data
}

/**
 * Redirige a Stripe Checkout para pagar productos
 */
export async function redirectToProductCheckout(workshopId: string, items: any[]) {
  const { url } = await createProductCheckoutSession(workshopId, items)
  window.location.href = url
}
