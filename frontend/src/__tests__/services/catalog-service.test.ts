import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  searchProducts,
  searchWorkshops,
  searchServices,
  getProduct,
  getWorkshopById,
  catalogService,
} from '@/features/catalog/services/catalog-service'

// Mock the API module
vi.mock('@/features/auth/services/auth-service', () => ({
  API: {
    get: vi.fn(),
  },
}))

const { API } = await import('@/features/auth/services/auth-service')
const mockedAPI = vi.mocked(API)

describe('catalog-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('searchProducts', () => {
    const mockProductsResponse = {
      data: {
        items: [{ id: '1', name: 'Product 1' }],
        total: 1,
        page: 1,
        size: 12,
      },
    }

    it('should fetch products without params', async () => {
      mockedAPI.get.mockResolvedValue(mockProductsResponse)

      const result = await searchProducts()

      expect(mockedAPI.get).toHaveBeenCalledWith('/catalog/products')
      expect(result).toEqual(mockProductsResponse.data)
    })

    it('should build query string with search params', async () => {
      mockedAPI.get.mockResolvedValue(mockProductsResponse)

      await searchProducts({ q: 'bike', page: 2, size: 10 })

      expect(mockedAPI.get).toHaveBeenCalledWith(
        expect.stringContaining('/catalog/products?')
      )
      expect(mockedAPI.get).toHaveBeenCalledWith(
        expect.stringContaining('q=bike')
      )
      expect(mockedAPI.get).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      )
      expect(mockedAPI.get).toHaveBeenCalledWith(
        expect.stringContaining('size=10')
      )
    })

    it('should include city filter in query', async () => {
      mockedAPI.get.mockResolvedValue(mockProductsResponse)

      await searchProducts({ city: 'Barcelona' })

      expect(mockedAPI.get).toHaveBeenCalledWith(
        expect.stringContaining('city=Barcelona')
      )
    })

    it('should include category filter in query', async () => {
      mockedAPI.get.mockResolvedValue(mockProductsResponse)

      await searchProducts({ categoryId: 'cat123' })

      expect(mockedAPI.get).toHaveBeenCalledWith(
        expect.stringContaining('categoryId=cat123')
      )
    })

    it('should include price range in query', async () => {
      mockedAPI.get.mockResolvedValue(mockProductsResponse)

      await searchProducts({ minPrice: 10, maxPrice: 100 })

      expect(mockedAPI.get).toHaveBeenCalledWith(
        expect.stringContaining('minPrice=10')
      )
      expect(mockedAPI.get).toHaveBeenCalledWith(
        expect.stringContaining('maxPrice=100')
      )
    })

    it('should exclude undefined and null values from query', async () => {
      mockedAPI.get.mockResolvedValue(mockProductsResponse)

      await searchProducts({ q: undefined, city: null as unknown as string })

      const calledUrl = mockedAPI.get.mock.calls[0][0]
      expect(calledUrl).not.toContain('q=')
      expect(calledUrl).not.toContain('city=')
    })

    it('should exclude empty string values from query', async () => {
      mockedAPI.get.mockResolvedValue(mockProductsResponse)

      await searchProducts({ q: '' })

      expect(mockedAPI.get).toHaveBeenCalledWith('/catalog/products')
    })
  })

  describe('searchWorkshops', () => {
    const mockWorkshopsResponse = {
      data: {
        items: [{ id: 'w1', name: 'Workshop 1' }],
        total: 1,
        page: 1,
        size: 12,
      },
    }

    it('should fetch workshops without params', async () => {
      mockedAPI.get.mockResolvedValue(mockWorkshopsResponse)

      const result = await searchWorkshops()

      expect(mockedAPI.get).toHaveBeenCalledWith('/catalog/workshops')
      expect(result).toEqual(mockWorkshopsResponse.data)
    })

    it('should build query string with search params', async () => {
      mockedAPI.get.mockResolvedValue(mockWorkshopsResponse)

      await searchWorkshops({ q: 'bike shop', city: 'Madrid' })

      expect(mockedAPI.get).toHaveBeenCalledWith(
        expect.stringContaining('q=bike+shop')
      )
      expect(mockedAPI.get).toHaveBeenCalledWith(
        expect.stringContaining('city=Madrid')
      )
    })
  })

  describe('searchServices', () => {
    const mockServicesResponse = {
      data: {
        items: [{ id: 's1', name: 'Service 1' }],
        total: 1,
        page: 1,
        size: 12,
      },
    }

    it('should fetch services without params', async () => {
      mockedAPI.get.mockResolvedValue(mockServicesResponse)

      const result = await searchServices()

      expect(mockedAPI.get).toHaveBeenCalledWith('/catalog/services')
      expect(result).toEqual(mockServicesResponse.data)
    })

    it('should include vehicleType in query', async () => {
      mockedAPI.get.mockResolvedValue(mockServicesResponse)

      await searchServices({ vehicleType: 'BICYCLE' })

      expect(mockedAPI.get).toHaveBeenCalledWith(
        expect.stringContaining('vehicleType=BICYCLE')
      )
    })

    it('should include categoryId in query', async () => {
      mockedAPI.get.mockResolvedValue(mockServicesResponse)

      await searchServices({ categoryId: 'repair' })

      expect(mockedAPI.get).toHaveBeenCalledWith(
        expect.stringContaining('categoryId=repair')
      )
    })
  })

  describe('getProduct', () => {
    it('should fetch product by id', async () => {
      const mockProduct = { id: '123', name: 'Test Product' }
      mockedAPI.get.mockResolvedValue({ data: mockProduct })

      const result = await getProduct('123')

      expect(mockedAPI.get).toHaveBeenCalledWith('/catalog/products/123')
      expect(result).toEqual(mockProduct)
    })
  })

  describe('getWorkshopById', () => {
    it('should fetch workshop by id', async () => {
      const mockWorkshop = { id: 'w1', name: 'Test Workshop' }
      mockedAPI.get.mockResolvedValue({ data: mockWorkshop })

      const result = await getWorkshopById('w1')

      expect(mockedAPI.get).toHaveBeenCalledWith('/owner/workshops/w1')
      expect(result).toEqual(mockWorkshop)
    })
  })

  describe('catalogService object', () => {
    it('should export all functions', () => {
      expect(catalogService.searchProducts).toBe(searchProducts)
      expect(catalogService.searchWorkshops).toBe(searchWorkshops)
      expect(catalogService.searchServices).toBe(searchServices)
      expect(catalogService.getProduct).toBe(getProduct)
      expect(catalogService.getProductById).toBe(getProduct)
      expect(catalogService.getWorkshopById).toBe(getWorkshopById)
    })
  })
})
