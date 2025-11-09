import { Router } from 'express'
import { asyncHandler } from '../../../../utils/async-handler'
import { authenticate } from '../../../auth/interfaces/middlewares/auth.middleware'
import {
  cancelOrderController,
  createOrderController,
  getOrderController,
  getUserOrdersController,
  getWorkshopOrdersController,
  updateOrderStatusController,
} from '../controllers/order.controller'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

// Crear un nuevo pedido
router.post('/', asyncHandler(createOrderController))

// Obtener un pedido por ID
router.get('/:id', asyncHandler(getOrderController))

// Obtener pedidos de un usuario
router.get('/user/:userId', asyncHandler(getUserOrdersController))

// Obtener pedidos de un taller
router.get('/workshop/:workshopId', asyncHandler(getWorkshopOrdersController))

// Actualizar estado de un pedido
router.patch('/:id/status', asyncHandler(updateOrderStatusController))

// Cancelar un pedido
router.post('/:id/cancel', asyncHandler(cancelOrderController))

export default router
