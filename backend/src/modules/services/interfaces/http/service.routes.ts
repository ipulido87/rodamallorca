import { Router } from 'express'
import {
  requireRole,
  requireUser,
  verifyToken,
} from '../../../auth/interfaces/middlewares/auth.middleware'
import {
  createServiceController,
  deleteServiceController,
  getServiceByIdController,
  listServiceCategoriesController,
  listWorkshopServicesController,
  searchServicesController,
  updateServiceController,
} from '../controllers/service.controller'

const r = Router()

// Rutas públicas (sin autenticación)

// GET /api/service-categories - Obtener todas las categorías de servicios
r.get('/service-categories', listServiceCategoriesController)

// GET /api/services - Buscar servicios (catálogo público)
r.get('/services', searchServicesController)

// GET /api/services/:id - Obtener un servicio por ID
r.get('/services/:id', getServiceByIdController)

// Rutas protegidas para dueños de taller

// POST /api/owner/services - Crear un nuevo servicio
r.post(
  '/owner/services',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  createServiceController
)

// GET /api/owner/services/workshop/:workshopId - Listar servicios de un taller
r.get(
  '/owner/services/workshop/:workshopId',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  listWorkshopServicesController
)

// PATCH /api/owner/services/:id - Actualizar un servicio
r.patch(
  '/owner/services/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  updateServiceController
)

// DELETE /api/owner/services/:id - Eliminar un servicio
r.delete(
  '/owner/services/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  deleteServiceController
)

export default r
