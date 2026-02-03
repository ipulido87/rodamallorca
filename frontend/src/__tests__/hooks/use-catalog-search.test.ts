import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useCatalogSearch } from '@/features/catalog/hooks/use-catalog-search'
import type {
  Product,
  Workshop,
  Service,
  PaginatedResponse,
} from '@/features/catalog/types/catalog'

// Mock the catalog service
vi.mock('@/features/catalog/services/catalog-service', () => ({
  searchProducts: vi.fn(),
  searchWorkshops: vi.fn(),
  searchServices: vi.fn(),
}))

const { searchProducts, searchWorkshops, searchServices } = await import(
  '@/features/catalog/services/catalog-service'
)
const mockedSearchProducts = vi.mocked(searchProducts)
const mockedSearchWorkshops = vi.mocked(searchWorkshops)
const mockedSearchServices = vi.mocked(searchServices)

const mockProduct: Product = {
  id: '1',
  title: 'Test Product',
  description: 'A test product',
  price: 100,
  status: 'PUBLISHED',
  categoryId: 'c1',
  workshopId: 'w1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  workshop: {
    id: 'w1',
    name: 'Test Workshop',
    city: 'Barcelona',
  },
  category: {
    id: 'c1',
    name: 'Bikes',
  },
  images: [],
}

const mockProductsResponse: PaginatedResponse<Product> = {
  items: [mockProduct],
  total: 1,
  page: 1,
  size: 12,
}

