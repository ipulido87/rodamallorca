import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import type { ReactNode } from 'react'
import { AxiosError } from 'axios'
import { AuthContext } from './auth-providers'
import type { User, AuthContextType } from './auth-providers'
import {
  API,
  login as apiLogin,
  me as apiMe,
  register as apiRegister,
  verifyCode as apiVerifyCode,
  resendVerification as apiResendVerification,
} from '../services/auth-service'
import { notify } from '../../../shared/services/notification-service'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

const handleApiError = (error: unknown): string => {
  const axiosError = error as AxiosError<{
    error?: string
    message?: string
    errors?: Array<{ message: string }>
  }>

  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message
  }

  if (axiosError.response?.data?.error) {
    return axiosError.response.data.error
  }

  if (axiosError.response?.data?.errors?.[0]?.message) {
    return axiosError.response.data.errors[0].message
  }

  return axiosError.message || 'Error de conexión'
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  )
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  const tokenRef = useRef(token)
  const userRef = useRef(user)

  useEffect(() => {
    tokenRef.current = token
    userRef.current = user
  }, [token, user])

  const persistToken = useCallback((t: string | null) => {
    if (t) {
      localStorage.setItem(TOKEN_KEY, t)
      setToken(t)
    } else {
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
    }
  }, [])

  // Configure axios interceptors once on mount
  useEffect(() => {
    const publicRoutes = [
      '/catalog/',
      '/service-categories',
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password'
    ]

    const reqId = API.interceptors.request.use((config) => {
      const requestUrl = config.url || ''

      const isOwnerOrAdminRoute = requestUrl.includes('/owner/') || requestUrl.includes('/admin/')
      const isPublicRoute = !isOwnerOrAdminRoute && publicRoutes.some(route => requestUrl.includes(route))

      const allowedWithoutSubscription = [
        '/subscriptions/create-checkout-session',
        '/subscriptions/status',
        '/auth/me',
      ]

      const isWorkshopsRoute = requestUrl.includes('/workshops')
      const isWorkshopsAllowed = isWorkshopsRoute && (
        config.method === 'post' ||
        requestUrl === '/owner/workshops' ||
        requestUrl.includes('/owner/workshops/mine')
      )

      if (isOwnerOrAdminRoute) {
        const isAllowedRoute = allowedWithoutSubscription.some(route =>
          requestUrl.includes(route)
        ) || isWorkshopsAllowed

        if (!isAllowedRoute) {
          const currentUser = JSON.parse(localStorage.getItem(USER_KEY) || 'null')

          if (currentUser?.role === 'WORKSHOP_OWNER' && !currentUser.hasActiveSubscription) {
            return Promise.reject({
              message: 'Subscription required',
              isSubscriptionRequired: true,
              blocked: true
            })
          }
        }
      }

      const currentToken = localStorage.getItem(TOKEN_KEY)

      if (currentToken && config.headers && !isPublicRoute) {
        config.headers.Authorization = `Bearer ${currentToken}`
      }
      return config
    })

    const resId = API.interceptors.response.use(
      (response) => response,
      (error) => {
        const requestUrl = error.config?.url || ''

        const isOwnerOrAdminRoute = requestUrl.includes('/owner/') || requestUrl.includes('/admin/')
        const isPublicRoute = !isOwnerOrAdminRoute && publicRoutes.some(route => requestUrl.includes(route))

        const isInOAuthCallback = window.location.pathname === '/auth/callback'
        const isInCheckoutFlow = window.location.pathname.includes('/checkout/')

        const currentToken = localStorage.getItem(TOKEN_KEY)
        if (error.response?.status === 401 && currentToken && !isPublicRoute && !isInOAuthCallback) {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          setToken(null)
          setUser(null)

          if (!isInCheckoutFlow) {
            setTimeout(() => {
              window.location.href = '/login?error=Sesión expirada, por favor inicia sesión nuevamente'
            }, 100)
          }
        }
        return Promise.reject(error)
      }
    )

    return () => {
      API.interceptors.request.eject(reqId)
      API.interceptors.response.eject(resId)
    }
  }, [])

  const refreshMeRef = useRef<() => Promise<void>>()

  refreshMeRef.current = async () => {
    try {
      const fetchedUser = await apiMe()
      setUser(fetchedUser ?? null)
      if (fetchedUser) {
        localStorage.setItem(USER_KEY, JSON.stringify(fetchedUser))
      } else {
        localStorage.removeItem(USER_KEY)
      }
      setAuthError(null)
    } catch {
      // Clear user state on any error
      setUser(null)
      localStorage.removeItem(USER_KEY)
      persistToken(null)
    }
  }

  const refreshMe = useCallback(async () => {
    await refreshMeRef.current?.()
  }, [])

  // Initial load with timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let isMounted = true

    ;(async () => {
      if (!isMounted) return

      setLoading(true)

      timeoutId = setTimeout(() => {
        if (!isMounted) return
        setLoading(false)
        setAuthError('La verificación de sesión tardó demasiado. Por favor, recarga la página.')
      }, 8000)

      try {
        await refreshMe()
        if (timeoutId) clearTimeout(timeoutId)
      } catch {
        if (timeoutId) clearTimeout(timeoutId)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    })()

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      setAuthError(null)

      try {
        const { token: newToken } = await apiLogin(email, password)
        persistToken(newToken)

        const fullUser = await apiMe()
        setUser(fullUser ?? null)
        if (fullUser) {
          localStorage.setItem(USER_KEY, JSON.stringify(fullUser))
        }

        return fullUser
      } catch (error: unknown) {
        const errorMessage = handleApiError(error)
        const axiosError = error as AxiosError<{ error?: string }>

        if (
          axiosError.response?.status === 403 &&
          axiosError.response?.data?.error === 'EMAIL_NOT_VERIFIED'
        ) {
          setAuthError(errorMessage)
          throw new Error(`EMAIL_NOT_VERIFIED:${email}`)
        }

        if (
          axiosError.response?.status === 401 &&
          axiosError.response?.data?.error === 'INVALID_CREDENTIALS'
        ) {
          setAuthError(errorMessage)
          throw new Error(errorMessage)
        }

        setAuthError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [persistToken]
  )

  const resendVerification = useCallback(async (email: string) => {
    setLoading(true)
    setAuthError(null)

    try {
      await apiResendVerification(email)
      setAuthError(
        'Email de verificación reenviado. Revisa tu bandeja de entrada.'
      )
    } catch (error: unknown) {
      const errorMessage = handleApiError(error)
      setAuthError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await API.post('/auth/logout')
    } catch {
      // Silent fail for logout
    }

    persistToken(null)
    setUser(null)
    setAuthError(null)
    localStorage.removeItem(USER_KEY)

    setTimeout(() => {
      window.location.href = '/login'
    }, 100)
  }, [persistToken])

  const register = useCallback(
    async (input: {
      email: string
      password: string
      name: string
      birthDate?: string
      phone?: string
      role?: 'USER' | 'WORKSHOP_OWNER'
    }) => {
      setLoading(true)
      setAuthError(null)

      try {
        await apiRegister(input)
        setAuthError(null)
      } catch (error: unknown) {
        const errorMessage = handleApiError(error)
        setAuthError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const verifyCode = useCallback(async (email: string, code: string) => {
    setLoading(true)
    setAuthError(null)

    try {
      await apiVerifyCode(email, code)
      setAuthError(null)
    } catch (error: unknown) {
      const errorMessage = handleApiError(error)
      setAuthError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setAuthError(null)
  }, [])

  // Auto-logout on inactivity
  useEffect(() => {
    if (!user) return

    const INACTIVITY_TIMEOUT = 30 * 60 * 1000
    let timeoutId: NodeJS.Timeout

    const resetTimeout = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        notify.warning('Sesión cerrada por inactividad (30 minutos)')
        logout()
      }, INACTIVITY_TIMEOUT)
    }

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ]

    events.forEach((event) => {
      document.addEventListener(event, resetTimeout, true)
    })

    resetTimeout()

    return () => {
      clearTimeout(timeoutId)
      events.forEach((event) => {
        document.removeEventListener(event, resetTimeout, true)
      })
    }
  }, [user, logout])

  const value: AuthContextType = useMemo(
    () => ({
      token,
      user,
      setUser,
      isAuthenticated: !!user,
      isWorkshopOwner: user?.role === 'WORKSHOP_OWNER',
      loading,
      authError,
      login,
      logout,
      register,
      verifyCode,
      resendVerification,
      refreshMe,
      persistToken,
      clearError,
    }),
    [
      token,
      user,
      loading,
      authError,
      login,
      logout,
      register,
      verifyCode,
      resendVerification,
      refreshMe,
      persistToken,
      clearError,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
