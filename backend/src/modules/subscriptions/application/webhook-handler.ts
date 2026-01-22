import prisma from '../../../lib/prisma'
import Stripe from 'stripe'
import { stripe } from '../infrastructure/stripe.config'
import {
  sendTrialStartedEmail,
  sendTrialEndingEmail,
  sendPaymentSuccessEmail,
  sendNewOrderEmail,
} from '../../notifications/services/email-service'

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

      // Trial está por terminar (3 días antes)
      case 'customer.subscription.trial_will_end':
        console.log('⏰ [Webhook] Procesando customer.subscription.trial_will_end')
        await handleTrialWillEnd(event.data.object as Stripe.Subscription)
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

  await prisma.subscription.upsert({
    where: { workshopId },
    update: {
      stripeSubscriptionId: subscription.id,
      status: mapStripeStatus(subscription.status),
      currentPeriodStart,
      currentPeriodEnd,
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
      currentPeriodStart,
      currentPeriodEnd,
      trialStart,
      trialEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  })

  console.log(`✅ [Webhook] Suscripción actualizada en BD para workshop ${workshopId}`)
  console.log(`   - Status: ${subscription.status}`)
  console.log(`   - Trial: ${trialStart ? 'SÍ' : 'NO'} ${trialEnd ? `hasta ${trialEnd.toLocaleDateString('es-ES')}` : ''}`)

  // 📧 Enviar email de bienvenida si es un trial
  if (trialStart && trialEnd) {
    try {
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

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`🔄 [Webhook] Suscripción actualizada: ${subscription.id}`)

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

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: mapStripeStatus(subscription.status),
      currentPeriodStart,
      currentPeriodEnd,
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

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log(`⏰ [Webhook] Trial está por terminar: ${subscription.id}`)

  const workshopId = subscription.metadata.workshopId

  if (!workshopId) {
    console.error('❌ [Webhook] No se encontró workshopId en metadata')
    return
  }

  try {
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
      : '14.90€'

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

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`💰 [Webhook] Pago exitoso: ${invoice.id}`)

  const invoiceSubscription = (invoice as any).subscription
  if (!invoiceSubscription) return

  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: invoiceSubscription as string },
    include: {
      workshop: {
        include: {
          owner: true,
        },
      },
    },
  })

  if (subscription) {
    // Actualizar estado de la suscripción
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
      },
    })
    console.log(`✅ [Webhook] Suscripción activada tras pago exitoso`)

    // 📧 Enviar email de confirmación de pago
    try {
      if (subscription.workshop && subscription.workshop.owner) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
        const amount = invoice.amount_paid
          ? `${(invoice.amount_paid / 100).toFixed(2)}€`
          : '14.90€'

        // Calcular próxima fecha de facturación
        const nextBillingDate = subscription.currentPeriodEnd
          ? new Date(subscription.currentPeriodEnd).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'Próximamente'

        await sendPaymentSuccessEmail({
          workshopName: subscription.workshop.name,
          ownerEmail: subscription.workshop.owner.email,
          amount,
          nextBillingDate,
          invoiceUrl: invoice.hosted_invoice_url || `${frontendUrl}/subscription/invoices`,
          manageSubscriptionUrl: `${frontendUrl}/subscription/manage`,
        })
        console.log(`📧 [Webhook] Email de pago exitoso enviado a ${subscription.workshop.owner.email}`)
      }
    } catch (emailError) {
      console.error('❌ [Webhook] Error enviando email de pago:', emailError)
      // No fallar el webhook por un error de email
    }
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

      // ✅ Determinar el tipo de orden basado en los items
      const hasRentals = items.some((item: any) => item.isRental === true)
      const orderType = hasRentals ? 'RENTAL' : 'PRODUCT_ORDER'

      // Crear la orden en la base de datos
      const order = await prisma.order.create({
        data: {
          workshopId,
          userId,
          status: 'PENDING',
          type: orderType as any, // RENTAL o PRODUCT_ORDER
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
              // ✅ Campos de alquiler
              isRental: item.isRental ?? false,
              rentalStartDate: item.rentalStartDate ? new Date(item.rentalStartDate) : null,
              rentalEndDate: item.rentalEndDate ? new Date(item.rentalEndDate) : null,
              rentalDays: item.rentalDays ?? null,
              depositPaid: item.depositPaid ?? null,
            })),
          },
        },
        include: {
          items: true,
          workshop: {
            include: {
              owner: true,
            },
          },
          user: true,
        },
      })

      console.log(`✅ [Webhook] Orden creada: ${order.id} - Estado: PAID`)

      // 📧 Enviar email de notificación al taller
      try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
        const totalAmount = `${(order.totalAmount / 100).toFixed(2)}€`

        await sendNewOrderEmail({
          workshopName: order.workshop.name,
          workshopOwnerEmail: order.workshop.owner.email,
          orderNumber: order.id.slice(0, 8),
          customerName: order.user.name || order.user.email,
          customerEmail: order.user.email,
          totalAmount,
          itemsCount: order.items.length,
          orderUrl: `${frontendUrl}/workshop-orders/${order.workshopId}`,
        })

        console.log(`📧 [Webhook] Email de nuevo pedido enviado al taller ${order.workshop.name}`)
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
