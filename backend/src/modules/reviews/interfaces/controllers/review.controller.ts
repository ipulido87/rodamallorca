import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { createReview } from '../../application/create-review'
import { getWorkshopReviews } from '../../application/get-reviews'
import { updateReview } from '../../application/update-review'
import { deleteReview } from '../../application/delete-review'
import { ReviewRepositoryPrisma } from '../../infrastructure/persistence/prisma/review-repository-prisma'

const repo = new ReviewRepositoryPrisma()

const createReviewSchema = z.object({
  workshopId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional().nullable(),
})

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional().nullable(),
})

export const createReviewController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        error: 'Token inválido: falta ID de usuario. Por favor, vuelve a iniciar sesión.',
      })
    }

    const body = createReviewSchema.parse(req.body)

    const review = await createReview(
      {
        ...body,
        userId: req.user.id,
      },
      { repo }
    )

    res.status(201).json(review)
  } catch (e) {
    next(e)
  }
}

export const getWorkshopReviewsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workshopId } = req.params

    const reviews = await getWorkshopReviews(workshopId, { repo })

    res.json(reviews)
  } catch (e) {
    next(e)
  }
}

export const updateReviewController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        error: 'Token inválido: falta ID de usuario. Por favor, vuelve a iniciar sesión.',
      })
    }

    const { reviewId } = req.params
    const body = updateReviewSchema.parse(req.body)

    const review = await updateReview(reviewId, body, {
      repo,
      authenticatedUserId: req.user.id,
    })

    res.json(review)
  } catch (e) {
    next(e)
  }
}

export const deleteReviewController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        error: 'Token inválido: falta ID de usuario. Por favor, vuelve a iniciar sesión.',
      })
    }

    const { reviewId } = req.params

    await deleteReview(reviewId, {
      repo,
      authenticatedUserId: req.user.id,
    })

    res.json({ message: 'Review eliminada correctamente' })
  } catch (e) {
    next(e)
  }
}
