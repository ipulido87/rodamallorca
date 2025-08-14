import axios from 'axios'
import { API_URL, AUTH_ENDPOINTS } from '../constants/api'

const API = axios.create({
  baseURL: API_URL,
  timeout: 15000,
})

export const me = () => API.get('/auth/me').then((r) => r.data)
export const login = async (email: string, password: string) => {
  const response = await API.post(AUTH_ENDPOINTS.LOGIN, { email, password })
  return response.data
}
