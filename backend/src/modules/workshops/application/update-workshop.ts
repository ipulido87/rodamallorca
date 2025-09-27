import { WorkshopRepository } from '../domain/repositories/workshop-repository'

export async function updateWorkshop(
  id: string,
  input: {
    name?: string
    description?: string | null
    address?: string | null
    city?: string | null
    country?: string | null
    phone?: string | null
  },
  deps: { repo: WorkshopRepository }
) {
  const workshop = await deps.repo.update(id, input)
  if (!workshop) {
    throw new Error('Workshop not found')
  }
  return workshop
}
