import { WorkshopRepository } from '../domain/repositories/workshop-repository'

export async function createWorkshop(
  input: {
    name: string
    description?: string | null
    address?: string | null
    city?: string | null
    country?: string | null
    phone?: string | null
    ownerId: string
  },
  deps: {
    repo: WorkshopRepository
    authenticatedUserId: string
  }
) {
  if (!input.name.trim()) throw new Error('Workshop name required')

  return deps.repo.create({
    ...input,
    ownerId: deps.authenticatedUserId,
  })
}
