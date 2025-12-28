const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

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
  const response = await fetch(`${API_URL}/favorites`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Error al obtener favoritos')
  }

  return response.json()
}

/**
 * Toggle favorito (agregar o quitar)
 */
export const toggleFavorite = async (
  workshopId: string
): Promise<{ added: boolean; favorite?: FavoriteWorkshop }> => {
  const response = await fetch(`${API_URL}/favorites/${workshopId}`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Error al actualizar favorito')
  }

  return response.json()
}

/**
 * Verificar si un taller es favorito
 */
export const checkFavorite = async (
  workshopId: string
): Promise<{ isFavorite: boolean }> => {
  const response = await fetch(`${API_URL}/favorites/check/${workshopId}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Error al verificar favorito')
  }

  return response.json()
}
