import { Prisma } from '@prisma/client'
import prisma from '../../../../../lib/prisma'
import type { BillingRepository } from '../../../domain/repositories/billing-repository'
import type {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceSeries,
  CreateInvoiceSeriesInput,
} from '../../../domain/entities/billing'

// Helper para convertir Decimal a number
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma Decimal mapping
function toDomainInvoice(prismaInvoice: any): Invoice {
  return {
    ...prismaInvoice,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma Decimal mapping
    items: prismaInvoice.items?.map((item: any) => ({
      ...item,
      quantity: item.quantity?.toNumber ? item.quantity.toNumber() : item.quantity,
      taxRate: item.taxRate?.toNumber ? item.taxRate.toNumber() : item.taxRate,
    })),
  }
}

export const billingRepositoryPrisma: BillingRepository = {
  // ==================== CUSTOMERS ====================
  async createCustomer(data: CreateCustomerInput): Promise<Customer> {
    const customer = await prisma.customer.create({
      data: {
        workshopId: data.workshopId,
        type: data.type || 'INDIVIDUAL',
        name: data.name,
        taxId: data.taxId,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country || 'España',
        notes: data.notes,
      },
    })
    return customer as Customer
  },

  async findCustomerById(id: string): Promise<Customer | null> {
    const customer = await prisma.customer.findUnique({
      where: { id },
    })
    return customer as Customer | null
  },

  async findCustomersByWorkshop(workshopId: string): Promise<Customer[]> {
    const customers = await prisma.customer.findMany({
      where: { workshopId },
      orderBy: { name: 'asc' },
    })
    return customers as Customer[]
  },

  async findCustomerByWorkshopAndEmail(workshopId: string, email: string): Promise<Customer | null> {
    const customer = await prisma.customer.findFirst({
      where: {
        workshopId,
        email,
      },
    })
    return customer as Customer | null
  },

  async updateCustomer(id: string, data: UpdateCustomerInput): Promise<Customer> {
    const customer = await prisma.customer.update({
      where: { id },
      data,
    })
    return customer as Customer
  },

  async deleteCustomer(id: string): Promise<void> {
    await prisma.customer.delete({
      where: { id },
    })
  },

  // ==================== INVOICE SERIES ====================
  async createInvoiceSeries(data: CreateInvoiceSeriesInput): Promise<InvoiceSeries> {
    const series = await prisma.invoiceSeries.create({
      data: {
        workshopId: data.workshopId,
        name: data.name,
        prefix: data.prefix,
        year: data.year,
        isDefault: data.isDefault || false,
      },
    })
    return series as InvoiceSeries
  },

  async findInvoiceSeriesByWorkshop(workshopId: string): Promise<InvoiceSeries[]> {
    const series = await prisma.invoiceSeries.findMany({
      where: { workshopId },
      orderBy: { year: 'desc' },
    })
    return series as InvoiceSeries[]
  },

  async findDefaultSeriesByWorkshop(workshopId: string): Promise<InvoiceSeries | null> {
    const series = await prisma.invoiceSeries.findFirst({
      where: {
        workshopId,
        isDefault: true,
      },
    })
    return series as InvoiceSeries | null
  },

  async getNextInvoiceNumber(seriesId: string): Promise<string> {
    const series = await prisma.invoiceSeries.findUnique({
      where: { id: seriesId },
    })

    if (!series) {
      throw new Error('Serie de facturación no encontrada')
    }

    const nextNumber = series.nextNumber
    const invoiceNumber = `${series.prefix}-${series.year}-${String(nextNumber).padStart(3, '0')}`

    // Incrementar el nextNumber
    await prisma.invoiceSeries.update({
      where: { id: seriesId },
      data: { nextNumber: nextNumber + 1 },
    })

    return invoiceNumber
  },

  // ==================== INVOICES ====================
  async createInvoice(data: CreateInvoiceInput): Promise<Invoice> {
    // Calcular totales
    let subtotal = 0
    let taxAmount = 0

    const itemsData = data.items.map((item) => {
      const itemSubtotal = item.quantity * item.unitPrice - (item.discount || 0)
      const itemTaxAmount = Math.round(itemSubtotal * ((item.taxRate || 21) / 100))
      const itemTotal = itemSubtotal + itemTaxAmount

      subtotal += itemSubtotal
      taxAmount += itemTaxAmount

      return {
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        taxRate: item.taxRate || 21,
        subtotal: itemSubtotal,
        taxAmount: itemTaxAmount,
        total: itemTotal,
      }
    })

    const total = subtotal + taxAmount

    // Generar número de factura
    const invoiceNumber = await billingRepositoryPrisma.getNextInvoiceNumber(data.seriesId)

    // Crear factura con sus items
    const invoice = await prisma.invoice.create({
      data: {
        workshopId: data.workshopId,
        customerId: data.customerId,
        seriesId: data.seriesId,
        orderId: data.orderId, // Vincular con el pedido si existe
        invoiceNumber,
        issueDate: data.issueDate || new Date(),
        dueDate: data.dueDate,
        status: data.status || 'DRAFT',
        subtotal,
        taxAmount,
        total,
        notes: data.notes,
        internalNotes: data.internalNotes,
        paymentMethod: data.paymentMethod,
        items: {
          create: itemsData,
        },
      },
      include: {
        customer: true,
        series: true,
        items: true,
      },
    })

    return toDomainInvoice(invoice)
  },

  async findInvoiceById(id: string): Promise<Invoice | null> {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        series: true,
        items: true,
      },
    })
    return invoice ? toDomainInvoice(invoice) : null
  },

  async findInvoiceByIdWithDetails(id: string): Promise<any | null> {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
      },
    })
    return invoice
  },

  async findInvoiceByOrderId(orderId: string): Promise<Invoice | null> {
    const invoice = await prisma.invoice.findUnique({
      where: { orderId },
      include: {
        customer: true,
        series: true,
        items: true,
      },
    })
    return invoice ? toDomainInvoice(invoice) : null
  },

  async findInvoicesByWorkshop(
    workshopId: string,
    filters?: { status?: string; customerId?: string }
  ): Promise<Invoice[]> {
    const where: any = { workshopId }

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.customerId) {
      where.customerId = filters.customerId
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: true,
        series: true,
        items: true,
      },
      orderBy: { issueDate: 'desc' },
    })

    return invoices.map(toDomainInvoice)
  },

  async updateInvoice(id: string, data: UpdateInvoiceInput): Promise<Invoice> {
    const invoice = await prisma.invoice.update({
      where: { id },
      data,
      include: {
        customer: true,
        series: true,
        items: true,
      },
    })
    return toDomainInvoice(invoice)
  },

  async deleteInvoice(id: string): Promise<void> {
    await prisma.invoice.delete({
      where: { id },
    })
  },
}
