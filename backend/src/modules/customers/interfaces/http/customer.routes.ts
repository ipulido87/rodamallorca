// backend/src/modules/customers/interfaces/http/customer.routes.ts
import { Router } from 'express'
import { verifyToken } from '../../../auth/interfaces/middlewares/auth.middleware'
import {
  getCustomersController,
  getCustomerByIdController,
  createCustomerController,
  updateCustomerController,
  deleteCustomerController,
} from './customer.controller'

const router = Router()

// Todas las rutas requieren autenticación
router.get('/', verifyToken, getCustomersController)
router.get('/:id', verifyToken, getCustomerByIdController)
router.post('/', verifyToken, createCustomerController)
router.put('/:id', verifyToken, updateCustomerController)
router.delete('/:id', verifyToken, deleteCustomerController)

export default router
