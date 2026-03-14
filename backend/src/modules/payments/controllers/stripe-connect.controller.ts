import type { Request, Response, NextFunction } from 'express'
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
): Promise<void> => {
  try {
    const { id: workshopId } = req.params
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({ error: 'No autenticado' })
      return
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const returnUrl = `${frontendUrl}/workshops/${workshopId}/stripe/success`
    const refreshUrl = `${frontendUrl}/workshops/${workshopId}/stripe/refresh`

    const account = await createConnectedAccount(workshopId as string, req.user.email)
    const accountLink = await createAccountLink(workshopId as string, returnUrl, refreshUrl)

    res.json({
      success: true,
      accountId: account.accountId,
      onboardingUrl: accountLink.url,
      expiresAt: accountLink.expiresAt,
    })
  } catch (error) {
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
): Promise<void> => {
  try {
    const { id: workshopId } = req.params
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({ error: 'No autenticado' })
      return
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const returnUrl = `${frontendUrl}/workshops/${workshopId}/stripe/success`
    const refreshUrl = `${frontendUrl}/workshops/${workshopId}/stripe/refresh`

    const accountLink = await createAccountLink(workshopId as string, returnUrl, refreshUrl)

    res.json({
      success: true,
      onboardingUrl: accountLink.url,
      expiresAt: accountLink.expiresAt,
    })
  } catch (error) {
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
): Promise<void> => {
  try {
    const { id: workshopId } = req.params

    const status = await getAccountStatus(workshopId as string)

    res.json({
      success: true,
      ...status,
    })
  } catch (error) {
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
): Promise<void> => {
  try {
    const { id: workshopId } = req.params
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({ error: 'No autenticado' })
      return
    }

    const dashboardLink = await createDashboardLink(workshopId as string)

    res.json({
      success: true,
      url: dashboardLink.url,
    })
  } catch (error) {
    next(error)
  }
}
