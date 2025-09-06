import { Router } from 'express'
import { z } from 'zod'
import prisma from '../../../../lib/prisma'
import {
  requireRole,
  requireUser,
  verifyToken,
} from '../../../auth/interfaces/middlewares/auth.middleware'
import { createProductDraft } from '../../application/create-product'
import { ProductRepositoryPrisma } from '../../infrastructure/persistence/prisma/product-repository-prisma'

const r = Router()
const repo = new ProductRepositoryPrisma()

const createProductSchema = z.object({
  title: z.string().min(2),
  price: z.number().int().min(0),
  condition: z.enum(['new', 'used', 'refurb']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SOLD']).optional(),
  description: z.string().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
})

const updateProductSchema = z.object({
  title: z.string().min(2).optional(),
  price: z.number().int().min(0).optional(),
  condition: z.enum(['new', 'used', 'refurb']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SOLD']).optional(),
  description: z.string().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
})

// Helper function to get user's workshop
async function getUserWorkshop(userId: string) {
  return prisma.workshop.findFirst({
    where: { ownerId: userId },
    select: { id: true },
  })
}

// POST /api/owner/products - Crear producto
r.post(
  '/products',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  async (req, res, next) => {
    try {
      const body = createProductSchema.parse(req.body)

      const workshop = await getUserWorkshop(req.user!.id)
      if (!workshop) {
        return res.status(403).json({ message: 'You do not own a workshop' })
      }

      // Usar el repository pattern
      const result = await createProductDraft(
        {
          workshopId: workshop.id,
          title: body.title,
          price: body.price,
          condition: body.condition,
          description: body.description,
          categoryId: body.categoryId,
        },
        { repo }
      )

      res.status(201).json(result)
    } catch (e) {
      next(e)
    }
  }
)

// GET /api/owner/products/mine - Obtener mis productos
r.get(
  '/products/mine',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  async (req, res, next) => {
    try {
      const workshop = await getUserWorkshop(req.user!.id)
      if (!workshop) {
        return res.status(403).json({ message: 'You do not own a workshop' })
      }

      const products = await prisma.product.findMany({
        where: { workshopId: workshop.id },
        include: {
          category: { select: { id: true, name: true } },
          images: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      res.json(products)
    } catch (e) {
      next(e)
    }
  }
)

// GET /api/owner/products/:id - Obtener producto específico
r.get(
  '/products/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  async (req, res, next) => {
    try {
      const { id } = req.params

      const workshop = await getUserWorkshop(req.user!.id)
      if (!workshop) {
        return res.status(403).json({ message: 'You do not own a workshop' })
      }

      const product = await prisma.product.findFirst({
        where: {
          id,
          workshopId: workshop.id, // Solo productos del workshop del usuario
        },
        include: {
          category: { select: { id: true, name: true } },
          images: true,
        },
      })

      if (!product) {
        return res.status(404).json({ message: 'Product not found' })
      }

      res.json(product)
    } catch (e) {
      next(e)
    }
  }
)

// PUT /api/owner/products/:id - Actualizar producto
r.put(
  '/products/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  async (req, res, next) => {
    try {
      const { id } = req.params
      const body = updateProductSchema.parse(req.body)

      const workshop = await getUserWorkshop(req.user!.id)
      if (!workshop) {
        return res.status(403).json({ message: 'You do not own a workshop' })
      }

      // Usar el repository pattern
      const result = await repo.update(id, workshop.id, body)
      res.json(result)
    } catch (e) {
      next(e)
    }
  }
)

// POST /api/owner/products/:id/publish - Publicar producto
r.post(
  '/products/:id/publish',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  async (req, res, next) => {
    try {
      const { id } = req.params

      const workshop = await getUserWorkshop(req.user!.id)
      if (!workshop) {
        return res.status(403).json({ message: 'You do not own a workshop' })
      }

      await repo.publish(id, workshop.id)
      res.json({ message: 'Product published successfully' })
    } catch (e) {
      next(e)
    }
  }
)

// DELETE /api/owner/products/:id - Eliminar producto
r.delete(
  '/products/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  async (req, res, next) => {
    try {
      const { id } = req.params

      const workshop = await getUserWorkshop(req.user!.id)
      if (!workshop) {
        return res.status(403).json({ message: 'You do not own a workshop' })
      }

      const deleted = await prisma.product.deleteMany({
        where: {
          id,
          workshopId: workshop.id,
        },
      })

      if (deleted.count === 0) {
        return res.status(404).json({ message: 'Product not found' })
      }

      res.json({ message: 'Product deleted successfully' })
    } catch (e) {
      next(e)
    }
  }
)

export default r
