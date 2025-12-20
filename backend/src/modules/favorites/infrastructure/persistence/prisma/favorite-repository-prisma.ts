import prisma from '../../../../../lib/prisma'
import type { FavoriteRepository } from '../../../domain/repositories/favorite-repository'
import type { FavoriteWorkshop, CreateFavoriteInput } from '../../../domain/entities/favorite'

export const favoriteRepositoryPrisma: FavoriteRepository = {
  async create(data: CreateFavoriteInput): Promise<FavoriteWorkshop> {
    const favorite = await prisma.favoriteWorkshop.create({
      data: {
        userId: data.userId,
        workshopId: data.workshopId,
      },
      include: {
        workshop: {
          select: {
            id: true,
            name: true,
            description: true,
            city: true,
            address: true,
          },
        },
      },
    })

    return favorite as FavoriteWorkshop
  },

  async delete(userId: string, workshopId: string): Promise<void> {
    await prisma.favoriteWorkshop.deleteMany({
      where: {
        userId,
        workshopId,
      },
    })
  },

  async findByUser(userId: string): Promise<FavoriteWorkshop[]> {
    const favorites = await prisma.favoriteWorkshop.findMany({
      where: { userId },
      include: {
        workshop: {
          select: {
            id: true,
            name: true,
            description: true,
            city: true,
            address: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return favorites as FavoriteWorkshop[]
  },

  async exists(userId: string, workshopId: string): Promise<boolean> {
    const favorite = await prisma.favoriteWorkshop.findFirst({
      where: {
        userId,
        workshopId,
      },
    })

    return favorite !== null
  },
}
