import { Router } from 'express'
import { verifyToken, requireUser } from '../../../auth/interfaces/middlewares/auth.middleware'
import * as subscriptionController from '../controllers/subscription.controller'

const router = Router()

// === CHECKOUT ===
router.post(
  '/checkout',
  verifyToken,
  requireUser,
  subscriptionController.createCheckoutSessionController
)

// === CANCEL ===
router.post('/cancel', verifyToken, requireUser, subscriptionController.cancelSubscriptionController)

// === STATUS ===
router.get(
  '/status/:workshopId',
  verifyToken,
  requireUser,
  subscriptionController.getSubscriptionStatusController
)

// === BILLING PORTAL ===
router.post('/portal', verifyToken, requireUser, subscriptionController.createPortalSessionController)

export default router
