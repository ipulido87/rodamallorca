import { API } from './auth-service'

export interface CreateWorkshopData {
  name: string
  description?: string
  address?: string
  city?: string
  country?: string
  phone?: string
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
