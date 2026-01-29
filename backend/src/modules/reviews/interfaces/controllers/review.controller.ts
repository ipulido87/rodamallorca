import { NextFunction, Request, Response } from 'express'
import { createReview } from '../../application/create-review'
import { getWorkshopReviews } from '../../application/get-reviews'
import { updateReview } from '../../application/update-review'
import { deleteReview } from '../../application/delete-review'
import { ReviewRepositoryPrisma } from '../../infrastructure/persistence/prisma/review-repository-prisma'
import { WorkshopRepositoryPrisma } from '../../../workshops/infrastructure/persistence/prisma/workshop-repository-prisma'

const repo = new ReviewRepositoryPrisma()
const workshopRepo = new WorkshopRepositoryPrisma()

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

    // Validación ya realizada por middleware validateBody
    const body = req.body

    const review = await createReview(
      {
        ...body,
        userId: req.user.id,
      },
      { repo, workshopRepo }
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

    const reviews = await getWorkshopReviews(workshopId as string, { repo })

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
    // Validación ya realizada por middleware validateBody
    const body = req.body

    const review = await updateReview(reviewId as string, body, {
      repo,
      workshopRepo,
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

    await deleteReview(reviewId as string, {
      repo,
      workshopRepo,
      authenticatedUserId: req.user.id,
    })

    res.json({ message: 'Review eliminada correctamente' })
  } catch (e) {
    next(e)
  }
}
