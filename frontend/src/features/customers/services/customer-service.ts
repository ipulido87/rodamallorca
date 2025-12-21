// frontend/src/features/customers/services/customer-service.ts
import { API } from '../../auth/services/auth-service'
import type {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
} from '../types/customer'

const API_URL = '/customers'

export const getCustomers = async (): Promise<Customer[]> => {
  const { data } = await API.get<Customer[]>(API_URL)
  return data
}

export const getCustomerById = async (id: string): Promise<Customer> => {
  const { data } = await API.get<Customer>(`${API_URL}/${id}`)
  return data
}

export const createCustomer = async (
  input: CreateCustomerInput
): Promise<Customer> => {
  const { data } = await API.post<Customer>(API_URL, input)
  return data
}

export const updateCustomer = async (
  id: string,
  input: UpdateCustomerInput
): Promise<Customer> => {
  const { data} = await API.put<Customer>(`${API_URL}/${id}`, input)
  return data
}

export const deleteCustomer = async (id: string): Promise<void> => {
  await API.delete(`${API_URL}/${id}`)
}
