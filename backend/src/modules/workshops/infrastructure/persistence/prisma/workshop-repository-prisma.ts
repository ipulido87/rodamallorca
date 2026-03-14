import prisma from '../../../../../lib/prisma'
import {
  WorkshopDTO,
  WorkshopRepository,
} from '../../../domain/repositories/workshop-repository'
import { ImageProcessor } from '../../../../media/application/image-processor'

const imageProcessor = new ImageProcessor()

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
      // Fetch all images before cascade delete to clean up Cloudinary
      const workshop = await prisma.workshop.findUnique({
        where: { id },
        select: {
          logoOriginal: true,
          logoMedium: true,
          products: {
            select: {
              images: { select: { original: true } },
            },
          },
        },
      })

      if (workshop) {
        const cloudinaryUrls: string[] = []

        if (workshop.logoOriginal) cloudinaryUrls.push(workshop.logoOriginal)

        for (const product of workshop.products) {
          for (const img of product.images) {
            cloudinaryUrls.push(img.original)
          }
        }

        if (cloudinaryUrls.length > 0) {
          await Promise.all(
            cloudinaryUrls.map((url) => imageProcessor.deleteImage(url))
          )
        }
      }

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

  async updateStripeAccount(
    workshopId: string,
    accountId: string | null,
    onboardingComplete: boolean
  ): Promise<void> {
    await prisma.workshop.update({
      where: { id: workshopId },
      data: {
        stripeConnectedAccountId: accountId,
        stripeOnboardingComplete: onboardingComplete,
      },
    })
  }

  async findByIdWithStripe(id: string): Promise<WorkshopDTO | null> {
    const w = await prisma.workshop.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        name: true,
        description: true,
        address: true,
        city: true,
        country: true,
        phone: true,
        logoOriginal: true,
        logoMedium: true,
        logoThumbnail: true,
        stripeConnectedAccountId: true,
        stripeOnboardingComplete: true,
      },
    })
    return w ? { ...w } : null
  }
}
