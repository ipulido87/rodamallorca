export interface ReviewDTO {
  id: string
  workshopId: string
  userId: string
  rating: number
  comment?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ReviewWithUser extends ReviewDTO {
  user: {
    id: string
    name?: string | null
    email: string
    picture?: string | null
  }
}

export interface CreateReviewInput {
  workshopId: string
  userId: string
  rating: number
  comment?: string | null
}

export interface UpdateReviewInput {
  rating?: number
  comment?: string | null
}

export interface ReviewRepository {
  create(input: CreateReviewInput): Promise<ReviewDTO>
  findById(id: string): Promise<ReviewDTO | null>
  findByWorkshopId(workshopId: string): Promise<ReviewWithUser[]>
  findByUserId(userId: string): Promise<ReviewDTO[]>
  findByWorkshopAndUser(workshopId: string, userId: string): Promise<ReviewDTO | null>
  update(id: string, input: UpdateReviewInput): Promise<ReviewDTO | null>
  delete(id: string): Promise<boolean>
  getWorkshopAverageRating(workshopId: string): Promise<number | null>
  getWorkshopReviewCount(workshopId: string): Promise<number>
}
