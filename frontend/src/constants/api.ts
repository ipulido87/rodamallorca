// src/constants/api.ts

// @ts-ignore - Vite env types
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY: '/auth/verify',
  GOOGLE_CALLBACK: '/auth/google/callback',
} as const

export const WORKSHOP_ENDPOINTS = {
  LIST: '/workshops',
  DETAIL: '/workshops/:id',
  CREATE: '/workshops',
  UPDATE: '/workshops/:id',
  DELETE: '/workshops/:id',
} as const

export const PRODUCT_ENDPOINTS = {
  LIST: '/products',
  DETAIL: '/products/:id',
  CREATE: '/products',
  UPDATE: '/products/:id',
  DELETE: '/products/:id',
  BY_WORKSHOP: '/workshops/:workshopId/products',
} as const

export const USER_ENDPOINTS = {
  PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
} as const