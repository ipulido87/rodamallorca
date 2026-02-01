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

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Crear pedido
 *     description: Crea un nuevo pedido de productos o servicios
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workshopId
 *               - items
 *             properties:
 *               workshopId:
 *                 type: string
 *                 format: uuid
 *               notes:
 *                 type: string
 *                 nullable: true
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *     responses:
 *       201:
 *         description: Pedido creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', validateBody(createOrderSchema), createOrderController)

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Obtener pedido
 *     description: Devuelve los detalles de un pedido específico
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del pedido
 *     responses:
 *       200:
 *         description: Detalles del pedido
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Order'
 *                 - type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/OrderItem'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', validateParams(UuidParamSchema), getOrderController)

/**
 * @swagger
 * /api/orders/user/{userId}:
 *   get:
 *     summary: Obtener pedidos de un usuario
 *     description: Lista todos los pedidos realizados por un usuario
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de pedidos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/user/:userId', validateParams(UserIdParamSchema), getUserOrdersController)

/**
 * @swagger
 * /api/orders/workshop/{workshopId}:
 *   get:
 *     summary: Obtener pedidos de un taller
 *     description: Lista todos los pedidos recibidos por un taller
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workshopId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del taller
 *     responses:
 *       200:
 *         description: Lista de pedidos del taller
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/workshop/:workshopId', validateParams(WorkshopIdParamSchema), getWorkshopOrdersController)

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Actualizar estado del pedido
 *     description: Cambia el estado de un pedido (solo talleres)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, IN_PROGRESS, READY, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Estado actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/:id/status', validateParams(UuidParamSchema), validateBody(updateOrderStatusSchema), updateOrderStatusController)

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   post:
 *     summary: Cancelar pedido
 *     description: Cancela un pedido (solo el propietario o admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del pedido
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Motivo de la cancelación
 *     responses:
 *       200:
 *         description: Pedido cancelado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: No se puede cancelar (ya completado o cancelado)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:id/cancel', validateParams(UuidParamSchema), validateBody(cancelOrderSchema), cancelOrderController)

export default router
