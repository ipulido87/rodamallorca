import { API } from '../../auth/services/auth-service'

export interface WorkshopStats {
  currentMonth: {
    revenue: number // en céntimos
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
  monthlySales: Array<{
    month: string // "2025-01"
    revenue: number
    invoiceCount: number
    taxAmount: number
  }>
  growth: {
    revenueChange: number // porcentaje
    invoiceChange: number
  }
}

export const getWorkshopStats = async (workshopId: string): Promise<WorkshopStats> => {
  const response = await API.get(`/owner/billing/workshops/${workshopId}/stats`)
  return response.data
}

export const formatCurrency = (amountInCents: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amountInCents / 100)
}

export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

export const formatMonthName = (monthStr: string): string => {
  const [year, month] = monthStr.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
}
