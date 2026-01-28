import { stripe } from '../../../subscriptions/infrastructure/stripe.config'
import type {
  PaymentGateway,
  CheckoutSession,
  CheckoutSessionParams,
  ConnectedAccount,
  AccountLink,
  SubscriptionParams,
  CustomerInfo,
  BillingPortalParams,
} from '../../domain/services/payment-gateway'

/**
 * Implementación de PaymentGateway usando Stripe
 */
export class StripePaymentGateway implements PaymentGateway {
  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSession> {
    const lineItems = params.lineItems.map((item) => ({
      price_data: {
        currency: item.priceData.currency.toLowerCase(),
        unit_amount: item.priceData.unitAmount,
        product_data: {
          name: item.priceData.productData.name,
          description: item.priceData.productData.description || undefined,
        },
      },
      quantity: item.quantity,
    }))

    const sessionParams: any = {
      mode: params.mode,
      payment_method_types: params.paymentMethodTypes,
      line_items: lineItems,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.customerEmail,
      metadata: params.metadata,
    }

    // Configurar Stripe Connect si se especifica
    if (params.applicationFeeAmount && params.transferDestination) {
      sessionParams.payment_intent_data = {
        application_fee_amount: params.applicationFeeAmount,
        transfer_data: {
          destination: params.transferDestination,
        },
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return {
      id: session.id,
      url: session.url!,
    }
  }

  async getConnectedAccount(accountId: string): Promise<ConnectedAccount> {
    const account = await stripe.accounts.retrieve(accountId)

    return {
      id: account.id,
      detailsSubmitted: account.details_submitted || false,
      chargesEnabled: account.charges_enabled || false,
      payoutsEnabled: account.payouts_enabled || false,
    }
  }

  async createAccountLink(
    accountId: string,
    refreshUrl: string,
    returnUrl: string
  ): Promise<AccountLink> {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    })

    return {
      url: accountLink.url,
    }
  }

  async createConnectedAccount(params: {
    email: string
    country: string
    type: 'express' | 'standard'
  }): Promise<{ accountId: string }> {
    const account = await stripe.accounts.create({
      type: params.type,
      country: params.country,
      email: params.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    })

    return {
      accountId: account.id,
    }
  }

  async createCustomer(params: {
    email: string
    name?: string
    metadata?: Record<string, string>
  }): Promise<CustomerInfo> {
    const customer = await stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: params.metadata,
    })

    return {
      id: customer.id,
      email: customer.email!,
      name: customer.name || undefined,
    }
  }

  async createSubscriptionCheckoutSession(params: SubscriptionParams): Promise<CheckoutSession> {
    const session = await stripe.checkout.sessions.create({
      customer: params.customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: params.trialPeriodDays,
        metadata: {
          workshopId: params.workshopId,
        },
      },
      metadata: {
        workshopId: params.workshopId,
      },
      payment_method_collection: 'always',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    })

    return {
      id: session.id,
      url: session.url!,
    }
  }

  async cancelSubscription(subscriptionId: string, cancelImmediately: boolean): Promise<void> {
    if (cancelImmediately) {
      await stripe.subscriptions.cancel(subscriptionId)
    } else {
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      })
    }
  }

  async createBillingPortalSession(params: BillingPortalParams): Promise<{ url: string }> {
    const session = await stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    })

    return {
      url: session.url,
    }
  }
}
