import { Router } from 'express'
import {
  createOrderController,
  getOrderController,
  getUserOrdersController,
  getWorkshopOrdersController,
  updateOrderStatusController,
  cancelOrderController,
} from '../controllers/order.controller'
import { verifyToken } from '../../../../modules/auth/interfaces/middlewares/auth.middleware'

const router = Router()

router.use(verifyToken) // ✅ Usa verifyToken

router.post('/', createOrderController)
router.get('/:id', getOrderController)
router.get('/user/:userId', getUserOrdersController)
router.get('/workshop/:workshopId', getWorkshopOrdersController)
router.patch('/:id/status', updateOrderStatusController)
router.post('/:id/cancel', cancelOrderController)

export default router
