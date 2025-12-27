import type { BillingRepository } from '../domain/repositories/billing-repository'
import type { Invoice, Customer } from '../domain/entities/billing'
import prisma from '../../../lib/prisma'

interface Dependencies {
  billingRepo: BillingRepository
}

/**
 * Genera automáticamente una factura desde un pedido confirmado
 * @param orderId - ID del pedido
 * @param deps - Dependencias (billing repository)
 * @returns Invoice creada
 */
export const generateInvoiceFromOrder = async (
  orderId: string,
  deps: Dependencies
): Promise<Invoice> => {
  const { billingRepo } = deps

  // 1. Obtener el pedido con todos sus datos
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: {
        include: {
          product: true,
          service: true,
        },
      },
      workshop: true,
    },
  })

  if (!order) {
    throw new Error('Pedido no encontrado')
  }

  // Verificar que no exista ya una factura para este pedido
  const existingInvoice = await prisma.invoice.findUnique({
    where: { orderId },
  })

  if (existingInvoice) {
    throw new Error('Este pedido ya tiene una factura generada')
  }

  // 2. Buscar o crear cliente para el usuario del pedido
  let customer: Customer | null = await prisma.customer.findFirst({
    where: {
      workshopId: order.workshopId,
      email: order.user.email,
    },
  }) as Customer | null

  // Si no existe, crear cliente automáticamente
  if (!customer) {
    customer = await billingRepo.createCustomer({
      workshopId: order.workshopId,
      type: 'INDIVIDUAL',
      name: order.user.name || order.user.email,
      email: order.user.email,
      notes: `Cliente creado automáticamente desde pedido #${order.id.slice(0, 8)}`,
    })
  }

  // 3. Obtener la serie por defecto del taller
  let defaultSeries = await billingRepo.findDefaultSeriesByWorkshop(order.workshopId)

  // Si no existe serie, crear una por defecto
  if (!defaultSeries) {
    const currentYear = new Date().getFullYear()
    defaultSeries = await billingRepo.createInvoiceSeries({
      workshopId: order.workshopId,
      name: 'Serie Principal',
      prefix: 'F',
      year: currentYear,
      isDefault: true,
    })
  }

  // 4. Preparar items de factura desde items del pedido
  const invoiceItems = order.items.map((orderItem) => ({
    description: orderItem.product?.title || orderItem.service?.name || orderItem.description || 'Item sin descripción',
    quantity: orderItem.quantity,
    unitPrice: orderItem.priceAtOrder, // Ya viene en céntimos
    discount: 0,
    taxRate: 21, // IVA por defecto 21%
  }))

  // 5. Crear la factura
  const invoice = await billingRepo.createInvoice({
    workshopId: order.workshopId,
    customerId: customer.id,
    seriesId: defaultSeries.id,
    orderId: order.id, // Vincular con el pedido
    status: 'DRAFT', // Dejar en borrador para que el taller pueda revisar
    notes: `Factura generada automáticamente desde pedido\nFecha del pedido: ${order.createdAt.toLocaleDateString('es-ES')}${order.notes ? `\nNotas del cliente: ${order.notes}` : ''}`,
    internalNotes: `Generada automáticamente desde pedido #${order.id}`,
    items: invoiceItems,
  })

  return invoice
}
