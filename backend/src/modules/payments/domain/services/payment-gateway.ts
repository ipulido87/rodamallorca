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

export interface SubscriptionParams {
  customerId?: string
  email: string
  name?: string
  priceId: string
  trialPeriodDays?: number
  workshopId: string
  successUrl: string
  cancelUrl: string
}

export interface CustomerInfo {
  id: string
  email: string
  name?: string
}

export interface BillingPortalParams {
  customerId: string
  returnUrl: string
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

  // Métodos para suscripciones
  /**
   * Crea un cliente en el gateway de pagos
   */
  createCustomer(params: { email: string; name?: string; metadata?: Record<string, string> }): Promise<CustomerInfo>

  /**
   * Crea una sesión de checkout para suscripción
   */
  createSubscriptionCheckoutSession(params: SubscriptionParams): Promise<CheckoutSession>

  /**
   * Cancela una suscripción
   */
  cancelSubscription(subscriptionId: string, cancelImmediately: boolean): Promise<void>

  /**
   * Crea una sesión del portal de facturación
   */
  createBillingPortalSession(params: BillingPortalParams): Promise<{ url: string }>
}
