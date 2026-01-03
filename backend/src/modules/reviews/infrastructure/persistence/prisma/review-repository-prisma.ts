import { PrismaClient } from '@prisma/client'
import type {
  ReviewRepository,
  ReviewDTO,
  ReviewWithUser,
  CreateReviewInput,
  UpdateReviewInput,
} from '../../../domain/repositories/review-repository'

const prisma = new PrismaClient()

export class ReviewRepositoryPrisma implements ReviewRepository {
  async create(input: CreateReviewInput): Promise<ReviewDTO> {
    const review = await prisma.review.create({
      data: input,
    })
    return review
  }

  async findById(id: string): Promise<ReviewDTO | null> {
    const review = await prisma.review.findUnique({
      where: { id },
    })
    return review
  }

  async findByWorkshopId(workshopId: string): Promise<ReviewWithUser[]> {
    const reviews = await prisma.review.findMany({
      where: { workshopId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            picture: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return reviews
  }

  async findByUserId(userId: string): Promise<ReviewDTO[]> {
    const reviews = await prisma.review.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return reviews
  }

  async findByWorkshopAndUser(
    workshopId: string,
    userId: string
  ): Promise<ReviewDTO | null> {
    const review = await prisma.review.findUnique({
      where: {
        workshopId_userId: {
          workshopId,
          userId,
        },
      },
    })
    return review
  }

  async update(id: string, input: UpdateReviewInput): Promise<ReviewDTO | null> {
    const review = await prisma.review.update({
      where: { id },
      data: input,
    })
    return review
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.review.delete({
        where: { id },
      })
      return true
    } catch {
      return false
    }
  }

  async getWorkshopAverageRating(workshopId: string): Promise<number | null> {
    const result = await prisma.review.aggregate({
      where: { workshopId },
      _avg: {
        rating: true,
      },
    })
    return result._avg.rating
  }

  async getWorkshopReviewCount(workshopId: string): Promise<number> {
    const count = await prisma.review.count({
      where: { workshopId },
    })
    return count
  }
}
