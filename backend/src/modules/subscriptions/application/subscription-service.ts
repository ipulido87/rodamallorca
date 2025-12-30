import { PrismaClient, SubscriptionStatus } from '@prisma/client'
import { stripe, SUBSCRIPTION_PRICE_ID, TRIAL_PERIOD_DAYS } from '../infrastructure/stripe.config'

const prisma = new PrismaClient()

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
export async function createTrialSubscription(input: CreateSubscriptionInput) {
  const { workshopId, ownerEmail, ownerName } = input

  console.log(`🎁 [Subscription] Creando trial para workshop ${workshopId}`)

  // Verificar que el workshop existe
  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
  })

  if (!workshop) {
    throw new Error('Workshop no encontrado')
  }

  // Verificar si ya tiene suscripción
  const existing = await prisma.subscription.findUnique({
    where: { workshopId },
  })

  if (existing) {
    console.log(`⚠️ [Subscription] Workshop ${workshopId} ya tiene suscripción`)
    return existing
  }

  // Crear Customer en Stripe
  const customer = await stripe.customers.create({
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
  const subscription = await prisma.subscription.create({
    data: {
      workshopId,
      stripeCustomerId: customer.id,
      stripePriceId: SUBSCRIPTION_PRICE_ID,
      status: 'TRIALING',
      currentPeriodStart: trialStart,
      currentPeriodEnd: trialEnd,
      trialStart,
      trialEnd,
    },
  })

  console.log(`✅ [Subscription] Trial creado para workshop ${workshopId}`)
  console.log(`🎁 [Subscription] Trial hasta: ${trialEnd.toLocaleDateString('es-ES')}`)

  return subscription
}

/**
 * Crea una sesión de Checkout de Stripe para que el usuario agregue su método de pago
 */
export async function createCheckoutSession(input: CreateCheckoutSessionInput) {
  const { workshopId, ownerEmail, successUrl, cancelUrl } = input

  console.log(`💳 [Checkout] Creando sesión para workshop ${workshopId}`)

  // Obtener o crear suscripción en trial
  let subscription = await prisma.subscription.findUnique({
    where: { workshopId },
  })

  if (!subscription) {
    throw new Error('Primero debes crear una suscripción en trial')
  }

  // Crear sesión de Checkout
  const session = await stripe.checkout.sessions.create({
    customer: subscription.stripeCustomerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: SUBSCRIPTION_PRICE_ID,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: TRIAL_PERIOD_DAYS, // ⭐ 7 días de trial GRATIS (pero con tarjeta)
      metadata: {
        workshopId,
      },
    },
    payment_method_collection: 'always', // ⭐ SIEMPRE pedir tarjeta (incluso durante trial)
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: ownerEmail,
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
export async function cancelSubscription(workshopId: string, cancelImmediately = false) {
  console.log(`❌ [Subscription] Cancelando suscripción para workshop ${workshopId}`)

  const subscription = await prisma.subscription.findUnique({
    where: { workshopId },
  })

  if (!subscription || !subscription.stripeSubscriptionId) {
    throw new Error('Suscripción no encontrada')
  }

  // Cancelar en Stripe
  const stripeSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: !cancelImmediately,
  })

  if (cancelImmediately) {
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
  }

  // Actualizar en BD
  const updated = await prisma.subscription.update({
    where: { workshopId },
    data: {
      cancelAtPeriodEnd: !cancelImmediately,
      canceledAt: cancelImmediately ? new Date() : null,
      status: cancelImmediately ? 'CANCELED' : subscription.status,
    },
  })

  console.log(
    `✅ [Subscription] Cancelada ${cancelImmediately ? 'inmediatamente' : 'al final del período'}`
  )

  return updated
}

/**
 * Verifica si un workshop tiene suscripción activa
 */
export async function checkWorkshopSubscription(workshopId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { workshopId },
  })

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
export async function createBillingPortalSession(workshopId: string, returnUrl: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { workshopId },
  })

  if (!subscription) {
    throw new Error('Suscripción no encontrada')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: returnUrl,
  })

  return { url: session.url }
}
