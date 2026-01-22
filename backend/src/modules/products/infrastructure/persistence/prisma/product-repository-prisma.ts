import prisma from '../../../../../lib/prisma'
import {
  ProductDTO,
  ProductRepository,
} from '../../../domain/repositories/product-repository'

export class ProductRepositoryPrisma implements ProductRepository {
  async createDraft(input: {
    workshopId: string
    title: string
    price: number
    currency?: string
    condition?: 'new' | 'used' | 'refurb'
    categoryId?: string | null
    description?: string | null
  }): Promise<ProductDTO> {
    const product = await prisma.product.create({
      data: {
        workshopId: input.workshopId,
        title: input.title,
        price: input.price,
        currency: input.currency ?? 'EUR',
        condition: input.condition ?? 'used',
        categoryId: input.categoryId ?? null,
        description: input.description ?? null,
        status: 'DRAFT',
      },
    })

    return {
      id: product.id,
      workshopId: product.workshopId,
      title: product.title,
      price: product.price,
      currency: product.currency,
      status: product.status as 'DRAFT' | 'PUBLISHED' | 'SOLD',
      condition: product.condition as 'new' | 'used' | 'refurb',
      categoryId: product.categoryId,
    }
  }

  async publish(productId: string, workshopId: string): Promise<void> {
    await prisma.product.updateMany({
      where: {
        id: productId,
        workshopId: workshopId, // Solo el owner puede publicar su producto
      },
      data: { status: 'PUBLISHED' },
    })
  }

  async update(
    productId: string,
    workshopId: string,
    patch: Partial<Omit<ProductDTO, 'id' | 'workshopId'>> & {
      description?: string | null
    }
  ): Promise<ProductDTO> {
    // Verificar que el producto pertenece al workshop del owner
    const updated = await prisma.product.updateMany({
      where: {
        id: productId,
        workshopId: workshopId, // Solo actualizar si pertenece al workshop
      },
      data: patch,
    })

    if (updated.count === 0) {
      throw new Error('Product not found or not owned by this workshop')
    }

    // Obtener el producto actualizado
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      throw new Error('Product not found after update')
    }

    return {
      id: product.id,
      workshopId: product.workshopId,
      title: product.title,
      price: product.price,
      currency: product.currency,
      status: product.status as 'DRAFT' | 'PUBLISHED' | 'SOLD',
      condition: product.condition as 'new' | 'used' | 'refurb',
      categoryId: product.categoryId,
    }
  }

  async findById(id: string): Promise<ProductDTO | null> {
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) return null

    return {
      id: product.id,
      workshopId: product.workshopId,
      title: product.title,
      price: product.price,
      currency: product.currency,
      status: product.status as 'DRAFT' | 'PUBLISHED' | 'SOLD',
      condition: product.condition as 'new' | 'used' | 'refurb',
      categoryId: product.categoryId,
    }
  }

  async search(params: {
    q?: string
    min?: number
    max?: number
    categoryId?: string
    city?: string
    page?: number
    size?: number
  }): Promise<{ items: ProductDTO[]; total: number }> {
    const { q, min, max, categoryId, city, page = 1, size = 12 } = params
    const skip = (page - 1) * size
    const take = Math.min(size, 50)

    const where = {
      status: 'PUBLISHED' as const,
      ...(q
        ? {
            title: {
              contains: q,
              mode: 'insensitive' as const,
            },
          }
        : {}),
      ...(min || max
        ? {
            price: {
              ...(min ? { gte: min } : {}),
              ...(max ? { lte: max } : {}),
            },
          }
        : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(city
        ? {
            workshop: {
              city: {
                contains: city,
                mode: 'insensitive' as const,
              },
            },
          }
        : {}),
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          workshop: {
            select: { id: true, name: true, city: true, country: true },
          },
          category: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ])

    const items = products.map((p) => ({
      id: p.id,
      workshopId: p.workshopId,
      title: p.title,
      price: p.price,
      currency: p.currency,
      status: p.status as 'DRAFT' | 'PUBLISHED' | 'SOLD',
      condition: p.condition as 'new' | 'used' | 'refurb',
      categoryId: p.categoryId,
    }))

    return { items, total }
  }
}
