import { Router } from 'express'
import {
  requireRole,
  requireUser,
  verifyToken,
} from '../../../auth/interfaces/middlewares/auth.middleware'
import { validateBody } from '../../../auth/interfaces/middlewares/validate-body'
import {
  createCustomerController,
  listCustomersController,
  createInvoiceSeriesController,
  listInvoiceSeriesController,
  createInvoiceController,
  listInvoicesController,
  getInvoiceByIdController,
  updateInvoiceController,
  deleteInvoiceController,
  getWorkshopStatsController,
} from '../controllers/billing.controller'
import { requireActiveSubscription } from '../../../subscriptions/interfaces/middlewares/subscription.middleware'
import {
  CreateCustomerSchema,
  CreateInvoiceSeriesSchema,
  CreateInvoiceSchema,
  UpdateInvoiceSchema,
} from './schemas/billing.schemas'

const r = Router()

/**
 * @swagger
 * /api/owner/billing/customers:
 *   post:
 *     summary: Crear cliente de facturación
 *     description: Crea un cliente para facturación (requiere suscripción activa)
 *     tags: [Billing]
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
 *               - name
 *               - taxId
 *             properties:
 *               workshopId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               taxId:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente creado
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
r.post(
  '/owner/billing/customers',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription,
  validateBody(CreateCustomerSchema),
  createCustomerController
)

/**
 * @swagger
 * /api/owner/billing/customers/workshop/{workshopId}:
 *   get:
 *     summary: Listar clientes de facturación
 *     description: Lista todos los clientes de facturación de un taller
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workshopId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de clientes
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
r.get(
  '/owner/billing/customers/workshop/:workshopId',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription,
  listCustomersController
)

/**
 * @swagger
 * /api/owner/billing/invoice-series:
 *   post:
 *     summary: Crear serie de facturación
 *     description: Crea una nueva serie de numeración de facturas
 *     tags: [Billing]
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
 *               - prefix
 *             properties:
 *               workshopId:
 *                 type: string
 *                 format: uuid
 *               prefix:
 *                 type: string
 *                 description: Prefijo de la serie (ej. "FAC", "A")
 *               startNumber:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       201:
 *         description: Serie creada
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
r.post(
  '/owner/billing/invoice-series',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription,
  validateBody(CreateInvoiceSeriesSchema),
  createInvoiceSeriesController
)

/**
 * @swagger
 * /api/owner/billing/invoice-series/workshop/{workshopId}:
 *   get:
 *     summary: Listar series de facturación
 *     description: Lista todas las series de facturación de un taller
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workshopId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de series
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
r.get(
  '/owner/billing/invoice-series/workshop/:workshopId',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription,
  listInvoiceSeriesController
)

/**
 * @swagger
 * /api/owner/billing/invoices:
 *   post:
 *     summary: Crear factura
 *     description: Crea una nueva factura
 *     tags: [Billing]
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
 *               - customerId
 *               - seriesId
 *               - items
 *             properties:
 *               workshopId:
 *                 type: string
 *                 format: uuid
 *               customerId:
 *                 type: string
 *                 format: uuid
 *               seriesId:
 *                 type: string
 *                 format: uuid
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unitPrice:
 *                       type: number
 *                     taxRate:
 *                       type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Factura creada
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
r.post(
  '/owner/billing/invoices',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription,
  validateBody(CreateInvoiceSchema),
  createInvoiceController
)

/**
 * @swagger
 * /api/owner/billing/invoices/workshop/{workshopId}:
 *   get:
 *     summary: Listar facturas
 *     description: Lista todas las facturas de un taller
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workshopId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, SENT, PAID, CANCELLED]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de facturas
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
r.get(
  '/owner/billing/invoices/workshop/:workshopId',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription,
  listInvoicesController
)

/**
 * @swagger
 * /api/owner/billing/invoices/{id}:
 *   get:
 *     summary: Obtener factura por ID
 *     description: Obtiene los detalles de una factura
 *     tags: [Billing]
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
 *         description: Detalles de la factura
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   patch:
 *     summary: Actualizar factura
 *     description: Actualiza una factura (solo si está en borrador)
 *     tags: [Billing]
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
 *               status:
 *                 type: string
 *                 enum: [DRAFT, SENT, PAID, CANCELLED]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Factura actualizada
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Eliminar factura
 *     description: Elimina una factura (solo si está en borrador)
 *     tags: [Billing]
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
 *         description: Factura eliminada
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
r.get(
  '/owner/billing/invoices/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription,
  getInvoiceByIdController
)

r.patch(
  '/owner/billing/invoices/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription,
  validateBody(UpdateInvoiceSchema),
  updateInvoiceController
)

r.delete(
  '/owner/billing/invoices/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription,
  deleteInvoiceController
)

/**
 * @swagger
 * /api/owner/billing/workshops/{workshopId}/stats:
 *   get:
 *     summary: Obtener estadísticas de facturación
 *     description: Obtiene estadísticas de facturación de un taller
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workshopId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Año para las estadísticas
 *     responses:
 *       200:
 *         description: Estadísticas de facturación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalInvoiced:
 *                   type: number
 *                 totalPaid:
 *                   type: number
 *                 totalPending:
 *                   type: number
 *                 invoiceCount:
 *                   type: integer
 *                 monthlyStats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: integer
 *                       total:
 *                         type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
r.get(
  '/owner/billing/workshops/:workshopId/stats',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription,
  getWorkshopStatsController
)

export default r
