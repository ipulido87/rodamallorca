import prisma from '../../../../../lib/prisma'
import type { Prisma } from '@prisma/client'
import type { RentalRepository } from '../../../domain/repositories/rental-repository'
import type {
  RentalBike,
  RentalFilters,
  RentalFilterOptions,
} from '../../../domain/entities/rental-bike'

export class RentalRepositoryPrisma implements RentalRepository {
  async findRentalBikes(filters: RentalFilters): Promise<RentalBike[]> {
    const where: Prisma.ProductWhereInput = {
      isRental: true,
      status: 'PUBLISHED',
      availableQuantity: { gt: 0 },
    }

    // Filtrar por ciudad (del workshop)
    if (filters.city) {
      where.workshop = {
        city: filters.city,
      }
    }

    // Filtrar por tipo de bici
    if (filters.bikeType) {
      where.bikeType = filters.bikeType
    }

    // Filtrar por rango de precio
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.rentalPricePerDay = {}
      if (filters.minPrice !== undefined) {
        where.rentalPricePerDay.gte = filters.minPrice
      }
      if (filters.maxPrice !== undefined) {
        where.rentalPricePerDay.lte = filters.maxPrice
      }
    }

    // Filtrar por talla
    if (filters.bikeSize) {
      where.bikeSize = filters.bikeSize
    }

    // Filtrar por accesorios
    if (filters.includesHelmet) {
      where.includesHelmet = true
    }
    if (filters.includesLock) {
      where.includesLock = true
    }

    const bikes = await prisma.product.findMany({
      where,
      include: {
        workshop: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
            phone: true,
            latitude: true,
            longitude: true,
            isVerified: true,
          },
        },
        images: {
          orderBy: { position: 'asc' },
        },
        category: true,
      },
      orderBy: [
        { workshop: { isVerified: 'desc' } },
        { rentalPricePerDay: 'asc' },
      ],
    })

    return bikes.map(this.mapToRentalBike)
  }

  async findRentalBikeById(id: string): Promise<RentalBike | null> {
    const bike = await prisma.product.findUnique({
      where: { id },
      include: {
        workshop: {
          select: {
            id: true,
            name: true,
            description: true,
            city: true,
            address: true,
            phone: true,
            website: true,
            googleMapsUrl: true,
            latitude: true,
            longitude: true,
            isVerified: true,
            averageRating: true,
            reviewCount: true,
          },
        },
        images: {
          orderBy: { position: 'asc' },
        },
        category: true,
      },
    })

    if (!bike || !bike.isRental) {
      return null
    }

    return this.mapToRentalBike(bike)
  }

  async getFilterOptions(): Promise<RentalFilterOptions> {
    // Obtener ciudades con bicis de alquiler
    const cities = await prisma.workshop.groupBy({
      by: ['city'],
      where: {
        products: {
          some: {
            isRental: true,
            status: 'PUBLISHED',
          },
        },
        city: { not: null },
      },
      _count: true,
    })

    // Obtener tipos de bici disponibles
    const bikeTypes = await prisma.product.groupBy({
      by: ['bikeType'],
      where: {
        isRental: true,
        status: 'PUBLISHED',
        bikeType: { not: null },
      },
      _count: true,
    })

    // Obtener rango de precios
    const priceRange = await prisma.product.aggregate({
      where: {
        isRental: true,
        status: 'PUBLISHED',
        rentalPricePerDay: { not: null },
      },
      _min: { rentalPricePerDay: true },
      _max: { rentalPricePerDay: true },
    })

    return {
      cities: cities.map((c) => ({ city: c.city, count: c._count })),
      bikeTypes: bikeTypes.map((t) => ({ type: t.bikeType, count: t._count })),
      priceRange: {
        min: priceRange._min.rentalPricePerDay || 0,
        max: priceRange._max.rentalPricePerDay || 10000,
      },
    }
  }

  async getActiveRentalOrdersInRange(
    productId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ quantity: number }>> {
    const orders = await prisma.orderItem.findMany({
      where: {
        productId,
        isRental: true,
        order: {
          status: {
            notIn: ['CANCELLED', 'COMPLETED'],
          },
        },
        AND: [
          { rentalStartDate: { lte: endDate } },
          { rentalEndDate: { gte: startDate } },
        ],
      },
      select: {
        quantity: true,
      },
    })

    return orders
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma query result mapping
  private mapToRentalBike(bike: Record<string, any>): RentalBike {
    return {
      id: bike.id,
      workshopId: bike.workshopId,
      title: bike.title,
      description: bike.description,
      bikeType: bike.bikeType,
      bikeSize: bike.bikeSize,
      includesHelmet: bike.includesHelmet ?? false,
      includesLock: bike.includesLock ?? false,
      rentalPricePerDay: bike.rentalPricePerDay ?? 0,
      depositAmount: bike.depositAmount,
      minRentalDays: bike.minRentalDays,
      maxRentalDays: bike.maxRentalDays,
      availableQuantity: bike.availableQuantity ?? 0,
      status: bike.status,
      images: (bike.images ?? []).map((img: Record<string, any>) => ({
        id: img.id,
        original: img.original,
        medium: img.medium,
        thumbnail: img.thumbnail,
        position: img.position,
      })),
      workshop: {
        id: bike.workshop.id,
        name: bike.workshop.name,
        city: bike.workshop.city,
        address: bike.workshop.address,
        phone: bike.workshop.phone,
        latitude: bike.workshop.latitude,
        longitude: bike.workshop.longitude,
        isVerified: bike.workshop.isVerified ?? false,
        averageRating: bike.workshop.averageRating,
        reviewCount: bike.workshop.reviewCount,
      },
      category: bike.category ? {
        id: bike.category.id,
        name: bike.category.name,
      } : null,
    }
  }
}

// Export singleton instance
export const rentalRepositoryPrisma = new RentalRepositoryPrisma()
