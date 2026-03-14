import { API } from '@/shared/api'
import type { Review, CreateReviewInput, UpdateReviewInput } from '../types/review-types'

export const createReview = async (data: CreateReviewInput): Promise<Review> => {
  const response = await API.post('/reviews', data)
  return response.data
}

export const getWorkshopReviews = async (workshopId: string): Promise<Review[]> => {
  const response = await API.get(`/workshops/${workshopId}/reviews`)
  return response.data
}

export const updateReview = async (
  reviewId: string,
  data: UpdateReviewInput
): Promise<Review> => {
  const response = await API.put(`/reviews/${reviewId}`, data)
  return response.data
}

export const deleteReview = async (reviewId: string): Promise<void> => {
  await API.delete(`/reviews/${reviewId}`)
}
