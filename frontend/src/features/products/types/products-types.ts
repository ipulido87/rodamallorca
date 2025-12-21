// src/features/products/types/products-types.ts
import type { MouseEvent } from 'react'

// Tipos compartidos para el layout/cards de productos y talleres

export interface ProductImage {
  id: string
  original: string
  medium: string
  thumbnail: string
  position: number
}

/** Modelo que usan las *cards* de producto (UI) */
export interface CardProduct {
  id: string
  title: string
  price: number // céntimos
  condition: 'new' | 'used' | 'refurb'
  status: 'PUBLISHED' | 'DRAFT' | string
  images: ProductImage[]
  workshop: {
    name: string
    city?: string
  }
}

/** Modelo que usan las *cards* de taller (UI) */
export interface CardWorkshop {
  id: string
  name: string
  description?: string
  address?: string
  city?: string
  country?: string
  phone?: string
  createdAt: string
}

/** Modelo que usan las *cards* de servicio (UI) */
export interface CardService {
  id: string
  name: string
  description?: string
  price: number // céntimos
  duration?: number // minutos
  vehicleType: 'BICYCLE' | 'E_BIKE' | 'E_SCOOTER' | 'ALL'
  workshop: {
    id: string
    name: string
    city?: string
  }
  serviceCategory: {
    id: string
    name: string
    icon?: string
  }
}

/** Handler para abrir el menú contextual desde la card */
export type OnOpenMenuHandler = (
  e: MouseEvent<HTMLElement>,
  item: CardProduct | CardWorkshop | CardService
) => void

/** Props comunes para el layout moderno */
export interface ModernLayoutCommonProps {
  loading?: boolean
  error?: string
  emptyMessage?: string
  onFavoriteToggle?: (id: string) => void
  favoriteIds?: string[]
}

/* --------- Tipo que devuelve el backend --------- */
export interface Product {
  id: string
  title: string
  description?: string
  price: number // céntimos
  status: 'PUBLISHED' | 'DRAFT'
  categoryId: string | null
  workshopId: string
  createdAt: string
  updatedAt: string
  category?: { id: string; name: string } | null
  images: Array<
    | { id: string; url: string; productId: string }
    | {
        id: string
        original: string
        medium: string
        thumbnail: string
        position: number
        productId: string
      }
  >
}
