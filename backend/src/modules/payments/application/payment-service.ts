import prisma from '../../../lib/prisma'
import { stripe } from '../../subscriptions/infrastructure/stripe.config'
import { calculateApplicationFee } from '../services/stripe-connect.service'

export interface CartItem {
  productId: string
  quantity: number
  priceAtOrder: number
  currency: string
  description?: string
  // Campos de alquiler
  isRental?: boolean
  rentalStartDate?: string
  rentalEndDate?: string
  rentalDays?: number
  depositPaid?: number
}

export interface CreateCheckoutInput {
  userId: string
  userEmail: string
  workshopId: string
  items: CartItem[]
  successUrl: string
  cancelUrl: string
}

/**
 * Crea una sesión de Checkout de Stripe para compra de productos
 * Usa Stripe Connect para enviar el pago al taller (menos comisión)
 */
export async function createProductCheckoutSession(input: CreateCheckoutInput) {
  const { userId, userEmail, workshopId, items, successUrl, cancelUrl } = input

  console.log(`💳 [Payment] Creando checkout para ${items.length} productos`)

  // ⭐ Obtener workshop y verificar Stripe Connect
  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
  })

  console.log(`🔍 [Payment] Workshop encontrado:`, {
    id: workshop?.id,
    name: workshop?.name,
    hasStripeAccount: !!workshop?.stripeConnectedAccountId,
    stripeAccountId: workshop?.stripeConnectedAccountId,
    onboardingComplete: workshop?.stripeOnboardingComplete,
  })

  if (!workshop) {
    throw new Error('Taller no encontrado')
  }

  if (!workshop.stripeConnectedAccountId) {
    throw new Error('El taller no tiene configurado Stripe Connect. No puede recibir pagos.')
  }

  console.log(`✅ [Payment] Workshop tiene Stripe Connect: ${workshop.stripeConnectedAccountId}`)

  // ⭐ Validar que la cuenta de Stripe Connect existe y es válida
  try {
    const account = await stripe.accounts.retrieve(workshop.stripeConnectedAccountId)

    // Verificar si el onboarding está completo en Stripe
    const onboardingComplete = account.details_submitted && account.charges_enabled && account.payouts_enabled

    // Si el onboarding está completo en Stripe pero no en la BD, actualizar
    if (onboardingComplete && !workshop.stripeOnboardingComplete) {
      console.log(`✅ [Payment] Onboarding completo en Stripe, actualizando BD...`)
      await prisma.workshop.update({
        where: { id: workshopId },
        data: { stripeOnboardingComplete: true },
      })
    }

    // Si el onboarding NO está completo, bloquear el pago
    if (!onboardingComplete) {
      console.error(`❌ [Payment] Onboarding incompleto:`, {
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      })

      // NO limpiar la cuenta, solo marcar onboarding como incompleto
      await prisma.workshop.update({
        where: { id: workshopId },
        data: { stripeOnboardingComplete: false },
      })

      throw new Error(
        'El taller aún no ha completado la verificación de Stripe. ' +
        'Por favor, completa la configuración de pagos en tu panel de control para poder vender productos.'
      )
    }

    console.log(`✅ [Payment] Cuenta de Stripe validada correctamente`)
  } catch (error: any) {
    // Si Stripe retorna error de cuenta no encontrada
    if (error.code === 'resource_missing' || error.type === 'StripeInvalidRequestError') {
      console.error(`❌ [Payment] Cuenta de Stripe Connect no existe: ${workshop.stripeConnectedAccountId}`)

      // Limpiar cuenta inválida automáticamente
      await prisma.workshop.update({
        where: { id: workshopId },
        data: {
          stripeConnectedAccountId: null,
          stripeOnboardingComplete: false,
        },
      })

      throw new Error(
        'La cuenta de pagos del taller ya no existe. ' +
        'El propietario debe reconectar Stripe Connect desde su panel de control.'
      )
    }

    // Re-throw si es otro tipo de error
    throw error
  }

  // Validar que todos los productos existen
  const productIds = items.map((item) => item.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  })

  if (products.length !== productIds.length) {
    throw new Error('Algunos productos no existen')
  }

  // Calcular total del pedido
  const totalAmount = items.reduce((sum, item) => sum + item.priceAtOrder * item.quantity, 0)
  console.log(`💰 [Payment] Total del pedido: ${totalAmount / 100}€`)

  // Calcular comisión de RodaMallorca (10%)
  const applicationFee = calculateApplicationFee(totalAmount)
  console.log(`💵 [Payment] Comisión RodaMallorca (10%): ${applicationFee / 100}€`)
  console.log(`💸 [Payment] Taller recibirá: ${(totalAmount - applicationFee) / 100}€`)

  // Crear line items para Stripe
  const lineItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId)
    if (!product) throw new Error(`Producto ${item.productId} no encontrado`)

    // Si es alquiler, agregar fechas a la descripción
    let description = item.description || product.description || ''
    if (item.isRental && item.rentalStartDate && item.rentalEndDate) {
      const startDate = new Date(item.rentalStartDate).toLocaleDateString('es-ES')
      const endDate = new Date(item.rentalEndDate).toLocaleDateString('es-ES')
      description = `Alquiler: ${startDate} - ${endDate} (${item.rentalDays} días)${description ? ' | ' + description : ''}`
    }

    return {
      price_data: {
        currency: item.currency.toLowerCase(),
        unit_amount: item.priceAtOrder, // Ya está en centavos
        product_data: {
          name: product.title,
          description: description || undefined,
          metadata: {
            productId: item.productId,
            workshopId,
            isRental: item.isRental ? 'true' : 'false',
            rentalStartDate: item.rentalStartDate || '',
            rentalEndDate: item.rentalEndDate || '',
          },
        },
      },
      quantity: item.quantity,
    }
  })

  // ⭐ Crear sesión de Checkout con Stripe Connect
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      // ✅ Múltiples métodos de pago habilitados
      payment_method_types: [
        'card',           // Tarjetas de crédito/débito
        'revolut_pay',    // Revolut
        'paypal',         // PayPal
        'klarna',         // Klarna (compra ahora, paga después)
      ],
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userEmail,

      // ⭐ Configuración de Stripe Connect
      payment_intent_data: {
        application_fee_amount: applicationFee, // Comisión para RodaMallorca
        transfer_data: {
          destination: workshop.stripeConnectedAccountId, // Cuenta del taller
        },
        metadata: {
          workshopId,
          workshopName: workshop.name,
        },
      },

      metadata: {
        userId,
        workshopId,
        items: JSON.stringify(
          items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtOrder: item.priceAtOrder,
            currency: item.currency,
            description: item.description,
            // ✅ Campos de alquiler
            isRental: item.isRental,
            rentalStartDate: item.rentalStartDate,
            rentalEndDate: item.rentalEndDate,
            rentalDays: item.rentalDays,
            depositPaid: item.depositPaid,
          }))
        ),
      },
    })

    console.log(`✅ [Payment] Sesión de checkout creada con Stripe Connect: ${session.id}`)
    console.log(`   - Cuenta destino: ${workshop.stripeConnectedAccountId}`)
    console.log(`   - Comisión: ${applicationFee / 100}€`)

    return {
      sessionId: session.id,
      url: session.url,
    }
  } catch (error: any) {
    // Manejar error específico de cuenta destino inválida
    if (
      error.message?.includes('No such destination') ||
      error.message?.includes('account that is not connected') ||
      error.code === 'account_invalid'
    ) {
      console.error(`❌ [Payment] Cuenta de Stripe Connect inválida, limpiando de la BD...`)

      // Limpiar cuenta inválida automáticamente
      await prisma.workshop.update({
        where: { id: workshopId },
        data: {
          stripeConnectedAccountId: null,
          stripeOnboardingComplete: false,
        },
      })

      throw new Error(
        'La cuenta de pagos del taller no es válida. ' +
        'Se ha desconectado automáticamente. El propietario debe reconectar Stripe Connect.'
      )
    }

    // Re-throw otros errores
    throw error
  }
}
