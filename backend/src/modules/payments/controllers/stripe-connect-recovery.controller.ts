import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { stripe } from '../../subscriptions/infrastructure/stripe.config'

const prisma = new PrismaClient()

/**
 * POST /api/workshops/:id/stripe/recover
 * Endpoint de recuperación para asociar una cuenta de Stripe existente con un workshop
 *
 * Útil cuando:
 * - El usuario completó el onboarding de Stripe pero no se guardó en BD
 * - Hay una desconexión entre Stripe y nuestra BD
 */
export const recoverStripeAccount = async (
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

    console.log(`🔧 [Recovery] Intentando recuperar cuenta Stripe para workshop ${workshopId}`)

    // Obtener workshop
    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
      include: { owner: true },
    })

    if (!workshop) {
      return res.status(404).json({ error: 'Workshop no encontrado' })
    }

    console.log(`🔍 [Recovery] Workshop actual:`, {
      id: workshop.id,
      name: workshop.name,
      stripeAccountId: workshop.stripeConnectedAccountId,
      onboardingComplete: workshop.stripeOnboardingComplete,
    })

    // Buscar cuentas de Stripe que pertenezcan a este workshop
    console.log(`🔍 [Recovery] Buscando cuentas en Stripe con metadata.workshopId=${workshopId}`)

    const accounts = await stripe.accounts.list({ limit: 100 })
    const matchingAccounts = accounts.data.filter(
      (account) => account.metadata?.workshopId === workshopId
    )

    console.log(`📊 [Recovery] Cuentas encontradas: ${matchingAccounts.length}`)

    if (matchingAccounts.length === 0) {
      return res.status(404).json({
        error: 'No se encontró ninguna cuenta de Stripe para este workshop',
        suggestion: 'Intenta conectar con Stripe de nuevo desde el dashboard',
      })
    }

    // Tomar la cuenta más reciente
    const account = matchingAccounts[0]
    console.log(`✅ [Recovery] Cuenta encontrada: ${account.id}`)
    console.log(`📊 [Recovery] Estado de la cuenta:`, {
      id: account.id,
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
    })

    const onboardingComplete =
      account.details_submitted && account.charges_enabled && account.payouts_enabled

    // Actualizar workshop en BD
    console.log(`💾 [Recovery] Actualizando workshop en BD...`)
    const updatedWorkshop = await prisma.workshop.update({
      where: { id: workshopId },
      data: {
        stripeConnectedAccountId: account.id,
        stripeOnboardingComplete: onboardingComplete,
      },
    })

    console.log(`✅ [Recovery] Workshop actualizado:`, {
      id: updatedWorkshop.id,
      stripeAccountId: updatedWorkshop.stripeConnectedAccountId,
      onboardingComplete: updatedWorkshop.stripeOnboardingComplete,
    })

    res.json({
      success: true,
      recovered: true,
      accountId: account.id,
      onboardingComplete,
      message: 'Cuenta de Stripe recuperada y asociada correctamente',
    })
  } catch (error: any) {
    console.error('❌ [Recovery] Error:', error)
    next(error)
  }
}
