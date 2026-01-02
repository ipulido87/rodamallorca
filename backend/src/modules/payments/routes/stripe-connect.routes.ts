import { Router } from 'express'
import { verifyToken } from '../../auth/interfaces/middlewares/auth.middleware'
import {
  initiateStripeConnect,
  refreshOnboardingLink,
  getStripeAccountStatus,
  getStripeDashboardLink,
} from '../controllers/stripe-connect.controller'
import { getWorkshopDebugInfo } from '../controllers/debug-workshop.controller'
import { recoverStripeAccount } from '../controllers/stripe-connect-recovery.controller'
import { recoverStripeAccountByEmail } from '../controllers/stripe-connect-recovery-email.controller'

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

// POST /api/workshops/:id/stripe/recover - Recuperar y asociar cuenta de Stripe existente (por metadata)
router.post('/:id/stripe/recover', verifyToken, recoverStripeAccount)

// POST /api/workshops/:id/stripe/recover-by-email - Recuperar cuenta de Stripe por email del owner
router.post('/:id/stripe/recover-by-email', verifyToken, recoverStripeAccountByEmail)

// GET /api/workshops/:id/debug - Info de diagnóstico del workshop
router.get('/:id/debug', getWorkshopDebugInfo)

export default router
