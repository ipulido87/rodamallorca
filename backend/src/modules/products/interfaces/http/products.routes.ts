import { Router } from 'express'
import {
  requireRole,
  requireUser,
  verifyToken,
} from '../../../auth/interfaces/middlewares/auth.middleware'
import { validateBody } from '../../../auth/interfaces/middlewares/validate-body'
import {
  createProduct,
  deleteProduct,
  getMyProducts,
  getProductById,
  publishProduct,
  updateProduct,
} from '../controllers/product.controller'
import { requireActiveSubscription } from '../../../subscriptions/interfaces/middlewares/subscription.middleware'
import {
  CreateProductSchema,
  UpdateProductSchema,
} from './schemas/product.schemas'

const r = Router()

// POST /api/owner/products - Crear producto
r.post(
  '/products',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription, // ⭐ Requiere suscripción activa
  validateBody(CreateProductSchema),
  createProduct
)

// GET /api/owner/products/mine - Obtener mis productos
r.get(
  '/products/mine',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription, // ⭐ Requiere suscripción activa
  getMyProducts
)

// GET /api/owner/products/:id - Obtener producto específico
r.get(
  '/products/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription, // ⭐ Requiere suscripción activa
  getProductById
)

// PUT /api/owner/products/:id - Actualizar producto
r.put(
  '/products/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription, // ⭐ Requiere suscripción activa
  validateBody(UpdateProductSchema),
  updateProduct
)

// POST /api/owner/products/:id/publish - Publicar producto
r.post(
  '/products/:id/publish',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription, // ⭐ Requiere suscripción activa
  publishProduct
)

// DELETE /api/owner/products/:id - Eliminar producto
r.delete(
  '/products/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription, // ⭐ Requiere suscripción activa
  deleteProduct
)

export default r
