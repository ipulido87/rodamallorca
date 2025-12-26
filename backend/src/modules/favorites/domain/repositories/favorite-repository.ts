import type { FavoriteWorkshop, CreateFavoriteInput } from '../entities/favorite'

export interface FavoriteRepository {
  create(data: CreateFavoriteInput): Promise<FavoriteWorkshop>
  delete(userId: string, workshopId: string): Promise<void>
  findByUser(userId: string): Promise<FavoriteWorkshop[]>
  exists(userId: string, workshopId: string): Promise<boolean>
}
