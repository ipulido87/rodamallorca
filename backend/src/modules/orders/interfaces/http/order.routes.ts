import { Router, Request, Response } from 'express'
import {
  requireUser,
  verifyToken,
} from '../../../auth/interfaces/middlewares/auth.middleware'

const router = Router()

// GET /api/orders - Obtener pedidos del usuario autenticado
router.get('/', verifyToken, requireUser, (req: Request, res: Response) => {
  // TODO: Implementar obtención de pedidos
  res.status(501).json({
    message: 'Módulo de pedidos en desarrollo',
    info: 'Esta funcionalidad estará disponible próximamente',
  })
})

// GET /api/orders/:id - Obtener un pedido específico
router.get(
  '/:id',
  verifyToken,
  requireUser,
  (req: Request, res: Response) => {
    // TODO: Implementar obtención de pedido específico
    res.status(501).json({
      message: 'Módulo de pedidos en desarrollo',
      info: 'Esta funcionalidad estará disponible próximamente',
    })
  }
)

export default router
