import { Router } from 'express'
import {
  requireRole,
  requireUser,
  verifyToken,
} from '../../../auth/interfaces/middlewares/auth.middleware'
import {
  createWorkshopController,
  deleteWorkshopController,
  getMyWorkshopsController,
  getWorkshopController,
  updateWorkshopController,
} from '../controllers/workshop.controller'

const r = Router()

// POST /api/owner/workshops (solo WORKSHOP_OWNER)
r.post(
  '/workshops',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  createWorkshopController
)

r.get(
  '/workshops/mine',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  getMyWorkshopsController
)

r.put(
  '/workshops/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  updateWorkshopController
)

r.delete(
  '/workshops/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  deleteWorkshopController
)

// GET /api/catalog/workshops/:id - Público
r.get('/workshops/:id', getWorkshopController)

// GET /api/owner/workshops/mine - Obtener mis talleres

export default r
