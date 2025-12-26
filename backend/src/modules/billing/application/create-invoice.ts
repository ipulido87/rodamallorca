import type { BillingRepository } from '../domain/repositories/billing-repository'
import type { Invoice, CreateInvoiceInput } from '../domain/entities/billing'

interface CreateInvoiceDeps {
  repo: BillingRepository
  authenticatedUserId: string
}

interface WorkshopRepository {
  findById(id: string): Promise<{ id: string; ownerId: string } | null>
}

export async function createInvoice(
  data: CreateInvoiceInput,
  deps: CreateInvoiceDeps & { workshopRepo: WorkshopRepository }
): Promise<Invoice> {
  const { repo, workshopRepo, authenticatedUserId } = deps

  // Verificar que el taller existe y que el usuario es el dueño
  const workshop = await workshopRepo.findById(data.workshopId)

  if (!workshop) {
    throw new Error('Taller no encontrado')
  }

  if (workshop.ownerId !== authenticatedUserId) {
    throw new Error('No tienes permisos para crear facturas en este taller')
  }

  // Verificar que la serie existe
  const series = await repo.findInvoiceSeriesByWorkshop(data.workshopId)
  const seriesExists = series.some((s) => s.id === data.seriesId)

  if (!seriesExists) {
    throw new Error('Serie de facturación no encontrada')
  }

  // Verificar que el cliente existe (si se proporciona)
  if (data.customerId) {
    const customer = await repo.findCustomerById(data.customerId)
    if (!customer) {
      throw new Error('Cliente no encontrado')
    }
  }

  const invoice = await repo.createInvoice(data)
  return invoice
}
