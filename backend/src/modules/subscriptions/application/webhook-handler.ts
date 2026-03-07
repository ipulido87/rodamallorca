import Stripe from 'stripe'
import { stripe } from '../infrastructure/stripe.config'
import {
  sendTrialStartedEmail,
  sendTrialEndingEmail,
  sendPaymentSuccessEmail,
  sendNewOrderEmail,
} from '../../notifications/services/email-service'
import type { SubscriptionRepository } from '../domain/repositories/subscription-repository'
import type { WorkshopRepository } from '../../workshops/domain/repositories/workshop-repository'
import type { OrderRepository } from '../../orders/domain/repositories/order-repository'
import type { ProductRepository } from '../../products/domain/repositories/product-repository'

interface Dependencies {
  subscriptionRepo: SubscriptionRepository
  workshopRepo: WorkshopRepository
  orderRepo: OrderRepository
  productRepo: ProductRepository
}

/**
 * Maneja los webhooks de Stripe
 */
export async function handleStripeWebhook(payload: Buffer, signature: string, deps: Dependencies) {
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
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, deps)
        break

      // Suscripción actualizada
      case 'customer.subscription.updated':
        console.log('🔄 [Webhook] Procesando customer.subscription.updated')
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, deps)
        break

      // Suscripción cancelada
      case 'customer.subscription.deleted':
        console.log('❌ [Webhook] Procesando customer.subscription.deleted')
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, deps)
        break

      // Trial está por terminar (3 días antes)
      case 'customer.subscription.trial_will_end':
        console.log('⏰ [Webhook] Procesando customer.subscription.trial_will_end')
        await handleTrialWillEnd(event.data.object as Stripe.Subscription, deps)
        break

      // Pago exitoso
      case 'invoice.payment_succeeded':
        console.log('💰 [Webhook] Procesando invoice.payment_succeeded')
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, deps)
        break

      // Pago fallido
      case 'invoice.payment_failed':
        console.log('⚠️ [Webhook] Procesando invoice.payment_failed')
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, deps)
        break

      // Checkout completado
      case 'checkout.session.completed':
        console.log('✅ [Webhook] Procesando checkout.session.completed')
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, deps)
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

