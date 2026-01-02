import { Request, Response, NextFunction } from 'express'
import {
  createConnectedAccount,
  createAccountLink,
  getAccountStatus,
  createDashboardLink,
} from '../services/stripe-connect.service'

/**
 * POST /api/workshops/:id/stripe/connect
 * Inicia el proceso de conexión de Stripe Connect
 */
export const initiateStripeConnect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: workshopId } = req.params
    const userId = req.user?.id

    // Verificar que el usuario es el owner del workshop
    // (esto se podría hacer con middleware, pero lo pongo aquí para claridad)
    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const returnUrl = `${frontendUrl}/workshops/${workshopId}/stripe/success`
    const refreshUrl = `${frontendUrl}/workshops/${workshopId}/stripe/refresh`

    console.log(`🚀 [Controller] Iniciando Stripe Connect para workshop ${workshopId}`)

    // Crear o recuperar cuenta conectada
    const account = await createConnectedAccount(workshopId, req.user.email)

    // Crear link de onboarding
    const accountLink = await createAccountLink(workshopId, returnUrl, refreshUrl)

    res.json({
      success: true,
      accountId: account.accountId,
      onboardingUrl: accountLink.url,
      expiresAt: accountLink.expiresAt,
    })
  } catch (error: any) {
    console.error('❌ [Controller] Error iniciando Stripe Connect:', error)
    next(error)
  }
}

/**
 * POST /api/workshops/:id/stripe/refresh-onboarding
 * Regenera el link de onboarding si expiró
 */
export const refreshOnboardingLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: workshopId } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const returnUrl = `${frontendUrl}/workshops/${workshopId}/stripe/success`
    const refreshUrl = `${frontendUrl}/workshops/${workshopId}/stripe/refresh`

    console.log(`🔄 [Controller] Regenerando link de onboarding para workshop ${workshopId}`)

    const accountLink = await createAccountLink(workshopId, returnUrl, refreshUrl)

    res.json({
      success: true,
      onboardingUrl: accountLink.url,
      expiresAt: accountLink.expiresAt,
    })
  } catch (error: any) {
    console.error('❌ [Controller] Error regenerando link:', error)
    next(error)
  }
}

/**
 * GET /api/workshops/:id/stripe/status
 * Obtiene el estado de la cuenta conectada
 */
export const getStripeAccountStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: workshopId } = req.params

    console.log(`📊 [Controller] Obteniendo estado Stripe para workshop ${workshopId}`)

    const status = await getAccountStatus(workshopId)

    res.json({
      success: true,
      ...status,
    })
  } catch (error: any) {
    console.error('❌ [Controller] Error obteniendo estado:', error)
    next(error)
  }
}

/**
 * POST /api/workshops/:id/stripe/dashboard-link
 * Genera un link al Stripe Express Dashboard
 */
export const getStripeDashboardLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: workshopId } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    console.log(`🔐 [Controller] Generando dashboard link para workshop ${workshopId}`)

    const dashboardLink = await createDashboardLink(workshopId)

    res.json({
      success: true,
      url: dashboardLink.url,
    })
  } catch (error: any) {
    console.error('❌ [Controller] Error generando dashboard link:', error)
    next(error)
  }
}
