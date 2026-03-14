import type { BillingRepository } from '../domain/repositories/billing-repository'
import type { Invoice, CreateInvoiceInput } from '../domain/entities/billing'
import { verifyWorkshopOwnership, verifyEntityExists } from '../../../lib/authorization'

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

  // Verificar que el taller existe y que el usuario es el dueño usando helper compartido
  await verifyWorkshopOwnership(data.workshopId, authenticatedUserId, workshopRepo)

  // Verificar que la serie existe
  const series = await repo.findInvoiceSeriesByWorkshop(data.workshopId)
  const seriesExists = series.some((s) => s.id === data.seriesId)

  if (!seriesExists) {
    throw new Error('Serie de facturación no encontrada')
  }

  // Verificar que el cliente existe (si se proporciona) usando helper compartido
  if (data.customerId) {
    const customer = await repo.findCustomerById(data.customerId)
    verifyEntityExists(customer, 'Cliente')
  }

  const invoice = await repo.createInvoice(data)
  return invoice
}
