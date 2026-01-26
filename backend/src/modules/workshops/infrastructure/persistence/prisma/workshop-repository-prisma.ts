import prisma from '../../../../../lib/prisma'
import {
  WorkshopDTO,
  WorkshopRepository,
} from '../../../domain/repositories/workshop-repository'

export class WorkshopRepositoryPrisma implements WorkshopRepository {
  async create(input: Omit<WorkshopDTO, 'id'>): Promise<WorkshopDTO> {
    const w = await prisma.workshop.create({ data: input })
    return { ...w }
  }

  async findById(id: string): Promise<WorkshopDTO | null> {
    const w = await prisma.workshop.findUnique({ where: { id } })
    return w ? { ...w } : null
  }

  async findByOwnerId(ownerId: string): Promise<WorkshopDTO[]> {
    const workshops = await prisma.workshop.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    })
    return workshops
  }

  async update(
    id: string,
    input: Partial<Omit<WorkshopDTO, 'id' | 'ownerId'>>
  ): Promise<WorkshopDTO | null> {
    try {
      const workshop = await prisma.workshop.update({
        where: { id },
        data: input,
      })
      return workshop
    } catch {
      return null
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.workshop.delete({ where: { id } })
      return true
    } catch {
      return false
    }
  }

  async findAll(): Promise<WorkshopDTO[]> {
    const workshops = await prisma.workshop.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return workshops
  }

  async updateStats(
    workshopId: string,
    stats: { averageRating: number; reviewCount: number }
  ): Promise<void> {
    await prisma.workshop.update({
      where: { id: workshopId },
      data: {
        averageRating: stats.averageRating,
        reviewCount: stats.reviewCount,
      },
    })
  }
}
