// frontend/src/features/catalog/hooks/useCatalogSearch.ts
import { useCallback, useState } from 'react'
import { searchProducts, searchWorkshops } from '../services/catalog-service'
import type {
  FilterValues,
  Product,
  ProductSearchParams,
  Workshop,
  WorkshopSearchParams,
} from '../types/catalog'

interface Pagination {
  total: number
  page: number
  size: number
  hasMore: boolean
}

interface UseCatalogSearchResult {
  // Products
  products: Product[]
  productsLoading: boolean
  productsError: string | null
  productsPagination: Pagination
  loadProducts: (
    query?: string,
    filters?: FilterValues,
    page?: number
  ) => Promise<void>

  // Workshops
  workshops: Workshop[]
  workshopsLoading: boolean
  workshopsError: string | null
  workshopsPagination: Pagination
  loadWorkshops: (
    query?: string,
    filters?: FilterValues,
    page?: number
  ) => Promise<void>
}

export const useCatalogSearch = (): UseCatalogSearchResult => {
  // Products state
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState<string | null>(null)
  const [productsPagination, setProductsPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    size: 12,
    hasMore: false,
  })

  // Workshops state
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [workshopsLoading, setWorkshopsLoading] = useState(false)
  const [workshopsError, setWorkshopsError] = useState<string | null>(null)
  const [workshopsPagination, setWorkshopsPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    size: 12,
    hasMore: false,
  })

  const loadProducts = useCallback(
    async (query?: string, filters?: FilterValues, page: number = 1) => {
      setProductsLoading(true)
      setProductsError(null)

      try {
        const params: ProductSearchParams = {
          page,
          size: 12,
        }

        if (query) params.q = query
        if (filters?.city && typeof filters.city === 'string')
          params.city = filters.city
        if (filters?.categoryId && typeof filters.categoryId === 'string') {
          params.categoryId = filters.categoryId
        }
        if (filters?.condition && typeof filters.condition === 'string') {
          params.condition = filters.condition
        }
        if (filters?.price && Array.isArray(filters.price)) {
          params.minPrice = filters.price[0]
          params.maxPrice = filters.price[1]
        }

        const response = await searchProducts(params)

        setProducts(response.items)
        setProductsPagination({
          total: response.total,
          page: response.page,
          size: response.size,
          hasMore: response.page * response.size < response.total,
        })
      } catch (error) {
        setProductsError('Error al cargar productos')
        console.error('Error loading products:', error)
      } finally {
        setProductsLoading(false)
      }
    },
    []
  )

  const loadWorkshops = useCallback(
    async (query?: string, filters?: FilterValues, page: number = 1) => {
      setWorkshopsLoading(true)
      setWorkshopsError(null)

      try {
        const params: WorkshopSearchParams = {
          page,
          size: 12,
        }

        if (query) params.q = query
        if (filters?.city && typeof filters.city === 'string')
          params.city = filters.city

        const response = await searchWorkshops(params)

        setWorkshops(response.items)
        setWorkshopsPagination({
          total: response.total,
          page: response.page,
          size: response.size,
          hasMore: response.page * response.size < response.total,
        })
      } catch (error) {
        setWorkshopsError('Error al cargar talleres')
        console.error('Error loading workshops:', error)
      } finally {
        setWorkshopsLoading(false)
      }
    },
    []
  )

  return {
    products,
    productsLoading,
    productsError,
    productsPagination,
    loadProducts,

    workshops,
    workshopsLoading,
    workshopsError,
    workshopsPagination,
    loadWorkshops,
  }
}
