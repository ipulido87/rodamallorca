import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import { stripe } from '../../subscriptions/infrastructure/stripe.config'

const prisma = new PrismaClient()

/**
 * Comisión de RodaMallorca en porcentaje (10%)
 * Por cada venta, RodaMallorca se queda con este porcentaje
 */
export const MARKETPLACE_COMMISSION_PERCENTAGE = 10

/**
 * Crea una cuenta conectada de Stripe para un taller
 */
export async function createConnectedAccount(workshopId: string, ownerEmail: string) {
  console.log(`📝 [Stripe Connect] Creando cuenta conectada para workshop ${workshopId}`)

  // Verificar que el workshop existe
  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
    include: { owner: true },
  })

  if (!workshop) {
    throw new Error('Taller no encontrado')
  }

  // Si ya tiene una cuenta conectada, retornarla
  if (workshop.stripeConnectedAccountId) {
    console.log(`✅ [Stripe Connect] Workshop ya tiene cuenta: ${workshop.stripeConnectedAccountId}`)
    return {
      accountId: workshop.stripeConnectedAccountId,
      onboardingComplete: workshop.stripeOnboardingComplete,
    }
  }

  // Crear cuenta conectada en Stripe
  const account = await stripe.accounts.create({
    type: 'express', // Cuenta Express (más simple para los talleres)
    country: 'ES',
    email: ownerEmail,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual', // Puede ser 'individual' o 'company'
    metadata: {
      workshopId: workshopId,
      workshopName: workshop.name,
    },
  })

  console.log(`✅ [Stripe Connect] Cuenta creada: ${account.id}`)

  // Guardar el ID en la base de datos
  await prisma.workshop.update({
    where: { id: workshopId },
    data: {
      stripeConnectedAccountId: account.id,
      stripeOnboardingComplete: false,
    },
  })

  return {
    accountId: account.id,
    onboardingComplete: false,
  }
}

/**
 * Crea un link de onboarding para que el taller complete su información
 */
export async function createAccountLink(workshopId: string, returnUrl: string, refreshUrl: string) {
  console.log(`🔗 [Stripe Connect] Creando account link para workshop ${workshopId}`)

  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
  })

  if (!workshop || !workshop.stripeConnectedAccountId) {
    throw new Error('El taller no tiene una cuenta conectada')
  }

  // Crear el link de onboarding
  const accountLink = await stripe.accountLinks.create({
    account: workshop.stripeConnectedAccountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  })

  console.log(`✅ [Stripe Connect] Account link creado`)

  return {
    url: accountLink.url,
    expiresAt: accountLink.expires_at,
  }
}

/**
 * Obtiene el estado de la cuenta conectada
 */
export async function getAccountStatus(workshopId: string) {
  console.log(`📊 [Stripe Connect] Obteniendo estado de cuenta para workshop ${workshopId}`)

  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
  })

  console.log(`🔍 [Stripe Connect] Workshop de BD:`, {
    id: workshop?.id,
    name: workshop?.name,
    hasStripeAccount: !!workshop?.stripeConnectedAccountId,
    stripeAccountId: workshop?.stripeConnectedAccountId,
    onboardingComplete: workshop?.stripeOnboardingComplete,
  })

  if (!workshop || !workshop.stripeConnectedAccountId) {
    console.log(`❌ [Stripe Connect] Workshop sin cuenta conectada`)
    return {
      hasAccount: false,
      onboardingComplete: false,
      chargesEnabled: false,
      payoutsEnabled: false,
    }
  }

  // Obtener información de la cuenta desde Stripe
  console.log(`🔍 [Stripe Connect] Consultando Stripe API para cuenta ${workshop.stripeConnectedAccountId}`)
  const account = await stripe.accounts.retrieve(workshop.stripeConnectedAccountId)

  console.log(`📊 [Stripe Connect] Respuesta de Stripe:`, {
    id: account.id,
    details_submitted: account.details_submitted,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
  })

  const onboardingComplete = account.details_submitted && account.charges_enabled && account.payouts_enabled

  console.log(`✅ [Stripe Connect] Onboarding completo: ${onboardingComplete}`)

  // Actualizar en BD si cambió el estado
  if (onboardingComplete !== workshop.stripeOnboardingComplete) {
    console.log(`💾 [Stripe Connect] Actualizando BD: stripeOnboardingComplete = ${onboardingComplete}`)

    const updated = await prisma.workshop.update({
      where: { id: workshopId },
      data: { stripeOnboardingComplete: onboardingComplete },
    })

    console.log(`✅ [Stripe Connect] BD actualizada:`, {
      id: updated.id,
      stripeOnboardingComplete: updated.stripeOnboardingComplete,
    })
  } else {
    console.log(`ℹ️ [Stripe Connect] No se requiere actualizar BD (estado igual)`)
  }

  return {
    hasAccount: true,
    accountId: workshop.stripeConnectedAccountId,
    onboardingComplete,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    requiresInfo: !account.details_submitted,
  }
}

/**
 * Crea un login link para que el taller acceda a su Stripe Dashboard
 */
export async function createDashboardLink(workshopId: string) {
  console.log(`🔐 [Stripe Connect] Creando dashboard link para workshop ${workshopId}`)

  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
  })

  if (!workshop || !workshop.stripeConnectedAccountId) {
    throw new Error('El taller no tiene una cuenta conectada')
  }

  // Crear login link al Express Dashboard
  const loginLink = await stripe.accounts.createLoginLink(workshop.stripeConnectedAccountId)

  console.log(`✅ [Stripe Connect] Dashboard link creado`)

  return {
    url: loginLink.url,
  }
}

/**
 * Calcula la comisión de RodaMallorca para una venta
 */
export function calculateApplicationFee(amount: number): number {
  return Math.round(amount * (MARKETPLACE_COMMISSION_PERCENTAGE / 100))
}

/**
 * Desconecta una cuenta de Stripe Connect (solo para casos especiales)
 */
export async function disconnectAccount(workshopId: string) {
  console.log(`❌ [Stripe Connect] Desconectando cuenta para workshop ${workshopId}`)

  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
  })

  if (!workshop || !workshop.stripeConnectedAccountId) {
    throw new Error('El taller no tiene una cuenta conectada')
  }

  // Eliminar la cuenta de Stripe (opcional - normalmente solo se desactiva en BD)
  // await stripe.accounts.del(workshop.stripeConnectedAccountId)

  // Limpiar campos en BD
  await prisma.workshop.update({
    where: { id: workshopId },
    data: {
      stripeConnectedAccountId: null,
      stripeOnboardingComplete: false,
    },
  })

  console.log(`✅ [Stripe Connect] Cuenta desconectada`)
}
