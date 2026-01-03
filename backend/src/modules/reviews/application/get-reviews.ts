import type { ReviewRepository } from '../domain/repositories/review-repository'

export async function getWorkshopReviews(
  workshopId: string,
  deps: { repo: ReviewRepository }
) {
  const reviews = await deps.repo.findByWorkshopId(workshopId)
  return reviews
}

export async function getUserReviews(
  userId: string,
  deps: { repo: ReviewRepository }
) {
  const reviews = await deps.repo.findByUserId(userId)
  return reviews
}
