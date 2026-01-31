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
import { validateBody, validateParams } from '../../../auth/interfaces/middlewares/validate-body'
import {
  createOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
} from '../schemas/order-schemas'
import { UuidParamSchema, UserIdParamSchema, WorkshopIdParamSchema } from '../../../../lib/schemas/common.schemas'

const router = Router()

router.use(verifyToken) // ✅ Usa verifyToken

router.post('/', validateBody(createOrderSchema), createOrderController)
router.get('/:id', validateParams(UuidParamSchema), getOrderController)
router.get('/user/:userId', validateParams(UserIdParamSchema), getUserOrdersController)
router.get('/workshop/:workshopId', validateParams(WorkshopIdParamSchema), getWorkshopOrdersController)
router.patch('/:id/status', validateParams(UuidParamSchema), validateBody(updateOrderStatusSchema), updateOrderStatusController)
router.post('/:id/cancel', validateParams(UuidParamSchema), validateBody(cancelOrderSchema), cancelOrderController)

export default router
