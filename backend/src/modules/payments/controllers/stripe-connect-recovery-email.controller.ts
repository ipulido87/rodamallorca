import { Request, Response, NextFunction } from 'express'
import prisma from '../../../lib/prisma'
import { stripe } from '../../subscriptions/infrastructure/stripe.config'

/**
 * POST /api/workshops/:id/stripe/recover-by-email
 * Recupera cuenta de Stripe buscando por email del owner
 */
export const recoverStripeAccountByEmail = async (
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

    console.log(`🔧 [Recovery Email] Intentando recuperar cuenta por email para workshop ${workshopId}`)

    // Obtener workshop y owner
    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
      include: { owner: true },
    })

    if (!workshop) {
      return res.status(404).json({ error: 'Workshop no encontrado' })
    }

    const ownerEmail = workshop.owner.email
    console.log(`🔍 [Recovery Email] Buscando cuentas de Stripe para email: ${ownerEmail}`)

    // Buscar TODAS las cuentas de Stripe (esto puede ser lento)
    const accounts = await stripe.accounts.list({ limit: 100 })

    console.log(`📊 [Recovery Email] Total de cuentas en Stripe: ${accounts.data.length}`)

    // Filtrar por email
    const matchingAccounts = accounts.data.filter(
      (account) => account.email?.toLowerCase() === ownerEmail.toLowerCase()
    )

    console.log(`📊 [Recovery Email] Cuentas con email ${ownerEmail}: ${matchingAccounts.length}`)

    if (matchingAccounts.length === 0) {
      return res.status(404).json({
        error: 'No se encontró ninguna cuenta de Stripe con tu email',
        suggestion: 'Intenta conectar con Stripe de nuevo desde el dashboard',
        searchedEmail: ownerEmail,
      })
    }

    // Si hay múltiples, tomar la más reciente
    const sortedAccounts = matchingAccounts.sort((a, b) => b.created - a.created)
    const account = sortedAccounts[0]

    console.log(`✅ [Recovery Email] Cuenta encontrada: ${account.id}`)
    console.log(`📊 [Recovery Email] Estado de la cuenta:`, {
      id: account.id,
      email: account.email,
      created: new Date(account.created * 1000).toISOString(),
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
    })

    const onboardingComplete =
      account.details_submitted && account.charges_enabled && account.payouts_enabled

    // Actualizar metadata en Stripe para futuras búsquedas
    console.log(`💾 [Recovery Email] Actualizando metadata en Stripe...`)
    await stripe.accounts.update(account.id, {
      metadata: {
        workshopId: workshopId as string,
        workshopName: workshop.name,
      },
    })

    // Actualizar workshop en BD
    console.log(`💾 [Recovery Email] Actualizando workshop en BD...`)
    const updatedWorkshop = await prisma.workshop.update({
      where: { id: workshopId },
      data: {
        stripeConnectedAccountId: account.id,
        stripeOnboardingComplete: onboardingComplete,
      },
    })

    console.log(`✅ [Recovery Email] Workshop actualizado:`, {
      id: updatedWorkshop.id,
      stripeAccountId: updatedWorkshop.stripeConnectedAccountId,
      onboardingComplete: updatedWorkshop.stripeOnboardingComplete,
    })

    res.json({
      success: true,
      recovered: true,
      method: 'email',
      accountId: account.id,
      email: account.email,
      onboardingComplete,
      message: 'Cuenta de Stripe recuperada y asociada correctamente (por email)',
    })
  } catch (error: any) {
    console.error('❌ [Recovery Email] Error:', error)
    next(error)
  }
}
