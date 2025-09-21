import { Router } from 'express'
import {
  requireRole,
  requireUser,
  verifyToken,
} from '../../../auth/interfaces/middlewares/auth.middleware'
import {
  createProduct,
  deleteProduct,
  getCategories,
  getMyProducts,
  getProductById,
  publishProduct,
  updateProduct,
} from '../controllers/product.controller'

const r = Router()

// GET /api/categories - Obtener todas las categorías (sin autenticación)
r.get('/categories', getCategories)

// POST /api/owner/products - Crear producto
r.post(
  '/products',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  createProduct
)

// GET /api/owner/products/mine - Obtener mis productos
r.get(
  '/products/mine',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  getMyProducts
)

// GET /api/owner/products/:id - Obtener producto específico
r.get(
  '/products/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  getProductById
)

// PUT /api/owner/products/:id - Actualizar producto
r.put(
  '/products/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  updateProduct
)

// POST /api/owner/products/:id/publish - Publicar producto
r.post(
  '/products/:id/publish',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  publishProduct
)

// DELETE /api/owner/products/:id - Eliminar producto
r.delete(
  '/products/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  deleteProduct
)

export default r
