// src/features/products/types/products-types.ts
import type { MouseEvent } from 'react'
import type { ProductImage } from '../../catalog/types/catalog'

export type { ProductImage }

// Tipos compartidos para el layout/cards de productos y talleres

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
  isRental?: boolean // Para saber si es alquiler o venta
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
  logoOriginal?: string
  logoMedium?: string
  logoThumbnail?: string
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

// Re-export Product from service (most complete version with rental fields)
export type { Product } from '../services/product-service'
