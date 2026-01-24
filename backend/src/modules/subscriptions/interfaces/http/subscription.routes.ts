import { Router } from 'express'
import { verifyToken, requireUser } from '../../../auth/interfaces/middlewares/auth.middleware'
import { validateBody } from '../../../auth/interfaces/middlewares/validate-body'
import * as subscriptionController from '../controllers/subscription.controller'
import {
  CreateCheckoutSessionSchema,
  CancelSubscriptionSchema,
  CreatePortalSessionSchema,
} from './schemas/subscription.schemas'

const router = Router()

// === CHECKOUT ===
router.post(
  '/checkout',
  verifyToken,
  requireUser,
  validateBody(CreateCheckoutSessionSchema),
  subscriptionController.createCheckoutSessionController
)

// === CANCEL ===
router.post(
  '/cancel',
  verifyToken,
  requireUser,
  validateBody(CancelSubscriptionSchema),
  subscriptionController.cancelSubscriptionController
)

// === STATUS ===
router.get(
  '/status/:workshopId',
  verifyToken,
  requireUser,
  subscriptionController.getSubscriptionStatusController
)

// === BILLING PORTAL ===
router.post(
  '/portal',
  verifyToken,
  requireUser,
  validateBody(CreatePortalSessionSchema),
  subscriptionController.createPortalSessionController
)

export default router
