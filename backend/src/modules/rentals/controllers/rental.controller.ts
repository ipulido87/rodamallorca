import { Request, Response, NextFunction } from 'express'
import prisma from '../../../lib/prisma'
import {
  checkAvailability,
  calculateRentalPrice,
  getBlockedDates,
} from '../services/rental-availability.service'

/**
 * GET /api/rentals/bikes
 * Lista todas las bicicletas disponibles para alquiler
 */
export const getRentalBikes = async (req: Request, res: Response, next: NextFunction) => {
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

    console.log('🚴 [Rentals] Listando bicicletas de alquiler con filtros:', req.query)

    const where: any = {
      isRental: true,
      status: 'PUBLISHED', // Solo mostrar publicadas
      availableQuantity: { gt: 0 }, // Con stock disponible
    }

    // Filtrar por ciudad (del workshop)
    if (city) {
      where.workshop = {
        city: city as string,
      }
    }

    // Filtrar por tipo de bici
    if (bikeType) {
      where.bikeType = bikeType as string
    }

    // Filtrar por rango de precio
    if (minPrice || maxPrice) {
      where.rentalPricePerDay = {}
      if (minPrice) where.rentalPricePerDay.gte = Number.parseInt(minPrice as string, 10)
      if (maxPrice) where.rentalPricePerDay.lte = Number.parseInt(maxPrice as string, 10)
    }

    // Filtrar por talla
    if (bikeSize) {
      where.bikeSize = bikeSize as string
    }

    // Filtrar por accesorios
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
        { workshop: { isVerified: 'desc' } }, // Verificados primero
        { rentalPricePerDay: 'asc' }, // Más baratos primero
      ],
    })

    // Si hay fechas, filtrar por disponibilidad
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

      filteredBikes = availabilityChecks.filter((item) => item.available).map((item) => item.bike)
      console.log(`✅ Filtradas por disponibilidad: ${filteredBikes.length}/${bikes.length}`)
    }

    res.json({
      success: true,
      bikes: filteredBikes,
      total: filteredBikes.length,
    })
  } catch (error: any) {
    console.error('❌ Error listando bicicletas de alquiler:', error)
    next(error)
  }
}

/**
 * GET /api/rentals/bikes/:id
 * Obtiene detalles de una bicicleta de alquiler
 */
export const getRentalBikeDetails = async (req: Request, res: Response, next: NextFunction) => {
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
      return res.status(404).json({
        error: 'Bicicleta no encontrada o no disponible para alquiler',
      })
    }

    res.json({
      success: true,
      bike,
    })
  } catch (error: any) {
    console.error('❌ Error obteniendo detalles de bicicleta:', error)
    next(error)
  }
}

/**
 * POST /api/rentals/bikes/:id/check-availability
 * Verifica disponibilidad de una bicicleta en fechas específicas
 */
export const checkBikeAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { startDate, endDate, quantity = 1 } = req.body

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Se requieren fechas de inicio y fin',
      })
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
  } catch (error: any) {
    console.error('❌ Error verificando disponibilidad:', error)
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
) => {
  try {
    const { id } = req.params
    const { startDate, endDate } = req.body

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Se requieren fechas de inicio y fin',
      })
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
  } catch (error: any) {
    console.error('❌ Error calculando precio:', error)
    if (error.message.includes('mínimo') || error.message.includes('máximo')) {
      return res.status(400).json({ error: error.message })
    }
    next(error)
  }
}

/**
 * GET /api/rentals/bikes/:id/blocked-dates
 * Obtiene las fechas bloqueadas de una bicicleta
 */
export const getBikeBlockedDates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const blockedDates = await getBlockedDates(id as string)

    res.json({
      success: true,
      blockedDates,
    })
  } catch (error: any) {
    console.error('❌ Error obteniendo fechas bloqueadas:', error)
    next(error)
  }
}

/**
 * GET /api/rentals/filters
 * Obtiene opciones para filtros (ciudades, tipos de bici, etc.)
 */
export const getRentalFilters = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
  } catch (error: any) {
    console.error('❌ Error obteniendo filtros:', error)
    next(error)
  }
}
