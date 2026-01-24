import { Router } from 'express'
import { verifyToken, requireUser } from '../../../auth/interfaces/middlewares/auth.middleware'
import { validateBody } from '../../../auth/interfaces/middlewares/validate-body'
import * as paymentController from '../controllers/payment.controller'
import { CreateProductCheckoutSchema } from './schemas/payment.schemas'

const router = Router()

// === PRODUCT CHECKOUT ===
router.post(
  '/checkout',
  verifyToken,
  requireUser,
  validateBody(CreateProductCheckoutSchema),
  paymentController.createProductCheckoutController
)

export default router
