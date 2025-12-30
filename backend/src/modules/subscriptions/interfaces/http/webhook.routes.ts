import { Router } from 'express'
import express from 'express'
import * as subscriptionController from '../controllers/subscription.controller'

const router = Router()

// IMPORTANTE: El webhook de Stripe necesita raw body, no JSON
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  subscriptionController.stripeWebhookController
)

export default router
