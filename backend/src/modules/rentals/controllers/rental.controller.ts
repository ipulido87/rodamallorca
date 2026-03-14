import type { Request, Response, NextFunction } from 'express'
import prisma from '../../../lib/prisma'
import {
  checkAvailability,
  calculateRentalPrice,
  getBlockedDates,
} from '../services/rental-availability.service'
import type { Prisma } from '@prisma/client'

/**
 * GET /api/rentals/bikes
 * Lista todas las bicicletas disponibles para alquiler
 */
export const getRentalBikes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      city,
      bikeType,
      minPrice,
      maxPrice,
      bikeSize,
      startDate,
      endDate,
      includesHelmet,
      includesLock,
    } = req.query

    const where: Prisma.ProductWhereInput = {
      isRental: true,
      status: 'PUBLISHED',
      availableQuantity: { gt: 0 },
    }

    if (city) {
      where.workshop = { city: city as string }
    }

    if (bikeType) {
      where.bikeType = bikeType as string
    }

    if (minPrice || maxPrice) {
      where.rentalPricePerDay = {
        ...(minPrice ? { gte: Number.parseInt(minPrice as string, 10) } : {}),
        ...(maxPrice ? { lte: Number.parseInt(maxPrice as string, 10) } : {}),
      }
    }

    if (bikeSize) {
      where.bikeSize = bikeSize as string
    }

    if (includesHelmet === 'true') where.includesHelmet = true
    if (includesLock === 'true') where.includesLock = true

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

    let filteredBikes = bikes
    if (startDate && endDate) {
      const start = new Date(startDate as string)
      const end = new Date(endDate as string)

      const availabilityChecks = await Promise.all(
        bikes.map(async (bike) => {
          const availability = await checkAvailability({
            productId: bike.id,
            startDate: start,
            endDate: end,
          })
          return { bike, available: availability.available }
        })
      )

      filteredBikes = availabilityChecks
        .filter((item) => item.available)
        .map((item) => item.bike)
    }

    res.json({
      success: true,
      bikes: filteredBikes,
      total: filteredBikes.length,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/rentals/bikes/:id
 * Obtiene detalles de una bicicleta de alquiler
 */
export const getRentalBikeDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

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
      res.status(404).json({
        error: 'Bicicleta no encontrada o no disponible para alquiler',
      })
      return
    }

    res.json({
      success: true,
      bike,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/rentals/bikes/:id/check-availability
 * Verifica disponibilidad de una bicicleta en fechas específicas
 */
export const checkBikeAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const { startDate, endDate, quantity = 1 } = req.body

    if (!startDate || !endDate) {
      res.status(400).json({
        error: 'Se requieren fechas de inicio y fin',
      })
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    const availability = await checkAvailability({
      productId: id as string,
      startDate: start,
      endDate: end,
      quantity,
    })

    res.json({
      success: true,
      ...availability,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/rentals/bikes/:id/calculate-price
 * Calcula el precio de alquiler para unas fechas
 */
export const calculateBikeRentalPrice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const { startDate, endDate } = req.body

    if (!startDate || !endDate) {
      res.status(400).json({
        error: 'Se requieren fechas de inicio y fin',
      })
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    const pricing = await calculateRentalPrice({
      productId: id as string,
      startDate: start,
      endDate: end,
    })

    res.json({
      success: true,
      ...pricing,
    })
  } catch (error) {
    if (error instanceof Error && (error.message.includes('mínimo') || error.message.includes('máximo'))) {
      res.status(400).json({ error: error.message })
      return
    }
    next(error)
  }
}

/**
 * GET /api/rentals/bikes/:id/blocked-dates
 * Obtiene las fechas bloqueadas de una bicicleta
 */
export const getBikeBlockedDates = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const blockedDates = await getBlockedDates(id as string)

    res.json({
      success: true,
      blockedDates,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/rentals/filters
 * Obtiene opciones para filtros (ciudades, tipos de bici, etc.)
 */
export const getRentalFilters = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
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

    const bikeTypes = await prisma.product.groupBy({
      by: ['bikeType'],
      where: {
        isRental: true,
        status: 'PUBLISHED',
        bikeType: { not: null },
      },
      _count: true,
    })

    const priceRange = await prisma.product.aggregate({
      where: {
        isRental: true,
        status: 'PUBLISHED',
        rentalPricePerDay: { not: null },
      },
      _min: { rentalPricePerDay: true },
      _max: { rentalPricePerDay: true },
    })

    res.json({
      success: true,
      filters: {
        cities: cities.map((c) => ({ city: c.city, count: c._count })),
        bikeTypes: bikeTypes.map((t) => ({ type: t.bikeType, count: t._count })),
        priceRange: {
          min: priceRange._min.rentalPricePerDay || 0,
          max: priceRange._max.rentalPricePerDay || 10000,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}
