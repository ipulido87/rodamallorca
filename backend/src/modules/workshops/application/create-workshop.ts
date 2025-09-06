import { WorkshopRepository } from '../domain/repositories/workshop-repository'

export async function createWorkshop(
  input: {
    ownerId: string
    name: string
    description?: string | null
    address?: string | null
    city?: string | null
    country?: string | null
    phone?: string | null
  },
  deps: { repo: WorkshopRepository }
) {
  if (!input.name.trim()) throw new Error('Workshop name required')
  return deps.repo.create(input)
}
