import { Router } from 'express'
import {
  requireRole,
  requireUser,
  verifyToken,
} from '../../../auth/interfaces/middlewares/auth.middleware'
import { validateBody } from '../../../auth/interfaces/middlewares/validate-body'
import {
  createServiceController,
  deleteServiceController,
  getServiceByIdController,
  listServiceCategoriesController,
  listWorkshopServicesController,
  searchServicesController,
  updateServiceController,
} from '../controllers/service.controller'
import {
  CreateServiceSchema,
  UpdateServiceSchema,
} from './schemas/service.schemas'

const r = Router()

/**
 * @swagger
 * /api/service-categories:
 *   get:
 *     summary: Listar categorías de servicios
 *     description: Obtiene todas las categorías de servicios disponibles
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 */
r.get('/service-categories', listServiceCategoriesController)

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Buscar servicios
 *     description: Busca servicios en el catálogo público con filtros opcionales
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtrar por ciudad
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Precio mínimo
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Precio máximo
 *     responses:
 *       200:
 *         description: Lista de servicios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 */
r.get('/services', searchServicesController)

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Obtener servicio por ID
 *     description: Obtiene los detalles de un servicio específico
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalles del servicio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
r.get('/services/:id', getServiceByIdController)

/**
 * @swagger
 * /api/owner/services:
 *   post:
 *     summary: Crear servicio
 *     description: Crea un nuevo servicio para un taller
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - workshopId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               estimatedDuration:
 *                 type: integer
 *                 description: Duración estimada en minutos
 *               category:
 *                 type: string
 *               workshopId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Servicio creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
r.post(
  '/owner/services',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  validateBody(CreateServiceSchema),
  createServiceController
)

/**
 * @swagger
 * /api/owner/services/workshop/{workshopId}:
 *   get:
 *     summary: Listar servicios de un taller
 *     description: Obtiene todos los servicios de un taller específico
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workshopId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de servicios del taller
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
r.get(
  '/owner/services/workshop/:workshopId',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  listWorkshopServicesController
)

/**
 * @swagger
 * /api/owner/services/{id}:
 *   patch:
 *     summary: Actualizar servicio
 *     description: Actualiza los datos de un servicio
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               estimatedDuration:
 *                 type: integer
 *               category:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Servicio actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Eliminar servicio
 *     description: Elimina un servicio
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Servicio eliminado
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
r.patch(
  '/owner/services/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  validateBody(UpdateServiceSchema),
  updateServiceController
)

r.delete(
  '/owner/services/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  deleteServiceController
)

export default r
