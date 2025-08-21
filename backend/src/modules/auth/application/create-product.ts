import { ProductRepository } from '../domain/repositories/product-repository'

export async function createProductDraft(
  input: {
    workshopId: string
    title: string
    price: number
    currency?: string
    condition?: 'new' | 'used' | 'refurb'
    categoryId?: string | null
    description?: string | null
  },
  deps: { repo: ProductRepository }
) {
  if (!input.title.trim()) throw new Error('Title required')
  if (input.price < 0) throw new Error('Price must be >= 0')
  return deps.repo.createDraft(input)
}
