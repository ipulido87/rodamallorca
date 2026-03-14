import { Router } from 'express'
import { verifyToken, requireUser } from '../../../auth/interfaces/middlewares/auth.middleware'
import { validateBody } from '../../../auth/interfaces/middlewares/validate-body'
import * as paymentController from '../controllers/payment.controller'
import { CreateProductCheckoutSchema } from './schemas/payment.schemas'

const router = Router()

/**
 * @swagger
 * /api/payments/checkout:
 *   post:
 *     summary: Crear checkout de producto
 *     description: Inicia el proceso de pago para comprar productos mediante Stripe
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - workshopId
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *               workshopId:
 *                 type: string
 *                 format: uuid
 *               successUrl:
 *                 type: string
 *                 format: uri
 *               cancelUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Sesión de checkout creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                 url:
 *                   type: string
 *                   format: uri
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  '/checkout',
  verifyToken,
  requireUser,
  validateBody(CreateProductCheckoutSchema),
  paymentController.createProductCheckoutController
)

export default router
