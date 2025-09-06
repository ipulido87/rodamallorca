import type { Prisma } from '@prisma/client'
import { Router } from 'express'
import prisma from '../../../../lib/prisma'

const r = Router()

// GET /api/catalog/products
r.get('/', async (req, res, next) => {
  try {
    const { q, categoryId, city, page = '1', size = '12' } = req.query
    const take = Math.min(Number(size), 50) // max 50
    const skip = (Number(page) - 1) * take

    const where: Prisma.ProductWhereInput = {
      status: 'PUBLISHED',
      ...(q ? { title: { contains: String(q), mode: 'insensitive' } } : {}),
      ...(categoryId ? { categoryId: String(categoryId) } : {}),
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
        include: {
          workshop: {
            select: { id: true, name: true, city: true, country: true },
          },
          category: { select: { id: true, name: true } },
          images: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ])

    res.json({ items, total, page: Number(page), size: take })
  } catch (e) {
    next(e)
  }
})

export default r
