export interface Review {
  id: string
  workshopId: string
  userId: string
  rating: number
  comment?: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name?: string | null
    email: string
    picture?: string | null
  }
}

export interface CreateReviewInput {
  workshopId: string
  rating: number
  comment?: string
}

export interface UpdateReviewInput {
  rating?: number
  comment?: string
}
