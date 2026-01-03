import type { ReviewRepository } from '../domain/repositories/review-repository'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function updateReview(
  reviewId: string,
  input: {
    rating?: number
    comment?: string | null
  },
  deps: { repo: ReviewRepository; authenticatedUserId: string }
) {
  // Verificar que la review existe
  const review = await deps.repo.findById(reviewId)
  if (!review) {
    throw new Error('Review no encontrada')
  }

  // Verificar que el usuario es el propietario
  if (review.userId !== deps.authenticatedUserId) {
    throw new Error('No tienes permisos para editar esta review')
  }

  // Validar rating si se proporciona
  if (input.rating !== undefined && (input.rating < 1 || input.rating > 5)) {
    throw new Error('El rating debe estar entre 1 y 5')
  }

  // Actualizar la review
  const updatedReview = await deps.repo.update(reviewId, input)

  if (!updatedReview) {
    throw new Error('Error al actualizar la review')
  }

  // Actualizar estadísticas del workshop
  await updateWorkshopStats(review.workshopId, deps.repo)

  return updatedReview
}

async function updateWorkshopStats(
  workshopId: string,
  repo: ReviewRepository
) {
  const averageRating = await repo.getWorkshopAverageRating(workshopId)
  const reviewCount = await repo.getWorkshopReviewCount(workshopId)

  await prisma.workshop.update({
    where: { id: workshopId },
    data: {
      averageRating: averageRating || 0,
      reviewCount,
    },
  })
}
