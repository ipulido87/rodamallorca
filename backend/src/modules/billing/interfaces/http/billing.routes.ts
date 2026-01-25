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

// Rutas protegidas para dueños de taller - TODAS requieren suscripción activa

// === CUSTOMERS ===
r.post(
  '/owner/billing/customers',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription, // ⭐ Requiere suscripción activa
  validateBody(CreateCustomerSchema),
  createCustomerController
)

r.get(
  '/owner/billing/customers/workshop/:workshopId',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription, // ⭐ Requiere suscripción activa
  listCustomersController
)

// === INVOICE SERIES ===
r.post(
  '/owner/billing/invoice-series',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription, // ⭐ Requiere suscripción activa
  validateBody(CreateInvoiceSeriesSchema),
  createInvoiceSeriesController
)

r.get(
  '/owner/billing/invoice-series/workshop/:workshopId',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription, // ⭐ Requiere suscripción activa
  listInvoiceSeriesController
)

// === INVOICES ===
r.post(
  '/owner/billing/invoices',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription, // ⭐ Requiere suscripción activa
  validateBody(CreateInvoiceSchema),
  createInvoiceController
)

r.get(
  '/owner/billing/invoices/workshop/:workshopId',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription, // ⭐ Requiere suscripción activa
  listInvoicesController
)

r.get(
  '/owner/billing/invoices/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription, // ⭐ Requiere suscripción activa
  getInvoiceByIdController
)

r.patch(
  '/owner/billing/invoices/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription, // ⭐ Requiere suscripción activa
  validateBody(UpdateInvoiceSchema),
  updateInvoiceController
)

r.delete(
  '/owner/billing/invoices/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription, // ⭐ Requiere suscripción activa
  deleteInvoiceController
)

// === STATS ===
r.get(
  '/owner/billing/workshops/:workshopId/stats',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription, // ⭐ Requiere suscripción activa
  getWorkshopStatsController
)

export default r
