import { Router } from 'express'
import { authenticate } from '../../auth/middleware/auth.middleware'
import {
  initiateStripeConnect,
  refreshOnboardingLink,
  getStripeAccountStatus,
  getStripeDashboardLink,
} from '../controllers/stripe-connect.controller'

const router = Router()

/**
 * Rutas de Stripe Connect para talleres
 * Todas requieren autenticación
 */

// POST /api/workshops/:id/stripe/connect - Iniciar conexión de Stripe
router.post('/:id/stripe/connect', authenticate, initiateStripeConnect)

// POST /api/workshops/:id/stripe/refresh-onboarding - Regenerar link de onboarding
router.post('/:id/stripe/refresh-onboarding', authenticate, refreshOnboardingLink)

// GET /api/workshops/:id/stripe/status - Estado de la cuenta conectada
router.get('/:id/stripe/status', getStripeAccountStatus)

// POST /api/workshops/:id/stripe/dashboard-link - Link al dashboard de Stripe
router.post('/:id/stripe/dashboard-link', authenticate, getStripeDashboardLink)

export default router
