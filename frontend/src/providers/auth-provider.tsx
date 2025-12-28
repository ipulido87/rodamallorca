import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AxiosError } from 'axios'
import { AuthContext } from '../features/auth/providers/auth-providers'
import type { User, AuthContextType } from '../features/auth/providers/auth-providers'
import {
  API,
  login as apiLogin,
  me as apiMe,
  register as apiRegister,
  verifyCode as apiVerifyCode,
  resendVerification as apiResendVerification, // ✅ AGREGAR
} from '../features/auth/services/auth-service'

// Key para localStorage
const TOKEN_KEY = 'token'
const USER_KEY = 'user'

// ✅ HELPER PARA MANEJAR ERRORES DE API
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
  const [authError, setAuthError] = useState<string | null>(null) // ✅ ERROR CENTRALIZADO

  // ---- Interceptor: adjunta Authorization si hay token ----
  useEffect(() => {
    const reqId = API.interceptors.request.use((config) => {
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // ---- Interceptor de respuesta: maneja 401 (token expirado) ----
    const resId = API.interceptors.response.use(
      (response) => response,
      (error) => {
        // Si el token expiró o es inválido, hacer logout automático
        if (error.response?.status === 401 && token) {
          console.warn('Token expirado o inválido, cerrando sesión...')
          persistToken(null)
          setUser(null)
          localStorage.removeItem(USER_KEY)
          window.location.href = '/login?error=Sesión expirada, por favor inicia sesión nuevamente'
        }
        return Promise.reject(error)
      }
    )

    return () => {
      API.interceptors.request.eject(reqId)
      API.interceptors.response.eject(resId)
    }
  }, [token, persistToken])

  const persistToken = useCallback((t: string | null) => {
    if (t) {
      localStorage.setItem(TOKEN_KEY, t)
      setToken(t)
    } else {
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
    }
  }, [])

  const refreshMe = useCallback(async () => {
    try {
      const fetchedUser = await apiMe() // ✅ apiMe() retorna el usuario directamente, no { user: {...} }
      setUser(fetchedUser ?? null)
      if (fetchedUser) {
        localStorage.setItem(USER_KEY, JSON.stringify(fetchedUser))
      } else {
        localStorage.removeItem(USER_KEY)
      }
      setAuthError(null)
    } catch (error) {
      console.error('Auth error:', error)
      setUser(null)
      localStorage.removeItem(USER_KEY)
      persistToken(null)
    }
  }, [persistToken])

  // Carga inicial
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        await refreshMe()
      } finally {
        setLoading(false)
      }
    })()
  }, [refreshMe])

  // ✅ LOGIN MEJORADO - MANEJA ERRORES ESPECÍFICOS
  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      setAuthError(null)

      try {
        const { token: newToken, user: u } = await apiLogin(email, password)
        persistToken(newToken)
        setUser(u ?? null)
        if (u) {
          localStorage.setItem(USER_KEY, JSON.stringify(u))
        }
      } catch (error: unknown) {
        console.error('Login error in AuthProvider:', error)

        const errorMessage = handleApiError(error)
        const axiosError = error as AxiosError<{ error?: string }>

        // ✅ MANEJAR ERROR DE EMAIL NO VERIFICADO
        if (
          axiosError.response?.status === 403 &&
          axiosError.response?.data?.error === 'EMAIL_NOT_VERIFIED'
        ) {
          setAuthError(errorMessage)
          throw new Error(`EMAIL_NOT_VERIFIED:${email}`)
        }

        // ✅ MANEJAR ERROR DE CREDENCIALES INVÁLIDAS
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

  // ✅ NUEVA FUNCIÓN PARA REENVIAR VERIFICACIÓN
  const resendVerification = useCallback(async (email: string) => {
    setLoading(true)
    setAuthError(null)

    try {
      await apiResendVerification(email)
      setAuthError(
        '✅ Email de verificación reenviado. Revisa tu bandeja de entrada.'
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
    } catch (error) {
      console.warn('Backend logout failed:', error)
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

  // ✅ FUNCIÓN PARA LIMPIAR ERRORES
  const clearError = useCallback(() => {
    setAuthError(null)
  }, [])

  // Auto-logout por inactividad
  useEffect(() => {
    if (!user) return

    const INACTIVITY_TIMEOUT = 30 * 60 * 1000
    let timeoutId: NodeJS.Timeout

    const resetTimeout = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        logout()
        alert('Sesión cerrada por inactividad (30 minutos)')
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
