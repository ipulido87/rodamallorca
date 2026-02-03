// src/shared/api/api-client.ts
import axios from 'axios'
import { API_URL } from '../../constants/api'

/**
 * Centralized API client instance
 * - Configured with base URL and credentials
 * - Handles subscription and email verification errors globally
 */
export const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Response interceptor for global error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle inactive subscription error
    if (
      error.response?.status === 403 &&
      error.response?.data?.error === 'NO_ACTIVE_SUBSCRIPTION'
    ) {
      globalThis.location.href = '/activate-subscription'
      return Promise.reject({
        ...error,
        isSubscriptionRequired: true,
      })
    }

    // Handle email not verified error
    if (
      error.response?.status === 403 &&
      error.response?.data?.error === 'EMAIL_NOT_VERIFIED'
    ) {
      return Promise.reject({
        ...error,
        isEmailNotVerified: true,
        email: error.response?.data?.email,
      })
    }

    return Promise.reject(error)
  }
)

export default API
