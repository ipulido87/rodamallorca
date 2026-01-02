import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import { stripe } from '../infrastructure/stripe.config'

const prisma = new PrismaClient()

/**
 * Maneja los webhooks de Stripe
 */
export async function handleStripeWebhook(payload: Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  console.log('🔔 [Webhook] Webhook recibido desde Stripe')
  console.log('🔔 [Webhook] STRIPE_WEBHOOK_SECRET configurado:', webhookSecret ? '✅ SÍ' : '❌ NO')

  if (!webhookSecret) {
    console.error('❌ [Webhook] STRIPE_WEBHOOK_SECRET no está configurado en las variables de entorno')
    throw new Error('STRIPE_WEBHOOK_SECRET no está configurado')
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    console.log('✅ [Webhook] Firma verificada correctamente')
  } catch (err) {
    console.error('❌ [Webhook] Error verificando firma:', err)
    throw new Error(`Webhook signature verification failed: ${err.message}`)
  }

  console.log(`📨 [Webhook] Evento recibido: ${event.type}`)
  console.log(`📨 [Webhook] Event ID: ${event.id}`)

  try {
    switch (event.type) {
      // Suscripción creada exitosamente
      case 'customer.subscription.created':
        console.log('🎉 [Webhook] Procesando customer.subscription.created')
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      // Suscripción actualizada
      case 'customer.subscription.updated':
        console.log('🔄 [Webhook] Procesando customer.subscription.updated')
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      // Suscripción cancelada
      case 'customer.subscription.deleted':
        console.log('❌ [Webhook] Procesando customer.subscription.deleted')
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      // Pago exitoso
      case 'invoice.payment_succeeded':
        console.log('💰 [Webhook] Procesando invoice.payment_succeeded')
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      // Pago fallido
      case 'invoice.payment_failed':
        console.log('⚠️ [Webhook] Procesando invoice.payment_failed')
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      // Checkout completado
      case 'checkout.session.completed':
        console.log('✅ [Webhook] Procesando checkout.session.completed')
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      // Pago de producto completado (NO suscripción)
      case 'payment_intent.succeeded':
        console.log(`💰 [Webhook] Pago de producto exitoso`)
        // El checkout.session.completed ya maneja la creación de órdenes
        break

      default:
        console.log(`⚠️ [Webhook] Evento no manejado: ${event.type}`)
    }

    console.log(`✅ [Webhook] Evento ${event.type} procesado exitosamente`)
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

  // ⭐ Extraer datos de trial si existen
  const sub = subscription as any
  const trialStart = sub.trial_start
    ? new Date(sub.trial_start * 1000)
    : null
  const trialEnd = sub.trial_end
    ? new Date(sub.trial_end * 1000)
    : null

  await prisma.subscription.upsert({
    where: { workshopId },
    update: {
      stripeSubscriptionId: subscription.id,
      status: mapStripeStatus(subscription.status),
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      trialStart,
      trialEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
    create: {
      workshopId,
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      status: mapStripeStatus(subscription.status),
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      trialStart,
      trialEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  })

  console.log(`✅ [Webhook] Suscripción actualizada en BD para workshop ${workshopId}`)
  console.log(`   - Status: ${subscription.status}`)
  console.log(`   - Trial: ${trialStart ? 'SÍ' : 'NO'} ${trialEnd ? `hasta ${trialEnd.toLocaleDateString('es-ES')}` : ''}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`🔄 [Webhook] Suscripción actualizada: ${subscription.id}`)

  const sub = subscription as any
  const trialStart = sub.trial_start
    ? new Date(sub.trial_start * 1000)
    : null
  const trialEnd = sub.trial_end
    ? new Date(sub.trial_end * 1000)
    : null

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: mapStripeStatus(subscription.status),
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      trialStart,
      trialEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
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

  // Checkout de SUSCRIPCIÓN
  if (session.mode === 'subscription' && session.subscription) {
    const workshopId = session.metadata?.workshopId

    if (workshopId) {
      console.log(`✅ [Webhook] Checkout de suscripción para workshop ${workshopId}`)
    }
  }

  // Checkout de PRODUCTOS (pago único)
  if (session.mode === 'payment' && session.payment_status === 'paid') {
    console.log(`💰 [Webhook] Pago de productos completado`)

    const { userId, workshopId, items: itemsJson } = session.metadata || {}

    if (!userId || !workshopId || !itemsJson) {
      console.error('❌ [Webhook] Metadata incompleta en checkout de productos')
      return
    }

    try {
      const items = JSON.parse(itemsJson)

      // Crear la orden en la base de datos
      const order = await prisma.order.create({
        data: {
          workshopId,
          userId,
          status: 'PENDING',
          totalAmount: session.amount_total || 0,
          paymentStatus: 'PAID', // ⭐ PAGADO
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent as string,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtOrder: item.priceAtOrder,
              currency: item.currency,
              description: item.description,
            })),
          },
        },
        include: {
          items: true,
          workshop: true,
          user: true,
        },
      })

      console.log(`✅ [Webhook] Orden creada: ${order.id} - Estado: PAID`)

      // TODO: Enviar email de confirmación al usuario
      // TODO: Enviar notificación al taller
    } catch (error) {
      console.error('❌ [Webhook] Error creando orden:', error)
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
