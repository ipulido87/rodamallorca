import type { NextFunction, Request, Response } from 'express'
import prisma from '../../../../lib/prisma'
import { billingRepositoryPrisma } from '../../infrastructure/persistence/prisma/billing-repository-prisma'
import { createCustomer } from '../../application/create-customer'
import { createInvoice } from '../../application/create-invoice'
import { listInvoicesByWorkshop, listCustomersByWorkshop } from '../../application/list-invoices'
import { getWorkshopStats } from '../../application/get-workshop-stats'

const repo = billingRepositoryPrisma

const workshopRepo = {
  async findById(id: string) {
    return prisma.workshop.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    })
  },
}

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

    // Validación ya realizada por middleware validateBody
    const body = req.body
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

    // Validación ya realizada por middleware validateBody
    const body = req.body
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

    // Validación ya realizada por middleware validateBody
    const body = req.body

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
    // Validación ya realizada por middleware validateBody
    const body = req.body

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

/**
 * GET /api/owner/billing/workshops/:workshopId/stats
 * Obtener estadísticas de ventas del taller
 */
export const getWorkshopStatsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    const { workshopId } = req.params

    // Verificar que el taller existe y pertenece al usuario
    const workshop = await workshopRepo.findById(workshopId)
    if (!workshop) {
      return res.status(404).json({ error: 'Taller no encontrado' })
    }

    if (workshop.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'No tienes permisos para ver las estadísticas de este taller' })
    }

    const stats = await getWorkshopStats(workshopId, { billingRepo: repo })

    res.json(stats)
  } catch (e) {
    next(e)
  }
}
