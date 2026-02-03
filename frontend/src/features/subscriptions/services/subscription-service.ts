import { API } from '@/shared/api'

export interface SubscriptionStatus {
  hasSubscription: boolean
  status: string | null
  isActive: boolean
  subscription?: {
    id: string
    status: string
    currentPeriodEnd: string
    trialEnd?: string | null
    cancelAtPeriodEnd: boolean
  }
}

/**
 * Crea una sesión de Checkout de Stripe
 */
export async function createCheckoutSession(workshopId: string) {
  const response = await API.post('/subscriptions/checkout', { workshopId })
  return response.data
}

/**
 * Cancela la suscripción
 */
export async function cancelSubscription(workshopId: string, immediate = false) {
  const response = await API.post('/subscriptions/cancel', { workshopId, immediate })
  return response.data
}

/**
 * Obtiene el estado de la suscripción del taller
 */
export async function getSubscriptionStatus(workshopId: string): Promise<SubscriptionStatus> {
  const response = await API.get(`/subscriptions/status/${workshopId}`)
  return response.data
}

/**
 * Crea una sesión del portal de facturación de Stripe
 */
export async function createBillingPortalSession(workshopId: string) {
  const response = await API.post('/subscriptions/portal', { workshopId })
  return response.data
}

/**
 * Redirige a Stripe Checkout
 */
export async function redirectToCheckout(workshopId: string) {
  const { url } = await createCheckoutSession(workshopId)
  window.location.href = url
}

/**
 * Redirige al portal de facturación
 */
export async function redirectToBillingPortal(workshopId: string) {
  const { url } = await createBillingPortalSession(workshopId)
  window.location.href = url
}
