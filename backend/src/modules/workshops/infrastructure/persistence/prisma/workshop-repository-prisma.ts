import { PrismaClient } from '@prisma/client'
import {
  WorkshopDTO,
  WorkshopRepository,
} from '../../../domain/repositories/workshop-repository'

const prisma = new PrismaClient()

export class WorkshopRepositoryPrisma implements WorkshopRepository {
  async create(input: Omit<WorkshopDTO, 'id'>): Promise<WorkshopDTO> {
    const w = await prisma.workshop.create({ data: input })
    return { ...w }
  }

  async findById(id: string): Promise<WorkshopDTO | null> {
    const w = await prisma.workshop.findUnique({ where: { id } })
    return w ? { ...w } : null
  }
}
