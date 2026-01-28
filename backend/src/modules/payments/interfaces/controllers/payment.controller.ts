import { Request, Response, NextFunction } from 'express'
import * as paymentService from '../../application/payment-service'
import { WorkshopRepositoryPrisma } from '../../../workshops/infrastructure/persistence/prisma/workshop-repository-prisma'
import { ProductRepositoryPrisma } from '../../../products/infrastructure/persistence/prisma/product-repository-prisma'
import { StripePaymentGateway } from '../../infrastructure/gateways/stripe-payment-gateway'

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

    // Validación ya realizada por middleware validateBody
    const { workshopId, items } = req.body

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

    console.log(`🌐 [PAYMENT] FRONTEND_URL configurada: ${frontendUrl}`)
    console.log(`✅ [PAYMENT] Success URL: ${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`)
    console.log(`❌ [PAYMENT] Cancel URL: ${frontendUrl}/checkout/cancel`)

    // Instanciar dependencias
    const workshopRepo = new WorkshopRepositoryPrisma()
    const productRepo = new ProductRepositoryPrisma()
    const paymentGateway = new StripePaymentGateway()

    const session = await paymentService.createProductCheckoutSession(
      {
        userId: req.user.id,
        userEmail: req.user.email,
        workshopId,
        items,
        successUrl: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${frontendUrl}/checkout/cancel`,
      },
      { workshopRepo, productRepo, paymentGateway }
    )

    res.json(session)
  } catch (error) {
    console.error('Error creando checkout de productos:', error)
    next(error)
  }
}
