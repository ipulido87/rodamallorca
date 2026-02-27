// src/modules/catalog/interfaces/controllers/catalog.controller.ts
import type { Prisma, VehicleType } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'
import prisma from '../../../../lib/prisma'

export const searchWorkshopsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const q = req.query.q?.toString()
    const city = req.query.city?.toString()
    const country = req.query.country?.toString()
    const page = Number(req.query.page ?? 1)
    const size = Math.min(Number(req.query.size ?? 12), 50)
    const skip = (page - 1) * size

    const where: Prisma.WorkshopWhereInput = {
      ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
      ...(country ? { country } : {}),
    }

    const [items, total] = await Promise.all([
      prisma.workshop.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.workshop.count({ where }),
    ])

    res.json({ items, total, page, size })
  } catch (e) {
    next(e)
  }
}

export const searchProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q, categoryId, workshopId, city, page = '1', size = '12' } = req.query
    const take = Math.min(Number(size), 50)
    const skip = (Number(page) - 1) * take

    const where: Prisma.ProductWhereInput = {
      status: 'PUBLISHED',
      isRental: false, // SOLO productos de venta, NO alquileres
      ...(q ? { title: { contains: String(q), mode: 'insensitive' } } : {}),
      ...(categoryId ? { categoryId: String(categoryId) } : {}),
      ...(workshopId ? { workshopId: String(workshopId) } : {}),
      ...(city
        ? {
            workshop: { city: { contains: String(city), mode: 'insensitive' } },
          }
        : {}),
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          workshop: {
            select: { id: true, name: true, city: true, country: true },
          },
          category: { select: { id: true, name: true } },
          images: true,
        },
      }),
      prisma.product.count({ where }),
    ])

    res.json({ items, total, page: Number(page), size: take })
  } catch (e) {
    next(e)
  }
}

export const getProductByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        workshop: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
            phone: true,
            stripeOnboardingComplete: true,
          },
        },
        category: {
          select: { id: true, name: true },
        },
        images: true,
      },
    })

    if (!product || product.isRental) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const { stripeOnboardingComplete, ...workshopPublic } = product.workshop
    res.json({
      ...product,
      workshop: {
        ...workshopPublic,
        canAcceptPayments: stripeOnboardingComplete,
      },
    })
  } catch (e) {
    next(e)
  }
}

export const searchServicesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q, categoryId, city, vehicleType, workshopId, page = '1', size = '12' } = req.query
    const take = Math.min(Number(size), 50)
    const skip = (Number(page) - 1) * take

    const where: Prisma.ServiceWhereInput = {
      status: 'ACTIVE',
      ...(q ? { name: { contains: String(q), mode: 'insensitive' } } : {}),
      ...(categoryId ? { serviceCategoryId: String(categoryId) } : {}),
      ...(vehicleType && vehicleType !== 'ALL' ? { vehicleType: String(vehicleType) as VehicleType } : {}),
      ...(workshopId ? { workshopId: String(workshopId) } : {}),
      ...(city
        ? {
            workshop: { city: { contains: String(city), mode: 'insensitive' } },
          }
        : {}),
    }

    const [items, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          workshop: {
            select: { id: true, name: true, city: true, country: true },
          },
          serviceCategory: { select: { id: true, name: true, icon: true } },
        },
      }),
      prisma.service.count({ where }),
    ])

    res.json({ items, total, page: Number(page), size: take })
  } catch (e) {
    next(e)
  }
}

/**
 * GET /api/catalog/categories
 * Obtener todas las categorías de productos (público)
 */
export const getCategoriesController = async (
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
