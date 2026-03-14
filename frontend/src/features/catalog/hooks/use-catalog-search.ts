// frontend/src/features/catalog/hooks/useCatalogSearch.ts
import { useCallback, useState } from 'react'
import {
  searchProducts,
  searchServices,
  searchWorkshops,
} from '../services/catalog-service'
import type {
  FilterValues,
  Product,
  ProductSearchParams,
  Service,
  ServiceSearchParams,
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
    page?: number,
    size?: number
  ) => Promise<void>

  // Services
  services: Service[]
  servicesLoading: boolean
  servicesError: string | null
  servicesPagination: Pagination
  loadServices: (
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

  // Services state
  const [services, setServices] = useState<Service[]>([])
  const [servicesLoading, setServicesLoading] = useState(false)
  const [servicesError, setServicesError] = useState<string | null>(null)
  const [servicesPagination, setServicesPagination] = useState<Pagination>({
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
          size: 50,
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

        setProducts(prev => page === 1 ? response.items : [...prev, ...response.items])
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
    async (query?: string, filters?: FilterValues, page: number = 1, size: number = 12) => {
      setWorkshopsLoading(true)
      setWorkshopsError(null)

      try {
        const params: WorkshopSearchParams = {
          page,
          size,
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

  const loadServices = useCallback(
    async (query?: string, filters?: FilterValues, page: number = 1) => {
      setServicesLoading(true)
      setServicesError(null)

      try {
        const params: ServiceSearchParams = {
          page,
          size: 12,
        }

        if (query) params.q = query
        if (filters?.city && typeof filters.city === 'string')
          params.city = filters.city
        if (filters?.categoryId && typeof filters.categoryId === 'string')
          params.categoryId = filters.categoryId
        if (filters?.vehicleType && typeof filters.vehicleType === 'string')
          params.vehicleType = filters.vehicleType as ServiceSearchParams['vehicleType']

        const response = await searchServices(params)

        setServices(response.items)
        setServicesPagination({
          total: response.total,
          page: response.page,
          size: response.size,
          hasMore: response.page * response.size < response.total,
        })
      } catch (error) {
        setServicesError('Error al cargar servicios')
        console.error('Error loading services:', error)
      } finally {
        setServicesLoading(false)
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

    services,
    servicesLoading,
    servicesError,
    servicesPagination,
    loadServices,
  }
}
