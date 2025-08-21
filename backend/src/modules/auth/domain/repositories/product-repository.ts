export interface ProductDTO {
  id: string
  workshopId: string
  title: string
  price: number
  currency: string
  status: 'DRAFT' | 'PUBLISHED' | 'SOLD'
  condition: 'new' | 'used' | 'refurb'
  categoryId?: string | null
}

export interface ProductRepository {
  createDraft(input: {
    workshopId: string
    title: string
    price: number
    currency?: string
    condition?: 'new' | 'used' | 'refurb'
    categoryId?: string | null
    description?: string | null
  }): Promise<ProductDTO>

  publish(productId: string, workshopId: string): Promise<void>

  update(
    productId: string,
    workshopId: string,
    patch: Partial<Omit<ProductDTO, 'id' | 'workshopId'>> & {
      description?: string | null
    }
  ): Promise<ProductDTO>

  findById(id: string): Promise<ProductDTO | null>

  search(params: {
    q?: string
    min?: number
    max?: number
    categoryId?: string
    city?: string
    page?: number
    size?: number
  }): Promise<{ items: ProductDTO[]; total: number }>
}
