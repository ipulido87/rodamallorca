import { Router } from 'express'
import { verifyToken } from '../../auth/interfaces/middlewares/auth.middleware'
import {
  getDirectoryWorkshops,
  claimWorkshop,
  getCities,
} from '../controllers/directory.controller'

const router = Router()

/**
 * Rutas del directorio público de talleres
 */

// GET /api/directory/workshops - Lista todos los talleres (público)
router.get('/workshops', getDirectoryWorkshops)

// GET /api/directory/cities - Lista de ciudades (público)
router.get('/cities', getCities)

// POST /api/directory/claim/:claimToken - Reclamar negocio (requiere auth)
router.post('/claim/:claimToken', verifyToken, claimWorkshop)

export default router
