/**
 * Interfaz del gateway de pagos para abstraer la implementación (Stripe, PayPal, etc.)
 */

export interface CheckoutSessionParams {
  mode: 'payment' | 'subscription'
  paymentMethodTypes: string[]
  lineItems: Array<{
    priceData: {
      currency: string
      productData: {
        name: string
        description?: string
      }
      unitAmount: number
    }
    quantity: number
  }>
  successUrl: string
  cancelUrl: string
  customerEmail: string
  applicationFeeAmount?: number
  transferDestination?: string
  metadata?: Record<string, string>
}

export interface CheckoutSession {
  id: string
  url: string
}

export interface ConnectedAccount {
  id: string
  detailsSubmitted: boolean
  chargesEnabled: boolean
  payoutsEnabled: boolean
}

export interface AccountLink {
  url: string
}

export interface PaymentGateway {
  /**
   * Crea una sesión de checkout para procesar un pago
   */
  createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSession>

  /**
   * Obtiene información de una cuenta conectada
   */
  getConnectedAccount(accountId: string): Promise<ConnectedAccount>

  /**
   * Crea un link de onboarding para cuenta conectada
   */
  createAccountLink(accountId: string, refreshUrl: string, returnUrl: string): Promise<AccountLink>

  /**
   * Crea una nueva cuenta conectada
   */
  createConnectedAccount(params: {
    email: string
    country: string
    type: 'express' | 'standard'
  }): Promise<{ accountId: string }>
}
