import { Request, Response, NextFunction } from 'express'
import * as paymentService from '../../application/payment-service'

/**
 * POST /api/payments/checkout
 * Crea una sesión de Stripe Checkout para compra de productos
 */
export const createProductCheckoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    const { workshopId, items } = req.body

    if (!workshopId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'workshopId e items son requeridos' })
    }

    // Validar estructura de items
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.priceAtOrder || !item.currency) {
        return res.status(400).json({
          error: 'Cada item debe tener: productId, quantity, priceAtOrder, currency',
        })
      }
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

    console.log(`🌐 [PAYMENT] FRONTEND_URL configurada: ${frontendUrl}`)
    console.log(`✅ [PAYMENT] Success URL: ${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`)
    console.log(`❌ [PAYMENT] Cancel URL: ${frontendUrl}/checkout/cancel`)

    const session = await paymentService.createProductCheckoutSession({
      userId: req.user.id,
      userEmail: req.user.email,
      workshopId,
      items,
      successUrl: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${frontendUrl}/checkout/cancel`,
    })

    res.json(session)
  } catch (error) {
    console.error('Error creando checkout de productos:', error)
    next(error)
  }
}
