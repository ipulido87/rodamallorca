import { API } from '../../../features/auth/services/auth-service'

export interface CreateWorkshopData {
  name: string
  description?: string
  address?: string
  city?: string
  country?: string
  phone?: string
  logoOriginal?: string
  logoMedium?: string
  logoThumbnail?: string
}

export interface Workshop {
  id: string
  ownerId: string
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
  updatedAt: string
}

export const createWorkshop = async (
  data: CreateWorkshopData
): Promise<Workshop> => {
  const response = await API.post('/owner/workshops', data)
  return response.data
}

export const getMyWorkshops = async (): Promise<Workshop[]> => {
  const response = await API.get('/owner/workshops/mine')
  return response.data
}

export const updateWorkshop = async (
  id: string,
  data: Partial<CreateWorkshopData>
): Promise<Workshop> => {
  const response = await API.put(`/owner/workshops/${id}`, data)
  return response.data
}

export const deleteWorkshop = async (id: string): Promise<void> => {
  await API.delete(`/owner/workshops/${id}`)
}

export const getWorkshopById = async (id: string): Promise<Workshop> => {
  const response = await API.get(`/workshops/${id}`)
  return response.data
}

export const getMyWorkshopById = async (id: string): Promise<Workshop> => {
  const response = await API.get(`/owner/workshops/${id}`)
  return response.data
}
