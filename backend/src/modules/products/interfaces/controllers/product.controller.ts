// modules/products/interfaces/controllers/product.controller.ts

import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../../../lib/prisma'
import { createProductDraft } from '../../application/create-product'
import { ProductRepositoryPrisma } from '../../infrastructure/persistence/prisma/product-repository-prisma'

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

// GET /api/categories
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    })

    res.json(categories)
  } catch (e) {
    next(e)
  }
}

// POST /api/owner/products
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = createProductSchema.parse(req.body)

    const workshop = await getUserWorkshop(req.user!.id)
    if (!workshop) {
      return res.status(403).json({ message: 'You do not own a workshop' })
    }

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

// GET /api/owner/products/mine
export const getMyProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

// GET /api/owner/products/:id
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    const workshop = await getUserWorkshop(req.user!.id)
    if (!workshop) {
      return res.status(403).json({ message: 'You do not own a workshop' })
    }

    const product = await prisma.product.findFirst({
      where: {
        id,
        workshopId: workshop.id,
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

// PUT /api/owner/products/:id
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const body = updateProductSchema.parse(req.body)

    const workshop = await getUserWorkshop(req.user!.id)
    if (!workshop) {
      return res.status(403).json({ message: 'You do not own a workshop' })
    }

    const result = await repo.update(id, workshop.id, body)
    res.json(result)
  } catch (e) {
    next(e)
  }
}

// POST /api/owner/products/:id/publish
export const publishProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

// DELETE /api/owner/products/:id
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
