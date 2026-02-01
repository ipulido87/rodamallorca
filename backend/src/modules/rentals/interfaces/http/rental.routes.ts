import { Router } from 'express'
import {
  getRentalBikesController,
  getRentalFiltersController,
  getRentalBikeDetailsController,
  checkBikeAvailabilityController,
  calculateBikeRentalPriceController,
  getBikeBlockedDatesController,
} from '../controllers/rental.controller'
import { validateBody, validateQuery, validateParams } from '../../../auth/interfaces/middlewares/validate-body'
import {
  CheckAvailabilitySchema,
  CalculatePriceSchema,
  RentalFiltersQuerySchema,
} from './schemas/rental.schemas'
import { UuidParamSchema } from '../../../../lib/schemas/common.schemas'

const router = Router()

/**
 * Rutas publicas de alquiler de bicicletas
 */

// GET /api/rentals/bikes - Lista de bicis de alquiler con filtros
router.get('/bikes', validateQuery(RentalFiltersQuerySchema), getRentalBikesController)

// GET /api/rentals/filters - Opciones para filtros
router.get('/filters', getRentalFiltersController)

// GET /api/rentals/bikes/:id - Detalles de una bici
router.get('/bikes/:id', validateParams(UuidParamSchema), getRentalBikeDetailsController)

// POST /api/rentals/bikes/:id/check-availability - Verificar disponibilidad
router.post(
  '/bikes/:id/check-availability',
  validateParams(UuidParamSchema),
  validateBody(CheckAvailabilitySchema),
  checkBikeAvailabilityController
)

// POST /api/rentals/bikes/:id/calculate-price - Calcular precio
router.post(
  '/bikes/:id/calculate-price',
  validateParams(UuidParamSchema),
  validateBody(CalculatePriceSchema),
  calculateBikeRentalPriceController
)

// GET /api/rentals/bikes/:id/blocked-dates - Fechas bloqueadas
router.get('/bikes/:id/blocked-dates', validateParams(UuidParamSchema), getBikeBlockedDatesController)

export default router
