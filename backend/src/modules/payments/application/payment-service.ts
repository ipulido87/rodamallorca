import { PrismaClient } from '@prisma/client'
import { stripe } from '../../subscriptions/infrastructure/stripe.config'
import { calculateApplicationFee } from '../services/stripe-connect.service'

const prisma = new PrismaClient()

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

  if (!workshop.stripeOnboardingComplete) {
    throw new Error('El taller aún no ha completado la verificación de Stripe.')
  }

  console.log(`✅ [Payment] Workshop tiene Stripe Connect: ${workshop.stripeConnectedAccountId}`)

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
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
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
}