const mockWorkshop: Workshop = {
  id: 'w1',
  ownerId: 'u1',
  name: 'Test Workshop',
  description: 'A test workshop',
  city: 'Barcelona',
  address: 'Calle Test 123',
  phone: '123456789',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const mockWorkshopsResponse: PaginatedResponse<Workshop> = {
  items: [mockWorkshop],
  total: 1,
  page: 1,
  size: 12,
}

const mockService: Service = {
  id: 's1',
  workshopId: 'w1',
  serviceCategoryId: 'sc1',
  name: 'Test Service',
  description: 'A test service',
  price: 50,
  currency: 'EUR',
  vehicleType: 'BICYCLE',
  status: 'ACTIVE',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  workshop: {
    id: 'w1',
    name: 'Test Workshop',
    city: 'Barcelona',
  },
  serviceCategory: {
    id: 'sc1',
    name: 'Repair',
  },
}

const mockServicesResponse: PaginatedResponse<Service> = {
  items: [mockService],
  total: 1,
  page: 1,
  size: 12,
}

describe('useCatalogSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should return empty arrays and default pagination', () => {
      const { result } = renderHook(() => useCatalogSearch())

      expect(result.current.products).toEqual([])
      expect(result.current.workshops).toEqual([])
      expect(result.current.services).toEqual([])

      expect(result.current.productsLoading).toBe(false)
      expect(result.current.workshopsLoading).toBe(false)
      expect(result.current.servicesLoading).toBe(false)

      expect(result.current.productsPagination).toEqual({
        total: 0,
        page: 1,
        size: 12,
        hasMore: false,
      })
    })
  })

  describe('loadProducts', () => {
    it('should load products successfully', async () => {
      mockedSearchProducts.mockResolvedValue(mockProductsResponse)

      const { result } = renderHook(() => useCatalogSearch())

      await act(async () => {
        await result.current.loadProducts()
      })

      await waitFor(() => {
        expect(result.current.products).toHaveLength(1)
        expect(result.current.products[0].title).toBe('Test Product')
        expect(result.current.productsLoading).toBe(false)
        expect(result.current.productsError).toBeNull()
      })
    })

    it('should set loading state while fetching products', async () => {
      let resolvePromise: (value: PaginatedResponse<Product>) => void
      const promise = new Promise<PaginatedResponse<Product>>((resolve) => {
        resolvePromise = resolve
      })
      mockedSearchProducts.mockReturnValue(promise)

      const { result } = renderHook(() => useCatalogSearch())

      act(() => {
        result.current.loadProducts()
      })

      expect(result.current.productsLoading).toBe(true)

      await act(async () => {
        resolvePromise!(mockProductsResponse)
        await promise
      })

      expect(result.current.productsLoading).toBe(false)
    })

    it('should handle error when loading products fails', async () => {
      mockedSearchProducts.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useCatalogSearch())

      await act(async () => {
        await result.current.loadProducts()
      })

      await waitFor(() => {
        expect(result.current.productsError).toBe('Error al cargar productos')
        expect(result.current.productsLoading).toBe(false)
      })
    })

    it('should pass query parameter when searching products', async () => {
      mockedSearchProducts.mockResolvedValue(mockProductsResponse)

      const { result } = renderHook(() => useCatalogSearch())

      await act(async () => {
        await result.current.loadProducts('bike')
      })

      expect(mockedSearchProducts).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'bike' })
      )
    })

    it('should pass filters to search products', async () => {
      mockedSearchProducts.mockResolvedValue(mockProductsResponse)

      const { result } = renderHook(() => useCatalogSearch())

      await act(async () => {
        await result.current.loadProducts('', {
          city: 'Barcelona',
          categoryId: 'cat1',
          condition: 'NEW',
          price: [0, 500],
        })
      })

      expect(mockedSearchProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          city: 'Barcelona',
          categoryId: 'cat1',
          condition: 'NEW',
          minPrice: 0,
          maxPrice: 500,
        })
      )
    })

    it('should calculate hasMore correctly based on pagination', async () => {
      mockedSearchProducts.mockResolvedValue({
        ...mockProductsResponse,
        total: 50,
        page: 1,
        size: 12,
      })

      const { result } = renderHook(() => useCatalogSearch())

      await act(async () => {
        await result.current.loadProducts()
      })

      await waitFor(() => {
        expect(result.current.productsPagination.hasMore).toBe(true)
      })
    })
  })

  describe('loadWorkshops', () => {
    it('should load workshops successfully', async () => {
      mockedSearchWorkshops.mockResolvedValue(mockWorkshopsResponse)

      const { result } = renderHook(() => useCatalogSearch())

      await act(async () => {
        await result.current.loadWorkshops()
      })

      await waitFor(() => {
        expect(result.current.workshops).toHaveLength(1)
        expect(result.current.workshops[0].name).toBe('Test Workshop')
        expect(result.current.workshopsError).toBeNull()
      })
    })

    it('should handle error when loading workshops fails', async () => {
      mockedSearchWorkshops.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useCatalogSearch())

      await act(async () => {
        await result.current.loadWorkshops()
      })

      await waitFor(() => {
        expect(result.current.workshopsError).toBe('Error al cargar talleres')
      })
    })

    it('should pass city filter when searching workshops', async () => {
      mockedSearchWorkshops.mockResolvedValue(mockWorkshopsResponse)

      const { result } = renderHook(() => useCatalogSearch())

      await act(async () => {
        await result.current.loadWorkshops('', { city: 'Madrid' })
      })

      expect(mockedSearchWorkshops).toHaveBeenCalledWith(
        expect.objectContaining({ city: 'Madrid' })
      )
    })
  })

  describe('loadServices', () => {
    it('should load services successfully', async () => {
      mockedSearchServices.mockResolvedValue(mockServicesResponse)

      const { result } = renderHook(() => useCatalogSearch())

      await act(async () => {
        await result.current.loadServices()
      })

      await waitFor(() => {
        expect(result.current.services).toHaveLength(1)
        expect(result.current.services[0].name).toBe('Test Service')
        expect(result.current.servicesError).toBeNull()
      })
    })

    it('should handle error when loading services fails', async () => {
      mockedSearchServices.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useCatalogSearch())

      await act(async () => {
        await result.current.loadServices()
      })

      await waitFor(() => {
        expect(result.current.servicesError).toBe('Error al cargar servicios')
      })
    })

    it('should pass vehicleType filter when searching services', async () => {
      mockedSearchServices.mockResolvedValue(mockServicesResponse)

      const { result } = renderHook(() => useCatalogSearch())

      await act(async () => {
        await result.current.loadServices('', { vehicleType: 'BICYCLE' })
      })

      expect(mockedSearchServices).toHaveBeenCalledWith(
        expect.objectContaining({ vehicleType: 'BICYCLE' })
      )
    })
  })

  describe('pagination', () => {
    it('should request correct page when paginating products', async () => {
      mockedSearchProducts.mockResolvedValue(mockProductsResponse)

      const { result } = renderHook(() => useCatalogSearch())

      await act(async () => {
        await result.current.loadProducts('', {}, 2)
      })

      expect(mockedSearchProducts).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      )
    })

    it('should update pagination state after loading', async () => {
      mockedSearchProducts.mockResolvedValue({
        items: [],
        total: 100,
        page: 3,
        size: 12,
      })

      const { result } = renderHook(() => useCatalogSearch())

      await act(async () => {
        await result.current.loadProducts('', {}, 3)
      })

      await waitFor(() => {
        expect(result.current.productsPagination).toEqual({
          total: 100,
          page: 3,
          size: 12,
          hasMore: true,
        })
      })
    })
  })
})
