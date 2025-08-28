import { createContext } from 'react'

export type User = {
  id: string
  email: string
  name?: string | null
  picture?: string | null
  birthDate?: string | null
  phone?: string | null
  verified?: boolean
  createdAt?: string
  updatedAt?: string
}

export type AuthContextType = {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (input: {
    email: string
    password: string
    name: string
    birthDate?: string
    phone?: string
  }) => Promise<void>
  verifyCode: (email: string, code: string) => Promise<void>
  refreshMe: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)
