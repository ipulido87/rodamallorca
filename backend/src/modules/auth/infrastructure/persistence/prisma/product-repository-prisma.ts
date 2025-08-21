import { PrismaClient } from '@prisma/client'
import {
  ProductDTO,
  ProductRepository,
} from '../../../domain/repositories/product-repository'

const prisma = new PrismaClient()

export class ProductRepositoryPrisma implements ProductRepository {
  createDraft(input: {
    workshopId: string
    title: string
    price: number
    currency?: string
    condition?: 'new' | 'used' | 'refurb'
    categoryId?: string | null
    description?: string | null
  }): Promise<ProductDTO> {
    throw new Error('Method not implemented.')
  }
  publish(productId: string, workshopId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  update(
    productId: string,
    workshopId: string,
    patch: Partial<Omit<ProductDTO, 'id' | 'workshopId'>> & {
      description?: string | null
    }
  ): Promise<ProductDTO> {
    throw new Error('Method not implemented.')
  }
  findById(id: string): Promise<ProductDTO | null> {
    throw new Error('Method not implemented.')
  }
  search(params: {
    q?: string
    min?: number
    max?: number
    categoryId?: string
    city?: string
    page?: number
    size?: number
  }): Promise<{ items: ProductDTO[]; total: number }> {
    throw new Error('Method not implemented.')
  }
  // ... métodos (createDraft, publish, update, findById, search)
}
