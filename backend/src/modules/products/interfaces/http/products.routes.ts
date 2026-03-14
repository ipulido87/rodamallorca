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

/**
 * @swagger
 * /api/owner/products:
 *   post:
 *     summary: Crear producto
 *     description: Crea un nuevo producto (requiere suscripción activa)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - workshopId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               category:
 *                 type: string
 *               workshopId:
 *                 type: string
 *                 format: uuid
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Producto creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
r.post(
  '/products',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription,
  validateBody(CreateProductSchema),
  createProduct
)

/**
 * @swagger
 * /api/owner/products/mine:
 *   get:
 *     summary: Obtener mis productos
 *     description: Lista todos los productos del usuario autenticado
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
r.get(
  '/products/mine',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription,
  getMyProducts
)

/**
 * @swagger
 * /api/owner/products/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     description: Obtiene los detalles de un producto específico
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalles del producto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   put:
 *     summary: Actualizar producto
 *     description: Actualiza los datos de un producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               category:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Producto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Eliminar producto
 *     description: Elimina un producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Producto eliminado
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
r.get(
  '/products/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription,
  getProductById
)

r.put(
  '/products/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription,
  validateBody(UpdateProductSchema),
  updateProduct
)

/**
 * @swagger
 * /api/owner/products/{id}/publish:
 *   post:
 *     summary: Publicar producto
 *     description: Publica un producto para que sea visible en el catálogo
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Producto publicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
r.post(
  '/products/:id/publish',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription,
  publishProduct
)

r.delete(
  '/products/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription,
  deleteProduct
)

export default r
