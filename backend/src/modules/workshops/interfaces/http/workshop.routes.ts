import { Router } from 'express'
import prisma from '../../../../lib/prisma'
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

// GET /api/owner/workshops/mine - Obtener mis talleres
r.get(
  '/workshops/mine',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  async (req, res, next) => {
    try {
      const workshops = await prisma.workshop.findMany({
        where: { ownerId: req.user!.id },
        orderBy: { createdAt: 'desc' },
      })
      res.json(workshops)
    } catch (e) {
      next(e)
    }
  }
)

export default r
