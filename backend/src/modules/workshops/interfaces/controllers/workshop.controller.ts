import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { createWorkshop } from '../../application/create-workshop'
import { WorkshopRepositoryPrisma } from '../../infrastructure/persistence/prisma/workshop-repository-prisma'

const repo = new WorkshopRepositoryPrisma()

const createWorkshopSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().length(2).optional().nullable(),
  phone: z.string().optional().nullable(),
})

export const createWorkshopController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = createWorkshopSchema.parse(req.body)
    const result = await createWorkshop(
      { ownerId: req.user!.id, ...body },
      { repo }
    )
    res.status(201).json(result)
  } catch (e) {
    next(e)
  }
}
