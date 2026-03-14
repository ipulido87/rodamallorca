import type { SubscriptionRepository } from '../domain/repositories/subscription-repository'
import type { WorkshopRepository } from '../../workshops/domain/repositories/workshop-repository'
import type { PaymentGateway } from '../../payments/domain/services/payment-gateway'
import { SUBSCRIPTION_PRICE_ID, TRIAL_PERIOD_DAYS } from '../infrastructure/stripe.config'

interface Dependencies {
  subscriptionRepo: SubscriptionRepository
  workshopRepo: WorkshopRepository
  paymentGateway: PaymentGateway
}

export interface CreateSubscriptionInput {
  workshopId: string
  ownerEmail: string
  ownerName: string
}

export interface CreateCheckoutSessionInput {
  workshopId: string
  ownerEmail: string
  successUrl: string
  cancelUrl: string
}

/**
 * Crea un Customer en Stripe y una suscripción en trial
 */
export async function createTrialSubscription(
  input: CreateSubscriptionInput,
  deps: Dependencies
) {
  const { workshopId, ownerEmail, ownerName } = input
  const { subscriptionRepo, workshopRepo, paymentGateway } = deps

  console.log(`🎁 [Subscription] Creando trial para workshop ${workshopId}`)

  // Verificar que el workshop existe
  const workshop = await workshopRepo.findById(workshopId)

  if (!workshop) {
    throw new Error('Workshop no encontrado')
  }

  // Verificar si ya tiene suscripción
  const existing = await subscriptionRepo.findByWorkshopId(workshopId)

  if (existing) {
    console.log(`⚠️ [Subscription] Workshop ${workshopId} ya tiene suscripción`)
    return existing
  }

  // Crear Customer en Stripe
  const customer = await paymentGateway.createCustomer({
    email: ownerEmail,
    name: ownerName,
    metadata: {
      workshopId,
    },
  })

  console.log(`✅ [Stripe] Customer creado: ${customer.id}`)

  // Calcular fechas de trial
  const trialStart = new Date()
  const trialEnd = new Date()
  trialEnd.setDate(trialEnd.getDate() + TRIAL_PERIOD_DAYS)

  // Crear registro en BD (sin suscripción de Stripe aún, solo trial)
  const subscription = await subscriptionRepo.create({
    workshopId,
    stripeCustomerId: customer.id,
    stripePriceId: SUBSCRIPTION_PRICE_ID,
    status: 'TRIALING',
    currentPeriodStart: trialStart,
    currentPeriodEnd: trialEnd,
    trialStart,
    trialEnd,
  })

  console.log(`✅ [Subscription] Trial creado para workshop ${workshopId}`)
  console.log(`🎁 [Subscription] Trial hasta: ${trialEnd.toLocaleDateString('es-ES')}`)

  return subscription
}

/**
 * Crea una sesión de Checkout de Stripe para que el usuario agregue su método de pago
 */
export async function createCheckoutSession(
  input: CreateCheckoutSessionInput,
  deps: Dependencies
) {
  const { workshopId, ownerEmail, successUrl, cancelUrl } = input
  const { subscriptionRepo, paymentGateway } = deps

  console.log(`💳 [Checkout] Creando sesión para workshop ${workshopId}`)

  // ⭐ Verificar si ya existe suscripción
  const subscription = await subscriptionRepo.findByWorkshopId(workshopId)

  let stripeCustomerId: string

  if (subscription && subscription.stripeCustomerId) {
    // Ya tiene customer de Stripe
    stripeCustomerId = subscription.stripeCustomerId
    console.log(`✅ [Checkout] Usando customer existente: ${stripeCustomerId}`)
  } else {
    // Crear nuevo customer en Stripe
    const customer = await paymentGateway.createCustomer({
      email: ownerEmail,
      metadata: {
        workshopId,
      },
    })
    stripeCustomerId = customer.id
    console.log(`✅ [Checkout] Nuevo customer creado: ${stripeCustomerId}`)
  }

  // Crear sesión de Checkout
  const session = await paymentGateway.createSubscriptionCheckoutSession({
    customerId: stripeCustomerId,
    email: ownerEmail,
    priceId: SUBSCRIPTION_PRICE_ID,
    trialPeriodDays: TRIAL_PERIOD_DAYS,
    workshopId,
    successUrl,
    cancelUrl,
  })

  console.log(`✅ [Checkout] Sesión creada: ${session.id}`)

  return {
    sessionId: session.id,
    url: session.url,
  }
}

/**
 * Cancela una suscripción
 */
export async function cancelSubscription(
  workshopId: string,
  cancelImmediately: boolean,
  deps: Dependencies
) {
  const { subscriptionRepo, paymentGateway } = deps

  console.log(`❌ [Subscription] Cancelando suscripción para workshop ${workshopId}`)

  const subscription = await subscriptionRepo.findByWorkshopId(workshopId)

  if (!subscription || !subscription.stripeSubscriptionId) {
    throw new Error('Suscripción no encontrada')
  }

  // Cancelar en Stripe
  await paymentGateway.cancelSubscription(subscription.stripeSubscriptionId, cancelImmediately)

  // Actualizar en BD
  const updated = await subscriptionRepo.update(workshopId, {
    cancelAtPeriodEnd: !cancelImmediately,
    canceledAt: cancelImmediately ? new Date() : null,
    status: cancelImmediately ? 'CANCELED' : subscription.status,
  })

  console.log(
    `✅ [Subscription] Cancelada ${cancelImmediately ? 'inmediatamente' : 'al final del período'}`
  )

  return updated
}

/**
 * Verifica si un workshop tiene suscripción activa
 */
export async function checkWorkshopSubscription(workshopId: string, deps: Dependencies) {
  const { subscriptionRepo } = deps

  const subscription = await subscriptionRepo.findByWorkshopId(workshopId)

  if (!subscription) {
    return { hasSubscription: false, status: null, isActive: false }
  }

  const now = new Date()
  const isInTrial = subscription.status === 'TRIALING' && subscription.trialEnd && subscription.trialEnd > now
  const isActive = subscription.status === 'ACTIVE'
  const isPastDue = subscription.status === 'PAST_DUE' && subscription.currentPeriodEnd > now

  return {
    hasSubscription: true,
    status: subscription.status,
    isActive: isInTrial || isActive || isPastDue,
    subscription,
  }
}

/**
 * Obtiene el portal de facturación de Stripe
 */
export async function createBillingPortalSession(
  workshopId: string,
  returnUrl: string,
  deps: Dependencies
) {
  const { subscriptionRepo, paymentGateway } = deps

  const subscription = await subscriptionRepo.findByWorkshopId(workshopId)

  if (!subscription) {
    throw new Error('Suscripción no encontrada')
  }

  return paymentGateway.createBillingPortalSession({
    customerId: subscription.stripeCustomerId,
    returnUrl,
  })
}
