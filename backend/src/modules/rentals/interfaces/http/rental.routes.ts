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
 * @swagger
 * /api/rentals/bikes:
 *   get:
 *     summary: Listar bicicletas de alquiler
 *     description: Obtiene una lista de bicicletas disponibles para alquiler con filtros opcionales
 *     tags: [Rentals]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtrar por ciudad
 *       - in: query
 *         name: bikeType
 *         schema:
 *           type: string
 *           enum: [ROAD, MOUNTAIN, CITY, ELECTRIC, GRAVEL, HYBRID]
 *         description: Tipo de bicicleta
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Precio mínimo diario
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: integer
 *         description: Precio máximo diario
 *       - in: query
 *         name: bikeSize
 *         schema:
 *           type: string
 *         description: Talla de la bicicleta (S, M, L, XL)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del alquiler
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del alquiler
 *       - in: query
 *         name: includesHelmet
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Incluye casco
 *       - in: query
 *         name: includesLock
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Incluye candado
 *     responses:
 *       200:
 *         description: Lista de bicicletas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RentalBike'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get('/bikes', validateQuery(RentalFiltersQuerySchema), getRentalBikesController)

/**
 * @swagger
 * /api/rentals/filters:
 *   get:
 *     summary: Obtener opciones de filtros
 *     description: Devuelve las opciones disponibles para filtrar bicicletas (ciudades, tipos, tallas, etc.)
 *     tags: [Rentals]
 *     responses:
 *       200:
 *         description: Opciones de filtros
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cities:
 *                   type: array
 *                   items:
 *                     type: string
 *                 bikeTypes:
 *                   type: array
 *                   items:
 *                     type: string
 *                 bikeSizes:
 *                   type: array
 *                   items:
 *                     type: string
 *                 priceRange:
 *                   type: object
 *                   properties:
 *                     min:
 *                       type: number
 *                     max:
 *                       type: number
 */
router.get('/filters', getRentalFiltersController)

/**
 * @swagger
 * /api/rentals/bikes/{id}:
 *   get:
 *     summary: Obtener detalles de una bicicleta
 *     description: Devuelve la información completa de una bicicleta de alquiler
 *     tags: [Rentals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la bicicleta
 *     responses:
 *       200:
 *         description: Detalles de la bicicleta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RentalBike'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/bikes/:id', validateParams(UuidParamSchema), getRentalBikeDetailsController)

/**
 * @swagger
 * /api/rentals/bikes/{id}/check-availability:
 *   post:
 *     summary: Verificar disponibilidad
 *     description: Comprueba si la bicicleta está disponible para las fechas indicadas
 *     tags: [Rentals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la bicicleta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - endDate
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio del alquiler
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Fecha de fin del alquiler
 *               quantity:
 *                 type: integer
 *                 default: 1
 *                 description: Cantidad de bicicletas
 *           example:
 *             startDate: '2024-06-01'
 *             endDate: '2024-06-07'
 *             quantity: 1
 *     responses:
 *       200:
 *         description: Resultado de disponibilidad
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                 availableQuantity:
 *                   type: integer
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  '/bikes/:id/check-availability',
  validateParams(UuidParamSchema),
  validateBody(CheckAvailabilitySchema),
  checkBikeAvailabilityController
)

/**
 * @swagger
 * /api/rentals/bikes/{id}/calculate-price:
 *   post:
 *     summary: Calcular precio de alquiler
 *     description: Calcula el precio total del alquiler para las fechas indicadas
 *     tags: [Rentals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la bicicleta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - endDate
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *           example:
 *             startDate: '2024-06-01'
 *             endDate: '2024-06-07'
 *     responses:
 *       200:
 *         description: Desglose del precio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 days:
 *                   type: integer
 *                 dailyPrice:
 *                   type: number
 *                 subtotal:
 *                   type: number
 *                 deposit:
 *                   type: number
 *                 total:
 *                   type: number
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  '/bikes/:id/calculate-price',
  validateParams(UuidParamSchema),
  validateBody(CalculatePriceSchema),
  calculateBikeRentalPriceController
)

/**
 * @swagger
 * /api/rentals/bikes/{id}/blocked-dates:
 *   get:
 *     summary: Obtener fechas bloqueadas
 *     description: Devuelve las fechas en las que la bicicleta no está disponible
 *     tags: [Rentals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la bicicleta
 *     responses:
 *       200:
 *         description: Lista de fechas bloqueadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blockedDates:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: date
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/bikes/:id/blocked-dates', validateParams(UuidParamSchema), getBikeBlockedDatesController)

export default router
