import type { BillingRepository } from '../domain/repositories/billing-repository'
import prisma from '../../../lib/prisma'

interface MonthlyStats {
  month: string // "2025-01"
  revenue: number // en céntimos
  invoiceCount: number
  taxAmount: number
}

export interface WorkshopStats {
  // Mes actual
  currentMonth: {
    revenue: number // Total facturado en céntimos
    invoiceCount: number // Número de facturas
    averageOrderValue: number // Promedio por factura
    taxCollected: number // IVA cobrado (21%)
    paidInvoices: number // Facturas pagadas
    pendingInvoices: number // Facturas pendientes
  }

  // Comparativa con mes anterior
  previousMonth: {
    revenue: number
    invoiceCount: number
  }

  // Tendencia (últimos 6 meses)
  monthlySales: MonthlyStats[]

  // Crecimiento
  growth: {
    revenueChange: number // Porcentaje de cambio vs mes anterior
    invoiceChange: number // Porcentaje de cambio vs mes anterior
  }
}

interface GetWorkshopStatsDeps {
  billingRepo: BillingRepository
}

/**
 * Obtiene estadísticas de ventas del taller
 */
export async function getWorkshopStats(
  workshopId: string,
  deps: GetWorkshopStatsDeps
): Promise<WorkshopStats> {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-12

  // Mes actual
  const currentMonthStart = new Date(currentYear, currentMonth - 1, 1)
  const currentMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59)

  // Mes anterior
  const previousMonthStart = new Date(currentYear, currentMonth - 2, 1)
  const previousMonthEnd = new Date(currentYear, currentMonth - 1, 0, 23, 59, 59)

  // Últimos 6 meses
  const sixMonthsAgo = new Date(currentYear, currentMonth - 6, 1)

  // Obtener facturas del mes actual
  const currentMonthInvoices = await prisma.invoice.findMany({
    where: {
      workshopId,
      issueDate: {
        gte: currentMonthStart,
        lte: currentMonthEnd,
      },
    },
  })

  // Obtener facturas del mes anterior
  const previousMonthInvoices = await prisma.invoice.findMany({
    where: {
      workshopId,
      issueDate: {
        gte: previousMonthStart,
        lte: previousMonthEnd,
      },
    },
  })

  // Obtener facturas de los últimos 6 meses agrupadas por mes
  const last6MonthsInvoices = await prisma.invoice.findMany({
    where: {
      workshopId,
      issueDate: {
        gte: sixMonthsAgo,
      },
    },
    orderBy: {
      issueDate: 'asc',
    },
  })

  // Calcular estadísticas del mes actual
  const currentRevenue = currentMonthInvoices.reduce((sum, inv) => sum + inv.total, 0)
  const currentTaxAmount = currentMonthInvoices.reduce((sum, inv) => sum + inv.taxAmount, 0)
  const currentInvoiceCount = currentMonthInvoices.length
  const currentAverage = currentInvoiceCount > 0 ? currentRevenue / currentInvoiceCount : 0
  const paidInvoices = currentMonthInvoices.filter((inv) => inv.status === 'PAID').length
  const pendingInvoices = currentMonthInvoices.filter(
    (inv) => inv.status === 'SENT' || inv.status === 'OVERDUE'
  ).length

  // Calcular estadísticas del mes anterior
  const previousRevenue = previousMonthInvoices.reduce((sum, inv) => sum + inv.total, 0)
  const previousInvoiceCount = previousMonthInvoices.length

  // Calcular crecimiento
  const revenueChange =
    previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0
  const invoiceChange =
    previousInvoiceCount > 0
      ? ((currentInvoiceCount - previousInvoiceCount) / previousInvoiceCount) * 100
      : 0

  // Agrupar ventas por mes (últimos 6 meses)
  const monthlySalesMap = new Map<string, MonthlyStats>()

  last6MonthsInvoices.forEach((invoice) => {
    const date = new Date(invoice.issueDate)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!monthlySalesMap.has(monthKey)) {
      monthlySalesMap.set(monthKey, {
        month: monthKey,
        revenue: 0,
        invoiceCount: 0,
        taxAmount: 0,
      })
    }

    const monthData = monthlySalesMap.get(monthKey)!
    monthData.revenue += invoice.total
    monthData.invoiceCount += 1
    monthData.taxAmount += invoice.taxAmount
  })

  const monthlySales = Array.from(monthlySalesMap.values()).sort((a, b) =>
    a.month.localeCompare(b.month)
  )

  return {
    currentMonth: {
      revenue: currentRevenue,
      invoiceCount: currentInvoiceCount,
      averageOrderValue: Math.round(currentAverage),
      taxCollected: currentTaxAmount,
      paidInvoices,
      pendingInvoices,
    },
    previousMonth: {
      revenue: previousRevenue,
      invoiceCount: previousInvoiceCount,
    },
    monthlySales,
    growth: {
      revenueChange: Math.round(revenueChange * 10) / 10, // 1 decimal
      invoiceChange: Math.round(invoiceChange * 10) / 10,
    },
  }
}
