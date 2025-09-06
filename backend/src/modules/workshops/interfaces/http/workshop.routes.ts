import { Router } from 'express'
import { z } from 'zod'
import prisma from '../../../../lib/prisma'
import {
  requireRole,
  requireUser,
  verifyToken,
} from '../../../auth/interfaces/middlewares/auth.middleware'
import { createWorkshop } from '../../application/create-workshop'
import { WorkshopRepositoryPrisma } from '../../infrastructure/persistence/prisma/workshop-repository-prisma'
const r = Router()
const repo = new WorkshopRepositoryPrisma()

// Validación crear taller
const createWorkshopSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().length(2).optional().nullable(), // ES, FR...
  phone: z.string().optional().nullable(),
})

// POST /api/owner/workshops  (solo WORKSHOP_OWNER)
r.post(
  '/workshops',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  async (req, res, next) => {
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
)

// (Opcional) POST /api/owner/products  (crear producto del taller del owner)
const createProductSchema = z.object({
  title: z.string().min(2),
  price: z.number().int().min(0),
  condition: z.enum(['new', 'used', 'refurb']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SOLD']).optional(),
  description: z.string().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
})

r.post(
  '/products',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  async (req, res, next) => {
    try {
      const body = createProductSchema.parse(req.body)

      // Taller del owner (asume 1; ajusta si quieres multi-taller)
      const ws = await prisma.workshop.findFirst({
        where: { ownerId: req.user!.id },
        select: { id: true },
      })
      if (!ws)
        return res.status(403).json({ message: 'You do not own a workshop' })

      const product = await prisma.product.create({
        data: {
          workshopId: ws.id,
          title: body.title,
          price: body.price,
          condition: body.condition ?? 'used',
          status: body.status ?? 'DRAFT',
          description: body.description ?? null,
          categoryId: body.categoryId ?? null,
        },
      })

      res.status(201).json(product)
    } catch (e) {
      next(e)
    }
  }
)

export default r
