import type { ReactNode } from 'react'

export interface MapCoords {
  lat: number
  lng: number
}

export interface MapMarkerConfig<T> {
  id: string
  coords: MapCoords
  data: T
}

export interface LeafletMapProps<T> {
  markers: MapMarkerConfig<T>[]
  center?: MapCoords
  zoom?: number
  height?: string | number
  renderPopup: (data: T) => ReactNode
  onMarkerClick?: (data: T) => void
}
