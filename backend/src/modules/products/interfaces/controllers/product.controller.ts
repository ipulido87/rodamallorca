// modules/products/interfaces/controllers/product.controller.ts

import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../../../lib/prisma'
import { createProductDraft } from '../../application/create-product'
import { ProductRepositoryPrisma } from '../../infrastructure/persistence/prisma/product-repository-prisma'

const repo = new ProductRepositoryPrisma()

// Esquema para las imágenes
const imageSchema = z.object({
  original: z.string(),
  medium: z.string(),
  thumbnail: z.string(),
})

const createProductSchema = z.object({
  title: z.string().min(2),
  price: z.number().int().min(0),
  condition: z.enum(['new', 'used', 'refurb']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SOLD']).optional(),
  description: z.string().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  images: z.array(imageSchema).min(1, 'Al menos una imagen es requerida'), // Nuevo campo
})

const updateProductSchema = z.object({
  title: z.string().min(2).optional(),
  price: z.number().int().min(0).optional(),
  condition: z.enum(['new', 'used', 'refurb']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SOLD']).optional(),
  description: z.string().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  images: z.array(imageSchema).optional(), // Opcional para updates
})

// Helper function to get user's workshop
async function getUserWorkshop(userId: string) {
  return prisma.workshop.findFirst({
    where: { ownerId: userId },
    select: { id: true },
  })
}

// Helper function to create product images
async function createProductImages(
  productId: string,
  images: Array<{ original: string; medium: string; thumbnail: string }>
) {
  const imageData = images.map((image, index) => ({
    productId,
    original: image.original,
    medium: image.medium,
    thumbnail: image.thumbnail,
    position: index,
  }))

  await prisma.productImage.createMany({
    data: imageData,
  })
}

// Helper function to update product images
async function updateProductImages(
  productId: string,
  images: Array<{ original: string; medium: string; thumbnail: string }>
) {
  // Eliminar imágenes existentes
  await prisma.productImage.deleteMany({
    where: { productId },
  })

  // Crear nuevas imágenes
  if (images.length > 0) {
    await createProductImages(productId, images)
  }
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
    const { images, ...productData } = createProductSchema.parse(req.body)

    const workshop = await getUserWorkshop(req.user!.id)
    if (!workshop) {
      return res.status(403).json({ message: 'You do not own a workshop' })
    }

    // Crear producto sin imágenes primero
    const product = await createProductDraft(
      {
        workshopId: workshop.id,
        title: productData.title,
        price: productData.price,
        condition: productData.condition,
        description: productData.description,
        categoryId: productData.categoryId,
      },
      { repo }
    )

    // Crear las imágenes asociadas
    await createProductImages(product.id, images)

    // Obtener el producto completo con imágenes
    const productWithImages = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: { select: { id: true, name: true } },
        images: { orderBy: { position: 'asc' } },
      },
    })

    res.status(201).json(productWithImages)
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
        images: { orderBy: { position: 'asc' } },
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
    console.log('🔧 [GET_MY_PRODUCTS] === INICIANDO ===')
    console.log('🔧 [GET_MY_PRODUCTS] req.user:', req.user)
    console.log('🔧 [GET_MY_PRODUCTS] req.user.id:', req.user?.id)
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
        images: { orderBy: { position: 'asc' } },
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
    const { images, ...productData } = updateProductSchema.parse(req.body)

    const workshop = await getUserWorkshop(req.user!.id)
    if (!workshop) {
      return res.status(403).json({ message: 'You do not own a workshop' })
    }

    // Actualizar producto
    const result = await repo.update(id, workshop.id, productData)

    // Actualizar imágenes si se proporcionaron
    if (images) {
      await updateProductImages(id, images)
    }

    // Obtener el producto actualizado con imágenes
    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        images: { orderBy: { position: 'asc' } },
      },
    })

    res.json(updatedProduct)
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
