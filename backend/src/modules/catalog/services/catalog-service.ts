import { PrismaClient, Prisma } from '@prisma/client'

interface SearchParams {
  q?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  city?: string
  page?: number
  size?: number
}

export async function searchCatalog(
  params: SearchParams,
  prisma: PrismaClient
) {
  const {
    q = '',
    categoryId,
    minPrice,
    maxPrice,
    city,
    page = 1,
    size = 12,
  } = params

  const skip = (page - 1) * size

  // Filtros para productos
  const productWhere: Prisma.ProductWhereInput = {
    status: 'PUBLISHED',
  }

  if (q) {
    productWhere.title = { contains: q, mode: 'insensitive' }
  }
  if (categoryId) {
    productWhere.categoryId = categoryId
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter: Record<string, number> = {}
    if (minPrice !== undefined) priceFilter.gte = minPrice
    if (maxPrice !== undefined) priceFilter.lte = maxPrice
    productWhere.price = priceFilter
  }
  if (city) {
    productWhere.workshop = {
      city: { contains: city, mode: 'insensitive' },
    }
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: productWhere,
      skip,
      take: size,
      orderBy: { createdAt: 'desc' },
      include: {
        workshop: {
          select: { id: true, name: true, city: true, country: true },
        },
        category: {
          select: { id: true, name: true },
        },
        images: true,
      },
    }),
    prisma.product.count({ where: productWhere }),
  ])

  return {
    items: products,
    total,
    page,
    size,
  }
}
