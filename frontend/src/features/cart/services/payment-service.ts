import { API } from '@/shared/api'

export interface CheckoutSessionData {
  sessionId: string
  url: string
}

/**
 * Crea una sesión de Stripe Checkout para productos
 */
export interface CheckoutItem {
  productId: string
  quantity: number
  priceAtOrder: number
  currency: string
  description?: string
  isRental?: boolean
  rentalStartDate?: string
  rentalEndDate?: string
  rentalDays?: number
  depositPaid?: number
}

export async function createProductCheckoutSession(workshopId: string, items: CheckoutItem[]) {
  const response = await API.post<CheckoutSessionData>('/payments/checkout', {
    workshopId,
    items,
  })
  return response.data
}

/**
 * Redirige a Stripe Checkout para pagar productos
 */
export async function redirectToProductCheckout(workshopId: string, items: CheckoutItem[]) {
  const { url } = await createProductCheckoutSession(workshopId, items)
  window.location.href = url
}
