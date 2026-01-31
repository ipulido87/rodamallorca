import { Request, Response, NextFunction } from 'express'
import { asyncHandler } from '../../../../utils/async-handler'
import { getRentalBikes } from '../../application/get-rental-bikes'
import { getRentalBikeDetails } from '../../application/get-rental-bike-details'
import { getRentalFilters } from '../../application/get-rental-filters'
import { rentalRepositoryPrisma } from '../../infrastructure/persistence/prisma/rental-repository-prisma'
import {
  checkAvailability,
  calculateRentalPrice,
  getBlockedDates,
} from '../../services/rental-availability.service'
import type {
  CheckAvailabilityDTO,
  CalculatePriceDTO,
  RentalFiltersQueryDTO,
} from '../http/schemas/rental.schemas'

const rentalRepo = rentalRepositoryPrisma

/**
 * GET /api/rentals/bikes
 * Lista todas las bicicletas disponibles para alquiler
 */
export const getRentalBikesController = asyncHandler(
  async (req: Request, res: Response) => {
    // Body ya validado por middleware validateQuery
    const query = req.query as unknown as RentalFiltersQueryDTO

    console.log('🚴 [Rentals] Listando bicicletas de alquiler con filtros:', query)

    const filters = {
      city: query.city,
      bikeType: query.bikeType,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      bikeSize: query.bikeSize,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      includesHelmet: query.includesHelmet === 'true',
      includesLock: query.includesLock === 'true',
    }

    const result = await getRentalBikes(filters, { rentalRepo })

    res.json({
      success: true,
      bikes: result.bikes,
      total: result.total,
    })
  }
)

/**
 * GET /api/rentals/filters
 * Obtiene opciones para filtros (ciudades, tipos de bici, etc.)
 */
export const getRentalFiltersController = asyncHandler(
  async (_req: Request, res: Response) => {
    const filters = await getRentalFilters({ rentalRepo })

    res.json({
      success: true,
      filters,
    })
  }
)

/**
 * GET /api/rentals/bikes/:id
 * Obtiene detalles de una bicicleta de alquiler
 */
export const getRentalBikeDetailsController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string

    const bike = await getRentalBikeDetails(id, { rentalRepo })

    if (!bike) {
      res.status(404).json({
        error: 'Bicicleta no encontrada o no disponible para alquiler',
      })
      return
    }

    res.json({
      success: true,
      bike,
    })
  }
)

/**
 * POST /api/rentals/bikes/:id/check-availability
 * Verifica disponibilidad de una bicicleta en fechas especificas
 */
export const checkBikeAvailabilityController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string
    // Body ya validado por middleware validateBody
    const body = req.body as CheckAvailabilityDTO

    const availability = await checkAvailability({
      productId: id,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      quantity: body.quantity,
    })

    res.json({
      success: true,
      ...availability,
    })
  }
)

/**
 * POST /api/rentals/bikes/:id/calculate-price
 * Calcula el precio de alquiler para unas fechas
 */
export const calculateBikeRentalPriceController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string
    // Body ya validado por middleware validateBody
    const body = req.body as CalculatePriceDTO

    try {
      const pricing = await calculateRentalPrice({
        productId: id,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
      })

      res.json({
        success: true,
        ...pricing,
      })
    } catch (error: any) {
      // Errores de validacion de dias minimos/maximos
      if (error.message.includes('minimo') || error.message.includes('maximo')) {
        res.status(400).json({ error: error.message })
        return
      }
      next(error)
    }
  }
)

/**
 * GET /api/rentals/bikes/:id/blocked-dates
 * Obtiene las fechas bloqueadas de una bicicleta
 */
export const getBikeBlockedDatesController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string

    const blockedDates = await getBlockedDates(id)

    res.json({
      success: true,
      blockedDates,
    })
  }
)
