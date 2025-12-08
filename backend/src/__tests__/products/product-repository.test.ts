import { ProductRepositoryPrisma } from '../../modules/products/infrastructure/persistence/prisma/product-repository-prisma'
import { PrismaClient } from '@prisma/client' // import de valor, no de tipo

// ===== Tipos mínimos usados por tus tests (sin any/unknown) =====
type Status = 'DRAFT' | 'PUBLISHED'
type Mode = 'insensitive' | 'default'

interface StringFilter {
  contains: string
  mode?: Mode
}
interface PriceFilter {
  gte?: number
  lte?: number
}

interface OrderByCreatedAt {
  createdAt: 'asc' | 'desc'
}

interface IncludeRefs {
  workshop?: boolean
  category?: boolean
}

interface ProductWhere {
  status?: Status
  title?: StringFilter
  price?: PriceFilter
  categoryId?: string | null
  workshop?: { city?: StringFilter }
  // añade aquí lo que vayas necesitando en otros tests
}

interface ProductRecord {
  id: string
  workshopId: string
  title: string
  price: number
  currency: string
  status: Status
  condition: 'new' | 'used'
  categoryId: string | null
  description: string | null
  createdAt: Date
  updatedAt: Date
  // relaciones opcionales para include
  workshop?: { id: string; name: string; city: string; country: string }
  category?: { id: string; name: string }
}

interface CreateArgs {
  data: {
    workshopId: string
    title: string
    price: number
    currency: string
    condition: 'new' | 'used'
    categoryId: string | null
    description: string | null
    status: Status
  }
}
interface UpdateManyArgs {
  where: { id: string; workshopId: string }
  data: Partial<
    Pick<
      ProductRecord,
      | 'title'
      | 'price'
      | 'currency'
      | 'condition'
      | 'categoryId'
      | 'description'
      | 'status'
    >
  >
}
interface FindUniqueArgs {
  where: { id: string }
  include?: IncludeRefs
}
interface FindManyArgs {
  where?: ProductWhere
  skip?: number
  take?: number
  orderBy?: OrderByCreatedAt
  include?: IncludeRefs
}
interface CountArgs {
  where?: ProductWhere
}

type CreateReturn = ProductRecord
type UpdateManyReturn = { count: number }
type FindUniqueReturn = ProductRecord | null
type FindManyReturn = ProductRecord[]
type CountReturn = number

interface MockPrismaClient {
  product: {
    create: jest.Mock<Promise<CreateReturn>, [CreateArgs]>
    updateMany: jest.Mock<Promise<UpdateManyReturn>, [UpdateManyArgs]>
    findUnique: jest.Mock<Promise<FindUniqueReturn>, [FindUniqueArgs]>
    findMany: jest.Mock<Promise<FindManyReturn>, [FindManyArgs]>
    count: jest.Mock<Promise<CountReturn>, [CountArgs]>
  }
}

// ===== Mock del módulo Prisma real, devolviendo nuestro cliente tipado =====
jest.mock('@prisma/client', () => {
  const mockPrismaClient: MockPrismaClient = {
    product: {
      create: jest.fn<Promise<CreateReturn>, [CreateArgs]>(),
      updateMany: jest.fn<Promise<UpdateManyReturn>, [UpdateManyArgs]>(),
      findUnique: jest.fn<Promise<FindUniqueReturn>, [FindUniqueArgs]>(),
      findMany: jest.fn<Promise<FindManyReturn>, [FindManyArgs]>(),
      count: jest.fn<Promise<CountReturn>, [CountArgs]>(),
    },
  }

  // Constructor que devuelve nuestro mock (y mantiene el export de valor)
  const PrismaClient = jest.fn<MockPrismaClient, []>(() => mockPrismaClient)

  return { PrismaClient }
})

// ==== A partir de aquí tu describe() tal cual ====

// Ejemplo de setup típico dentro de tus tests:
describe('Product Repository Prisma', () => {
  let repository: ProductRepositoryPrisma
  let prisma: MockPrismaClient

  beforeEach(() => {
    jest.clearAllMocks()
    repository = new ProductRepositoryPrisma()
    prisma = new PrismaClient() as unknown as MockPrismaClient
  })

  // ... tus casos (createDraft, publish, update, findById, search)
})
