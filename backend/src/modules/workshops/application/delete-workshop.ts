import { WorkshopRepository } from '../domain/repositories/workshop-repository'

export async function deleteWorkshop(
  id: string,
  deps: { repo: WorkshopRepository }
) {
  const success = await deps.repo.delete(id)
  if (!success) {
    throw new Error('Workshop not found')
  }
  return { success: true }
}
