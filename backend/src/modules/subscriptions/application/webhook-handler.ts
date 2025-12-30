import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import { stripe } from '../infrastructure/stripe.config'

const prisma = new PrismaClient()

/**
 * Maneja los webhooks de Stripe
 */
export async function handleStripeWebhook(payload: Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET no está configurado')
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (err) {
    console.error('❌ [Webhook] Error verificando firma:', err)
    throw new Error(`Webhook signature verification failed: ${err.message}`)
  }

  console.log(`📨 [Webhook] Evento recibido: ${event.type}`)

  try {
    switch (event.type) {
      // Suscripción creada exitosamente
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      // Suscripción actualizada
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      // Suscripción cancelada
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      // Pago exitoso
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      // Pago fallido
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      // Checkout completado
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      default:
        console.log(`⚠️ [Webhook] Evento no manejado: ${event.type}`)
    }

    return { received: true }
  } catch (error) {
    console.error(`❌ [Webhook] Error procesando ${event.type}:`, error)
    throw error
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log(`✅ [Webhook] Suscripción creada: ${subscription.id}`)

  const workshopId = subscription.metadata.workshopId

  if (!workshopId) {
    console.error('❌ [Webhook] No se encontró workshopId en metadata')
    return
  }

  await prisma.subscription.upsert({
    where: { workshopId },
    update: {
      stripeSubscriptionId: subscription.id,
      status: mapStripeStatus(subscription.status),
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
    },
    create: {
      workshopId,
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      status: mapStripeStatus(subscription.status),
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
    },
  })

  console.log(`✅ [Webhook] Suscripción actualizada en BD para workshop ${workshopId}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`🔄 [Webhook] Suscripción actualizada: ${subscription.id}`)

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: mapStripeStatus(subscription.status),
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
      canceledAt: (subscription as any).canceled_at ? new Date((subscription as any).canceled_at * 1000) : null,
    },
  })

  console.log(`✅ [Webhook] Estado actualizado: ${subscription.status}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`❌ [Webhook] Suscripción eliminada: ${subscription.id}`)

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'CANCELED',
      canceledAt: new Date(),
    },
  })

  console.log(`✅ [Webhook] Suscripción marcada como cancelada`)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`💰 [Webhook] Pago exitoso: ${invoice.id}`)

  const invoiceSubscription = (invoice as any).subscription
  if (!invoiceSubscription) return

  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: invoiceSubscription as string },
  })

  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
      },
    })
    console.log(`✅ [Webhook] Suscripción activada tras pago exitoso`)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.error(`❌ [Webhook] Pago fallido: ${invoice.id}`)

  const invoiceSubscription = (invoice as any).subscription
  if (!invoiceSubscription) return

  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: invoiceSubscription as string },
  })

  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'PAST_DUE',
      },
    })
    console.log(`⚠️ [Webhook] Suscripción marcada como PAST_DUE`)

    // TODO: Enviar email de aviso al usuario
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`✅ [Webhook] Checkout completado: ${session.id}`)

  if (session.mode === 'subscription' && session.subscription) {
    const workshopId = session.metadata?.workshopId

    if (workshopId) {
      console.log(`✅ [Webhook] Checkout para workshop ${workshopId}`)
    }
  }
}

/**
 * Mapea el status de Stripe a nuestro enum
 */
function mapStripeStatus(status: Stripe.Subscription.Status): any {
  const statusMap: Record<string, string> = {
    trialing: 'TRIALING',
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    incomplete: 'INCOMPLETE',
    unpaid: 'UNPAID',
  }

  return statusMap[status] || 'UNPAID'
}
