import { Router } from 'express'
import { verifyToken, requireUser } from '../../../auth/interfaces/middlewares/auth.middleware'
import * as paymentController from '../controllers/payment.controller'

const router = Router()

// === PRODUCT CHECKOUT ===
router.post(
  '/checkout',
  verifyToken,
  requireUser,
  paymentController.createProductCheckoutController
)

export default router
