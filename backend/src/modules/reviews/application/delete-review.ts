import type { ReviewRepository } from '../domain/repositories/review-repository'
import prisma from '../../../lib/prisma'

export async function deleteReview(
  reviewId: string,
  deps: { repo: ReviewRepository; authenticatedUserId: string }
) {
  // Verificar que la review existe
  const review = await deps.repo.findById(reviewId)
  if (!review) {
    throw new Error('Review no encontrada')
  }

  // Verificar que el usuario es el propietario
  if (review.userId !== deps.authenticatedUserId) {
    throw new Error('No tienes permisos para eliminar esta review')
  }

  const workshopId = review.workshopId

  // Eliminar la review
  const deleted = await deps.repo.delete(reviewId)

  if (!deleted) {
    throw new Error('Error al eliminar la review')
  }

  // Actualizar estadísticas del workshop
  await updateWorkshopStats(workshopId, deps.repo)

  return true
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
