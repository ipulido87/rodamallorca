import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CartProvider, CartContext } from '@/features/cart/contexts/CartContext'
import type { CartItem } from '@/features/cart/contexts/CartContext'
import { useContext } from 'react'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock window.alert
global.alert = vi.fn()

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
)

const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  const mockItem: Omit<CartItem, 'quantity'> = {
    productId: 'prod-1',
    workshopId: 'workshop-1',
    workshopName: 'Test Workshop',
    name: 'Test Product',
    description: 'Test description',
    price: 100,
    currency: 'EUR',
  }

  it('should initialize with empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    expect(result.current.cart.items).toEqual([])
    expect(result.current.cart.workshopId).toBeNull()
  })

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addToCart(mockItem, 2)
    })

    expect(result.current.cart.items).toHaveLength(1)
    expect(result.current.cart.items[0]).toEqual({ ...mockItem, quantity: 2 })
    expect(result.current.cart.workshopId).toBe('workshop-1')
  })

  it('should increase quantity when adding existing item', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addToCart(mockItem, 1)
    })

    act(() => {
      result.current.addToCart(mockItem, 2)
    })

    expect(result.current.cart.items).toHaveLength(1)
    expect(result.current.cart.items[0].quantity).toBe(3)
  })

  it('should replace cart when adding item from different workshop', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addToCart(mockItem, 1)
    })

    const differentWorkshopItem = {
      ...mockItem,
      productId: 'prod-2',
      workshopId: 'workshop-2',
      workshopName: 'Different Workshop',
    }

    act(() => {
      result.current.addToCart(differentWorkshopItem, 1)
    })

    expect(result.current.cart.items).toHaveLength(1)
    expect(result.current.cart.items[0].productId).toBe('prod-2')
    expect(result.current.cart.workshopId).toBe('workshop-2')
    expect(global.alert).toHaveBeenCalledWith(
      expect.stringContaining('Solo puedes pedir productos de un taller a la vez')
    )
  })

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addToCart(mockItem, 1)
    })

    act(() => {
      result.current.removeFromCart('prod-1')
    })

    expect(result.current.cart.items).toHaveLength(0)
    expect(result.current.cart.workshopId).toBeNull()
  })

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addToCart(mockItem, 1)
    })

    act(() => {
      result.current.updateQuantity('prod-1', 5)
    })

    expect(result.current.cart.items[0].quantity).toBe(5)
  })

  it('should remove item when quantity is set to 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addToCart(mockItem, 1)
    })

    act(() => {
      result.current.updateQuantity('prod-1', 0)
    })

    expect(result.current.cart.items).toHaveLength(0)
  })

  it('should clear entire cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addToCart(mockItem, 1)
      result.current.addToCart({ ...mockItem, productId: 'prod-2' }, 2)
    })

    expect(result.current.cart.items).toHaveLength(2)

    act(() => {
      result.current.clearCart()
    })

    expect(result.current.cart.items).toHaveLength(0)
    expect(result.current.cart.workshopId).toBeNull()
  })

  it('should calculate total amount correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addToCart(mockItem, 2) // 100 * 2 = 200
      result.current.addToCart({ ...mockItem, productId: 'prod-2', price: 50 }, 3) // 50 * 3 = 150
    })

    expect(result.current.getTotalAmount()).toBe(350)
  })

  it('should calculate item count correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addToCart(mockItem, 2)
      result.current.addToCart({ ...mockItem, productId: 'prod-2' }, 3)
    })

    expect(result.current.getItemCount()).toBe(5)
  })

  it('should persist cart to localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addToCart(mockItem, 1)
    })

    const stored = JSON.parse(localStorageMock.getItem('rodamallorca_cart') || '{}')
    expect(stored.items).toHaveLength(1)
    expect(stored.items[0].productId).toBe('prod-1')
  })

  it('should load cart from localStorage on mount', () => {
    const initialCart = {
      items: [{ ...mockItem, quantity: 3 }],
      workshopId: 'workshop-1',
    }
    localStorageMock.setItem('rodamallorca_cart', JSON.stringify(initialCart))

    const { result } = renderHook(() => useCart(), { wrapper })

    expect(result.current.cart.items).toHaveLength(1)
    expect(result.current.cart.items[0].quantity).toBe(3)
  })
})