async function handleSubscriptionCreated(subscription: Stripe.Subscription, deps: Dependencies) {
  console.log(`✅ [Webhook] Suscripción creada: ${subscription.id}`)

  const { subscriptionRepo } = deps
  const workshopId = subscription.metadata.workshopId

  if (!workshopId) {
    console.error('❌ [Webhook] No se encontró workshopId en metadata')
    return
  }

  // 🔍 DEBUG: Ver estructura completa del objeto subscription
  console.log('🔍 [DEBUG] Subscription object keys:', Object.keys(subscription))
  console.log('🔍 [DEBUG] subscription.current_period_start:', (subscription as any).current_period_start)
  console.log('🔍 [DEBUG] subscription.current_period_end:', (subscription as any).current_period_end)
  console.log('🔍 [DEBUG] subscription.trial_start:', (subscription as any).trial_start)
  console.log('🔍 [DEBUG] subscription.trial_end:', (subscription as any).trial_end)
  console.log('🔍 [DEBUG] Full subscription object:', JSON.stringify(subscription, null, 2))

  // ⭐ Extraer datos de trial si existen
  const sub = subscription as any
  const trialStart = sub.trial_start
    ? new Date(sub.trial_start * 1000)
    : null
  const trialEnd = sub.trial_end
    ? new Date(sub.trial_end * 1000)
    : null

  // ⭐ Manejar current_period - durante trial, usar trial dates como fallback
  const currentPeriodStart = sub.current_period_start
    ? new Date(sub.current_period_start * 1000)
    : (trialStart || new Date())
  const currentPeriodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000)
    : (trialEnd || new Date())

  console.log('🔍 [DEBUG] Fechas calculadas:')
  console.log('   - trialStart:', trialStart)
  console.log('   - trialEnd:', trialEnd)
  console.log('   - currentPeriodStart:', currentPeriodStart)
  console.log('   - currentPeriodEnd:', currentPeriodEnd)

  // Check if subscription exists
  const existing = await subscriptionRepo.findByWorkshopId(workshopId)

  if (existing) {
    await subscriptionRepo.update(workshopId, {
      stripeSubscriptionId: subscription.id,
      status: mapStripeStatus(subscription.status),
      currentPeriodStart,
      currentPeriodEnd,
      trialStart,
      trialEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    })
  } else {
    await subscriptionRepo.create({
      workshopId,
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      status: mapStripeStatus(subscription.status),
      currentPeriodStart,
      currentPeriodEnd,
      trialStart,
      trialEnd,
    })
  }

  console.log(`✅ [Webhook] Suscripción actualizada en BD para workshop ${workshopId}`)
  console.log(`   - Status: ${subscription.status}`)
  console.log(`   - Trial: ${trialStart ? 'SÍ' : 'NO'} ${trialEnd ? `hasta ${trialEnd.toLocaleDateString('es-ES')}` : ''}`)

  // 📧 Enviar email de bienvenida si es un trial
  if (trialStart && trialEnd) {
    try {
      // Note: We need to fetch workshop with owner, which requires a more complex query
      // For now, this would need a specialized repository method or we keep minimal Prisma usage here
      // Since email sending is infrastructure-level, it's acceptable to keep this Prisma call
      const prismaModule = await import('../../../lib/prisma')
      const prisma = (prismaModule as any).default ?? prismaModule

      if (!prisma?.workshop?.findUnique) {
        console.warn('⚠️ [Webhook] Prisma workshop.findUnique no disponible para enviar email')
        return
      }

      const workshop = await prisma.workshop.findUnique({
        where: { id: workshopId },
        include: { owner: true },
      })

      if (workshop && workshop.owner) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
        await sendTrialStartedEmail({
          workshopName: workshop.name,
          ownerEmail: workshop.owner.email,
          trialEndDate: trialEnd.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          dashboardUrl: `${frontendUrl}/dashboard`,
        })
        console.log(`📧 [Webhook] Email de bienvenida enviado a ${workshop.owner.email}`)
      }
    } catch (emailError) {
      console.error('❌ [Webhook] Error enviando email de bienvenida:', emailError)
      // No fallar el webhook por un error de email
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, deps: Dependencies) {
  console.log(`🔄 [Webhook] Suscripción actualizada: ${subscription.id}`)

  const { subscriptionRepo } = deps
  const sub = subscription as any
  const trialStart = sub.trial_start
    ? new Date(sub.trial_start * 1000)
    : null
  const trialEnd = sub.trial_end
    ? new Date(sub.trial_end * 1000)
    : null

  // ⭐ Manejar current_period con fallback
  const currentPeriodStart = sub.current_period_start
    ? new Date(sub.current_period_start * 1000)
    : (trialStart || new Date())
  const currentPeriodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000)
    : (trialEnd || new Date())

  const existing = await subscriptionRepo.findByStripeSubscriptionId(subscription.id)
  if (existing) {
    await subscriptionRepo.update(existing.workshopId, {
      status: mapStripeStatus(subscription.status),
      currentPeriodStart,
      currentPeriodEnd,
      trialStart,
      trialEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
    })
  }

  console.log(`✅ [Webhook] Estado actualizado: ${subscription.status}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, deps: Dependencies) {
  console.log(`❌ [Webhook] Suscripción eliminada: ${subscription.id}`)

  const { subscriptionRepo } = deps
  const existing = await subscriptionRepo.findByStripeSubscriptionId(subscription.id)
  if (existing) {
    await subscriptionRepo.update(existing.workshopId, {
      status: 'CANCELED',
      canceledAt: new Date(),
    })
  }

  console.log(`✅ [Webhook] Suscripción marcada como cancelada`)
}

async function handleTrialWillEnd(subscription: Stripe.Subscription, deps: Dependencies) {
  console.log(`⏰ [Webhook] Trial está por terminar: ${subscription.id}`)

  const workshopId = subscription.metadata.workshopId

  if (!workshopId) {
    console.error('❌ [Webhook] No se encontró workshopId en metadata')
    return
  }

  try {
    // Keep minimal Prisma usage for email sending (infrastructure concern)
    const prismaModule = await import('../../../lib/prisma')
    const prisma = (prismaModule as any).default ?? prismaModule

    if (!prisma?.workshop?.findUnique) {
      console.warn('⚠️ [Webhook] Prisma workshop.findUnique no disponible para enviar email de trial')
      return
    }

    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
      include: { owner: true },
    })

    if (!workshop || !workshop.owner) {
      console.error('❌ [Webhook] No se encontró el workshop o el owner')
      return
    }

    const sub = subscription as any
    const trialEnd = sub.trial_end
      ? new Date(sub.trial_end * 1000)
      : null

    if (!trialEnd) {
      console.error('❌ [Webhook] No se encontró trial_end en la suscripción')
      return
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

    // Obtener el precio de la suscripción
    const priceAmount = subscription.items.data[0]?.price?.unit_amount
    const amount = priceAmount
      ? `${(priceAmount / 100).toFixed(2)}€`
      : '18.3€'

    await sendTrialEndingEmail({
      workshopName: workshop.name,
      ownerEmail: workshop.owner.email,
      trialEndDate: trialEnd.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      amount,
      manageSubscriptionUrl: `${frontendUrl}/subscription/manage`,
    })

    console.log(`✅ [Webhook] Email de trial ending enviado a ${workshop.owner.email}`)
  } catch (error) {
    console.error('❌ [Webhook] Error enviando email de trial ending:', error)
    // No fallar el webhook por un error de email
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, deps: Dependencies) {
  console.log(`💰 [Webhook] Pago exitoso: ${invoice.id}`)

  const { subscriptionRepo } = deps
  const invoiceSubscription = (invoice as any).subscription
  if (!invoiceSubscription) return

  const subscription = await subscriptionRepo.findByStripeSubscriptionId(invoiceSubscription as string)

  if (subscription) {
    // Actualizar estado de la suscripción
    await subscriptionRepo.update(subscription.workshopId, {
      status: 'ACTIVE',
    })
    console.log(`✅ [Webhook] Suscripción activada tras pago exitoso`)

    // 📧 Enviar email de confirmación de pago
    try {
      // Get workshop with owner for email
      const prisma = (await import('../../../lib/prisma')).default
      const workshop = await prisma.workshop.findUnique({
        where: { id: subscription.workshopId },
        include: { owner: true },
      })

      if (workshop && workshop.owner) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
        const amount = invoice.amount_paid
          ? `${(invoice.amount_paid / 100).toFixed(2)}€`
          : '18.3€'

        // Calcular próxima fecha de facturación
        const nextBillingDate = subscription.currentPeriodEnd
          ? new Date(subscription.currentPeriodEnd).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'Próximamente'

        await sendPaymentSuccessEmail({
          workshopName: workshop.name,
          ownerEmail: workshop.owner.email,
          amount,
          nextBillingDate,
          invoiceUrl: invoice.hosted_invoice_url || `${frontendUrl}/subscription/invoices`,
          manageSubscriptionUrl: `${frontendUrl}/subscription/manage`,
        })
        console.log(`📧 [Webhook] Email de pago exitoso enviado a ${workshop.owner.email}`)
      }
    } catch (emailError) {
      console.error('❌ [Webhook] Error enviando email de pago:', emailError)
      // No fallar el webhook por un error de email
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, deps: Dependencies) {
  console.error(`❌ [Webhook] Pago fallido: ${invoice.id}`)

  const { subscriptionRepo } = deps
  const invoiceSubscription = (invoice as any).subscription
  if (!invoiceSubscription) return

  const subscription = await subscriptionRepo.findByStripeSubscriptionId(invoiceSubscription as string)

  if (subscription) {
    await subscriptionRepo.update(subscription.workshopId, {
      status: 'PAST_DUE',
    })
    console.log(`⚠️ [Webhook] Suscripción marcada como PAST_DUE`)

    // TODO: Enviar email de aviso al usuario
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, deps: Dependencies) {
  console.log(`✅ [Webhook] Checkout completado: ${session.id}`)

  // Checkout de SUSCRIPCIÓN
  if (session.mode === 'subscription' && session.subscription) {
    const workshopId = session.metadata?.workshopId

    if (workshopId) {
      console.log(`✅ [Webhook] Checkout de suscripción para workshop ${workshopId}`)

      try {
        // Obtener la suscripción completa de Stripe
        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription.id

        console.log(`🔍 [Webhook] Obteniendo suscripción ${subscriptionId} desde Stripe...`)
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        // Procesar la suscripción (igual que en handleSubscriptionCreated)
        // Esto creará/actualizará el registro en BD y enviará emails
        await handleSubscriptionCreated(subscription, deps)

        console.log(`✅ [Webhook] Suscripción procesada desde checkout para workshop ${workshopId}`)
      } catch (error) {
        console.error('❌ [Webhook] Error procesando suscripción desde checkout:', error)
        throw error
      }
    } else {
      console.error('❌ [Webhook] No se encontró workshopId en metadata del checkout de suscripción')
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
      const { orderRepo } = deps
      const items = JSON.parse(itemsJson)

      // ✅ Determinar el tipo de orden basado en los items
      const hasRentals = items.some((item: any) => item.isRental === true)
      const orderType = hasRentals ? 'RENTAL' : 'PRODUCT_ORDER'

      // ✅ Crear la orden usando OrderRepository
      const order = await orderRepo.create({
        workshopId,
        userId,
        notes: null,
        type: orderType,
        totalAmount: session.amount_total || 0,
        // Campos de pago
        paymentStatus: 'PAID',
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent as string,
        items: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceAtOrder: item.priceAtOrder,
          currency: item.currency,
          description: item.description,
          // Campos de alquiler
          isRental: item.isRental ?? false,
          rentalStartDate: item.rentalStartDate ? new Date(item.rentalStartDate) : null,
          rentalEndDate: item.rentalEndDate ? new Date(item.rentalEndDate) : null,
          rentalDays: item.rentalDays ?? null,
          depositPaid: item.depositPaid ?? null,
        })),
      })

      console.log(`✅ [Webhook] Orden creada: ${order.id} - Estado: PAID`)

      // 📧 Enviar email de notificación al taller
      try {
        // Para el email necesitamos workshop con owner y user completo (usa Prisma mínimo)
        const prisma = (await import('../../../lib/prisma')).default
        const orderDetails = await prisma.order.findUnique({
          where: { id: order.id },
          include: {
            workshop: {
              include: {
                owner: true,
              },
            },
            user: true,
            items: true,
          },
        })

        if (orderDetails) {
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
          const totalAmount = `${(orderDetails.totalAmount / 100).toFixed(2)}€`

          await sendNewOrderEmail({
            workshopName: orderDetails.workshop.name,
            workshopOwnerEmail: orderDetails.workshop.owner.email,
            orderNumber: orderDetails.id.slice(0, 8),
            customerName: orderDetails.user.name || orderDetails.user.email,
            customerEmail: orderDetails.user.email,
            totalAmount,
            itemsCount: orderDetails.items.length,
            orderUrl: `${frontendUrl}/workshop-orders/${orderDetails.workshopId}`,
          })

          console.log(`📧 [Webhook] Email de nuevo pedido enviado al taller ${orderDetails.workshop.name}`)
        }
      } catch (emailError) {
        console.error('❌ [Webhook] Error enviando email al taller:', emailError)
        // No fallar el webhook por un error de email
      }
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
