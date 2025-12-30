import { Router } from 'express'
import {
  requireRole,
  requireUser,
  verifyToken,
} from '../../../auth/interfaces/middlewares/auth.middleware'
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

const r = Router()

// Rutas protegidas para dueños de taller

// === CUSTOMERS ===
r.post(
  '/owner/billing/customers',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  createCustomerController
)

r.get(
  '/owner/billing/customers/workshop/:workshopId',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  listCustomersController
)

// === INVOICE SERIES ===
r.post(
  '/owner/billing/invoice-series',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  createInvoiceSeriesController
)

r.get(
  '/owner/billing/invoice-series/workshop/:workshopId',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  listInvoiceSeriesController
)

// === INVOICES ===
r.post(
  '/owner/billing/invoices',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  createInvoiceController
)

r.get(
  '/owner/billing/invoices/workshop/:workshopId',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  listInvoicesController
)

r.get(
  '/owner/billing/invoices/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  getInvoiceByIdController
)

r.patch(
  '/owner/billing/invoices/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  updateInvoiceController
)

r.delete(
  '/owner/billing/invoices/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  deleteInvoiceController
)

// === STATS ===
r.get(
  '/owner/billing/workshops/:workshopId/stats',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  getWorkshopStatsController
)

export default r
