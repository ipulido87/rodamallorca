import React, { createContext, useEffect, useState } from 'react'

export interface CartItem {
  productId: string
  workshopId: string
  workshopName: string
  name: string
  description: string | null
  price: number
  currency: string
  quantity: number
}

export interface Cart {
  items: CartItem[]
  workshopId: string | null // Solo se puede pedir de un taller a la vez
  workshopCanAcceptPayments?: boolean
  workshopPhone?: string
}

interface WorkshopMeta {
  canAcceptPayments?: boolean
  phone?: string
}

export interface CartContextValue {
  cart: Cart
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number, workshopMeta?: WorkshopMeta) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalAmount: () => number
  getItemCount: () => number
}

export const CartContext = createContext<CartContextValue | undefined>(
  undefined
)

const CART_STORAGE_KEY = 'rodamallorca_cart'

function loadCartFromStorage(): Cart {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error)
  }
  return { items: [], workshopId: null }
}

function saveCartToStorage(cart: Cart): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  } catch (error) {
    console.error('Error saving cart to localStorage:', error)
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<Cart>(loadCartFromStorage)

  // Sincronizar con localStorage cada vez que cambia el carrito
  useEffect(() => {
    saveCartToStorage(cart)
  }, [cart])

  const addToCart = (
    item: Omit<CartItem, 'quantity'>,
    quantity: number = 1,
    workshopMeta?: WorkshopMeta
  ) => {
    setCart((prev) => {
      // Si el carrito está vacío o es del mismo taller, agregar
      if (!prev.workshopId || prev.workshopId === item.workshopId) {
        // Verificar si el producto ya está en el carrito
        const existingItemIndex = prev.items.findIndex(
          (i) => i.productId === item.productId
        )

        if (existingItemIndex >= 0) {
          // Actualizar cantidad
          const newItems = [...prev.items]
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + quantity,
          }
          return { ...prev, items: newItems }
        } else {
          // Agregar nuevo item
          return {
            workshopId: item.workshopId,
            workshopCanAcceptPayments: workshopMeta?.canAcceptPayments,
            workshopPhone: workshopMeta?.phone,
            items: [...prev.items, { ...item, quantity }],
          }
        }
      } else {
        // Si es de otro taller, reemplazar todo el carrito
        alert(
          'Solo puedes pedir productos de un taller a la vez. El carrito actual será reemplazado.'
        )
        return {
          workshopId: item.workshopId,
          workshopCanAcceptPayments: workshopMeta?.canAcceptPayments,
          workshopPhone: workshopMeta?.phone,
          items: [{ ...item, quantity }],
        }
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const newItems = prev.items.filter((i) => i.productId !== productId)
      return {
        workshopId: newItems.length > 0 ? prev.workshopId : null,
        items: newItems,
      }
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart((prev) => {
      const newItems = prev.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
      return { ...prev, items: newItems }
    })
  }

  const clearCart = () => {
    setCart({ items: [], workshopId: null })
  }

  const getTotalAmount = (): number => {
    return cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  }

  const getItemCount = (): number => {
    return cart.items.reduce((count, item) => count + item.quantity, 0)
  }

  const value: CartContextValue = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalAmount,
    getItemCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
