import { Router } from 'express'
import {
  requireRole,
  requireUser,
  verifyToken,
} from '../../../auth/interfaces/middlewares/auth.middleware'
import { validateBody } from '../../../auth/interfaces/middlewares/validate-body'
import {
  createWorkshopController,
  deleteWorkshopController,
  getMyWorkshopsController,
  getWorkshopController,
  updateWorkshopController,
} from '../controllers/workshop.controller'
import { getWorkshopOrdersController } from '../../../orders/interfaces/controllers/order.controller'
import { requireActiveSubscription } from '../../../subscriptions/interfaces/middlewares/subscription.middleware'
import {
  CreateWorkshopSchema,
  UpdateWorkshopSchema,
} from './schemas/workshop.schemas'

const r = Router()

/**
 * @swagger
 * /api/owner/workshops:
 *   post:
 *     summary: Crear taller
 *     description: Crea un nuevo taller (solo WORKSHOP_OWNER)
 *     tags: [Workshops]
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
 *               - address
 *               - city
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Taller creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workshop'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
r.post(
  '/workshops',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  validateBody(CreateWorkshopSchema),
  createWorkshopController
)

/**
 * @swagger
 * /api/owner/workshops/mine:
 *   get:
 *     summary: Obtener mis talleres
 *     description: Lista todos los talleres del usuario autenticado
 *     tags: [Workshops]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de talleres del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Workshop'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
r.get(
  '/workshops/mine',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  getMyWorkshopsController
)

/**
 * @swagger
 * /api/owner/workshops/{id}:
 *   put:
 *     summary: Actualizar taller
 *     description: Actualiza los datos de un taller (requiere suscripción activa)
 *     tags: [Workshops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del taller
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
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Taller actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workshop'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Eliminar taller
 *     description: Elimina un taller (requiere suscripción activa)
 *     tags: [Workshops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del taller
 *     responses:
 *       200:
 *         description: Taller eliminado
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   get:
 *     summary: Obtener taller por ID
 *     description: Obtiene los detalles de un taller específico (público)
 *     tags: [Workshops]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del taller
 *     responses:
 *       200:
 *         description: Detalles del taller
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workshop'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
r.put(
  '/workshops/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription,
  validateBody(UpdateWorkshopSchema),
  updateWorkshopController
)

r.delete(
  '/workshops/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription,
  deleteWorkshopController
)

r.get('/workshops/:id', getWorkshopController)

/**
 * @swagger
 * /api/owner/workshops/{id}/orders:
 *   get:
 *     summary: Obtener pedidos del taller
 *     description: Lista todos los pedidos de un taller (requiere suscripción activa)
 *     tags: [Workshops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
r.get(
  '/workshops/:id/orders',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription,
  getWorkshopOrdersController
)

export default r
