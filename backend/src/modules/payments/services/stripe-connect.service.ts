import prisma from '../../../lib/prisma'
import Stripe from 'stripe'
import { stripe } from '../../subscriptions/infrastructure/stripe.config'

/**
 * Comisión de RodaMallorca en porcentaje (10%)
 * Por cada venta, RodaMallorca se queda con este porcentaje
 */
export const MARKETPLACE_COMMISSION_PERCENTAGE = 10

function isStripeError(error: unknown): error is Stripe.errors.StripeError {
  return error instanceof Error && 'type' in error
}

function isInvalidAccountError(error: unknown): boolean {
  if (!isStripeError(error)) return false
  return (
    error.code === 'resource_missing' ||
    error.type === 'StripeInvalidRequestError'
  )
}

async function clearStripeAccount(workshopId: string): Promise<void> {
  await prisma.workshop.update({
    where: { id: workshopId },
    data: {
      stripeConnectedAccountId: null,
      stripeOnboardingComplete: false,
    },
  })
}

/**
 * Crea una cuenta conectada de Stripe para un taller
 */
export async function createConnectedAccount(workshopId: string, ownerEmail: string) {
  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
    include: { owner: true },
  })

  if (!workshop) {
    throw new Error('Taller no encontrado')
  }

  if (workshop.stripeConnectedAccountId) {
    try {
      const account = await stripe.accounts.retrieve(workshop.stripeConnectedAccountId)

      if (account) {
        return {
          accountId: workshop.stripeConnectedAccountId,
          onboardingComplete: workshop.stripeOnboardingComplete,
        }
      }
    } catch (error: unknown) {
      if (isInvalidAccountError(error)) {
        await clearStripeAccount(workshopId)
      } else {
        throw error
      }
    }
  }

  const account = await stripe.accounts.create({
    type: 'express',
    country: 'ES',
    email: ownerEmail,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual',
    metadata: {
      workshopId: workshopId,
      workshopName: workshop.name,
    },
  })

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
  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
  })

  if (!workshop || !workshop.stripeConnectedAccountId) {
    throw new Error('El taller no tiene una cuenta conectada')
  }

  try {
    await stripe.accounts.retrieve(workshop.stripeConnectedAccountId)
  } catch (error: unknown) {
    if (isInvalidAccountError(error)) {
      await clearStripeAccount(workshopId)

      throw new Error(
        'La cuenta de Stripe Connect no es válida. Se ha limpiado automáticamente. ' +
        'Por favor, inicia el proceso de conexión de nuevo.'
      )
    }
    throw error
  }

  try {
    const accountLink = await stripe.accountLinks.create({
      account: workshop.stripeConnectedAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    })

    return {
      url: accountLink.url,
      expiresAt: accountLink.expires_at,
    }
  } catch (error: unknown) {
    if (
      isStripeError(error) &&
      (error.message?.includes('account that is not connected') ||
        error.code === 'account_invalid')
    ) {
      await clearStripeAccount(workshopId)

      throw new Error(
        'La cuenta de Stripe Connect no es válida. Se ha limpiado automáticamente. ' +
        'Por favor, recarga la página e inicia el proceso de conexión de nuevo.'
      )
    }
    throw error
  }
}

/**
 * Obtiene el estado de la cuenta conectada
 */
export async function getAccountStatus(workshopId: string) {
  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
  })

  if (!workshop || !workshop.stripeConnectedAccountId) {
    return {
      hasAccount: false,
      onboardingComplete: false,
      chargesEnabled: false,
      payoutsEnabled: false,
    }
  }

  let account: Stripe.Account
  try {
    account = await stripe.accounts.retrieve(workshop.stripeConnectedAccountId)
  } catch (error: unknown) {
    if (isInvalidAccountError(error)) {
      await clearStripeAccount(workshopId)

      return {
        hasAccount: false,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      }
    }
    throw error
  }

  const onboardingComplete = account.details_submitted && account.charges_enabled && account.payouts_enabled

  if (onboardingComplete !== workshop.stripeOnboardingComplete) {
    await prisma.workshop.update({
      where: { id: workshopId },
      data: { stripeOnboardingComplete: onboardingComplete },
    })
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
  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
  })

  if (!workshop || !workshop.stripeConnectedAccountId) {
    throw new Error('El taller no tiene una cuenta conectada')
  }

  const loginLink = await stripe.accounts.createLoginLink(workshop.stripeConnectedAccountId)

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
  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
  })

  if (!workshop || !workshop.stripeConnectedAccountId) {
    throw new Error('El taller no tiene una cuenta conectada')
  }

  await clearStripeAccount(workshopId)
}
