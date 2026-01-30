import prisma from '../prisma'

/**
 * Obtiene el taller del usuario autenticado
 * Lanza error si el usuario no tiene taller
 */
export async function getUserWorkshop(userId: string) {
  const workshop = await prisma.workshop.findFirst({
    where: { ownerId: userId },
  })

  if (!workshop) {
    throw new Error('No tienes un taller registrado')
  }

  return workshop
}

/**
 * Verifica que el usuario sea propietario del taller especificado
 * Lanza error si no es propietario
 */
export async function verifyWorkshopOwnership(workshopId: string, userId: string) {
  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
  })

  if (!workshop) {
    throw new Error('Taller no encontrado')
  }

  if (workshop.ownerId !== userId) {
    throw new Error('No tienes permisos para acceder a este taller')
  }

  return workshop
}

/**
 * Verifica que el taller tenga Stripe Connect configurado
 * Lanza error si no está configurado
 */
export async function verifyStripeConnect(workshopId: string) {
  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
    select: {
      id: true,
      stripeConnectedAccountId: true,
      stripeOnboardingComplete: true,
    },
  })

  if (!workshop) {
    throw new Error('Taller no encontrado')
  }

  if (!workshop.stripeConnectedAccountId || !workshop.stripeOnboardingComplete) {
    throw new Error('Debes completar la configuración de Stripe Connect para este taller')
  }

  return workshop
}

/**
 * Obtiene el taller con sus estadísticas completas
 */
export async function getWorkshopWithStats(workshopId: string) {
  return await prisma.workshop.findUnique({
    where: { id: workshopId },
    include: {
      _count: {
        select: {
          products: true,
          services: true,
          orders: true,
          reviews: true,
        },
      },
    },
  })
}
