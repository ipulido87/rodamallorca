import { Router } from 'express'
import { verifyToken } from '../../auth/interfaces/middlewares/auth.middleware'
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
router.post('/:id/stripe/connect', verifyToken, initiateStripeConnect)

// POST /api/workshops/:id/stripe/refresh-onboarding - Regenerar link de onboarding
router.post('/:id/stripe/refresh-onboarding', verifyToken, refreshOnboardingLink)

// GET /api/workshops/:id/stripe/status - Estado de la cuenta conectada
router.get('/:id/stripe/status', getStripeAccountStatus)

// POST /api/workshops/:id/stripe/dashboard-link - Link al dashboard de Stripe
router.post('/:id/stripe/dashboard-link', verifyToken, getStripeDashboardLink)

export default router
