import { API as api } from '../features/auth/services/auth-service'

export interface StripeConnectStatus {
  hasAccount: boolean
  accountId?: string
  onboardingComplete: boolean
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted?: boolean
  requiresInfo?: boolean
}

export interface ConnectResponse {
  success: boolean
  accountId: string
  onboardingUrl: string
  expiresAt: number
}

export interface DashboardLinkResponse {
  success: boolean
  url: string
}

/**
 * Inicia el proceso de conexión de Stripe Connect
 * Crea la cuenta conectada y retorna la URL de onboarding
 */
export async function initiateStripeConnect(workshopId: string): Promise<ConnectResponse> {
  const response = await api.post(`/api/workshops/${workshopId}/stripe/connect`)
  return response.data
}

/**
 * Regenera el link de onboarding si expiró
 */
export async function refreshOnboardingLink(workshopId: string): Promise<ConnectResponse> {
  const response = await api.post(`/api/workshops/${workshopId}/stripe/refresh-onboarding`)
  return response.data
}

/**
 * Obtiene el estado de la cuenta conectada de Stripe
 */
export async function getStripeAccountStatus(workshopId: string): Promise<StripeConnectStatus> {
  const response = await api.get(`/api/workshops/${workshopId}/stripe/status`)
  return response.data
}

/**
 * Obtiene un link al Stripe Express Dashboard
 */
export async function getStripeDashboardLink(workshopId: string): Promise<DashboardLinkResponse> {
  const response = await api.post(`/api/workshops/${workshopId}/stripe/dashboard-link`)
  return response.data
}
