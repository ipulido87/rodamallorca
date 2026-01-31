// backend/src/modules/customers/interfaces/http/customer.routes.ts
import { Router } from 'express'
import { verifyToken } from '../../../auth/interfaces/middlewares/auth.middleware'
import { validateBody, validateParams } from '../../../auth/interfaces/middlewares/validate-body'
import {
  getCustomersController,
  getCustomerByIdController,
  createCustomerController,
  updateCustomerController,
  deleteCustomerController,
} from './customer.controller'
import { CreateCustomerSchema, UpdateCustomerSchema } from './schemas/customer.schemas'
import { UuidParamSchema } from '../../../../lib/schemas/common.schemas'

const router = Router()

// Todas las rutas requieren autenticación
router.get('/', verifyToken, getCustomersController)
router.get('/:id', verifyToken, validateParams(UuidParamSchema), getCustomerByIdController)
router.post('/', verifyToken, validateBody(CreateCustomerSchema), createCustomerController)
router.put('/:id', verifyToken, validateParams(UuidParamSchema), validateBody(UpdateCustomerSchema), updateCustomerController)
router.delete('/:id', verifyToken, validateParams(UuidParamSchema), deleteCustomerController)

export default router
