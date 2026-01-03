import type { ReviewRepository } from '../domain/repositories/review-repository'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createReview(
  input: {
    workshopId: string
    userId: string
    rating: number
    comment?: string | null
  },
  deps: { repo: ReviewRepository }
) {
  // Validar rating
  if (input.rating < 1 || input.rating > 5) {
    throw new Error('El rating debe estar entre 1 y 5')
  }

  // Verificar si el usuario ya dejó una review para este taller
  const existingReview = await deps.repo.findByWorkshopAndUser(
    input.workshopId,
    input.userId
  )

  if (existingReview) {
    throw new Error('Ya has dejado una review para este taller')
  }

  // Crear la review
  const review = await deps.repo.create(input)

  // Actualizar estadísticas del workshop
  await updateWorkshopStats(input.workshopId, deps.repo)

  return review
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
