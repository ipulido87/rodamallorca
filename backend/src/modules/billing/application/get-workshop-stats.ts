import type { BillingRepository } from '../domain/repositories/billing-repository'

interface MonthlyStats {
  month: string
  revenue: number
  invoiceCount: number
  taxAmount: number
}

export interface WorkshopStats {
  currentMonth: {
    revenue: number
    invoiceCount: number
    averageOrderValue: number
    taxCollected: number
    paidInvoices: number
    pendingInvoices: number
  }
  previousMonth: {
    revenue: number
    invoiceCount: number
  }
  monthlySales: MonthlyStats[]
  growth: {
    revenueChange: number
    invoiceChange: number
  }
}

interface GetWorkshopStatsDeps {
  billingRepo: BillingRepository
}

export async function getWorkshopStats(
  workshopId: string,
  deps: GetWorkshopStatsDeps
): Promise<WorkshopStats> {
  const { billingRepo } = deps
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const currentMonthStart = new Date(year, month - 1, 1)
  const currentMonthEnd = new Date(year, month, 0, 23, 59, 59)
  const previousMonthStart = new Date(year, month - 2, 1)
  const previousMonthEnd = new Date(year, month - 1, 0, 23, 59, 59)
  const sixMonthsAgo = new Date(year, month - 6, 1)

  const [currentMonthInvoices, previousMonthInvoices, last6MonthsInvoices] =
    await Promise.all([
      billingRepo.findInvoicesByWorkshopAndDateRange(workshopId, currentMonthStart, currentMonthEnd),
      billingRepo.findInvoicesByWorkshopAndDateRange(workshopId, previousMonthStart, previousMonthEnd),
      billingRepo.findInvoicesByWorkshopAndDateRange(workshopId, sixMonthsAgo),
    ])

  const currentRevenue = currentMonthInvoices.reduce((sum, inv) => sum + inv.total, 0)
  const currentTaxAmount = currentMonthInvoices.reduce((sum, inv) => sum + inv.taxAmount, 0)
  const currentInvoiceCount = currentMonthInvoices.length
  const currentAverage = currentInvoiceCount > 0 ? currentRevenue / currentInvoiceCount : 0
  const paidInvoices = currentMonthInvoices.filter((inv) => inv.status === 'PAID').length
  const pendingInvoices = currentMonthInvoices.filter(
    (inv) => inv.status === 'SENT' || inv.status === 'OVERDUE'
  ).length

  const previousRevenue = previousMonthInvoices.reduce((sum, inv) => sum + inv.total, 0)
  const previousInvoiceCount = previousMonthInvoices.length

  const revenueChange =
    previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0
  const invoiceChange =
    previousInvoiceCount > 0
      ? ((currentInvoiceCount - previousInvoiceCount) / previousInvoiceCount) * 100
      : 0

  const monthlySalesMap = new Map<string, MonthlyStats>()
  for (const invoice of last6MonthsInvoices) {
    const date = new Date(invoice.issueDate)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const entry = monthlySalesMap.get(monthKey) ?? { month: monthKey, revenue: 0, invoiceCount: 0, taxAmount: 0 }
    entry.revenue += invoice.total
    entry.invoiceCount += 1
    entry.taxAmount += invoice.taxAmount
    monthlySalesMap.set(monthKey, entry)
  }

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
      revenueChange: Math.round(revenueChange * 10) / 10,
      invoiceChange: Math.round(invoiceChange * 10) / 10,
    },
  }
}
