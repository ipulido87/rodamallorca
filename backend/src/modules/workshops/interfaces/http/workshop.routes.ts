import { Router } from 'express'
import {
  requireRole,
  requireUser,
  verifyToken,
} from '../../../auth/interfaces/middlewares/auth.middleware'
import { createWorkshopController } from '../controllers/workshop.controller'

const r = Router()

// POST /api/owner/workshops (solo WORKSHOP_OWNER)
r.post(
  '/workshops',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  createWorkshopController
)

export default r
