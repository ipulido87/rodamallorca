import { Router } from 'express'
import {
  getRentalBikes,
  getRentalBikeDetails,
  checkBikeAvailability,
  calculateBikeRentalPrice,
  getBikeBlockedDates,
  getRentalFilters,
} from '../controllers/rental.controller'

const router = Router()

/**
 * Rutas públicas de alquiler de bicicletas
 */

// GET /api/rentals/bikes - Lista de bicis de alquiler con filtros
router.get('/bikes', getRentalBikes)

// GET /api/rentals/filters - Opciones para filtros
router.get('/filters', getRentalFilters)

// GET /api/rentals/bikes/:id - Detalles de una bici
router.get('/bikes/:id', getRentalBikeDetails)

// POST /api/rentals/bikes/:id/check-availability - Verificar disponibilidad
router.post('/bikes/:id/check-availability', checkBikeAvailability)

// POST /api/rentals/bikes/:id/calculate-price - Calcular precio
router.post('/bikes/:id/calculate-price', calculateBikeRentalPrice)

// GET /api/rentals/bikes/:id/blocked-dates - Fechas bloqueadas
router.get('/bikes/:id/blocked-dates', getBikeBlockedDates)

export default router
