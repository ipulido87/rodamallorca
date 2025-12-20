import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../../../lib/prisma'
import { billingRepositoryPrisma } from '../../infrastructure/persistence/prisma/billing-repository-prisma'
import { createCustomer } from '../../application/create-customer'
import { createInvoice } from '../../application/create-invoice'
import { listInvoicesByWorkshop, listCustomersByWorkshop } from '../../application/list-invoices'

const repo = billingRepositoryPrisma

const workshopRepo = {
  async findById(id: string) {
    return prisma.workshop.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    })
  },
}

// Esquemas de validación
const createCustomerSchema = z.object({
  workshopId: z.string().uuid(),
  type: z.enum(['INDIVIDUAL', 'BUSINESS']).optional(),
  name: z.string().min(2),
  taxId: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
})

const createInvoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().min(0.01),
  unitPrice: z.number().int().min(0),
  discount: z.number().int().min(0).optional(),
  taxRate: z.number().min(0).max(100).optional(),
})

const createInvoiceSchema = z.object({
  workshopId: z.string().uuid(),
  customerId: z.string().uuid().optional(),
  seriesId: z.string().uuid(),
  issueDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  paymentMethod: z.string().optional(),
  items: z.array(createInvoiceItemSchema).min(1),
})

const updateInvoiceSchema = z.object({
  customerId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  paymentMethod: z.string().optional(),
  paidAt: z.string().datetime().optional(),
})

const createInvoiceSeriesSchema = z.object({
  workshopId: z.string().uuid(),
  name: z.string().min(1),
  prefix: z.string().min(1).max(10),
  year: z.number().int().min(2000).max(2100),
  isDefault: z.boolean().optional(),
})

/**
 * POST /api/owner/billing/customers
 * Crear un nuevo cliente
 */
export const createCustomerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    const body = createCustomerSchema.parse(req.body)
    const customer = await createCustomer(body, {
      repo,
      workshopRepo,
      authenticatedUserId: req.user.id,
    })

    res.status(201).json(customer)
  } catch (e) {
    next(e)
  }
}

/**
 * GET /api/owner/billing/customers/workshop/:workshopId
 * Listar clientes de un taller
 */
export const listCustomersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    const { workshopId } = req.params
    const customers = await listCustomersByWorkshop(workshopId, { repo })

    res.json(customers)
  } catch (e) {
    next(e)
  }
}

/**
 * POST /api/owner/billing/invoice-series
 * Crear una serie de facturación
 */
export const createInvoiceSeriesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    const body = createInvoiceSeriesSchema.parse(req.body)
    const series = await repo.createInvoiceSeries(body)

    res.status(201).json(series)
  } catch (e) {
    next(e)
  }
}

/**
 * GET /api/owner/billing/invoice-series/workshop/:workshopId
 * Listar series de facturación de un taller
 */
export const listInvoiceSeriesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    const { workshopId } = req.params
    let series = await repo.findInvoiceSeriesByWorkshop(workshopId)

    // Si no existe ninguna serie, crear una por defecto automáticamente
    if (series.length === 0) {
      const currentYear = new Date().getFullYear()
      const defaultSeries = await repo.createInvoiceSeries({
        workshopId,
        name: 'Serie Principal',
        prefix: 'F',
        year: currentYear,
        isDefault: true,
      })
      series = [defaultSeries]
    }

    res.json(series)
  } catch (e) {
    next(e)
  }
}

/**
 * POST /api/owner/billing/invoices
 * Crear una nueva factura
 */
export const createInvoiceController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    const body = createInvoiceSchema.parse(req.body)

    const invoice = await createInvoice(
      {
        ...body,
        issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      },
      {
        repo,
        workshopRepo,
        authenticatedUserId: req.user.id,
      }
    )

    res.status(201).json(invoice)
  } catch (e) {
    next(e)
  }
}

/**
 * GET /api/owner/billing/invoices/workshop/:workshopId
 * Listar facturas de un taller
 */
export const listInvoicesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    const { workshopId } = req.params
    const { status, customerId } = req.query

    const invoices = await listInvoicesByWorkshop(
      workshopId,
      {
        status: status as string,
        customerId: customerId as string,
      },
      { repo }
    )

    res.json(invoices)
  } catch (e) {
    next(e)
  }
}

/**
 * GET /api/owner/billing/invoices/:id
 * Obtener una factura por ID
 */
export const getInvoiceByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    const { id } = req.params
    const invoice = await repo.findInvoiceById(id)

    if (!invoice) {
      return res.status(404).json({ error: 'Factura no encontrada' })
    }

    res.json(invoice)
  } catch (e) {
    next(e)
  }
}

/**
 * PATCH /api/owner/billing/invoices/:id
 * Actualizar una factura
 */
export const updateInvoiceController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    const { id } = req.params
    const body = updateInvoiceSchema.parse(req.body)

    const invoice = await repo.updateInvoice(id, {
      ...body,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      paidAt: body.paidAt ? new Date(body.paidAt) : undefined,
    })

    res.json(invoice)
  } catch (e) {
    next(e)
  }
}

/**
 * DELETE /api/owner/billing/invoices/:id
 * Eliminar una factura
 */
export const deleteInvoiceController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    const { id } = req.params
    await repo.deleteInvoice(id)

    res.status(204).send()
  } catch (e) {
    next(e)
  }
}
