import { PrismaClient } from '@prisma/client'
import { stripe } from '../../subscriptions/infrastructure/stripe.config'

const prisma = new PrismaClient()

export interface CartItem {
  productId: string
  quantity: number
  priceAtOrder: number
  currency: string
  description?: string
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
 */
export async function createProductCheckoutSession(input: CreateCheckoutInput) {
  const { userId, userEmail, workshopId, items, successUrl, cancelUrl } = input

  console.log(`💳 [Payment] Creando checkout para ${items.length} productos`)

  // Validar que todos los productos existen
  const productIds = items.map((item) => item.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  })

  if (products.length !== productIds.length) {
    throw new Error('Algunos productos no existen')
  }

  // Crear line items para Stripe
  const lineItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId)
    if (!product) throw new Error(`Producto ${item.productId} no encontrado`)

    return {
      price_data: {
        currency: item.currency.toLowerCase(),
        unit_amount: item.priceAtOrder, // Ya está en centavos
        product_data: {
          name: product.name,
          description: item.description || product.description || undefined,
          metadata: {
            productId: item.productId,
            workshopId,
          },
        },
      },
      quantity: item.quantity,
    }
  })

  // Crear sesión de Checkout
  const session = await stripe.checkout.sessions.create({
    mode: 'payment', // ⭐ Modo PAGO (no suscripción)
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: userEmail,
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

  console.log(`✅ [Payment] Sesión de checkout creada: ${session.id}`)

  return {
    sessionId: session.id,
    url: session.url,
  }
}
