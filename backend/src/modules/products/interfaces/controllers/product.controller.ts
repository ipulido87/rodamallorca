// modules/products/interfaces/controllers/product.controller.ts

import { NextFunction, Request, Response } from 'express'
import { invalidateCache } from '../../../../lib/cache'
import prisma from '../../../../lib/prisma'
import { createProductDraft } from '../../application/create-product'
import { ProductRepositoryPrisma } from '../../infrastructure/persistence/prisma/product-repository-prisma'
import {
  CreateProductSchema,
  UpdateProductSchema,
} from '../http/schemas/product.schemas'
import { ImageProcessor } from '../../../media/application/image-processor'

const imageProcessor = new ImageProcessor()

const repo = new ProductRepositoryPrisma()

// Aliases para mantener compatibilidad con código existente
const createProductSchema = CreateProductSchema
const updateProductSchema = UpdateProductSchema

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

    // Crear producto con Prisma directamente (incluye campos de alquiler)
    const product = await prisma.product.create({
      data: {
        workshopId: workshop.id,
        title: productData.title,
        price: productData.price,
        condition: productData.condition || 'used',
        status: productData.status || 'DRAFT',
        description: productData.description,
        categoryId: productData.categoryId,
        // Campos de alquiler
        isRental: productData.isRental || false,
        rentalPricePerDay: productData.rentalPricePerDay,
        rentalPricePerWeek: productData.rentalPricePerWeek,
        availableQuantity: productData.availableQuantity || 1,
        bikeType: productData.bikeType,
        bikeSize: productData.bikeSize,
        bikeBrand: productData.bikeBrand,
        bikeModel: productData.bikeModel,
        frameSize: productData.frameSize,
        includesHelmet: productData.includesHelmet || false,
        includesLock: productData.includesLock || false,
        includesLights: productData.includesLights || false,
        depositAmount: productData.depositAmount,
        minRentalDays: productData.minRentalDays,
        maxRentalDays: productData.maxRentalDays,
      },
    })

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

    invalidateCache('/api/catalog/products')
    res.status(201).json(productWithImages)
  } catch (e) {
    next(e)
  }
}

// GET /api/owner/products/mine?isRental=true|false
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

    // Filtro opcional para separar productos de venta vs alquiler
    const isRentalParam = req.query.isRental
    const whereClause: any = { workshopId: workshop.id }

    if (isRentalParam === 'true') {
      whereClause.isRental = true
    } else if (isRentalParam === 'false') {
      whereClause.isRental = false
    }
    // Si no se especifica, devuelve todos

    const products = await prisma.product.findMany({
      where: whereClause,
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
    const result = await repo.update(id as string, workshop.id, productData)

    // Actualizar imágenes si se proporcionaron
    if (images) {
      await updateProductImages(id as string, images)
    }

    // Obtener el producto actualizado con imágenes
    const updatedProduct = await prisma.product.findUnique({
      where: { id: id as string },
      include: {
        category: { select: { id: true, name: true } },
        images: { orderBy: { position: 'asc' } },
      },
    })

    invalidateCache('/api/catalog/products')
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

    await repo.publish(id as string, workshop.id)
    invalidateCache('/api/catalog/products')
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

    const product = await prisma.product.findFirst({
      where: { id, workshopId: workshop.id },
      include: { images: true },
    })

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    // Clean up Cloudinary images before cascade delete
    if (product.images.length > 0) {
      await Promise.all(
        product.images.map((img) => imageProcessor.deleteImage(img.original))
      )
    }

    await prisma.product.delete({ where: { id } })

    invalidateCache('/api/catalog/products')
    res.json({ message: 'Product deleted successfully' })
  } catch (e) {
    next(e)
  }
}
