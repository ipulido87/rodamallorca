import { API } from '../../auth/services/auth-service'

export interface FavoriteWorkshop {
  id: string
  userId: string
  workshopId: string
  createdAt: string
  workshop?: {
    id: string
    name: string
    description?: string
    city?: string
    address?: string
  }
}

/**
 * Obtener todos los favoritos del usuario autenticado
 */
export const getUserFavorites = async (): Promise<FavoriteWorkshop[]> => {
  const response = await API.get<FavoriteWorkshop[]>('/favorites')
  return response.data
}

/**
 * Toggle favorito (agregar o quitar)
 */
export const toggleFavorite = async (
  workshopId: string
): Promise<{ added: boolean; favorite?: FavoriteWorkshop }> => {
  const response = await API.post<{ added: boolean; favorite?: FavoriteWorkshop }>(
    `/favorites/${workshopId}`
  )
  return response.data
}

/**
 * Verificar si un taller es favorito
 */
export const checkFavorite = async (
  workshopId: string
): Promise<{ isFavorite: boolean }> => {
  const response = await API.get<{ isFavorite: boolean }>(
    `/favorites/check/${workshopId}`
  )
  return response.data
}
