import { Request, Response, NextFunction } from 'express'
import prisma from '../../../lib/prisma'

/**
 * GET /api/workshops/:id/debug
 * Endpoint de diagnóstico para ver el estado real del workshop en la BD
 */
export const getWorkshopDebugInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: workshopId } = req.params

    console.log(`🔍 [DEBUG] Consultando workshop ${workshopId} directamente de la BD`)

    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
      select: {
        id: true,
        name: true,
        stripeConnectedAccountId: true,
        stripeOnboardingComplete: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!workshop) {
      return res.status(404).json({ error: 'Workshop no encontrado' })
    }

    console.log(`📊 [DEBUG] Estado del workshop:`, workshop)

    res.json({
      success: true,
      workshop,
      diagnostics: {
        hasStripeAccount: !!workshop.stripeConnectedAccountId,
        onboardingComplete: workshop.stripeOnboardingComplete,
        canReceivePayments: !!workshop.stripeConnectedAccountId && workshop.stripeOnboardingComplete,
      },
    })
  } catch (error: any) {
    console.error('❌ [DEBUG] Error:', error)
    next(error)
  }
}
