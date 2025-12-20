export interface FavoriteWorkshop {
  id: string
  userId: string
  workshopId: string
  createdAt: Date
  workshop?: {
    id: string
    name: string
    description?: string
    city?: string
    address?: string
  }
}

export interface CreateFavoriteInput {
  userId: string
  workshopId: string
}
